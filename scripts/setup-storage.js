import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupStorage() {
    console.log('--- Setting up Supabase Storage ---')

    // Create bucket if it doesn't exist
    const { data: bucketData, error: bucketError } = await supabase.storage.createBucket('menu-images', {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp']
    })

    if (bucketError) {
        if (bucketError.message.includes('already exists')) {
            console.log('Bucket "menu-images" already exists.')
        } else {
            console.error('Error creating bucket:', bucketError.message)
        }
    } else {
        console.log('Bucket "menu-images" created successfully.')
    }

    // Set up public access policy for storage
    // Note: RLS for storage is slightly different, but since we created it as public: true, 
    // users can download without auth. We still need to allow authenticated users to upload.

    console.log('--- Done! ---')
}

setupStorage()
