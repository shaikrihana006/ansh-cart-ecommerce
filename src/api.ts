import { Product, User, Order, CategoryInfo } from './types.ts';

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

export async function fetchProducts(params?: {
  search?: string;
  category?: string;
  sort?: string;
  badge?: string;
  featured?: boolean;
}): Promise<{ products: Product[]; total: number }> {
  const query = new URLSearchParams();
  if (params?.search) query.append('search', params.search);
  if (params?.category && params.category !== 'All') query.append('category', params.category);
  if (params?.sort) query.append('sort', params.sort);
  if (params?.badge) query.append('badge', params.badge);
  if (params?.featured) query.append('featured', 'true');

  const res = await fetch(`${API_BASE}/products?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch products');
  return res.json();
}

export async function fetchProductByIdOrSlug(idOrSlug: string | number): Promise<{ product: Product; related: Product[] }> {
  const res = await fetch(`${API_BASE}/products/${idOrSlug}`);
  if (!res.ok) throw new Error('Product not found');
  return res.json();
}

export async function fetchCategories(): Promise<CategoryInfo[]> {
  const res = await fetch(`${API_BASE}/categories`);
  if (!res.ok) throw new Error('Failed to fetch categories');
  const data = await res.json();
  return data.categories;
}

export async function registerUser(userData: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  return data;
}

export async function loginUser(credentials: {
  email: string;
  password: string;
}): Promise<{ token: string; user: User }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  return data;
}

export async function fetchCurrentUser(): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch user');
  return data.user;
}

export async function updateUserProfile(profileData: Partial<User>): Promise<User> {
  const res = await fetch(`${API_BASE}/auth/profile`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(profileData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to update profile');
  return data.user;
}

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
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(orderPayload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to place order');
  return data;
}

export async function fetchUserOrders(email?: string): Promise<Order[]> {
  const query = email ? `?email=${encodeURIComponent(email)}` : '';
  const res = await fetch(`${API_BASE}/orders${query}`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch orders');
  return data.orders || [];
}

export async function fetchOrderDetails(orderNumber: string): Promise<Order> {
  const res = await fetch(`${API_BASE}/orders/${encodeURIComponent(orderNumber)}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to load order');
  return data.order;
}
