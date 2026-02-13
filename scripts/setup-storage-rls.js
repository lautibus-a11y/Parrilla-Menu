import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;
const connectionString = process.env.DATABASE_URL;

async function setupStoragePolicies() {
    const client = new Client({ connectionString });
    try {
        await client.connect();
        console.log('--- Setting up Storage RLS Policies ---');

        // Supabase storage uses the storage schema
        // We need to allow all operations for now to fix the "Error al subir imagen"

        // 1. Ensure the bucket is public (this was done in JS but let's be sure in DB)
        await client.query(`
      UPDATE storage.buckets 
      SET public = true 
      WHERE id = 'menu-images';
    `);

        // 2. Delete existing policies to avoid conflicts
        await client.query(`DROP POLICY IF EXISTS "Public Access" ON storage.objects;`);
        await client.query(`DROP POLICY IF EXISTS "Anyone can upload" ON storage.objects;`);
        await client.query(`DROP POLICY IF EXISTS "Anyone can update" ON storage.objects;`);
        await client.query(`DROP POLICY IF EXISTS "Anyone can delete" ON storage.objects;`);

        // 3. Create permissive policies for the 'menu-images' bucket

        // SELECT: Anyone can view
        await client.query(`
      CREATE POLICY "Public Access" ON storage.objects FOR SELECT 
      USING (bucket_id = 'menu-images');
    `);

        // INSERT: Anyone can upload (simplified for demo, usually restricted to authenticated)
        await client.query(`
      CREATE POLICY "Anyone can upload" ON storage.objects FOR INSERT 
      WITH CHECK (bucket_id = 'menu-images');
    `);

        // UPDATE: Anyone can update
        await client.query(`
      CREATE POLICY "Anyone can update" ON storage.objects FOR UPDATE 
      USING (bucket_id = 'menu-images');
    `);

        // DELETE: Anyone can delete
        await client.query(`
      CREATE POLICY "Anyone can delete" ON storage.objects FOR DELETE 
      USING (bucket_id = 'menu-images');
    `);

        console.log('--- Storage Policies Established ---');

    } catch (err) {
        console.error('Error:', err.message);
    } finally {
        await client.end();
    }
}

setupStoragePolicies();
