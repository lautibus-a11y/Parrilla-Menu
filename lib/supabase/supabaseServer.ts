import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    // We use this check to avoid bundling the service key in the frontend if possible,
    // though in this dev environment we might need it for the seed script.
    console.warn('Supabase Service Role Key is missing or being accessed in a client-side environment.')
}

// Client for administrative access (Service Role)
// IMPORTANT: This client bypasses RLS. Never use it in frontend components.
export const supabaseAdmin = createClient(supabaseUrl || '', supabaseServiceKey || '', {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
})
