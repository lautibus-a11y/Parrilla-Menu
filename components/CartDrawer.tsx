
import React from 'react';
import { CartItem, Order } from '../types';
import { WHATSAPP_PHONE } from '../constants';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  updateQuantity: (id: string, delta: number) => void;
  removeFromCart: (id: string) => void;
  tableNumber: string;
  setTableNumber: (val: string) => void;
  onConfirm: (order: Order) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen, onClose, cart, updateQuantity, removeFromCart, tableNumber, setTableNumber, onConfirm
}) => {
  const total = cart.reduce((acc, item) => acc + (item.priceNumber * item.quantity), 0);

  const formatCurrency = (val: number) => `$${val.toLocaleString('es-AR')}`;

  const sendOrder = () => {
    if (!tableNumber) {
      alert("Por favor ingresa tu número de mesa.");
      return;
    }

    const orderText = cart.map(item => `${item.quantity}x ${item.name} - ${formatCurrency(item.priceNumber * item.quantity)}`).join('%0A');
    const message = `🔥 *NUEVO PEDIDO - LA PARRILLA*%0A%0A📍 *Mesa:* ${tableNumber}%0A%0A📋 *Pedido:*%0A${orderText}%0A%0A💰 *Total:* ${formatCurrency(total)}%0A%0A⏰ Enviado desde el menú digital.`;

    // Create local order record
    const newOrder: Order = {
      id: Date.now().toString(),
      tableNumber,
      items: cart,
      total,
      status: 'pendiente',
      createdAt: new Date().toISOString()
    };

    onConfirm(newOrder);
    window.open(`https://wa.me/${WHATSAPP_PHONE}?text=${message}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

      <div className="relative bg-white rounded-t-[3rem] max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in slide-in-from-bottom-full duration-500">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black tracking-tight text-gray-950 uppercase">Tu Pedido</h2>
            <p className="text-gray-400 text-sm font-medium">{cart.length} productos seleccionados</p>
          </div>
          <button onClick={onClose} className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-950 hover:bg-gray-200 transition-colors">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
          {cart.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-gray-400 font-medium">Tu carrito está vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-4 group">
                <img src={item.image} className="w-20 h-20 rounded-2xl object-cover shadow-md" alt={item.name} />
                <div className="flex-1">
                  <h4 className="font-bold text-gray-950 uppercase text-sm leading-tight">{item.name}</h4>
                  <p className="text-orange-600 font-black text-sm">{formatCurrency(item.priceNumber * item.quantity)}</p>
                </div>
                <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-2 border border-gray-200">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors font-bold"
                  >-</button>
                  <span className="w-4 text-center font-black text-xs text-gray-950">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-white rounded-lg transition-colors font-bold"
                  >+</button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        <div className="p-8 bg-gray-50 space-y-6">
          <div className="space-y-4">
            <label className="block">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 block">Número de Mesa *</span>
              <input
                type="number"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
                placeholder="Ej: 12"
                className="w-full bg-white border border-gray-200 rounded-2xl px-6 py-4 text-lg font-black text-gray-950 focus:ring-2 focus:ring-orange-600 outline-none transition-all placeholder:text-gray-400"
              />
            </label>

            <div className="flex justify-between items-end">
              <span className="text-gray-400 font-bold uppercase text-xs tracking-widest">Total Estimado</span>
              <span className="text-4xl font-black text-gray-950 tracking-tighter">{formatCurrency(total)}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={sendOrder}
            className={`w-full py-6 rounded-3xl font-black text-lg tracking-tight uppercase transition-all transform active:scale-95 shadow-xl ${cart.length === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-orange-600 text-white hover:bg-orange-500 shadow-orange-900/20'
              }`}
          >
            CONFIRMAR POR WHATSAPP
          </button>
        </div>
      </div>
    </div>
  );
};
