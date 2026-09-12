import { Product, User, Order, CategoryInfo } from './types.ts';
import { FALLBACK_PRODUCTS, DEMO_USER, DEMO_ORDERS } from './fallbackData.ts';

const API_BASE = '/api';

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('ansh_cart_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Client-side fallback storage keys for static hosting (GitHub Pages)
const LOCAL_ORDERS_KEY = 'ansh_cart_local_orders';
const LOCAL_USERS_KEY = 'ansh_cart_local_users';

function getLocalOrders(): Order[] {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    return raw ? JSON.parse(raw) : DEMO_ORDERS;
  } catch {
    return DEMO_ORDERS;
  }
}

function saveLocalOrders(orders: Order[]) {
  try {
    localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

// 1. Fetch Products
export async function fetchProducts(params?: {
  search?: string;
  category?: string;
  sort?: string;
  badge?: string;
  featured?: boolean;
}): Promise<{ products: Product[]; total: number }> {
  try {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category && params.category !== 'All') query.append('category', params.category);
    if (params?.sort) query.append('sort', params.sort);
    if (params?.badge) query.append('badge', params.badge);
    if (params?.featured) query.append('featured', 'true');

    const res = await fetch(`${API_BASE}/products?${query.toString()}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Backend unavailable or static host (e.g. GitHub Pages)
  }

  // Graceful client fallback for GitHub Pages
  let filtered = [...FALLBACK_PRODUCTS];

  if (params?.category && params.category !== 'All') {
    filtered = filtered.filter((p) => p.category === params.category);
  }
  if (params?.badge) {
    filtered = filtered.filter((p) => p.badge === params.badge);
  }
  if (params?.featured) {
    filtered = filtered.filter((p) => p.is_featured === 1);
  }
  if (params?.search && params.search.trim()) {
    const q = params.search.trim().toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.tagline && p.tagline.toLowerCase().includes(q)) ||
        p.category.toLowerCase().includes(q)
    );
  }

  switch (params?.sort) {
    case 'price-asc':
      filtered.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      filtered.sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      filtered.sort((a, b) => b.rating - a.rating);
      break;
    case 'newest':
      filtered.sort((a, b) => b.id - a.id);
      break;
    case 'featured':
    default:
      filtered.sort((a, b) => b.is_featured - a.is_featured || b.rating - a.rating);
      break;
  }

  return { products: filtered, total: filtered.length };
}

// 2. Fetch Product by ID or Slug
export async function fetchProductByIdOrSlug(
  idOrSlug: string | number
): Promise<{ product: Product; related: Product[] }> {
  try {
    const res = await fetch(`${API_BASE}/products/${idOrSlug}`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Backend unavailable
  }

  const p = FALLBACK_PRODUCTS.find(
    (item) => item.id === Number(idOrSlug) || item.slug === String(idOrSlug)
  ) || FALLBACK_PRODUCTS[0];

  const related = FALLBACK_PRODUCTS.filter(
    (item) => item.category === p.category && item.id !== p.id
  ).slice(0, 4);

  return { product: p, related };
}

// 3. Fetch Categories
export async function fetchCategories(): Promise<CategoryInfo[]> {
  try {
    const res = await fetch(`${API_BASE}/categories`);
    if (res.ok) {
      const data = await res.json();
      return data.categories;
    }
  } catch (err) {
    // Backend unavailable
  }

  const map: Record<string, number> = {};
  for (const p of FALLBACK_PRODUCTS) {
    map[p.category] = (map[p.category] || 0) + 1;
  }
  return Object.entries(map).map(([category, count]) => ({ category, count }));
}

// 4. Register User
export async function registerUser(userData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}): Promise<{ token: string; user: User }> {
  try {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    if (res.ok) {
      return await res.json();
    }
    const errData = await res.json();
    throw new Error(errData.error || 'Registration failed');
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
  }

  // Fallback for static GitHub Pages
  const newUser: User = {
    id: Date.now(),
    name: userData.name,
    email: userData.email,
    role: 'customer',
    phone: userData.phone,
    address: userData.address,
    city: userData.city,
    postal_code: userData.postal_code,
  };
  localStorage.setItem('ansh_cart_current_user', JSON.stringify(newUser));
  return { token: 'offline_token_' + Date.now(), user: newUser };
}

// 5. Login User
export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (res.ok) {
      return await res.json();
    }
    const errData = await res.json();
    throw new Error(errData.error || 'Login failed');
  } catch (err: any) {
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
  }

  // Fallback for static GitHub Pages
  if (credentials.email.toLowerCase() === 'ansh@anshcart.com') {
    localStorage.setItem('ansh_cart_current_user', JSON.stringify(DEMO_USER));
    return { token: 'offline_demo_token', user: DEMO_USER };
  }

  const customUser: User = {
    id: 99,
    name: credentials.email.split('@')[0],
    email: credentials.email,
    role: 'customer',
  };
  localStorage.setItem('ansh_cart_current_user', JSON.stringify(customUser));
  return { token: 'offline_token_' + Date.now(), user: customUser };
}

// 6. Current User
export async function fetchCurrentUser(): Promise<User> {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch (err) {
    // Backend unavailable
  }

  const raw = localStorage.getItem('ansh_cart_current_user');
  if (raw) {
    return JSON.parse(raw);
  }
  return DEMO_USER;
}

// 7. Update Profile
export async function updateUserProfile(profileData: Partial<User>): Promise<User> {
  try {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    if (res.ok) {
      const data = await res.json();
      return data.user;
    }
  } catch (err) {
    // Backend unavailable
  }

  const current = await fetchCurrentUser();
  const updated = { ...current, ...profileData };
  localStorage.setItem('ansh_cart_current_user', JSON.stringify(updated));
  return updated;
}

// 8. Create Order
export async function createOrder(orderPayload: {
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  city: string;
  postal_code: string;
  phone?: string;
  payment_method: string;
  items: Array<{ productId: number; quantity: number }>;
  notes?: string;
}): Promise<{ message: string; order: Order }> {
  try {
    const res = await fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(orderPayload),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Backend unavailable
  }

  // Fallback for static GitHub Pages
  let subtotal = 0;
  const verifiedItems = orderPayload.items.map((item) => {
    const prod = FALLBACK_PRODUCTS.find((p) => p.id === item.productId) || FALLBACK_PRODUCTS[0];
    subtotal += prod.price * item.quantity;
    return {
      product_id: prod.id,
      product_title: prod.title,
      product_image: prod.image,
      price: prod.price,
      quantity: item.quantity,
    };
  });

  const shippingFee = subtotal >= 75 ? 0 : 9.0;
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const totalAmount = Math.round((subtotal + shippingFee + tax) * 100) / 100;
  const orderNumber = `AC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  const newOrder: Order = {
    id: Date.now(),
    order_number: orderNumber,
    customer_name: orderPayload.customer_name,
    customer_email: orderPayload.customer_email,
    shipping_address: orderPayload.shipping_address,
    city: orderPayload.city,
    postal_code: orderPayload.postal_code,
    phone: orderPayload.phone,
    payment_method: orderPayload.payment_method,
    payment_status: 'Paid',
    subtotal,
    shipping_fee: shippingFee,
    tax,
    total_amount: totalAmount,
    order_status: 'Confirmed',
    notes: orderPayload.notes,
    items: verifiedItems,
    created_at: new Date().toISOString(),
  };

  const existing = getLocalOrders();
  saveLocalOrders([newOrder, ...existing]);

  return { message: 'Order placed successfully', order: newOrder };
}

// 9. Fetch Orders
export async function fetchUserOrders(email?: string): Promise<Order[]> {
  try {
    const query = email ? `?email=${encodeURIComponent(email)}` : '';
    const res = await fetch(`${API_BASE}/orders${query}`, {
      headers: getAuthHeaders(),
    });
    if (res.ok) {
      const data = await res.json();
      return data.orders || [];
    }
  } catch (err) {
    // Backend unavailable
  }

  const local = getLocalOrders();
  if (email) {
    return local.filter((o) => o.customer_email.toLowerCase() === email.toLowerCase());
  }
  return local;
}

// 10. Fetch Order Details
export async function fetchOrderDetails(orderNumber: string): Promise<Order> {
  try {
    const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderNumber)}`);
    if (res.ok) {
      const data = await res.json();
      return data.order;
    }
  } catch (err) {
    // Backend unavailable
  }

  const local = getLocalOrders();
  const found = local.find((o) => o.order_number === orderNumber);
  if (found) return found;
  return local[0] || DEMO_ORDERS[0];
}
