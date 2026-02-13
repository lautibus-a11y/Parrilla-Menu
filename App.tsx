
import React, { useState, useEffect, useRef } from 'react';
import { HomeIcon, ArrowRightIcon, ChevronDownIcon, FlameIcon } from './components/Icons';
import { Card } from './components/Card';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanel } from './components/AdminPanel';
import { ParticleBackground } from './components/ParticleBackground';
import { StorageService } from './store';
import { FoodItem, CartItem, Order, Category, OrderStatus } from './types';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loginForm, setLoginForm] = useState({ user: '', pass: '' });

  // Menu State
  const [menu, setMenu] = useState<FoodItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState('');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState('');

  // UI State
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Active Order Tracking
  const [activeOrder, setActiveOrder] = useState<{ id: string, status: OrderStatus } | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const [loading, setLoading] = useState(true);

  // Sync with Supabase on mount and every few seconds
  useEffect(() => {
    const sync = async () => {
      try {
        const [menuData, catData] = await Promise.all([
          StorageService.getMenu(),
          StorageService.getCategories()
        ]);
        setMenu(menuData.filter(i => i.isActive));
        setCategories(catData);
      } catch (error) {
        console.error("Sync error:", error);
      } finally {
        setLoading(false);
      }
    };
    sync();
    const interval = setInterval(sync, 15000); // Only periodic sync

    // Restore last order from storage
    const lastOrderId = localStorage.getItem('last_order_id');
    if (lastOrderId) {
      setActiveOrder({ id: lastOrderId, status: 'pendiente' });
    }

    return () => clearInterval(interval);
  }, []);

  // Handle initial category selection separately to avoid resets
  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  // Poll for active order status
  // Poll for active order status
  useEffect(() => {
    if (!activeOrder) return;

    const checkStatus = async () => {
      try {
        const orders = await StorageService.getOrders();
        const current = orders.find(o => o.id === activeOrder.id);

        // If order was deleted from DB (by admin)
        if (!current) {
          setActiveOrder(null);
          localStorage.removeItem('last_order_id');
          return;
        }

        // If order was cancelled
        if (current.status === 'cancelado') {
          setActiveOrder(null);
          localStorage.removeItem('last_order_id');
          return;
        }

        // Update status if changed
        if (current.status !== activeOrder.status) {
          setActiveOrder({ id: current.id, status: current.status });
        }
      } catch (e) { console.error(e); }
    };

    const interval = setInterval(checkStatus, 3000);
    checkStatus(); // Initial check
    return () => clearInterval(interval);
  }, [activeOrder?.id, activeOrder?.status]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const addToCart = (item: FoodItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data, error } = await StorageService.login(loginForm.user, loginForm.pass);
    if (!error) {
      setIsLogged(true);
      setLoginForm({ user: '', pass: '' });
    } else {
      alert('Error de autenticación: ' + error.message);
    }
  };

  const onConfirmOrder = async (order: Order) => {
    try {
      const saved = await StorageService.addOrder(order);
      setCart([]);
      setIsCartOpen(false);

      // Focus on tracking the new order
      const newActive = { id: saved.id, status: saved.status };
      setActiveOrder(newActive);
      localStorage.setItem('last_order_id', saved.id);

      alert('¡Pedido recibido! En unos minutos llegará a tu mesa.');
    } catch (error) {
      console.error(error);
      alert('No se pudo enviar el pedido. Verifica tu conexión.');
    }
  };

  const scrollToMenu = () => {
    const menuSection = document.getElementById('menu-section');
    menuSection?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleVerVinos = () => {
    setActiveCategory('5'); // '5' is the ID for Vinos y Bebidas in constants.tsx
    scrollToMenu();
  };

  if (isAdmin) {
    if (!isLogged) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
          <form onSubmit={handleLogin} className="bg-white w-full max-sm p-10 rounded-[3rem] shadow-2xl">
            <h2 className="text-3xl font-black uppercase mb-8 tracking-tighter text-gray-900">Admin Login</h2>
            <div className="space-y-4 mb-8">
              <input
                placeholder="Usuario"
                className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600 font-bold"
                value={loginForm.user}
                onChange={e => setLoginForm({ ...loginForm, user: e.target.value })}
              />
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full bg-gray-50 border border-gray-100 px-6 py-4 rounded-2xl outline-none focus:ring-2 focus:ring-orange-600 font-bold"
                value={loginForm.pass}
                onChange={e => setLoginForm({ ...loginForm, pass: e.target.value })}
              />
            </div>
            <button className="w-full py-5 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-900/10 mb-4">Entrar al Panel</button>
            <button type="button" onClick={() => setIsAdmin(false)} className="w-full py-3 text-gray-400 font-bold uppercase text-[10px] tracking-widest">Volver al Menú</button>
          </form>
        </div>
      );
    }
    return <AdminPanel onLogout={() => { setIsLogged(false); setIsAdmin(false); }} />;
  }

  const filteredMenu = menu.filter(i => i.categoryId === activeCategory);
  const cartItemCount = cart.reduce((a, b) => a + b.quantity, 0);

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-orange-600/30 font-['Inter'] overflow-x-hidden w-full relative">

      {/* Animated Particles Background */}
      <div className="fixed inset-0 z-0">
        <ParticleBackground />
      </div>

      {/* Immersive Hero Section */}
      <section className="relative h-[100dvh] min-h-[500px] w-full flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2000&auto=format&fit=crop"
            alt="Brasas"
            className="w-full h-full object-cover scale-105 animate-pulse-slow"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent"></div>
          <div className="absolute inset-0 bg-black/40"></div>
        </div>

        <div className="relative z-10 w-full px-6 flex flex-col items-center text-center max-w-5xl">
          <div className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <span className="inline-block px-6 py-2 bg-orange-600/20 border border-orange-600/30 rounded-full text-[10px] md:text-xs font-black tracking-[0.3em] text-orange-500 uppercase mb-8 backdrop-blur-md">
              Experiencia Premium
            </span>
            <h1 className="text-6xl md:text-[11rem] font-serif leading-[0.8] text-white italic tracking-tighter mb-12">
              Parrilla <br />
              <span className="text-orange-600 not-italic font-sans font-black uppercase">los amores</span>
            </h1>

            <button
              onClick={scrollToMenu}
              className="group flex flex-col items-center gap-6 transition-all hover:scale-105 active:scale-95 mx-auto"
            >
              <span className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-10 py-5 rounded-full font-black text-xs uppercase tracking-[0.4em] backdrop-blur-md transition-all shadow-2xl">
                Ver Menú
              </span>
              <div className="w-14 h-14 rounded-full border border-white/30 flex items-center justify-center text-white animate-bounce shadow-xl bg-white/5 backdrop-blur-sm">
                <ChevronDownIcon className="w-6 h-6" />
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Main Container - Dark Premium Refactoring */}
      <main id="menu-section" className="relative z-20 bg-[#080808] backdrop-blur-lg rounded-t-[3.5rem] md:rounded-t-[8rem] -mt-20 md:-mt-24 text-white min-h-screen border-t border-white/10 shadow-[0_-40px_80px_-20px_rgba(0,0,0,0.9)] w-full max-w-full overflow-x-hidden">

        {/* Decorative Light Leak */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-orange-600/5 blur-[120px] pointer-events-none rounded-full"></div>

        <div className="max-w-7xl mx-auto pt-16 md:pt-32 pb-48">

          {/* Refined Centered Title */}
          <div className="px-6 md:px-12 mb-12 md:mb-24 flex flex-col items-center text-center">
            <div className="flex items-center gap-6 mb-6 md:mb-8">
              <div className="h-[1px] w-16 bg-gradient-to-r from-transparent to-orange-500/50"></div>
              <span className="text-[12px] font-black uppercase tracking-[0.6em] text-orange-500/80">Selección de Autor</span>
              <div className="h-[1px] w-16 bg-gradient-to-l from-transparent to-orange-500/50"></div>
            </div>
            <h2 className="text-5xl md:text-[8rem] font-serif italic text-white leading-[0.9] mb-6 tracking-tighter">
              El Ritual del <br /><span className="not-italic font-black text-orange-600 uppercase">Fuego</span>
            </h2>
            <p className="text-zinc-500 font-medium max-w-lg mx-auto text-lg leading-relaxed">
              Una experiencia sensorial donde la nobleza del producto y la maestría de la brasa se encuentran.
            </p>
          </div>

          {/* Categories Tab Bar - Glassmorphism */}
          <div className="sticky top-0 z-40 mb-20">
            <div className="bg-[#0a0a0a]/60 backdrop-blur-3xl border-y border-white/5 py-2">
              <div className="relative max-w-5xl mx-auto flex items-center">
                <nav
                  ref={scrollRef}
                  onScroll={checkScroll}
                  className="flex gap-4 md:gap-16 px-12 overflow-x-auto no-scrollbar snap-x snap-mandatory scroll-smooth flex-1"
                >
                  {categories.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`relative py-8 px-4 text-sm font-black uppercase tracking-[0.3em] whitespace-nowrap snap-center transition-all duration-500 flex items-center gap-2 ${activeCategory === cat.id ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'
                        }`}
                    >
                      {activeCategory === cat.id && (
                        <FlameIcon className="w-5 h-5 text-orange-600 animate-flicker" />
                      )}
                      {cat.label}
                      <div className={`absolute bottom-6 left-0 right-0 h-[2px] bg-orange-600 transition-all duration-700 ease-out shadow-[0_0_15px_rgba(234,88,12,0.8)] ${activeCategory === cat.id ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
                        }`} />
                    </button>
                  ))}
                </nav>

                <div className={`absolute right-4 z-20 transition-all duration-500 flex items-center pointer-events-none ${canScrollRight ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'
                  }`}>
                  <div className="w-12 h-12 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-sm pointer-events-auto cursor-pointer" onClick={() => scrollRef.current?.scrollBy({ left: 150, behavior: 'smooth' })}>
                    <div className="animate-bounce-x text-orange-600">
                      <ArrowRightIcon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Menu Grid */}
          <div className="px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 md:gap-12 place-items-center">
            {filteredMenu.map(item => (
              <Card key={item.id} item={item} onAdd={addToCart} />
            ))}
            {filteredMenu.length === 0 && (
              <div className="col-span-full py-48 text-center bg-white/5 rounded-[4rem] border border-dashed border-white/10 mx-6">
                <div className="text-8xl mb-8 animate-pulse">🔥</div>
                <p className="text-zinc-500 font-serif italic text-2xl">Próximamente...</p>
                <p className="text-orange-500/40 font-black uppercase tracking-[0.4em] text-[10px] mt-4">Encendiendo las brasas para esta categoría</p>
              </div>
            )}
          </div>

          {/* Premium Footer Ad & Admin Link */}
          <div className="mt-40 px-6 md:px-12">
            <div className="bg-[#0a0a0a] rounded-[3.5rem] md:rounded-[5rem] p-12 md:p-24 flex flex-col lg:flex-row items-center gap-20 relative overflow-hidden group">
              <div className="absolute -top-32 -right-32 w-[40rem] h-[40rem] bg-orange-600/10 blur-[150px] rounded-full group-hover:bg-orange-600/20 transition-all duration-1000"></div>
              <div className="z-10 flex-1 text-center lg:text-left">
                <span className="inline-block text-orange-500 font-black tracking-[0.4em] text-[10px] uppercase mb-8 py-1.5 px-4 border border-orange-500/20 rounded-full bg-orange-500/5">Exclusividad</span>
                <h3 className="text-6xl md:text-[9rem] text-white font-serif italic mb-10 leading-[0.85] tracking-tighter">Cava & <br /><span className="text-orange-600 not-italic">Reservas</span></h3>
                <button
                  onClick={handleVerVinos}
                  className="group/btn bg-white text-black px-16 py-6 rounded-[1.75rem] font-black text-sm tracking-widest uppercase hover:bg-orange-600 hover:text-white transition-all transform hover:scale-105 shadow-2xl flex items-center gap-4 mx-auto lg:mx-0"
                >
                  Ver Carta de Vinos
                  <ArrowRightIcon className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                </button>
              </div>
              <div className="relative z-10 w-full lg:w-1/2 aspect-[4/3] md:aspect-video rounded-[3rem] overflow-hidden shadow-2xl ring-1 ring-white/10">
                <img src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1200&auto=format&fit=crop" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105" alt="Cava" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
              </div>
            </div>

            <div className="mt-20 text-center pb-12">
              <button
                onClick={() => setIsAdmin(true)}
                className="text-gray-300 text-[10px] font-black uppercase tracking-[0.5em] hover:text-orange-600 transition-all opacity-40 hover:opacity-100 py-4 px-8 border border-transparent hover:border-gray-100/10 rounded-full"
              >
                Panel Administrativo
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Floating Bottom Navigation - More Centered and Elegant */}
      <div className="fixed bottom-10 left-0 right-0 z-[60] flex justify-center px-6 pointer-events-none">
        <nav className="bg-black/85 backdrop-blur-3xl px-10 py-5 rounded-[3rem] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] border border-white/10 flex items-center justify-between min-w-[280px] max-w-sm pointer-events-auto ring-1 ring-white/5 relative group">

          {/* Item 1: Home */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex flex-col items-center gap-1.5 text-gray-400 hover:text-orange-500 transition-all transform active:scale-90"
          >
            <HomeIcon className="w-7 h-7" />
            <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Inicio</span>
          </button>

          {/* Central Cart Item */}
          <div className="relative">
            <button
              onClick={() => setIsCartOpen(true)}
              className="w-20 h-20 bg-orange-600 text-white rounded-[2rem] flex items-center justify-center shadow-[0_20px_40px_rgba(234,88,12,0.4)] hover:bg-orange-500 transition-all transform hover:-translate-y-2 active:scale-95 border-4 border-[#0a0a0a] -mt-10 relative z-20 group/cart"
            >
              <span className="text-3xl font-black">{cartItemCount}</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-orange-600 rounded-full flex items-center justify-center text-[10px] font-black shadow-lg animate-bounce">
                  !
                </span>
              )}
            </button>
            {/* Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-orange-600/40 blur-[20px] rounded-full -z-10 group-hover:scale-150 transition-transform"></div>
          </div>

          {/* Item 3: Order Status / Pronto */}
          <button
            onClick={() => activeOrder && setIsStatusModalOpen(true)}
            className={`flex flex-col items-center gap-1.5 transition-all transform active:scale-90 ${activeOrder ? (
              activeOrder.status === 'pendiente' ? 'text-yellow-500' :
                activeOrder.status === 'preparando' ? 'text-orange-500' :
                  activeOrder.status === 'camino' ? 'text-green-500' :
                    'text-gray-400'
            ) : 'text-gray-400 opacity-40 cursor-default'}`}
          >
            {activeOrder ? (
              <>
                <div className={`w-7 h-7 flex items-center justify-center relative`}>
                  <FlameIcon className={`w-6 h-6 ${activeOrder.status === 'preparando' ? 'animate-pulse' : activeOrder.status === 'camino' ? 'animate-bounce' : ''}`} />
                  {(activeOrder.status === 'camino' || activeOrder.status === 'preparando') && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${activeOrder.status === 'camino' ? 'bg-green-400' : 'bg-orange-400'} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-3 w-3 ${activeOrder.status === 'camino' ? 'bg-green-500' : 'bg-orange-500'}`}></span>
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest">
                  {activeOrder.status === 'camino' ? 'En camino' : activeOrder.status}
                </span>
              </>
            ) : (
              <>
                <div className="w-7 h-7 rounded-full border-2 border-dashed border-gray-600"></div>
                <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Pronto</span>
              </>
            )}
          </button>

        </nav>
      </div>

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        updateQuantity={updateQuantity}
        removeFromCart={() => { }}
        tableNumber={tableNumber}
        setTableNumber={setTableNumber}
        onConfirm={onConfirmOrder}
      />

      {/* Status Detail Modal */}
      {isStatusModalOpen && activeOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 px-10">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsStatusModalOpen(false)} />
          <div className="bg-white w-full max-w-sm p-8 rounded-[2.5rem] shadow-2xl relative animate-in zoom-in duration-300 flex flex-col items-center text-center">

            <button
              onClick={() => setIsStatusModalOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-900 font-bold"
            >✕</button>

            <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 
              ${activeOrder.status === 'pendiente' ? 'bg-yellow-100 text-yellow-600' :
                activeOrder.status === 'preparando' ? 'bg-orange-100 text-orange-600' :
                  activeOrder.status === 'camino' ? 'bg-green-100 text-green-600' : 'bg-gray-100'}`}>
              <FlameIcon className={`w-12 h-12 ${activeOrder.status === 'preparando' ? 'animate-pulse' : activeOrder.status === 'camino' ? 'animate-bounce' : ''}`} />
            </div>

            <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-2">
              {activeOrder.status === 'pendiente' && 'Pedido Recibido'}
              {activeOrder.status === 'preparando' && 'En la Parrilla'}
              {activeOrder.status === 'camino' && '¡En Camino!'}
            </h3>

            <p className="text-gray-500 font-medium mb-8 leading-relaxed">
              {activeOrder.status === 'pendiente' && 'Tu pedido está en espera de ser confirmado por la cocina. ¡No tardamos!'}
              {activeOrder.status === 'preparando' && 'Nuestros parrilleros están preparando tus platos con el mejor fuego.'}
              {activeOrder.status === 'camino' && 'Tu pedido ya salió de la cocina y se dirige a tu mesa. ¡Buen provecho!'}
            </p>

            <div className="w-full bg-gray-100 rounded-full h-2 mb-2 overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-1000 
                ${activeOrder.status === 'pendiente' ? 'w-[10%] bg-yellow-500' :
                  activeOrder.status === 'preparando' ? 'w-[50%] bg-orange-500' :
                    'w-[90%] bg-green-500'}`}
              />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {activeOrder.status === 'pendiente' ? 'Confirmando...' :
                activeOrder.status === 'preparando' ? 'Cocinando...' :
                  'Sirviendo...'}
            </p>

          </div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,900;1,900&family=Inter:wght@400;700;900&display=swap');

        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        .animate-bounce-x {
          animation: bounce-x 2s infinite ease-in-out;
        }

        /* Modern UI Utilities */
        .glass-panel {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        /* Touch interaction optimizations */
        button:active {
          transform: scale(0.95);
          transition: transform 0.1s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .scroll-reveal {
          animation: reveal 1s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes reveal {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;
