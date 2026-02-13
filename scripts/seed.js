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

const categories = [
    { id: '1', label: 'Entradas', order_index: 1 },
    { id: '2', label: 'Cortes de Carne', order_index: 2 },
    { id: '3', label: 'Achuras', order_index: 3 },
    { id: '4', label: 'Guarniciones', order_index: 4 },
    { id: '5', label: 'Vinos y Bebidas', order_index: 5 },
]

const products = [
    {
        id: '1',
        category_id: '2',
        name: 'Ojo de Bife 400g',
        description: 'Corte premium de exportación, madurado 21 días.',
        price_number: 24500,
        image_url: 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?q=80&w=600&auto=format&fit=crop',
        is_active: true,
        is_available: true
    },
    {
        id: '2',
        category_id: '2',
        name: 'Bife de Chorizo',
        description: 'El clásico argentino con el punto justo de grasa.',
        price_number: 22800,
        image_url: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=600&auto=format&fit=crop',
        is_active: true,
        is_available: true
    },
    {
        id: '3',
        category_id: '1',
        name: 'Provoleta Especial',
        description: 'Queso provolone fundido con orégano y oliva.',
        price_number: 8500,
        image_url: 'https://images.unsplash.com/photo-1559144490-8328294facd8?q=80&w=600&auto=format&fit=crop',
        is_active: true,
        is_available: true
    },
    {
        id: '4',
        category_id: '3',
        name: 'Chorizo de Campo',
        description: 'Puro cerdo con mezcla de especias secretas.',
        price_number: 4200,
        image_url: 'https://images.unsplash.com/photo-1593039830919-3422800159f8?q=80&w=600&auto=format&fit=crop',
        is_active: true,
        is_available: true
    },
    {
        id: '5',
        category_id: '4',
        name: 'Papas Fritas Trufadas',
        description: 'Doble cocción con aceite de trufa y parmesano.',
        price_number: 6900,
        image_url: 'https://images.unsplash.com/photo-1573082833947-3e9c264326fb?q=80&w=600&auto=format&fit=crop',
        is_active: true,
        is_available: true
    }
]

const site_content = [
    {
        section: 'hero',
        key: 'title',
        value: 'Parrilla los amores',
        metadata: { italic: 'Parrilla', bold: 'los amores' }
    },
    {
        section: 'hero',
        key: 'subtitle',
        value: 'Experiencia Premium',
        metadata: {}
    },
    {
        section: 'hero',
        key: 'background',
        value: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000&auto=format&fit=crop',
        metadata: {}
    }
]

async function seed() {
    console.log('Starting seed...')

    // Insert Categories
    const { error: catError } = await supabase.from('categories').upsert(categories)
    if (catError) console.error('Error seeding categories:', catError)
    else console.log('Categories seeded')

    // Insert Products
    const { error: prodError } = await supabase.from('products').upsert(products)
    if (prodError) console.error('Error seeding products:', prodError)
    else console.log('Products seeded')

    // Insert Site Content
    const { error: contentError } = await supabase.from('site_content').upsert(site_content)
    if (contentError) console.error('Error seeding site content:', contentError)
    else console.log('Site content seeded')

    console.log('Seed finished.')
}

seed()
