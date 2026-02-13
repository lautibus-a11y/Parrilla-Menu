import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

async function setupOrdersRLS() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('--- Setting up Orders RLS ---');

        // Orders Table
        await client.query(`ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;`);
        await client.query(`DROP POLICY IF EXISTS "Anyone can insert orders" ON public.orders;`);
        await client.query(`CREATE POLICY "Anyone can insert orders" ON public.orders FOR INSERT WITH CHECK (true);`);

        await client.query(`DROP POLICY IF EXISTS "Anyone can view orders" ON public.orders;`);
        await client.query(`CREATE POLICY "Anyone can view orders" ON public.orders FOR SELECT USING (true);`);

        await client.query(`DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;`);
        await client.query(`CREATE POLICY "Admins can update orders" ON public.orders FOR UPDATE USING (true);`);

        await client.query(`DROP POLICY IF EXISTS "Admins can delete orders" ON public.orders;`);
        await client.query(`CREATE POLICY "Admins can delete orders" ON public.orders FOR DELETE USING (true);`);

        // Order Items Table
        await client.query(`ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;`);
        await client.query(`DROP POLICY IF EXISTS "Anyone can insert order items" ON public.order_items;`);
        await client.query(`CREATE POLICY "Anyone can insert order items" ON public.order_items FOR INSERT WITH CHECK (true);`);

        await client.query(`DROP POLICY IF EXISTS "Anyone can view order items" ON public.order_items;`);
        await client.query(`CREATE POLICY "Anyone can view order items" ON public.order_items FOR SELECT USING (true);`);

        await client.query(`DROP POLICY IF EXISTS "Admins can delete order items" ON public.order_items;`);
        await client.query(`CREATE POLICY "Admins can delete order items" ON public.order_items FOR DELETE USING (true);`);

        console.log('RLS Policies for orders and order_items established.');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

setupOrdersRLS();
