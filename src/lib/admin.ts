import { supabase } from './supabase'
import { signUp } from './auth'
import type { Profile } from './supabase'

// ─── Get All Users ────────────────────────────────────────────────────────────

export async function getAllUsers(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'user')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Profile[]
}

// ─── Get All Technicians ──────────────────────────────────────────────────────

export async function getAllTechnicians(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'technician')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Profile[]
}

// ─── Promote User to Technician ──────────────────────────────────────────────────

export async function promoteToTechnician(
  userId: string,
  specialization: string
) {
  // Update the user's role and specialization in the profiles table.
  // Requires the admin to be securely logged in (RLS checks this).
  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      role: 'technician',
      specialization 
    })
    .eq('id', userId)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Assign Technician to Service Request ────────────────────────────────────

export async function assignTechnicianToService(
  serviceRequestId: string,
  technicianId: string
) {
  const { data, error } = await supabase
    .from('service_requests')
    .update({
      technician_id: technicianId,
      status: 'In Progress',
      updated_at: new Date().toISOString(),
    })
    .eq('id', serviceRequestId)
    .select()
    .single()

  if (error) throw error

  // Add service update
  await supabase.from('service_updates').insert({
    service_request_id: serviceRequestId,
    note: 'Technician assigned. Work will begin soon.',
  })

  return data
}

// ─── Get Admin Stats ──────────────────────────────────────────────────────────

export async function getAdminStats() {
  const [usersRes, techniciansRes, servicesRes, ordersRes] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'user'),
    supabase.from('profiles').select('id', { count: 'exact' }).eq('role', 'technician'),
    supabase.from('service_requests').select('id', { count: 'exact' }).neq('status', 'Completed'),
    supabase.from('orders').select('total_amount'),
  ])

  const totalRevenue = (ordersRes.data ?? []).reduce(
    (sum: number, o: { total_amount: number }) => sum + (o.total_amount || 0), 0
  )

  return {
    totalUsers: usersRes.count ?? 0,
    totalTechnicians: techniciansRes.count ?? 0,
    activeServices: servicesRes.count ?? 0,
    monthlyRevenue: totalRevenue,
  }
}

// ─── Get All Orders ───────────────────────────────────────────────────────────

export async function getAllOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      profiles (
        full_name,
        phone
      ),
      order_items (
        *,
        products (
          name
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

// ─── Update Order Status ──────────────────────────────────────────────────────

export async function updateOrderStatus(orderId: string, status: string) {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', orderId)
    .select()
    .single()

  if (error) throw error
  return data
}
