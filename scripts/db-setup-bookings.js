import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

async function setupBookings() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('--- Setting up Bookings Table ---');

        // Create bookings table if not exists
        await client.query(`
      CREATE TABLE IF NOT EXISTS public.bookings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        booking_date DATE NOT NULL,
        booking_time TIME NOT NULL,
        guests_count INTEGER NOT NULL DEFAULT 1,
        status TEXT NOT NULL DEFAULT 'pendiente',
        notes TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);
        console.log('Table "bookings" ensured.');

        // Enable RLS
        await client.query(`ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;`);
        console.log('RLS enabled for "bookings".');

        // Policies (Example: Public can insert, Admin can see all)
        // First, drop existing to avoid conflicts
        await client.query(`DROP POLICY IF EXISTS "Public can create bookings" ON public.bookings;`);
        await client.query(`
      CREATE POLICY "Public can create bookings" 
      ON public.bookings FOR INSERT 
      WITH CHECK (true);
    `);

        await client.query(`DROP POLICY IF EXISTS "Admins can view all bookings" ON public.bookings;`);
        await client.query(`
      CREATE POLICY "Admins can view all bookings" 
      ON public.bookings FOR SELECT 
      USING (true); -- Transitioning to proper auth check later if needed
    `);

        console.log('Policies configured.');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

setupBookings();
