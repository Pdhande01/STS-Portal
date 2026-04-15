import { supabase } from './supabase'
import type { Profile, UserRole } from './supabase'

// ─── Sign Up (Register) ───────────────────────────────────────────────────────

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  phone: string,
  role: UserRole = 'user'
) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, phone, role },
    },
  })
  if (error) throw error
  return data
}

// ─── Sign In (Login) ──────────────────────────────────────────────────────────

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

// ─── Get Current Session User ─────────────────────────────────────────────────

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ─── Get Profile ──────────────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data as Profile
}

// ─── Update Profile ───────────────────────────────────────────────────────────

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data as Profile
}
