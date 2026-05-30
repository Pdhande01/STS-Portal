import { supabase } from './supabase'
import type { Product, Order, ProductReview } from './supabase'
import { createAuditLog } from './audit'

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

export async function createOrder(cartItems: CartItem[], deliveryAddress: string): Promise<Order> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // Create the order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({ user_id: user.id, total_amount: total, delivery_address: deliveryAddress })
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
    const { error } = await supabase.rpc('decrement_stock', {
      product_id: item.productId,
      amount: item.quantity,
    })
    if (error) {
      // If the RPC doesn't exist yet or fails, just skip stock update
      console.warn('Could not update stock:', error.message)
    }
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
  const newProd = data as Product

  await createAuditLog(
    'Add Product',
    `Product: ${newProd.name}`,
    `Added new inventory item. Category: ${newProd.category}, Price: ₹${newProd.price}, Initial Stock: ${newProd.stock}`
  )

  return newProd
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
  const updatedProd = data as Product

  const changes = Object.entries(updates)
    .map(([k, v]) => `${k} -> ${v}`)
    .join(', ')

  await createAuditLog(
    'Update Product',
    `Product: ${updatedProd.name}`,
    `Updated fields: ${changes}`
  )

  return updatedProd
}

// ─── Admin: Delete Product ────────────────────────────────────────────────────

export async function deleteProduct(productId: string): Promise<void> {
  // Fetch product name first for logging
  const { data: prod } = await supabase
    .from('products')
    .select('name')
    .eq('id', productId)
    .single()
  const productName = prod?.name || productId

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', productId)

  if (error) throw error

  await createAuditLog(
    'Delete Product',
    `Product: ${productName}`,
    `Deleted product from inventory.`
  )
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

// ─── Product Reviews ──────────────────────────────────────────────────────────

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  const { data, error } = await supabase
    .from('product_reviews')
    .select('*')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ProductReview[]
}

export async function addProductReview(
  productId: string,
  rating: number,
  comment: string
): Promise<ProductReview> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Get user's name from profile
  let fullName = 'Anonymous'
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()

    if (profile?.full_name) {
      fullName = profile.full_name
    } else if (user.user_metadata?.full_name) {
      fullName = user.user_metadata.full_name
    } else if (user.email) {
      fullName = user.email.split('@')[0]
      fullName = fullName.charAt(0).toUpperCase() + fullName.slice(1)
    }
  } catch (e) {
    console.warn('Could not fetch profile for review name:', e)
    if (user.user_metadata?.full_name) {
      fullName = user.user_metadata.full_name
    } else if (user.email) {
      fullName = user.email.split('@')[0]
    }
  }

  // Insert review
  const { data: review, error: insertError } = await supabase
    .from('product_reviews')
    .insert({
      product_id: productId,
      user_id: user.id,
      full_name: fullName,
      rating,
      comment,
    })
    .select()
    .single()

  if (insertError) throw insertError

  // Fetch all reviews for this product to recalculate rating
  const { data: reviews, error: fetchReviewsError } = await supabase
    .from('product_reviews')
    .select('rating')
    .eq('product_id', productId)

  if (fetchReviewsError) throw fetchReviewsError

  const totalReviews = reviews.length
  const averageRating = totalReviews > 0
    ? Math.round((reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / totalReviews) * 10) / 10
    : 0

  // Update product statistics
  const { error: updateError } = await supabase
    .from('products')
    .update({
      rating: averageRating,
      reviews: totalReviews,
    })
    .eq('id', productId)

  if (updateError) throw updateError

  return review as ProductReview
}

