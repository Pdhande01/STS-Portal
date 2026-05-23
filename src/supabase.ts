import { createClient } from '@supabase/supabase-js'
import { mockSupabase } from './mockSupabase'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

const useMock = 
  !supabaseUrl || 
  supabaseUrl.includes('placeholder.supabase.co') || 
  supabaseUrl.includes('vwheljeudaasvfgumzrt.supabase.co') ||
  import.meta.env.VITE_USE_MOCK_SUPABASE === 'true';

if (useMock) {
  console.info(
    '🔌 [STS-Portal] Running in client-side MOCK mode because the Supabase URL ' +
    'is missing, placeholder, or unreachable.\n' +
    'Profiles, products, services, and orders will persist locally in localStorage.'
  );
}

export const supabase = useMock
  ? (mockSupabase as any)
  : createClient(supabaseUrl, supabaseAnonKey);
