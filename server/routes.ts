import express, { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDatabase, queryToObjects, saveDatabase } from './db.ts';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ansh_cart_super_secret_jwt_key_2026';

// Middleware to extract user from Authorization header
export async function authenticateToken(req: Request, res: Response, next: Function) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    const db = await getDatabase();
    const result = db.exec(`SELECT id, name, email, role, phone, address, city, postal_code, created_at FROM users WHERE id = ${decoded.id}`);
    const users = queryToObjects(result);
    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }
    (req as any).user = users[0];
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}

// Optional auth middleware (attaches user if token present)
export async function optionalAuth(req: Request, res: Response, next: Function) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
      const db = await getDatabase();
      const result = db.exec(`SELECT id, name, email, role, phone, address, city, postal_code, created_at FROM users WHERE id = ${decoded.id}`);
      const users = queryToObjects(result);
      if (users && users.length > 0) {
        (req as any).user = users[0];
      }
    } catch (err) {
      // Ignore token decode error for optional auth
    }
  }
  next();
}

// 1. GET /api/products - list products with search, category filter, sorting
router.get('/products', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const { search, category, sort, badge, featured } = req.query;

    let sql = 'SELECT * FROM products WHERE 1=1';

    if (category && typeof category === 'string' && category !== 'All') {
      const safeCat = category.replace(/'/g, "''");
      sql += ` AND category = '${safeCat}'`;
    }

    if (featured === 'true' || featured === '1') {
      sql += ` AND is_featured = 1`;
    }

    if (badge && typeof badge === 'string') {
      const safeBadge = badge.replace(/'/g, "''");
      sql += ` AND badge = '${safeBadge}'`;
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim().toLowerCase().replace(/'/g, "''");
      sql += ` AND (LOWER(title) LIKE '%${q}%' OR LOWER(tagline) LIKE '%${q}%' OR LOWER(tags) LIKE '%${q}%' OR LOWER(category) LIKE '%${q}%')`;
    }

    // Sorting
    switch (sort) {
      case 'price-asc':
        sql += ' ORDER BY price ASC';
        break;
      case 'price-desc':
        sql += ' ORDER BY price DESC';
        break;
      case 'rating':
        sql += ' ORDER BY rating DESC';
        break;
      case 'newest':
        sql += ' ORDER BY id DESC';
        break;
      case 'featured':
      default:
        sql += ' ORDER BY is_featured DESC, rating DESC, id ASC';
        break;
    }

    const result = db.exec(sql);
    const products = queryToObjects(result).map((p: any) => ({
      ...p,
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
      secondary_images: typeof p.secondary_images === 'string' ? JSON.parse(p.secondary_images) : p.secondary_images,
      tags: typeof p.tags === 'string' ? p.tags.split(',').map((t: string) => t.trim()) : p.tags,
    }));

    res.json({ products, total: products.length });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// 2. GET /api/products/:identifier - product details by slug or ID
router.get('/products/:identifier', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const { identifier } = req.params;

    let sql: string;
    if (/^\d+$/.test(identifier)) {
      sql = `SELECT * FROM products WHERE id = ${parseInt(identifier, 10)}`;
    } else {
      const safeSlug = identifier.replace(/'/g, "''");
      sql = `SELECT * FROM products WHERE slug = '${safeSlug}'`;
    }

    const result = db.exec(sql);
    const products = queryToObjects(result);

    if (!products || products.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const p: any = products[0];
    const product = {
      ...p,
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
      secondary_images: typeof p.secondary_images === 'string' ? JSON.parse(p.secondary_images) : p.secondary_images,
      tags: typeof p.tags === 'string' ? p.tags.split(',').map((t: string) => t.trim()) : p.tags,
    };

    // Also get related products from same category
    const safeCat = p.category.replace(/'/g, "''");
    const relatedResult = db.exec(`SELECT * FROM products WHERE category = '${safeCat}' AND id != ${p.id} LIMIT 4`);
    const related = queryToObjects(relatedResult).map((r: any) => ({
      ...r,
      features: typeof r.features === 'string' ? JSON.parse(r.features) : r.features,
      secondary_images: typeof r.secondary_images === 'string' ? JSON.parse(r.secondary_images) : r.secondary_images,
    }));

    res.json({ product, related });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).json({ error: 'Failed to fetch product details' });
  }
});

// 3. GET /api/categories - list distinct categories and count
router.get('/categories', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const result = db.exec(`
      SELECT category, COUNT(*) as count 
      FROM products 
      GROUP BY category 
      ORDER BY count DESC
    `);
    const categories = queryToObjects(result);
    res.json({ categories });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// 4. POST /api/auth/register - Register user in SQLite
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { name, email, password, phone, address, city, postal_code } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const db = await getDatabase();
    const safeEmail = email.trim().toLowerCase().replace(/'/g, "''");
    const existing = db.exec(`SELECT id FROM users WHERE email = '${safeEmail}'`);
    if (existing.length > 0 && existing[0].values.length > 0) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const now = new Date().toISOString();

    const stmt = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, phone, address, city, postal_code, created_at)
      VALUES (?, ?, ?, 'customer', ?, ?, ?, ?, ?)
    `);

    stmt.run([
      name.trim(),
      email.trim().toLowerCase(),
      passwordHash,
      phone || '',
      address || '',
      city || '',
      postal_code || '',
      now
    ]);
    stmt.free();

    const idRes = db.exec('SELECT last_insert_rowid() as id');
    const newUserId = idRes[0]?.values[0]?.[0] as number;

    saveDatabase();

    const token = jwt.sign({ id: newUserId, email: email.trim().toLowerCase() }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: newUserId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: 'customer',
        phone: phone || '',
        address: address || '',
        city: city || '',
        postal_code: postal_code || '',
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// 5. POST /api/auth/login - Login user
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const db = await getDatabase();
    const safeEmail = email.trim().toLowerCase().replace(/'/g, "''");
    const result = db.exec(`SELECT * FROM users WHERE email = '${safeEmail}'`);
    const users = queryToObjects(result);

    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user: any = users[0];
    const passwordValid = bcrypt.compareSync(password, user.password_hash);

    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Logged in successfully',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
        city: user.city || '',
        postal_code: user.postal_code || '',
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// 6. GET /api/auth/me - Get current authenticated user
router.get('/auth/me', authenticateToken, (req: Request, res: Response) => {
  res.json({ user: (req as any).user });
});

// 7. PUT /api/auth/profile - Update user profile
router.put('/auth/profile', authenticateToken, async (req: Request, res: Response) => {
  try {
    const currentUser = (req as any).user;
    const { name, phone, address, city, postal_code } = req.body;

    const db = await getDatabase();
    const stmt = db.prepare(`
      UPDATE users 
      SET name = ?, phone = ?, address = ?, city = ?, postal_code = ?
      WHERE id = ?
    `);

    stmt.run([
      name || currentUser.name,
      phone ?? currentUser.phone,
      address ?? currentUser.address,
      city ?? currentUser.city,
      postal_code ?? currentUser.postal_code,
      currentUser.id
    ]);
    stmt.free();

    saveDatabase();

    res.json({
      message: 'Profile updated successfully',
      user: {
        ...currentUser,
        name: name || currentUser.name,
        phone: phone ?? currentUser.phone,
        address: address ?? currentUser.address,
        city: city ?? currentUser.city,
        postal_code: postal_code ?? currentUser.postal_code,
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// 8. POST /api/orders - Process checkout and create order in SQLite
router.post('/orders', optionalAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const {
      customer_name,
      customer_email,
      shipping_address,
      city,
      postal_code,
      phone,
      payment_method,
      items,
      notes
    } = req.body;

    if (!customer_name || !customer_email || !shipping_address || !city || !items || !items.length) {
      return res.status(400).json({ error: 'Missing required shipping or cart information' });
    }

    // Calculate subtotal from products in database to prevent tampering
    let subtotal = 0;
    const verifiedItems: Array<{
      product_id: number;
      product_title: string;
      product_image: string;
      price: number;
      quantity: number;
    }> = [];

    for (const item of items) {
      const prodRes = db.exec(`SELECT id, title, price, image, stock FROM products WHERE id = ${parseInt(item.productId, 10)}`);
      const prods = queryToObjects(prodRes);
      if (prods.length > 0) {
        const prod: any = prods[0];
        const qty = Math.max(1, parseInt(item.quantity, 10) || 1);
        subtotal += prod.price * qty;
        verifiedItems.push({
          product_id: prod.id,
          product_title: prod.title,
          product_image: prod.image,
          price: prod.price,
          quantity: qty,
        });

        // Decrement stock in SQLite
        const newStock = Math.max(0, (prod.stock || 10) - qty);
        db.run(`UPDATE products SET stock = ${newStock} WHERE id = ${prod.id}`);
      }
    }

    if (verifiedItems.length === 0) {
      return res.status(400).json({ error: 'Cart contains invalid products' });
    }

    // Free shipping over $75, otherwise $9.00
    const shippingFee = subtotal >= 75 ? 0 : 9.00;
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const totalAmount = Math.round((subtotal + shippingFee + tax) * 100) / 100;

    // Generate readable order ID e.g. AC-2026-XXXX
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `AC-${new Date().getFullYear()}-${randomSuffix}`;
    const now = new Date().toISOString();
    const userId = (req as any).user ? (req as any).user.id : null;

    const orderStmt = db.prepare(`
      INSERT INTO orders (
        order_number, user_id, customer_name, customer_email, shipping_address,
        city, postal_code, phone, payment_method, payment_status,
        subtotal, shipping_fee, tax, total_amount, order_status, notes, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    orderStmt.run([
      orderNumber,
      userId,
      customer_name.trim(),
      customer_email.trim().toLowerCase(),
      shipping_address.trim(),
      city.trim(),
      postal_code || '',
      phone || '',
      payment_method || 'Credit Card',
      'Paid',
      subtotal,
      shippingFee,
      tax,
      totalAmount,
      'Confirmed',
      notes || '',
      now
    ]);
    orderStmt.free();

    const orderIdRes = db.exec('SELECT last_insert_rowid() as id');
    const orderId = orderIdRes[0]?.values[0]?.[0] as number;

    const itemStmt = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_title, product_image, price, quantity)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    for (const vItem of verifiedItems) {
      itemStmt.run([
        orderId,
        vItem.product_id,
        vItem.product_title,
        vItem.product_image,
        vItem.price,
        vItem.quantity
      ]);
    }
    itemStmt.free();

    saveDatabase();

    res.status(201).json({
      message: 'Order placed successfully',
      order: {
        id: orderId,
        order_number: orderNumber,
        customer_name,
        customer_email,
        shipping_address,
        city,
        postal_code,
        phone,
        payment_method: payment_method || 'Credit Card',
        payment_status: 'Paid',
        subtotal,
        shipping_fee: shippingFee,
        tax,
        total_amount: totalAmount,
        order_status: 'Confirmed',
        items: verifiedItems,
        created_at: now
      }
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

// 9. GET /api/orders - List orders for authenticated user or email lookup
router.get('/orders', optionalAuth, async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const user = (req as any).user;
    const emailQuery = req.query.email as string;

    let sql = 'SELECT * FROM orders WHERE 1=1';

    if (user) {
      sql += ` AND (user_id = ${user.id} OR LOWER(customer_email) = '${user.email.toLowerCase().replace(/'/g, "''")}')`;
    } else if (emailQuery) {
      const safeEmail = emailQuery.trim().toLowerCase().replace(/'/g, "''");
      sql += ` AND LOWER(customer_email) = '${safeEmail}'`;
    } else {
      // If not logged in and no email, return recent demo orders or require auth
      return res.status(200).json({ orders: [] });
    }

    sql += ' ORDER BY id DESC';

    const orderResults = db.exec(sql);
    const orders = queryToObjects(orderResults);

    // Fetch items for each order
    const populatedOrders = orders.map((ord: any) => {
      const itemRes = db.exec(`SELECT * FROM order_items WHERE order_id = ${ord.id}`);
      const items = queryToObjects(itemRes);
      return {
        ...ord,
        items,
      };
    });

    res.json({ orders: populatedOrders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// 10. GET /api/orders/:orderNumber - View specific order tracking details
router.get('/orders/:orderNumber', async (req: Request, res: Response) => {
  try {
    const db = await getDatabase();
    const { orderNumber } = req.params;
    const safeNumber = orderNumber.replace(/'/g, "''");

    const orderRes = db.exec(`SELECT * FROM orders WHERE order_number = '${safeNumber}'`);
    const orders = queryToObjects(orderRes);

    if (!orders || orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const order: any = orders[0];
    const itemRes = db.exec(`SELECT * FROM order_items WHERE order_id = ${order.id}`);
    const items = queryToObjects(itemRes);

    res.json({
      order: {
        ...order,
        items,
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch order details' });
  }
});

export default router;
