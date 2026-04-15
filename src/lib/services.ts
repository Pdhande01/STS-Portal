import { supabase } from './supabase'
import type { ServiceRequest, ServiceUpdate } from './supabase'

// ─── Create Service Request ───────────────────────────────────────────────────

export async function createServiceRequest(data: {
  device_type: string
  brand: string
  model: string
  issue_type: string
  description: string
  service_location: 'home' | 'shop'
  address?: string
  phone: string
  preferred_date: string
  preferred_time: string
}) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: result, error } = await supabase
    .from('service_requests')
    .insert({ ...data, user_id: user.id })
    .select()
    .single()

  if (error) throw error

  // Add initial update entry
  await supabase.from('service_updates').insert({
    service_request_id: result.id,
    note: 'Service request received. Awaiting technician assignment.',
  })

  return result as ServiceRequest
}

// ─── Get User's Service Requests ──────────────────────────────────────────────

export async function getUserServiceRequests(): Promise<ServiceRequest[]> {
  const { data, error } = await supabase
    .from('service_requests')
    .select(`
      *,
      technician:profiles!service_requests_technician_id_fkey(full_name, phone),
      service_updates(*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ServiceRequest[]
}

// ─── Get Technician's Assigned Requests ───────────────────────────────────────

export async function getTechnicianServiceRequests(): Promise<ServiceRequest[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('service_requests')
    .select(`
      *,
      profiles:profiles!service_requests_user_id_fkey(full_name, phone),
      service_updates(*)
    `)
    .eq('technician_id', user.id)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ServiceRequest[]
}

// ─── Get All Service Requests (Admin) ────────────────────────────────────────

export async function getAllServiceRequests(): Promise<ServiceRequest[]> {
  const { data, error } = await supabase
    .from('service_requests')
    .select(`
      *,
      profiles:profiles!service_requests_user_id_fkey(full_name, phone),
      technician:profiles!service_requests_technician_id_fkey(full_name, phone),
      service_updates(*)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as ServiceRequest[]
}

// ─── Update Service Request ───────────────────────────────────────────────────

export async function updateServiceRequest(
  id: string,
  updates: {
    status?: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled'
    progress?: number
    technician_id?: string
  }
) {
  const { data, error } = await supabase
    .from('service_requests')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as ServiceRequest
}

// ─── Add Service Update (Timeline Note) ──────────────────────────────────────

export async function addServiceUpdate(
  serviceRequestId: string,
  note: string
): Promise<ServiceUpdate> {
  const { data, error } = await supabase
    .from('service_updates')
    .insert({ service_request_id: serviceRequestId, note })
    .select()
    .single()

  if (error) throw error
  return data as ServiceUpdate
}
