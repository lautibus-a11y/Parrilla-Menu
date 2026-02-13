
import React from 'react';
import { FoodItem } from '../types';

interface CardProps {
  item: FoodItem;
  onAdd: (item: FoodItem) => void;
}

export const Card: React.FC<CardProps> = ({ item, onAdd }) => {
  const isOut = !item.isAvailable;

  return (
    <div className={`w-full max-w-[340px] bg-white/5 backdrop-blur-xl rounded-[3rem] p-5 transition-all duration-700 border border-white/10 group flex flex-col h-[520px] relative overflow-hidden ${isOut ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-orange-500/40 hover:shadow-[0_0_50px_-12px_rgba(234,88,12,0.3)]'}`}>

      {/* Background Ambient Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-600/5 blur-[80px] group-hover:bg-orange-600/10 transition-all duration-700 rounded-full"></div>

      <div className="relative w-full h-[280px] mb-8 overflow-hidden rounded-[2.5rem] shadow-2xl ring-1 ring-white/10">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover transition-transform duration-[2s] group-hover:scale-110 group-hover:rotate-2"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>

        {isOut && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-white/10 border border-white/20 text-white px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-[0.3em] backdrop-blur-md">Agotado</span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 px-3 z-10">
        <div className="mb-3">
          <h3 className="text-white font-serif italic text-3xl leading-none tracking-tight group-hover:text-orange-500 transition-colors duration-500">
            {item.name}
          </h3>
        </div>

        <p className="text-zinc-400 text-sm font-medium leading-relaxed line-clamp-2 mb-8 group-hover:text-zinc-300 transition-colors">
          {item.description}
        </p>

        <div className="flex justify-between items-center mt-auto pb-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-orange-500/60 font-black uppercase tracking-[0.4em] mb-1">Inversión</span>
            <span className="text-white font-black text-3xl tracking-tighter">${item.priceNumber.toLocaleString()}</span>
          </div>

          <button
            disabled={isOut}
            onClick={() => onAdd(item)}
            className="group/btn relative w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all duration-500 active:scale-90 bg-white text-black hover:bg-orange-600 hover:text-white overflow-hidden shadow-2xl hover:shadow-orange-600/20"
          >
            <span className="relative z-10 text-3xl font-light transform group-hover/btn:rotate-90 transition-transform duration-500">+</span>
            <div className="absolute inset-0 bg-orange-600 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500"></div>
          </button>
        </div>
      </div>
    </div>
  );
};
