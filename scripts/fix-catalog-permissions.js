import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

async function fixCatalogPermissions() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('--- Fixing Catalog Permissions (Products & Categories) ---');

        // Products Table
        await client.query(`ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;`);
        await client.query(`DROP POLICY IF EXISTS "Public can view products" ON public.products;`);
        await client.query(`CREATE POLICY "Public can view products" ON public.products FOR SELECT USING (true);`);

        await client.query(`DROP POLICY IF EXISTS "Admins can insert products" ON public.products;`);
        await client.query(`CREATE POLICY "Admins can insert products" ON public.products FOR INSERT WITH CHECK (true);`);

        await client.query(`DROP POLICY IF EXISTS "Admins can update products" ON public.products;`);
        await client.query(`CREATE POLICY "Admins can update products" ON public.products FOR UPDATE USING (true);`);

        await client.query(`DROP POLICY IF EXISTS "Admins can delete products" ON public.products;`);
        await client.query(`CREATE POLICY "Admins can delete products" ON public.products FOR DELETE USING (true);`);

        // Categories Table
        await client.query(`ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;`);
        await client.query(`DROP POLICY IF EXISTS "Public can view categories" ON public.categories;`);
        await client.query(`CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);`);

        await client.query(`DROP POLICY IF EXISTS "Admins can insert categories" ON public.categories;`);
        await client.query(`CREATE POLICY "Admins can insert categories" ON public.categories FOR INSERT WITH CHECK (true);`);

        await client.query(`DROP POLICY IF EXISTS "Admins can update categories" ON public.categories;`);
        await client.query(`CREATE POLICY "Admins can update categories" ON public.categories FOR UPDATE USING (true);`);

        await client.query(`DROP POLICY IF EXISTS "Admins can delete categories" ON public.categories;`);
        await client.query(`CREATE POLICY "Admins can delete categories" ON public.categories FOR DELETE USING (true);`);

        console.log('--- Permissions Updated Successfully ---');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

fixCatalogPermissions();
