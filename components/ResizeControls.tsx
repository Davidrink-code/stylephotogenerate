import React, { useEffect } from 'react';
import { Lock, Unlock, ArrowRightLeft } from 'lucide-react';

interface ResizeControlsProps {
  width: number;
  height: number;
  maintainAspectRatio: boolean;
  onWidthChange: (w: number) => void;
  onHeightChange: (h: number) => void;
  onToggleAspectRatio: () => void;
  originalAspectRatio: number;
}

export const ResizeControls: React.FC<ResizeControlsProps> = ({
  width,
  height,
  maintainAspectRatio,
  onWidthChange,
  onHeightChange,
  onToggleAspectRatio,
  originalAspectRatio,
}) => {

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value) || 0;
    onWidthChange(newWidth);
    if (maintainAspectRatio && originalAspectRatio > 0) {
      onHeightChange(Math.round(newWidth / originalAspectRatio));
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value) || 0;
    onHeightChange(newHeight);
    if (maintainAspectRatio && originalAspectRatio > 0) {
      onWidthChange(Math.round(newHeight * originalAspectRatio));
    }
  };

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-zinc-300 flex items-center gap-2">
          <ArrowRightLeft className="w-4 h-4 text-emerald-500" />
          输出尺寸设置
        </h3>
        <button
          onClick={onToggleAspectRatio}
          className="text-xs flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
          title="切换宽高比锁定"
        >
          {maintainAspectRatio ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          {maintainAspectRatio ? "已锁定" : "未锁定"}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-500 font-medium ml-1">宽度 (px)</label>
          <input
            type="number"
            min="1"
            max="4096"
            value={width}
            onChange={handleWidthChange}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-zinc-500 font-medium ml-1">高度 (px)</label>
          <input
            type="number"
            min="1"
            max="4096"
            value={height}
            onChange={handleHeightChange}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono"
          />
        </div>
      </div>
      
      <div className="flex gap-2">
        {[0.25, 0.5, 1, 2].map((scale) => (
           <button
             key={scale}
             onClick={() => {
                const w = Math.round(width * scale);
                onWidthChange(w);
                if (maintainAspectRatio && originalAspectRatio > 0) {
                    onHeightChange(Math.round(w / originalAspectRatio));
                } else {
                    onHeightChange(Math.round(height * scale));
                }
             }}
             className="flex-1 text-xs py-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors border border-zinc-700"
           >
             {scale}x
           </button>
        ))}
      </div>
    </div>
  );
};