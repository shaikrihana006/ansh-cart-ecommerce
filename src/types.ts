export interface Product {
  id: number;
  title: string;
  slug: string;
  tagline?: string;
  description: string;
  features: string[];
  price: number;
  compare_at_price?: number;
  category: string;
  image: string;
  secondary_images: string[];
  rating: number;
  reviews_count: number;
  stock: number;
  is_featured: number;
  badge?: string;
  tags?: string[];
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  phone?: string;
  address?: string;
  city?: string;
  postal_code?: string;
}

export interface OrderItem {
  id?: number;
  order_id?: number;
  product_id: number;
  product_title: string;
  product_image: string;
  price: number;
  quantity: number;
}

export interface Order {
  id: number;
  order_number: string;
  user_id?: number;
  customer_name: string;
  customer_email: string;
  shipping_address: string;
  city: string;
  postal_code: string;
  phone?: string;
  payment_method: string;
  payment_status: string;
  subtotal: number;
  shipping_fee: number;
  tax: number;
  total_amount: number;
  order_status: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
}

export interface CategoryInfo {
  category: string;
  count: number;
}
