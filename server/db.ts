import initSqlJs, { Database, QueryExecResult } from 'sql.js';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DB_FILE_PATH = path.join(process.cwd(), 'ansh_cart.sqlite');

let dbInstance: Database | null = null;

// Helper to save SQLite binary database file to disk
export function saveDatabase(): void {
  if (!dbInstance) return;
  try {
    const data = dbInstance.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE_PATH, buffer);
  } catch (err) {
    console.error('Failed to save SQLite database to disk:', err);
  }
}

// Initialize SQLite database
export async function getDatabase(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE_PATH);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (err) {
      console.error('Error loading existing database, creating new one:', err);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  initTables(dbInstance);
  seedInitialData(dbInstance);
  saveDatabase();

  return dbInstance;
}

function initTables(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'customer',
      avatar TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      postal_code TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      tagline TEXT,
      description TEXT NOT NULL,
      features TEXT NOT NULL,
      price REAL NOT NULL,
      compare_at_price REAL,
      category TEXT NOT NULL,
      image TEXT NOT NULL,
      secondary_images TEXT NOT NULL,
      rating REAL DEFAULT 4.8,
      reviews_count INTEGER DEFAULT 0,
      stock INTEGER DEFAULT 25,
      is_featured INTEGER DEFAULT 0,
      badge TEXT,
      tags TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      customer_name TEXT NOT NULL,
      customer_email TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      city TEXT NOT NULL,
      postal_code TEXT NOT NULL,
      phone TEXT,
      payment_method TEXT NOT NULL,
      payment_status TEXT DEFAULT 'Paid',
      subtotal REAL NOT NULL,
      shipping_fee REAL NOT NULL,
      tax REAL NOT NULL,
      total_amount REAL NOT NULL,
      order_status TEXT DEFAULT 'Confirmed',
      notes TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      product_title TEXT NOT NULL,
      product_image TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );
  `);
}

function seedInitialData(db: Database): void {
  // Check if products exist
  const res = db.exec('SELECT COUNT(*) as count FROM products');
  const count = (res[0]?.values[0]?.[0] as number) || 0;
  if (count > 0) {
    return;
  }

  console.log('Seeding initial curated products and demo users for ANSH CART SQLite database...');

  // Default demo user: demo@anshcart.com / password123
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync('password123', salt);
  const now = new Date().toISOString();

  const userStmt = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, phone, address, city, postal_code, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  userStmt.run([
    'Anshul Verma',
    'ansh@anshcart.com',
    passwordHash,
    'customer',
    '+1 (555) 234-8901',
    '742 Evergreen Terrace, Suite 4B',
    'San Francisco',
    '94107',
    now,
  ]);
  userStmt.free();

  const curatedProducts = [
    {
      title: 'Minimalist Matte Aluminum Mechanical Keyboard',
      slug: 'minimalist-aluminum-mechanical-keyboard',
      tagline: 'Custom tactile hot-swappable switches in an anodized CNC chassis.',
      description: 'Engineered for seamless productivity and tactile typing delight. Built with aircraft-grade aluminum, custom lubed switches, factory foam sound dampening, and seamless Bluetooth 5.2 / 2.4GHz / USB-C tri-mode connectivity.',
      features: JSON.stringify([
        'Full CNC Anodized Aluminum casing',
        'Custom pre-lubed silent tactile switches',
        'Multi-device pairing up to 3 devices',
        '4000mAh battery lasting up to 200 hours',
        'RGB subtle per-key backlighting with warm white profile'
      ]),
      price: 139.00,
      compare_at_price: 169.00,
      category: 'Workspace & Tech',
      image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
      secondary_images: JSON.stringify([
        'https://images.unsplash.com/photo-1595225476474-87563907a212?auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80'
      ]),
      rating: 4.9,
      reviews_count: 142,
      stock: 18,
      is_featured: 1,
      badge: 'Best Seller',
      tags: 'keyboard, workspace, aluminum, mechanical, tech',
    },
    {
      title: 'Artisan Solid Walnut Desk Shelf & Riser',
      slug: 'artisan-solid-walnut-desk-shelf',
      tagline: 'Elevate your monitor to ergonomic eye-level with natural North American walnut.',
      description: 'Handcrafted from sustainably sourced American black walnut and sandblasted matte steel legs. Features an integrated cork-lined tray for pens and everyday carry accessories, organizing your workspace with timeless warmth.',
      features: JSON.stringify([
        'Solid 100% natural American Walnut grain',
        'Supports up to 2 large displays (up to 75 lbs)',
        'Integrated micro-storage valet tray with felt bottom',
        'Precision non-slip silicone feet pads'
      ]),
      price: 118.00,
      compare_at_price: 145.00,
      category: 'Workspace & Tech',
      image: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?auto=format&fit=crop&w=1000&q=80',
      secondary_images: JSON.stringify([
        'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1000&q=80'
      ]),
      rating: 4.8,
      reviews_count: 88,
      stock: 12,
      is_featured: 1,
      badge: 'Staff Pick',
      tags: 'desk shelf, walnut, organizer, ergonomics',
    },
    {
      title: 'Precision Japanese Pour-Over Gooseneck Kettle',
      slug: 'japanese-pour-over-gooseneck-kettle',
      tagline: 'Ergonomic counter-balanced handle with smooth laminar flow spout.',
      description: 'Crafted for coffee perfectionists. Features a fluted gooseneck spout designed for steady, turbulence-free water pouring, an analog temperature gauge on the lid, and triple-coated food-grade matte stainless steel.',
      features: JSON.stringify([
        'Ultra-precise flow control spout',
        'Integrated bi-metal temperature gauge (195-205°F highlight)',
        'Counter-balanced heat resistant ergonomic grip',
        'Induction, gas, and electric stovetop compatible'
      ]),
      price: 64.00,
      compare_at_price: 79.00,
      category: 'Kitchen & Brew',
      image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80',
      secondary_images: JSON.stringify([
        'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1000&q=80'
      ]),
      rating: 4.9,
      reviews_count: 119,
      stock: 22,
      is_featured: 1,
      badge: 'Popular',
      tags: 'coffee, kettle, pour over, kitchen, brew',
    },
    {
      title: 'Full-Grain Leather EDC Zipper Folio & Tablet Sleeve',
      slug: 'full-grain-leather-edc-folio',
      tagline: 'Vegetable-tanned leather that develops a rich, golden patina over time.',
      description: 'The definitive daily companion for creatives and executives. Accommodates up to a 13-inch laptop or iPad Pro, notebook, fountain pens, passport, cables, and bank cards in one sleek, hand-stitched leather case.',
      features: JSON.stringify([
        'Full-grain Italian vegetable tanned leather',
        'Smooth antique brass YKK Excella zippers',
        'Dedicated microfiber-lined tablet partition',
        'Interior passport and 4 card slots with RFID shielding'
      ]),
      price: 92.00,
      compare_at_price: 115.00,
      category: 'Everyday Carry',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=80',
      secondary_images: JSON.stringify([
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1000&q=80'
      ]),
      rating: 4.7,
      reviews_count: 64,
      stock: 15,
      is_featured: 0,
      badge: 'Handcrafted',
      tags: 'leather, edc, sleeve, folio, carry',
    },
    {
      title: 'Ultrasonic Ceramic Aromatherapy Stone Diffuser',
      slug: 'ultrasonic-ceramic-aroma-diffuser',
      tagline: 'Whisper-quiet cold mist diffusion encased in hand-cast textured ceramic.',
      description: 'Transforms your living room or bedroom into a sanctuary of calm. Employs 2.4MHz ultrasonic frequencies to gently diffuse 100% pure essential oils without heat degradation, preserving botanical therapeutic benefits.',
      features: JSON.stringify([
        'Hand-thrown matte bisque porcelain cover',
        'Two mist modes: continuous (4 hrs) or intermittent (8 hrs)',
        'Ambient warm LED glow (can operate independently of mist)',
        'Automatic waterless safety shut-off'
      ]),
      price: 52.00,
      compare_at_price: 65.00,
      category: 'Wellness & Rest',
      image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1000&q=80',
      secondary_images: JSON.stringify([
        'https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=1000&q=80'
      ]),
      rating: 4.8,
      reviews_count: 93,
      stock: 30,
      is_featured: 1,
      badge: 'Trending',
      tags: 'diffuser, aroma, wellness, home, ceramic',
    },
    {
      title: 'Double-Walled Borosilicate Glass French Press',
      slug: 'double-walled-borosilicate-french-press',
      tagline: 'Thermal insulation that keeps coffee scalding hot while staying cool to the touch.',
      description: 'Engineered with double-walled laboratory-grade borosilicate glass to retain heat 40% longer than traditional carafes. Features a micro-mesh 4-level filtration system that delivers clean, full-bodied coffee without silt.',
      features: JSON.stringify([
        'Thermal insulated double-wall glass chamber (800ml / 27oz)',
        '304 Stainless steel four-stage spring micro-filtration',
        'Cool-touch handle and non-drip pouring rim',
        'Dishwasher safe glass and filter components'
      ]),
      price: 46.00,
      compare_at_price: 58.00,
      category: 'Kitchen & Brew',
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=1000&q=80',
      secondary_images: JSON.stringify([
        'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80'
      ]),
      rating: 4.7,
      reviews_count: 76,
      stock: 25,
      is_featured: 0,
      badge: 'Kitchen Essential',
      tags: 'french press, coffee, glass, brew',
    },
    {
      title: 'Cast Aluminum Ergonomic Noise-Cancelling Headphones',
      slug: 'cast-aluminum-noise-cancelling-headphones',
      tagline: 'Studio clarity audio with hybrid active noise cancellation and memory foam earcups.',
      description: 'Immerse yourself in acoustic precision. Custom 40mm beryllium-coated dynamic drivers deliver deep resonant bass and sparkling highs, wrapped in plush lambskin memory foam for all-day listening fatigue prevention.',
      features: JSON.stringify([
        'Hybrid ANC cancelling up to 38dB ambient drone',
        'Audiophile-tuned 40mm Beryllium dynamic drivers',
        'Up to 45 hours battery life with fast quick-charge (15 min = 6 hrs)',
        'Dual beamforming MEMS microphones with AI vocal clarity'
      ]),
      price: 189.00,
      compare_at_price: 229.00,
      category: 'Workspace & Tech',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      secondary_images: JSON.stringify([
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80'
      ]),
      rating: 4.9,
      reviews_count: 215,
      stock: 14,
      is_featured: 1,
      badge: 'Editor’s Choice',
      tags: 'headphones, audio, anc, bluetooth, music',
    },
    {
      title: 'Weighted Organic Bamboo Cooling Gravity Blanket',
      slug: 'weighted-organic-bamboo-cooling-blanket',
      tagline: 'Evenly distributed micro-glass beads wrapped in silky cooling bamboo lyocell.',
      description: 'Designed to relieve sensory overload and promote deep, restorative REM sleep. The breathable organic bamboo shell wicks away moisture and body heat, while the 15-pound gentle compression mimics the calming sensation of being held.',
      features: JSON.stringify([
        '100% Organic Bamboo Lyocell 300TC silky shell',
        'Hypoallergenic micro-glass bead filling in 4x4 quilted pockets',
        'Temperature regulating cooling technology for hot sleepers',
        'Machine washable with reinforced double-stitched perimeter'
      ]),
      price: 110.00,
      compare_at_price: 139.00,
      category: 'Wellness & Rest',
      image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=80',
      secondary_images: JSON.stringify([
        'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1000&q=80'
      ]),
      rating: 4.8,
      reviews_count: 104,
      stock: 16,
      is_featured: 0,
      badge: 'Sleep Well',
      tags: 'blanket, weighted, sleep, wellness, bamboo',
    },
    {
      title: 'Nordic Cast Iron Dutch Oven (4.5 Quart)',
      slug: 'nordic-cast-iron-dutch-oven',
      tagline: 'Heavy-gauge enameled cast iron for artisanal sourdough, braises, and stews.',
      description: 'A kitchen heirloom built to last generations. Features a heavy self-basting condensation lid with interior raised spikes, matte graphite enamel interior that requires no seasoning, and ergonomic wide loop handles for oven-mitt security.',
      features: JSON.stringify([
        'Heirloom quality enameled cast iron distribution',
        'Oven safe up to 500°F (260°C)',
        'Spiked moisture-locking condensation lid system',
        'Scratch-resistant enamel cleans easily without sticking'
      ]),
      price: 88.00,
      compare_at_price: 110.00,
      category: 'Home & Living',
      image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?auto=format&fit=crop&w=1000&q=80',
      secondary_images: JSON.stringify([
        'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80'
      ]),
      rating: 4.9,
      reviews_count: 138,
      stock: 20,
      is_featured: 1,
      badge: 'Culinary Master',
      tags: 'dutch oven, cookware, cast iron, kitchen, baking',
    },
    {
      title: 'Waterproof Cordura Commuter Sling Bag (6L)',
      slug: 'waterproof-cordura-commuter-sling-bag',
      tagline: 'Weatherproof 500D ballistic nylon with Fidlock magnetic quick-release buckle.',
      description: 'Streamlined urban mobility. Featuring dedicated quick-draw compartments for your phone, keys with carabiner, sunglasses with fleece lining, and an internal padded tablet sleeve. The magnetic V-buckle detaches smoothly with one hand.',
      features: JSON.stringify([
        'Indestructible 500D Cordura ballistic nylon exterior',
        'German Fidlock magnetic quick-disconnect buckle',
        'AquaGuard weatherproof YKK zippers',
        'Concealed back passport and wallet security pocket'
      ]),
      price: 78.00,
      compare_at_price: 95.00,
      category: 'Everyday Carry',
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1000&q=80',
      secondary_images: JSON.stringify([
        'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1000&q=80'
      ]),
      rating: 4.8,
      reviews_count: 82,
      stock: 24,
      is_featured: 0,
      badge: 'Weatherproof',
      tags: 'sling bag, cordura, edc, travel, commuter',
    },
    {
      title: 'Hand-Poured Soy Wax & Cedarwood Amber Candle',
      slug: 'soy-wax-cedarwood-amber-candle',
      tagline: 'Notes of cracked peppercorn, smoked cedar, and warm amber resin in amber glass.',
      description: 'Cast in heavy amber apothecary jars with an unbleached crackling wooden wick that gently crackles like a cozy hearth. Hand-poured in small batches using 100% Midwestern soy wax and phthalate-free fragrance botanicals.',
      features: JSON.stringify([
        '65-hour clean burn with zero paraffin soot',
        'FSC-certified dual wooden wick with subtle crackle',
        'Reusable apothecary glass vessel with embossed cork lid',
        'Infused with pure cedar, vetiver, and cardamom essential oils'
      ]),
      price: 28.00,
      compare_at_price: 35.00,
      category: 'Home & Living',
      image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=80',
      secondary_images: JSON.stringify([
        'https://images.unsplash.com/photo-1572726729437-3732efed37c1?auto=format&fit=crop&w=1000&q=80'
      ]),
      rating: 4.9,
      reviews_count: 174,
      stock: 45,
      is_featured: 0,
      badge: 'Best Value',
      tags: 'candle, home, aromatherapy, soy, cedarwood',
    },
    {
      title: 'Magnetic Wireless Fast-Charge Stand with MagSafe',
      slug: 'magnetic-wireless-fast-charge-stand',
      tagline: 'Weighted zinc-alloy 3-in-1 dock for iPhone, Apple Watch, and AirPods.',
      description: 'Streamline your bedside or desk with a single minimalist charging tower. Strong N52 neodymium magnets snap your device firmly in portrait or landscape standby mode, powering up to 15W fast Qi2 wireless speeds.',
      features: JSON.stringify([
        'Heavy non-tip weighted solid zinc alloy base',
        'Simultaneous 3-in-1 fast charging (Phone, Watch, Buds)',
        'Rotates seamlessly into iOS StandBy clock mode',
        'Included 30W GaN power adapter and braided 2m cable'
      ]),
      price: 69.00,
      compare_at_price: 85.00,
      category: 'Workspace & Tech',
      image: 'https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=1000&q=80',
      secondary_images: JSON.stringify([
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80'
      ]),
      rating: 4.8,
      reviews_count: 97,
      stock: 28,
      is_featured: 1,
      badge: 'Must Have',
      tags: 'wireless charger, magsafe, desk, phone, dock',
    }
  ];

  const prodStmt = db.prepare(`
    INSERT INTO products (
      title, slug, tagline, description, features, price, compare_at_price,
      category, image, secondary_images, rating, reviews_count, stock,
      is_featured, badge, tags, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const p of curatedProducts) {
    prodStmt.run([
      p.title,
      p.slug,
      p.tagline,
      p.description,
      p.features,
      p.price,
      p.compare_at_price,
      p.category,
      p.image,
      p.secondary_images,
      p.rating,
      p.reviews_count,
      p.stock,
      p.is_featured,
      p.badge,
      p.tags,
      now,
    ]);
  }
  prodStmt.free();

  // Create a sample seeded past order for the demo user
  const orderStmt = db.prepare(`
    INSERT INTO orders (
      order_number, user_id, customer_name, customer_email, shipping_address,
      city, postal_code, phone, payment_method, payment_status,
      subtotal, shipping_fee, tax, total_amount, order_status, notes, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  orderStmt.run([
    'AC-2026-9814',
    1,
    'Anshul Verma',
    'ansh@anshcart.com',
    '742 Evergreen Terrace, Suite 4B',
    'San Francisco',
    '94107',
    '+1 (555) 234-8901',
    'Credit Card (ending in 4242)',
    'Paid',
    203.00,
    0.00,
    16.24,
    219.24,
    'Shipped',
    'Please leave package at the front porch.',
    new Date(Date.now() - 3 * 86400000).toISOString()
  ]);
  orderStmt.free();

  const orderIdRes = db.exec('SELECT last_insert_rowid() as id');
  const orderId = orderIdRes[0]?.values[0]?.[0] as number;

  if (orderId) {
    const itemStmt = db.prepare(`
      INSERT INTO order_items (order_id, product_id, product_title, product_image, price, quantity)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    itemStmt.run([
      orderId,
      1,
      'Minimalist Matte Aluminum Mechanical Keyboard',
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
      139.00,
      1
    ]);
    itemStmt.run([
      orderId,
      3,
      'Precision Japanese Pour-Over Gooseneck Kettle',
      'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1000&q=80',
      64.00,
      1
    ]);
    itemStmt.free();
  }

  console.log('Successfully seeded SQLite database for ANSH CART.');
}

// Convert SQLite QueryExecResult to array of objects
export function queryToObjects<T = Record<string, any>>(result: QueryExecResult[]): T[] {
  if (!result || result.length === 0) return [];
  const columns = result[0].columns;
  const values = result[0].values;
  return values.map((row) => {
    const obj: Record<string, any> = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj as T;
  });
}
