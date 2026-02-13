
import React, { useState, useEffect } from 'react';
import { StorageService } from '../store';
import { FoodItem, Category, Order, OrderStatus } from '../types';

interface AdminPanelProps {
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [view, setView] = useState<'dashboard' | 'menu' | 'orders' | 'categories'>('dashboard');
  const [menu, setMenu] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [editingItem, setEditingItem] = useState<Partial<FoodItem> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [m, c, o] = await Promise.all([
          StorageService.getMenu(),
          StorageService.getCategories(),
          StorageService.getOrders()
        ]);
        setMenu(m);
        setCategories(c);
        setOrders(o);
      } catch (e) { console.error(e); }
    };
    fetchData();

    const interval = setInterval(async () => {
      try {
        setOrders(await StorageService.getOrders());
      } catch (e) { console.error(e); }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id: string, status: OrderStatus) => {
    try {
      await StorageService.updateOrderStatus(id, status);
      setOrders(await StorageService.getOrders());
    } catch (e) { alert('Error al actualizar estado'); }
  };

  const confirmDeleteOrder = async () => {
    if (!deletingOrderId) return;
    try {
      await StorageService.deleteOrder(deletingOrderId);
      const updatedOrders = await StorageService.getOrders();
      setOrders(updatedOrders);
      setDeletingOrderId(null);
    } catch (e) {
      console.error(e);
      alert(`Error al eliminar pedido: ${(e as any).message || 'Desconocido'}`);
    }
  };

  const handleDeleteOrder = (id: string) => {
    setDeletingOrderId(id);
  };

  const handleClearDelivered = async () => {
    if (confirm('¿Eliminar TODOS los pedidos entregados? Esta acción no se puede deshacer.')) {
      try {
        await StorageService.deleteAllDeliveredOrders();
        setOrders(await StorageService.getOrders());
        alert('Historial de entregados limpiado.');
      } catch (e) {
        console.error(e);
        alert(`Error al limpiar el historial: ${(e as any).message || 'Desconocido'}`);
      }
    }
  };

  const saveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      await StorageService.saveMenuItem(editingItem);
      setMenu(await StorageService.getMenu());
      setEditingItem(null);
    } catch (e) { alert('Error al guardar producto'); }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const url = await StorageService.uploadImage(file);
      setEditingItem(prev => prev ? { ...prev, image: url } : null);
    } catch (error) {
      alert('Error al subir imagen');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteProduct = async (id: string) => {
    if (confirm('¿Eliminar este producto?')) {
      try {
        await StorageService.deleteMenuItem(id);
        setMenu(await StorageService.getMenu());
      } catch (e) { alert('Error al eliminar'); }
    }
  };

  const totalSales = orders.reduce((acc, o) => acc + o.total, 0);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans relative overflow-hidden">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 bg-gray-900 text-white p-4 z-[100] flex justify-between items-center shadow-lg">
        <span className="font-black uppercase tracking-tighter italic">La <span className="text-orange-500">Parrilla</span></span>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 bg-gray-800 rounded-lg text-orange-500"
        >
          {isSidebarOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/60 md:backdrop-blur-sm z-[80]" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-72 bg-gray-900 text-white flex flex-col z-[90] transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-8 border-b border-gray-800 hidden lg:block">
          <span className="text-xl font-black tracking-tighter uppercase italic">
            La <span className="text-orange-500">Parrilla</span> <span className="text-[10px] bg-white/10 px-2 py-1 rounded">ADMIN</span>
          </span>
        </div>
        <nav className="flex-1 p-6 lg:p-4 space-y-2 mt-20 lg:mt-0">
          <button
            onClick={() => { setView('dashboard'); setIsSidebarOpen(false); }}
            className={`w-full text-left px-6 py-4 rounded-xl font-bold transition-all ${view === 'dashboard' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40' : 'hover:bg-gray-800 text-gray-400'}`}
          >📊 Dashboard</button>
          <button
            onClick={() => { setView('orders'); setIsSidebarOpen(false); }}
            className={`w-full text-left px-6 py-4 rounded-xl font-bold transition-all ${view === 'orders' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40' : 'hover:bg-gray-800 text-gray-400'}`}
          >🛎️ Pedidos</button>
          <button
            onClick={() => { setView('menu'); setIsSidebarOpen(false); }}
            className={`w-full text-left px-6 py-4 rounded-xl font-bold transition-all ${view === 'menu' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40' : 'hover:bg-gray-800 text-gray-400'}`}
          >📖 Gestión Carta</button>
          <button
            onClick={() => { setView('categories'); setIsSidebarOpen(false); }}
            className={`w-full text-left px-6 py-4 rounded-xl font-bold transition-all ${view === 'categories' ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/40' : 'hover:bg-gray-800 text-gray-400'}`}
          >📂 Categorías</button>
        </nav>
        <div className="p-8">
          <button onClick={onLogout} className="w-full py-4 bg-red-600/10 text-red-500 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-500/20">Cerrar Sesión</button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pt-24 lg:pt-10">
        {view === 'dashboard' && (
          <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Resumen del Día</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-2">Ventas Totales</p>
                <p className="text-3xl md:text-4xl font-black tracking-tighter">${totalSales.toLocaleString()}</p>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Pedidos Activos</p>
                <p className="text-4xl font-black tracking-tighter">{orders.filter(o => o.status !== 'entregado').length}</p>
              </div>
              <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100">
                <p className="text-gray-400 text-xs font-black uppercase tracking-widest mb-2">Nivel de Ocupación</p>
                <p className="text-4xl font-black tracking-tighter">75%</p>
              </div>
            </div>
          </div>
        )}

        {view === 'orders' && (
          <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Monitor de Pedidos</h1>
              {orders.some(o => o.status === 'entregado') && (
                <button
                  onClick={handleClearDelivered}
                  className="w-full md:w-auto px-6 py-3 bg-red-600/10 text-red-500 border border-red-500/20 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all"
                >
                  🗑️ Limpiar Entregados
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-4">
              {orders.map(order => (
                <div key={order.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center gap-6">
                  <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Mesa</span>
                    <span className="text-3xl font-black">{order.tableNumber}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-400 mb-2 font-bold">{new Date(order.createdAt).toLocaleTimeString()}</p>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map(i => (
                        <span key={i.id} className="bg-gray-50 px-3 py-1 rounded-full text-[10px] font-bold border border-gray-200">{i.quantity}x {i.name}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col md:items-end gap-2">
                    <p className="text-xl font-black">${order.total.toLocaleString()}</p>
                    <div className="flex flex-col md:flex-row gap-2">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-orange-600 outline-none transition-all ${order.status === 'pendiente' ? 'bg-yellow-100 text-yellow-700' :
                          order.status === 'preparando' ? 'bg-orange-100 text-orange-700' :
                            order.status === 'listo' ? 'bg-green-100 text-green-700' :
                              order.status === 'cancelado' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-500'
                          }`}
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="preparando">Preparando</option>
                        <option value="listo">En camino</option>
                        <option value="entregado">Entregado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteOrder(order.id);
                        }}
                        className="px-4 py-2 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'menu' && (
          <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Gestión de Carta</h1>
              <button
                onClick={() => setEditingItem({ name: '', priceNumber: 0, description: '', categoryId: categories[0]?.id })}
                className="w-full md:w-auto bg-orange-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-orange-900/10"
              > + Nuevo Producto</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menu.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col group">
                  <img src={item.image} className="w-full h-48 object-cover rounded-[2rem] mb-4 grayscale group-hover:grayscale-0 transition-all duration-500" />
                  <div className="px-2 flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-black uppercase text-lg leading-none">{item.name}</h3>
                      <span className="text-orange-600 font-black">${item.priceNumber.toLocaleString()}</span>
                    </div>
                    <p className="text-gray-400 text-xs mb-6 line-clamp-2">{item.description}</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingItem(item)}
                        className="flex-1 py-3 bg-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-950 hover:text-white transition-all"
                      >Editar</button>
                      <button
                        onClick={() => deleteProduct(item.id)}
                        className="px-4 py-3 bg-red-50 text-red-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all"
                      >Borrar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'categories' && (
          <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">Categorías</h1>
              <button
                onClick={() => setEditingCategory({ label: '' })}
                className="w-full md:w-auto bg-orange-600 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl shadow-orange-900/10"
              > + Nueva Categoría</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map(cat => (
                <div key={cat.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 flex items-center justify-between group">
                  <div>
                    <h3 className="font-black uppercase text-lg leading-none">{cat.label}</h3>
                    <p className="text-gray-400 text-[10px] mt-2 font-bold uppercase tracking-widest">
                      {menu.filter(i => i.categoryId === cat.id).length} Productos
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingCategory(cat)}
                      className="p-3 bg-gray-50 rounded-xl text-gray-400 hover:text-orange-600 transition-all"
                    >Editar</button>
                    <button
                      onClick={async () => {
                        if (confirm('¿Eliminar categoría? Los productos asociados podrían quedar huérfanos.')) {
                          await StorageService.deleteCategory(cat.id);
                          setCategories(await StorageService.getCategories());
                        }
                      }}
                      className="p-3 bg-red-50 rounded-xl text-red-500 hover:bg-red-600 hover:text-white transition-all"
                    >Borrar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Editor */}
        {editingItem && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            <div className="fixed inset-0 bg-black/60 md:backdrop-blur-sm" onClick={() => setEditingItem(null)} />
            <form onSubmit={saveProduct} className="relative bg-white w-full max-w-xl p-6 md:p-10 rounded-3xl md:rounded-[3.5rem] shadow-2xl animate-in zoom-in duration-300 my-auto">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase mb-6 md:mb-8">{editingItem.id ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <div className="space-y-4">
                <input
                  required
                  placeholder="Nombre del plato"
                  className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600 font-bold"
                  value={editingItem.name}
                  onChange={e => setEditingItem({ ...editingItem, name: e.target.value })}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    required
                    type="number"
                    placeholder="Precio (número)"
                    className="flex-1 bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600 font-bold"
                    value={editingItem.priceNumber}
                    onChange={e => setEditingItem({ ...editingItem, priceNumber: Number(e.target.value), price: `$${Number(e.target.value).toLocaleString()}` })}
                  />
                  <select
                    className="flex-1 bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600 font-bold"
                    value={editingItem.categoryId}
                    onChange={e => setEditingItem({ ...editingItem, categoryId: e.target.value })}
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                  </select>
                </div>
                <textarea
                  placeholder="Descripción del plato..."
                  className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600 font-bold h-32"
                  value={editingItem.description}
                  onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                />
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-2">Imagen del Producto</label>
                  <div className="flex flex-col md:flex-row gap-4 items-center">
                    {editingItem.image && (
                      <img src={editingItem.image} className="w-24 h-24 object-cover rounded-2xl border border-zinc-100 shadow-sm" alt="Vista previa" />
                    )}
                    <div className="flex-1 w-full space-y-3">
                      <input
                        placeholder="Pegar URL de imagen..."
                        className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600 font-bold text-sm"
                        value={editingItem.image || ''}
                        onChange={e => setEditingItem({ ...editingItem, image: e.target.value })}
                      />
                      <label className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${isUploading ? 'bg-zinc-50 border-zinc-200' : 'bg-orange-50/30 border-orange-200 hover:border-orange-500 hover:bg-orange-50/50'}`}>
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                        <span className="text-orange-600 font-black text-xs uppercase tracking-widest">{isUploading ? 'Subiendo...' : '📁 Subir desde dispositivo'}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-8 md:mt-10 flex flex-col md:flex-row gap-4">
                <button type="submit" className="flex-1 py-4 md:py-5 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-900/10">Guardar Cambios</button>
                <button type="button" onClick={() => setEditingItem(null)} className="px-8 py-4 md:py-5 bg-gray-100 text-gray-400 rounded-2xl font-black uppercase text-xs tracking-widest">Cancelar</button>
              </div>
            </form>
          </div>
        )}

        {/* Category Editor Modal */}
        {editingCategory && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto">
            <div className="fixed inset-0 bg-black/60 md:backdrop-blur-sm" onClick={() => setEditingCategory(null)} />
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await StorageService.saveCategory(editingCategory);
                setCategories(await StorageService.getCategories());
                setEditingCategory(null);
              }}
              className="relative bg-white w-full max-w-md p-8 md:p-10 rounded-3xl md:rounded-[3rem] shadow-2xl animate-in zoom-in duration-300 my-auto"
            >
              <h2 className="text-2xl md:text-3xl font-black tracking-tight uppercase mb-6 md:mb-8">{editingCategory.id ? 'Editar Categoría' : 'Nueva Categoría'}</h2>
              <input
                required
                placeholder="Nombre de la categoría"
                className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600 font-bold"
                value={editingCategory.label}
                onChange={e => setEditingCategory({ ...editingCategory, label: e.target.value })}
              />
              <div className="mt-8 flex gap-4">
                <button type="submit" className="flex-1 py-5 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-900/10">Guardar</button>
                <button type="button" onClick={() => setEditingCategory(null)} className="px-8 py-5 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase text-xs tracking-widest">Cancelar</button>
              </div>
            </form>
          </div>
        )}
      </main>
      {/* Delete Confirmation Modal */}
      {deletingOrderId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 md:backdrop-blur-sm" onClick={() => setDeletingOrderId(null)} />
          <div className="relative bg-white w-full max-w-sm p-6 rounded-3xl shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-xl font-black uppercase mb-4 text-center">¿Eliminar Pedido?</h3>
            <p className="text-gray-500 text-center mb-6 text-sm">Esta acción no se puede deshacer.</p>
            <div className="flex gap-4">
              <button
                onClick={confirmDeleteOrder}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-xs tracking-widest shadow-lg shadow-red-900/20"
              >
                Sí, Eliminar
              </button>
              <button
                onClick={() => setDeletingOrderId(null)}
                className="flex-1 py-3 bg-gray-100 text-gray-500 rounded-xl font-black uppercase text-xs tracking-widest"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
