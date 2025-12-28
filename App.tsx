import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Upload, Download, Sparkles, Image as ImageIcon, RotateCcw, AlertTriangle } from 'lucide-react';
import { Button } from './components/Button';
import { StyleCard } from './components/StyleCard';
import { ResizeControls } from './components/ResizeControls';
import { STYLES } from './constants';
import { RetroStyle, ProcessingSettings } from './types';
import { generateRetroImage } from './services/geminiService';

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceMimeType, setSourceMimeType] = useState<string>('image/jpeg');
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Dimensions state for the *downloadable* output
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [originalAspectRatio, setOriginalAspectRatio] = useState(1);
  
  const [selectedStyle, setSelectedStyle] = useState<RetroStyle>(RetroStyle.NOKIA);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Handle Image Upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError("请上传有效的图片文件。");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setSourceImage(result);
        setSourceMimeType(file.type);
        setProcessedImage(null);
        setError(null);
        
        // Get dimensions
        const img = new Image();
        img.onload = () => {
          setDimensions({ width: img.width, height: img.height });
          setOriginalAspectRatio(img.width / img.height);
          setMaintainAspectRatio(true);
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!sourceImage) return;

    setIsProcessing(true);
    setError(null);

    try {
      const result = await generateRetroImage(sourceImage, sourceMimeType, selectedStyle);
      setProcessedImage(result);
    } catch (err: any) {
      setError("图片处理失败，请重试。" + (err.message || ""));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = useCallback(() => {
    if (!processedImage && !sourceImage) return;
    
    // We use a canvas to resize the image to the user's requested dimensions before downloading
    const imgToSave = processedImage || sourceImage;
    if (!imgToSave) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Disable image smoothing for pixel art styles to keep edges crisp
        if (selectedStyle === RetroStyle.NOKIA || selectedStyle === RetroStyle.GAMEBOY) {
            ctx.imageSmoothingEnabled = false;
        } else {
            ctx.imageSmoothingEnabled = true; // Smooth for CRT/CCD usually better unless strictly pixelated
            if (selectedStyle === RetroStyle.BW_CCD) ctx.imageSmoothingQuality = 'low'; // Gritty look
        }

        ctx.drawImage(img, 0, 0, dimensions.width, dimensions.height);
        
        // Trigger download
        const link = document.createElement('a');
        link.download = `retro-lens-${selectedStyle.toLowerCase()}-${Date.now()}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      }
    };
    img.src = imgToSave;
  }, [processedImage, sourceImage, dimensions, selectedStyle]);

  const handleReset = () => {
    setSourceImage(null);
    setProcessedImage(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 font-sans pb-20">
      {/* Hidden Canvas for resizing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-md flex items-center justify-center">
               <Sparkles className="text-zinc-950 w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              RetroLens AI
            </h1>
          </div>
          <div className="flex items-center gap-4">
             {/* Simple link for "About" or similar could go here */}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Controls */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Upload Area */}
            <div className="space-y-2">
               <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">上传原图</h2>
               <div 
                 onClick={() => fileInputRef.current?.click()}
                 className={`
                    border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 group
                    ${sourceImage ? 'border-zinc-700 bg-zinc-900/30' : 'border-zinc-700 hover:border-emerald-500 hover:bg-zinc-900'}
                 `}
               >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                  
                  {sourceImage ? (
                     <div className="relative aspect-video w-full h-32 overflow-hidden rounded-lg mx-auto">
                        <img src={sourceImage} alt="Source" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs font-medium text-white flex items-center gap-1">
                                <RotateCcw className="w-3 h-3" /> 更换图片
                            </span>
                        </div>
                     </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-6">
                      <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 group-hover:text-emerald-400 transition-colors">
                        <Upload className="w-6 h-6 text-zinc-400 group-hover:text-emerald-400" />
                      </div>
                      <p className="text-sm font-medium text-zinc-300">点击上传图片</p>
                      <p className="text-xs text-zinc-500 mt-1">支持 PNG, JPG, WEBP (最大 5MB)</p>
                    </div>
                  )}
               </div>
            </div>

            {/* Style Selector */}
            <div className="space-y-3">
               <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">选择复古风格</h2>
               <div className="grid grid-cols-2 gap-3">
                 {STYLES.map(style => (
                    <StyleCard 
                      key={style.id}
                      config={style} 
                      isSelected={selectedStyle === style.id}
                      onSelect={setSelectedStyle}
                    />
                 ))}
               </div>
            </div>

            {/* Action Button */}
            <div className="pt-2">
              <Button 
                onClick={handleGenerate} 
                disabled={!sourceImage}
                isLoading={isProcessing}
                className="w-full py-4 text-lg shadow-emerald-900/20"
                icon={<Sparkles className="w-5 h-5" />}
              >
                {isProcessing ? '正在处理像素...' : '应用复古滤镜'}
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN: Preview & Final Adjustments */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Viewer */}
            <div className="flex-1 bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden relative min-h-[500px] flex items-center justify-center">
               
               {!sourceImage && (
                 <div className="text-center text-zinc-500">
                    <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>请上传图片开始编辑</p>
                 </div>
               )}

               {sourceImage && (
                 <div className="relative w-full h-full p-4 flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-zinc-950/50">
                    {/* If we have a processed image, show it. Otherwise show source. */}
                    <div className="relative max-w-full max-h-full shadow-2xl shadow-black/50">
                       <img 
                         src={processedImage || sourceImage} 
                         alt="Preview" 
                         className={`
                           max-h-[600px] object-contain rounded-md border border-zinc-700
                           ${selectedStyle === RetroStyle.NOKIA && processedImage ? 'rendering-pixelated' : ''}
                         `}
                         style={{ 
                           imageRendering: (selectedStyle === RetroStyle.NOKIA || selectedStyle === RetroStyle.GAMEBOY) ? 'pixelated' : 'auto' 
                         }}
                       />
                       
                       {/* Label Badge */}
                       <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-mono border border-white/10 text-white">
                          {processedImage ? `${STYLES.find(s => s.id === selectedStyle)?.name} 效果预览` : '原图'}
                       </div>
                    </div>
                 </div>
               )}

               {/* Loading Overlay */}
               {isProcessing && (
                 <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                    <div className="w-16 h-16 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                    <p className="text-emerald-400 font-mono animate-pulse">AI 正在重绘像素...</p>
                 </div>
               )}
            </div>

            {/* Bottom Controls: Resize & Download */}
            <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6">
               <div className="flex flex-col md:flex-row md:items-start gap-6">
                  
                  {/* Resize Section */}
                  <div className="flex-1">
                     <ResizeControls 
                        width={dimensions.width}
                        height={dimensions.height}
                        maintainAspectRatio={maintainAspectRatio}
                        originalAspectRatio={originalAspectRatio}
                        onWidthChange={(w) => setDimensions(d => ({ ...d, width: w }))}
                        onHeightChange={(h) => setDimensions(d => ({ ...d, height: h }))}
                        onToggleAspectRatio={() => setMaintainAspectRatio(!maintainAspectRatio)}
                     />
                  </div>

                  {/* Download Action */}
                  <div className="md:w-64 flex flex-col justify-end">
                     <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 mb-4">
                        <div className="text-xs text-zinc-500 mb-1">最终分辨率</div>
                        <div className="text-xl font-mono text-white tracking-tight">
                           {dimensions.width} <span className="text-zinc-600">x</span> {dimensions.height}
                        </div>
                     </div>
                     <Button 
                       onClick={handleDownload}
                       variant="secondary"
                       className="w-full py-3 bg-zinc-100 text-zinc-900 hover:bg-white hover:text-black border-none font-bold"
                       disabled={!sourceImage}
                       icon={<Download className="w-5 h-5" />}
                     >
                       保存图片
                     </Button>
                  </div>

               </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;