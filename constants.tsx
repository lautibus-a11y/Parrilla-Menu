
import { FoodItem, Category } from './types';

export const WHATSAPP_PHONE = "541172023171";

export const CATEGORIES: Category[] = [
  { id: '1', label: 'Entradas' },
  { id: '2', label: 'Cortes de Carne' },
  { id: '3', label: 'Achuras' },
  { id: '4', label: 'Guarniciones' },
  { id: '5', label: 'Vinos y Bebidas' },
];

export const MENU_ITEMS: FoodItem[] = [
  {
    id: '1',
    categoryId: '2',
    name: 'Ojo de Bife 400g',
    description: 'Corte premium de exportación, madurado 21 días.',
    price: '$24.500',
    priceNumber: 24500,
    image: 'https://images.unsplash.com/photo-1546241072-48010ad28c2c?q=80&w=600&auto=format&fit=crop',
    isActive: true,
    isAvailable: true
  },
  {
    id: '2',
    categoryId: '2',
    name: 'Bife de Chorizo',
    description: 'El clásico argentino con el punto justo de grasa.',
    price: '$22.800',
    priceNumber: 22800,
    image: 'https://images.unsplash.com/photo-1600891964599-f61ba0e24092?q=80&w=600&auto=format&fit=crop',
    isActive: true,
    isAvailable: true
  },
  {
    id: '3',
    categoryId: '1',
    name: 'Provoleta Especial',
    description: 'Queso provolone fundido con orégano y oliva.',
    price: '$8.500',
    priceNumber: 8500,
    image: 'https://images.unsplash.com/photo-1559144490-8328294facd8?q=80&w=600&auto=format&fit=crop',
    isActive: true,
    isAvailable: true
  },
  {
    id: '4',
    categoryId: '3',
    name: 'Chorizo de Campo',
    description: 'Puro cerdo con mezcla de especias secretas.',
    price: '$4.200',
    priceNumber: 4200,
    image: 'https://images.unsplash.com/photo-1593039830919-3422800159f8?q=80&w=600&auto=format&fit=crop',
    isActive: true,
    isAvailable: true
  },
  {
    id: '5',
    categoryId: '4',
    name: 'Papas Fritas Trufadas',
    description: 'Doble cocción con aceite de trufa y parmesano.',
    price: '$6.900',
    priceNumber: 6900,
    image: 'https://images.unsplash.com/photo-1573082833947-3e9c264326fb?q=80&w=600&auto=format&fit=crop',
    isActive: true,
    isAvailable: true
  }
];
