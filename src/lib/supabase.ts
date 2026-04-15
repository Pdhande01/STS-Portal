// Re-export the supabase client from the root supabase.ts
export { supabase } from '../supabase'

// ─── Database Types ──────────────────────────────────────────────────────────

export type UserRole = 'user' | 'technician' | 'admin'

export interface Profile {
  id: string
  full_name: string
  phone: string | null
  role: UserRole
  specialization: string | null
  created_at: string
}

export interface ServiceRequest {
  id: string
  user_id: string
  technician_id: string | null
  device_type: string
  brand: string
  model: string
  issue_type: string
  description: string
  service_location: 'home' | 'shop'
  address: string | null
  phone: string
  preferred_date: string
  preferred_time: string
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled'
  progress: number
  created_at: string
  updated_at: string
  // joined
  profiles?: Profile
  technician?: Profile
  service_updates?: ServiceUpdate[]
}

export interface ServiceUpdate {
  id: string
  service_request_id: string
  note: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  category: 'memory' | 'storage' | 'accessories'
  price: number
  stock: number
  image_url: string | null
  rating: number
  reviews: number
  trending: boolean
  created_at: string
}

export interface Order {
  id: string
  user_id: string
  total_amount: number
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
  created_at: string
  order_items?: OrderItem[]
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price_at_purchase: number
  products?: Product
}
