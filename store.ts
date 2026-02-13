import { supabase } from './lib/supabase/supabaseClient';
import { FoodItem, Category, Order, OrderStatus, CartItem } from './types';

export const StorageService = {
  getMenu: async (): Promise<FoodItem[]> => {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching menu:', error);
      return [];
    }

    return data.map(item => ({
      id: item.id,
      categoryId: item.category_id,
      name: item.name,
      description: item.description,
      price: `$${item.price_number.toLocaleString()}`,
      priceNumber: item.price_number,
      image: item.image_url,
      isActive: item.is_active,
      isAvailable: item.is_available
    }));
  },

  getCategories: async (): Promise<Category[]> => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index');

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    return data.map(cat => ({
      id: cat.id,
      label: cat.label
    }));
  },

  saveCategory: async (category: Partial<Category>) => {
    const dbCat = {
      label: category.label,
      order_index: (category as any).order_index || 0
    };

    if (category.id) {
      const { error } = await supabase
        .from('categories')
        .update(dbCat)
        .eq('id', category.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('categories')
        .insert({ ...dbCat, id: Date.now().toString() });
      if (error) throw error;
    }
  },

  deleteCategory: async (id: string) => {
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  getOrders: async (): Promise<Order[]> => {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      return [];
    }

    return data.map(order => ({
      id: order.id,
      tableNumber: order.table_number,
      total: order.total_amount,
      status: order.status,
      createdAt: order.created_at,
      items: (order.order_items || []).map((i: any) => ({
        id: i.product_id || i.id,
        name: i.name,
        quantity: i.quantity,
        priceNumber: i.unit_price,
        price: `$${i.unit_price.toLocaleString()}`
      })) as CartItem[]
    }));
  },

  addOrder: async (order: Order) => {
    // 1. Insert Order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        table_number: order.tableNumber,
        total_amount: order.total,
        status: order.status
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 2. Insert Items
    const itemsToInsert = order.items.map(item => ({
      order_id: orderData.id,
      product_id: item.id.length > 20 ? item.id : null, // Check if it's a UUID or simple ID
      name: item.name,
      quantity: item.quantity,
      unit_price: item.priceNumber
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsToInsert);

    if (itemsError) throw itemsError;

    return orderData;
  },

  updateOrderStatus: async (orderId: string, status: OrderStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId);

    if (error) throw error;
  },

  deleteOrder: async (orderId: string) => {
    await supabase.from('order_items').delete().eq('order_id', orderId);
    const { error } = await supabase.from('orders').delete().eq('id', orderId);
    if (error) throw error;
  },

  // Admin methods for Menu Management
  saveMenuItem: async (item: Partial<FoodItem>) => {
    const dbItem = {
      category_id: item.categoryId,
      name: item.name,
      description: item.description,
      price_number: item.priceNumber,
      image_url: item.image,
      is_active: item.isActive,
      is_available: item.isAvailable
    };

    if (item.id) {
      const { error } = await supabase
        .from('products')
        .update(dbItem)
        .eq('id', item.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('products')
        .insert({ ...dbItem, id: Date.now().toString() });
      if (error) throw error;
    }
  },

  deleteMenuItem: async (id: string) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  uploadImage: async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('menu-images')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('menu-images')
      .getPublicUrl(filePath);

    return publicUrl;
  },

  login: async (email: string, pass: string) => {
    const finalEmail = email.includes('@') ? email : `${email}@parrilla.com`;
    return await supabase.auth.signInWithPassword({
      email: finalEmail,
      password: pass
    });
  }
};
