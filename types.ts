
export type OrderStatus = 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cancelado';

export interface FoodItem {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  price: string;
  priceNumber: number;
  image: string;
  isAvailable: boolean;
  isActive: boolean;
}

export interface CartItem extends FoodItem {
  quantity: number;
}

export interface Category {
  id: string;
  label: string;
}

export interface Order {
  id: string;
  tableNumber: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
}
