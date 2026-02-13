import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

async function openAllPermissions() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('--- Opening All Permissions (Products, Categories, Orders, Order Items) ---');

        const tables = ['products', 'categories', 'orders', 'order_items'];

        for (const table of tables) {
            console.log(`Configuring ${table}...`);
            await client.query(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);

            // Select
            await client.query(`DROP POLICY IF EXISTS "Public select on ${table}" ON public.${table};`);
            await client.query(`CREATE POLICY "Public select on ${table}" ON public.${table} FOR SELECT USING (true);`);

            // Insert
            await client.query(`DROP POLICY IF EXISTS "Public insert on ${table}" ON public.${table};`);
            await client.query(`CREATE POLICY "Public insert on ${table}" ON public.${table} FOR INSERT WITH CHECK (true);`);

            // Update
            await client.query(`DROP POLICY IF EXISTS "Public update on ${table}" ON public.${table};`);
            await client.query(`CREATE POLICY "Public update on ${table}" ON public.${table} FOR UPDATE USING (true);`);

            // Delete
            await client.query(`DROP POLICY IF EXISTS "Public delete on ${table}" ON public.${table};`);
            await client.query(`CREATE POLICY "Public delete on ${table}" ON public.${table} FOR DELETE USING (true);`);
        }

        console.log('--- All Permissions Opened Successfully ---');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

openAllPermissions();
