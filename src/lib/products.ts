import { supabase } from './supabase'
import type { Product, Order } from './supabase'

// ─── Get All Products ─────────────────────────────────────────────────────────

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) throw error
  return data as Product[]
}

// ─── Get User's Orders ────────────────────────────────────────────────────────

export async function getUserOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(*, products(*))
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Order[]
}

// ─── Create Order (Checkout) ──────────────────────────────────────────────────

interface CartItem {
  productId: string
  quantity: number
  price: number
}

export async function createOrder(cartItems: CartItem[]): Promise<Order> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ user_id: user.id, total_amount: total })
    .select()
    .single()

  if (orderError) throw orderError

  // Create order items
  const items = cartItems.map(item => ({
    order_id: order.id,
    product_id: item.productId,
    quantity: item.quantity,
    price_at_purchase: item.price,
  }))

  const { error: itemsError } = await supabase.from('order_items').insert(items)
  if (itemsError) throw itemsError

  // Decrement stock for each product
  for (const item of cartItems) {
    await supabase.rpc('decrement_stock', {
      product_id: item.productId,
      amount: item.quantity,
    }).catch(() => {
      // If the RPC doesn't exist yet, just skip stock update
    })
  }

  return order as Order
}

// ─── Admin: Add Product ───────────────────────────────────────────────────────

export async function addProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single()

  if (error) throw error
  return data as Product
}

// ─── Admin: Update Product ────────────────────────────────────────────────────

export async function updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Product
}

// ─── Admin: Get All Orders ────────────────────────────────────────────────────

export async function getAllOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select(`*, order_items(*, products(*))`)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Order[]
}
