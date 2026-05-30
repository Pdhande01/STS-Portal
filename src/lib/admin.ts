import { supabase } from './supabase'
import type { Profile } from './supabase'
import { createAuditLog } from './audit'

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

// ─── Delete User Profile ──────────────────────────────────────────────────────

export async function deleteUser(userId: string): Promise<void> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()
  const email = profile?.email || userId

  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId)

  if (error) throw error

  await createAuditLog('Delete User', `User: ${email}`, `Permanently deleted user account.`)
}

// ─── Update User Status (Restrict/Active) ─────────────────────────────────────

export async function updateUserStatus(userId: string, status: 'active' | 'suspended'): Promise<void> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()
  const email = profile?.email || userId

  const { error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', userId)

  if (error) throw error

  await createAuditLog(
    'User Status Update',
    `User: ${email}`,
    `Updated user status to ${status}.`
  )
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
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', userId)
    .single()
  const email = profile?.email || userId

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

  await createAuditLog(
    'Promote User',
    `User: ${email}`,
    `Promoted user to Technician with specialization: ${specialization}.`
  )

  return data
}

// ─── Create Technician directly ──────────────────────────────────────────────

export async function createTechnician(
  email: string,
  password: string,
  fullName: string,
  phone: string,
  specialization: string
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { 
        full_name: fullName, 
        phone, 
        role: 'technician',
        specialization 
      },
    },
  })
  if (error) throw error

  await createAuditLog(
    'Create Technician',
    `Tech: ${email}`,
    `Created new technician: ${fullName} (${specialization}).`
  )

  return data
}

// ─── Demote Technician back to User ──────────────────────────────────────────

export async function demoteTechnician(techId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('email')
    .eq('id', techId)
    .single()
  const email = profile?.email || techId

  const { data, error } = await supabase
    .from('profiles')
    .update({ 
      role: 'user',
      specialization: null 
    })
    .eq('id', techId)
    .select()
    .single()

  if (error) throw error

  await createAuditLog(
    'Demote Technician',
    `Tech: ${email}`,
    `Demoted technician back to standard user role.`
  )

  return data
}

// ─── Assign Technician to Service Request ────────────────────────────────────

export async function assignTechnicianToService(
  serviceRequestId: string,
  technicianId: string
) {
  const { data: tech } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', technicianId)
    .single()
  const techName = tech?.full_name || technicianId

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

  await supabase.from('service_updates').insert({
    service_request_id: serviceRequestId,
    note: 'Technician assigned. Work will begin soon.',
  })

  await createAuditLog(
    'Assign Technician',
    `Request ID: ${serviceRequestId}`,
    `Assigned technician ${techName} to the request.`
  )

  return data
}

// ─── Delete Service Request ──────────────────────────────────────────────────

export async function deleteServiceRequest(id: string) {
  const { data: request } = await supabase
    .from('service_requests')
    .select('device_type, brand, model')
    .eq('id', id)
    .single();
  
  const label = request ? `${request.brand} ${request.model} (${request.device_type})` : id;

  const { error } = await supabase
    .from('service_requests')
    .delete()
    .eq('id', id);

  if (error) throw error;

  await createAuditLog(
    'Delete Service Request',
    `Request ID: ${id}`,
    `Deleted service request for ${label}.`
  );
}

// ─── Update Service Request Status & Progress ────────────────────────────────

export async function adminUpdateServiceRequest(
  id: string,
  updates: {
    status?: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled'
    progress?: number
    technician_id?: string
  }
) {
  const { data: oldData } = await supabase
    .from('service_requests')
    .select('status, progress, brand, model')
    .eq('id', id)
    .single();

  const { data, error } = await supabase
    .from('service_requests')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  const changesList: string[] = [];
  if (updates.status && oldData?.status !== updates.status) {
    changesList.push(`status: ${oldData?.status || 'N/A'} -> ${updates.status}`);
  }
  if (updates.progress !== undefined && oldData?.progress !== updates.progress) {
    changesList.push(`progress: ${oldData?.progress ?? 0}% -> ${updates.progress}%`);
  }
  if (updates.technician_id) {
    changesList.push(`technician: assigned ID ${updates.technician_id}`);
  }

  const label = oldData ? `${oldData.brand} ${oldData.model}` : id;

  await createAuditLog(
    'Update Service Request',
    `Request: ${label}`,
    `Updated fields: ${changesList.join(', ')}`
  );

  return data;
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

  await createAuditLog(
    'Update Order Status',
    `Order ID: ${orderId}`,
    `Changed order status to: ${status}.`
  )

  return data
}
