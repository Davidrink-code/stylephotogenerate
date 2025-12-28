import React from 'react';
import { RetroStyle, StyleConfig } from '../types';
import { Smartphone, Camera, Gamepad2, Tv } from 'lucide-react';

interface StyleCardProps {
  config: StyleConfig;
  isSelected: boolean;
  onSelect: (id: RetroStyle) => void;
}

export const StyleCard: React.FC<StyleCardProps> = ({ config, isSelected, onSelect }) => {
  const Icon = () => {
    switch (config.iconName) {
      case 'smartphone': return <Smartphone className="w-6 h-6" />;
      case 'camera': return <Camera className="w-6 h-6" />;
      case 'gamepad': return <Gamepad2 className="w-6 h-6" />;
      case 'tv': return <Tv className="w-6 h-6" />;
      default: return <Smartphone className="w-6 h-6" />;
    }
  };

  return (
    <div 
      onClick={() => onSelect(config.id)}
      className={`
        relative overflow-hidden cursor-pointer group rounded-xl p-4 border-2 transition-all duration-300
        ${isSelected 
          ? 'border-emerald-500 bg-zinc-900 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600 hover:bg-zinc-800'
        }
      `}
    >
      <div className={`
        absolute top-0 right-0 p-2 opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12
        text-${config.previewColor}
      `}>
         <Icon />
      </div>

      <div className="flex items-center space-x-3 mb-2">
        <div className={`
          p-2 rounded-lg 
          ${isSelected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-400 group-hover:text-zinc-200'}
        `}>
          <Icon />
        </div>
        <h3 className="font-bold text-sm tracking-wide uppercase text-zinc-100">{config.name}</h3>
      </div>
      
      <p className="text-xs text-zinc-400 leading-relaxed">
        {config.description}
      </p>

      {/* Decorative Selection Indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></div>
      )}
    </div>
  );
};
