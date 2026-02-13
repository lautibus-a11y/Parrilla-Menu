

import React from 'react';
import { FoodItem } from '../types';

interface CardProps {
  item: FoodItem;
  onAdd: (item: FoodItem) => void;
  index?: number;
}

export const Card: React.FC<CardProps> = ({ item, onAdd, index = 0 }) => {
  const isOut = !item.isAvailable;

  return (
    <div
      style={{ animationDelay: `${index * 0.05}s` }}
      className={`animate-reveal w-full max-w-[340px] bg-zinc-900/90 rounded-[3rem] p-5 transition-transform duration-300 border border-white/5 group flex flex-col h-[520px] relative overflow-hidden ${isOut
        ? 'opacity-40 grayscale pointer-events-none'
        : 'touch-scale md:hover:border-orange-500/80 md:hover:shadow-[0_0_50px_-10px_rgba(234,88,12,0.4)] md:hover:bg-zinc-800'
        }`}>

      {/* Background Ambient Glow - Optimized */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-600/5 blur-[40px] md:group-hover:bg-orange-600/10 transition-colors duration-700 rounded-full pointer-events-none"></div>

      <div className="relative w-full h-[280px] mb-8 overflow-hidden rounded-[2.5rem] shadow-2xl ring-1 ring-white/10 bg-zinc-800">
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-700 md:group-hover:scale-110 md:group-hover:rotate-2"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 md:group-hover:opacity-40 transition-opacity duration-500"></div>

        {isOut && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <span className="bg-white/10 border border-white/20 text-white px-8 py-3 rounded-full font-black uppercase text-[10px] tracking-[0.3em] backdrop-blur-md">Agotado</span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 px-3 z-10">
        <div className="mb-3">
          <h3 className="text-white font-serif italic text-3xl leading-none tracking-tight md:group-hover:text-orange-500 transition-colors duration-300">
            {item.name}
          </h3>
        </div>

        <p className="text-zinc-400 text-sm font-medium leading-relaxed line-clamp-2 mb-8 md:group-hover:text-zinc-300 transition-colors duration-300">
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
            className="group/btn relative w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-transform duration-300 active:scale-90 bg-white text-black md:hover:bg-orange-600 md:hover:text-white overflow-hidden shadow-2xl md:hover:shadow-orange-600/20"
          >
            <span className="relative z-10 text-3xl font-light transform md:group-hover/btn:rotate-90 transition-transform duration-500">+</span>
            <div className="absolute inset-0 bg-orange-600 translate-y-full md:group-hover/btn:translate-y-0 transition-transform duration-300"></div>
          </button>
        </div>
      </div>
    </div>
  );
};
