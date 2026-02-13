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
    { id: 'cat_entradas', label: 'Entradas' },
    { id: 'cat_carnes', label: 'Cortes de Carne' },
    { id: 'cat_achuras', label: 'Achuras' },
    { id: 'cat_guarniciones', label: 'Guarniciones' },
    { id: 'cat_vinos', label: 'Vinos y Bebidas' },
    { id: 'cat_postres', label: 'Postres' },
]

const products = [
    // Entradas
    {
        id: 'prod_provoleta',
        category_id: 'cat_entradas',
        name: 'Provoleta al Hierro',
        description: 'Queso provolone fundido con tomates secos, albahaca y aceite de oliva.',
        price_number: 9500,
        image_url: 'https://images.unsplash.com/photo-1559144490-8328294facd8?q=80&w=800',
        is_active: true, is_available: true
    },
    {
        id: 'prod_empanadas',
        category_id: 'cat_entradas',
        name: 'Empanadas de Carne (2u)',
        description: 'Cortadas a cuchillo, fritas o al horno de barro.',
        price_number: 4800,
        image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=800',
        is_active: true, is_available: true
    },
    // Carnes
    {
        id: 'prod_ojobife',
        category_id: 'cat_carnes',
        name: 'Ojo de Bife 450g',
        description: 'Corazón de la costilla, madurado al vacío, suprema terneza.',
        price_number: 28500,
        image_url: 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?q=80&w=800',
        is_active: true, is_available: true
    },
    {
        id: 'prod_entranña',
        category_id: 'cat_carnes',
        name: 'Entraña Premium',
        description: 'Corte delgado y jugoso, con el punto justo de sal marina.',
        price_number: 32000,
        image_url: 'https://images.unsplash.com/photo-1558030006-450675393462?q=80&w=800',
        is_active: true, is_available: true
    },
    {
        id: 'prod_asado',
        category_id: 'cat_carnes',
        name: 'Asado de Tira',
        description: 'Costillar cortado transversalmente, sabor clásico a leña.',
        price_number: 25900,
        image_url: 'https://images.unsplash.com/photo-1529692236671-61f66cb8a0b5?q=80&w=800',
        is_active: true, is_available: true
    },
    // Achuras
    {
        id: 'prod_chorizo',
        category_id: 'cat_achuras',
        name: 'Chorizo Bombón',
        description: 'Mix de cerdo y vaca con especias seleccionadas.',
        price_number: 4200,
        image_url: 'https://images.unsplash.com/photo-1593039830919-3422800159f8?q=80&w=800',
        is_active: true, is_available: true
    },
    {
        id: 'prod_mollejas',
        category_id: 'cat_achuras',
        name: 'Mollejas de Corazón',
        description: 'Crocantes por fuera y mantecosas por dentro, al limón.',
        price_number: 14500,
        image_url: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=800',
        is_active: true, is_available: true
    },
    // Vinos
    {
        id: 'prod_malbec',
        category_id: 'cat_vinos',
        name: 'Malbec Reserva',
        description: 'Cuerpo intenso, notas de frutos rojos y paso por roble.',
        price_number: 18000,
        image_url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=800',
        is_active: true, is_available: true
    }
]

async function reseed() {
    console.log('--- Reseeding Database ---')

    // Cleanup
    console.log('Cleaning existing data...')
    await supabase.from('products').delete().neq('id', '0')
    await supabase.from('categories').delete().neq('id', '0')

    // Categories
    console.log('Inserting categories...')
    const { error: catError } = await supabase.from('categories').insert(categories)
    if (catError) console.error(catError)

    // Products
    console.log('Inserting products...')
    const { error: prodError } = await supabase.from('products').insert(products)
    if (prodError) console.error(prodError)

    console.log('--- Done! Check your Admin Panel ---')
}

reseed()
