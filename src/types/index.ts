// Tipos de Usuario
export interface User {
  id: number;
  email: string;
  full_name: string;
  password_hash?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  postal_code?: string;
  profile_image_url?: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// Tipos de Producto
export interface Product {
  id: number;
  name: string;
  description?: string;
  category: string;
  price_cop: number;
  image_url?: string;
  image_data?: string;
  sku?: string;
  stock_quantity: number;
  is_available: boolean;
  created_by?: number;
  created_at: Date;
  updated_at: Date;
}

// Tipos de Orden
export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  subtotal_cop: number;
  tax_cop: number;
  total_cop: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  payment_method?: string;
  shipping_address?: string;
  tracking_number?: string;
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

// Tipos de Item de Orden
export interface OrderItem {
  id: number;
  order_id: number;
  product_id?: number;
  quantity: number;
  price_cop: number;
  subtotal_cop: number;
  created_at: Date;
}

// Tipos de Curso
export interface Course {
  id: number;
  title: string;
  description?: string;
  instructor_id?: number;
  price_cop: number;
  duration_hours?: number;
  level?: string;
  category?: string;
  image_url?: string;
  is_published: boolean;
  created_at: Date;
  updated_at: Date;
}

// Tipos de Carrito
export interface CartItem {
  id: number;
  user_id?: number;
  session_id?: string;
  product_id: number;
  quantity: number;
  added_at: Date;
}

// Tipos de Respuesta
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Tipos de Solicitud
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  full_name: string;
  password: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  category: string;
  price_cop: number;
  image_url?: string;
  stock_quantity?: number;
}

export interface CreateOrderRequest {
  user_id: number;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}
