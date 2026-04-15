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

// ─── Add Technician (creates auth user + profile) ─────────────────────────────

export async function addTechnician(
  email: string,
  password: string,
  fullName: string,
  phone: string,
  specialization: string
) {
  // Create the auth user through supabase auth  
  const result = await signUp(email, password, fullName, phone, 'technician')
  
  // The trigger auto-creates the profile, but we need to update specialization
  if (result.user) {
    // Wait a moment for trigger to fire, then update specialization
    await new Promise(r => setTimeout(r, 500))
    const { error } = await supabase
      .from('profiles')
      .update({ specialization })
      .eq('id', result.user.id)
    if (error) throw error
  }

  return result
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
