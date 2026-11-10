import React, { useState, useEffect, useMemo, useCallback } from 'react';
import seedrandom from 'seedrandom';
import { Header } from './components/Header';
import { ClassicSymbolTable } from './components/ClassicSymbolTable';
import { ClassicControlFieldsets } from './components/ClassicControlFieldsets';
import { ExportModal } from './components/ExportModal';
import { HelpModal } from './components/HelpModal';
import { CARTOGRAPHIC_SYMBOLS } from './data/symbolsData';
import { CARTOGRAPHIC_PRESETS } from './data/presets';
import { PatternEngine } from './engine/patternEngine';
import { CartoSymbol, DotPoint, GeneratorConfig, PresetPattern, SymbolSelection } from './types';

const DEFAULT_CONFIG: GeneratorConfig = {
  gridSize: 256,
  dotDist: 38,
  dotRadius: 40,
  dotRadiusY: 40,
  metric: 2,
  gridType: 'random',
  seed: 'carto88',
  symbolColor: '#507040',
  backgroundColor: '#a2c892',
  transparentBackground: false,
  casingWidth: 0,
  casingColor: '#ffffff',
  pixelAlign: false,
  inlineGeometries: true,
};

export default function App() {
  const [config, setConfig] = useState<GeneratorConfig>(DEFAULT_CONFIG);
  const [selectedSymbols, setSelectedSymbols] = useState<SymbolSelection[]>([
    {
      symbolId: 'wood-s',
      weight: 10,
      scale: 1.0,
      offsetX: 'auto',
      offsetY: 'auto',
      randomRotate: false,
      color: '#507040',
    },
  ]);
  const [customSymbols, setCustomSymbols] = useState<CartoSymbol[]>([]);
  const [activePresetId, setActivePresetId] = useState<string>('');
  const [dots, setDots] = useState<DotPoint[]>([]);

  // Preview mode for Column 2
  const [previewMode, setPreviewMode] = useState<'tile' | 'seamless' | 'map'>('tile');
  const [showSeams, setShowSeams] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  // Modals state
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Symbol lookup map
  const symbolLib = useMemo(() => {
    const map: Record<string, CartoSymbol> = {};
    CARTOGRAPHIC_SYMBOLS.forEach((s) => {
      map[s.id] = s;
    });
    customSymbols.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [customSymbols]);

  // Generate initial grid
  const regenerateGrid = useCallback(() => {
    const rng = seedrandom(config.seed);
    const newDots = PatternEngine.generateGrid(
      config.gridSize,
      config.dotDist,
      config.gridType,
      rng
    );
    const relaxed = PatternEngine.relax(
      newDots,
      config.gridSize,
      config.dotRadius,
      config.dotRadiusY,
      config.metric,
      1
    );
    setDots(relaxed);
  }, [config.gridSize, config.dotDist, config.gridType, config.dotRadius, config.dotRadiusY, config.metric, config.seed]);

  useEffect(() => {
    regenerateGrid();
  }, [regenerateGrid]);

  // Relaxation and spatial transforms
  const handleRelax = (steps: number) => {
    const relaxed = PatternEngine.relax(
      dots,
      config.gridSize,
      config.dotRadius,
      config.dotRadiusY,
      config.metric,
      steps
    );
    setDots(relaxed);
  };

  const handleShake = () => {
    const rng = seedrandom();
    setDots(PatternEngine.shake(dots, config.gridSize, config.dotDist, 0.25, rng));
  };

  const handleJitter = () => {
    const rng = seedrandom();
    setDots(PatternEngine.jitter(dots, config.gridSize, 2.0, rng));
  };

  const handleRotate45 = () => {
    setDots(PatternEngine.rotate45(dots, config.gridSize));
  };

  const handleSwap = () => {
    setDots(PatternEngine.swap(dots));
  };

  const handleZigzag = () => {
    setDots(PatternEngine.zigzag(dots, config.gridSize));
  };

  // Symbol selection handlers
  const handleUseSymbol = (symbolId: string) => {
    setSelectedSymbols([
      {
        symbolId,
        weight: 10,
        scale: 1.0,
        offsetX: 'auto',
        offsetY: 'auto',
        randomRotate: false,
        color: config.symbolColor,
      },
    ]);
  };

  const handleAddSymbol = (symbolId: string) => {
    setSelectedSymbols((prev) => {
      const exists = prev.some((s) => s.symbolId === symbolId);
      if (exists) {
        if (prev.length <= 1) return prev;
        return prev.filter((s) => s.symbolId !== symbolId);
      }
      return [
        ...prev,
        {
          symbolId,
          weight: 5,
          scale: 1.0,
          offsetX: 'auto',
          offsetY: 'auto',
          randomRotate: false,
          color: config.symbolColor,
        },
      ];
    });
  };

  const handleUpdateSymbolConfig = (symbolId: string, updates: Partial<SymbolSelection>) => {
    setSelectedSymbols((prev) =>
      prev.map((s) => (s.symbolId === symbolId ? { ...s, ...updates } : s))
    );
  };

  const handleAddCustomSymbol = (symbol: CartoSymbol) => {
    setCustomSymbols((prev) => [symbol, ...prev]);
  };

  // Presets
  const handleSelectPreset = (preset: PresetPattern) => {
    setActivePresetId(preset.id);
    setConfig((prev) => ({ ...prev, ...preset.config }));
    if (preset.symbols) setSelectedSymbols(preset.symbols);
    setTimeout(regenerateGrid, 50);
  };

  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setSelectedSymbols([
      {
        symbolId: 'wood-s',
        weight: 10,
        scale: 1.0,
        offsetX: 'auto',
        offsetY: 'auto',
        randomRotate: false,
        color: '#507040',
      },
    ]);
    setActivePresetId('');
    setTimeout(regenerateGrid, 50);
  };

  // Generate SVG string using engine
  const svgContent = useMemo(() => {
    return PatternEngine.buildSvgString(dots, selectedSymbols, symbolLib, config);
  }, [dots, selectedSymbols, symbolLib, config]);

  const svgDataUrl = useMemo(() => {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgContent)}`;
  }, [svgContent]);

  // Direct downloads
  const handleDownloadSvg = () => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carto_pattern_${config.gridSize}x${config.gridSize}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPng = () => {
    const canvas = document.createElement('canvas');
    const size = config.gridSize * 2;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      const a = document.createElement('a');
      a.href = canvas.toDataURL('image/png');
      a.download = `carto_pattern_${size}x${size}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleCopySvg = () => {
    navigator.clipboard.writeText(svgContent).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f5f8] text-slate-800">
      {/* Top Navbar */}
      <Header
        onSelectPreset={handleSelectPreset}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onReset={handleReset}
        activePresetId={activePresetId}
      />

      {/* Main Studio Container */}
      <main className="flex-1 p-4 max-w-[1700px] w-full mx-auto flex flex-col space-y-4">
        {/* TOP ROW: 3-Column Classic Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* COLUMN 1: 点状模式 (Dot Pattern) */}
          <div className="lg:col-span-4 bg-white border border-slate-300 rounded-xl p-3 flex flex-col shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
              <strong className="text-xs text-slate-800">点状模式:</strong>
              <span className="text-[10px] text-slate-500 font-mono font-medium">
                {dots.length} 点位
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center p-2 bg-slate-50 rounded-lg min-h-[300px]">
              <div
                className="bg-white rounded border border-slate-300 shadow-xs overflow-hidden relative"
                style={{ width: 256, height: 256 }}
              >
                <svg viewBox={`0 0 ${config.gridSize} ${config.gridSize}`} className="w-full h-full">
                  {dots.map((d, i) => (
                    <circle key={i} cx={d.x} cy={d.y} r="1.6" fill="#2563eb" />
                  ))}
                </svg>
              </div>
            </div>
            <div className="text-[10px] text-slate-500 text-center pt-2">
              周期边界拓扑点位网格 ({config.gridSize}×{config.gridSize} px)
            </div>
          </div>

          {/* COLUMN 2: 符号图案 (Symbol Pattern & Live Render) */}
          <div className="lg:col-span-4 bg-white border border-slate-300 rounded-xl p-3 flex flex-col shadow-xs">
            {/* Top Toolbar: Color Pickers & Preview Switcher */}
            <div className="flex flex-wrap items-center justify-between pb-2 border-b border-slate-200 mb-2 gap-2">
              <div className="flex items-center space-x-2">
                <strong className="text-xs text-slate-800">符号图案:</strong>
                {/* Symbol Color Picker */}
                <input
                  type="color"
                  value={config.symbolColor}
                  onChange={(e) => setConfig((prev) => ({ ...prev, symbolColor: e.target.value }))}
                  className="w-5 h-5 rounded cursor-pointer border border-slate-300 bg-transparent"
                  title="符号颜色"
                />
                {/* Background Color Picker */}
                <input
                  type="color"
                  value={config.backgroundColor}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, backgroundColor: e.target.value, transparentBackground: false }))
                  }
                  className="w-5 h-5 rounded cursor-pointer border border-slate-300 bg-transparent"
                  title="背景底色"
                />
                {/* Transparent toggle */}
                <label className="text-[10px] text-slate-600 flex items-center space-x-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.transparentBackground}
                    onChange={(e) => setConfig((prev) => ({ ...prev, transparentBackground: e.target.checked }))}
                    className="rounded bg-white border-slate-300 text-emerald-600 focus:ring-0"
                  />
                  <span>透明</span>
                </label>
              </div>

              {/* View mode buttons */}
              <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200 text-[10px]">
                <button
                  onClick={() => setPreviewMode('tile')}
                  className={`px-1.5 py-0.5 rounded transition ${
                    previewMode === 'tile' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="单格单胞"
                >
                  单格
                </button>
                <button
                  onClick={() => setPreviewMode('seamless')}
                  className={`px-1.5 py-0.5 rounded transition ${
                    previewMode === 'seamless' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="3x3 无缝矩阵"
                >
                  3x3
                </button>
                <button
                  onClick={() => setPreviewMode('map')}
                  className={`px-1.5 py-0.5 rounded transition ${
                    previewMode === 'map' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="地图面填充实景"
                >
                  地图
                </button>
              </div>
            </div>

            {/* Canvas / SVG Output Area */}
            <div className="flex-1 flex items-center justify-center p-2 bg-slate-50 rounded-lg min-h-[300px] overflow-hidden">
              {/* Single Tile Mode */}
              {previewMode === 'tile' && (
                <div
                  className="rounded border border-slate-300 shadow-xs overflow-hidden relative transition-transform"
                  style={{
                    width: 256,
                    height: 256,
                    backgroundColor: config.transparentBackground ? 'transparent' : config.backgroundColor,
                  }}
                >
                  {config.transparentBackground && (
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,#cbd5e1_25%,transparent_25%),linear-gradient(-45deg,#cbd5e1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#cbd5e1_75%),linear-gradient(-45deg,transparent_75%,#cbd5e1_75%)] [background-size:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0px] opacity-40 pointer-events-none" />
                  )}
                  <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: svgContent }} />
                </div>
              )}

              {/* 3x3 Seamless Grid Mode */}
              {previewMode === 'seamless' && (
                <div
                  className="rounded border border-slate-300 shadow-xs overflow-hidden relative"
                  style={{
                    width: 288,
                    height: 288,
                    backgroundColor: config.transparentBackground ? '#ffffff' : config.backgroundColor,
                  }}
                >
                  {config.transparentBackground && (
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,#cbd5e1_25%,transparent_25%),linear-gradient(-45deg,#cbd5e1_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#cbd5e1_75%),linear-gradient(-45deg,transparent_75%,#cbd5e1_75%)] [background-size:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0px] opacity-40 pointer-events-none" />
                  )}
                  {/* 3x3 Grid: Center core tile is 100% opacity, surrounding 8 perimeter tiles are dimmed */}
                  <div
                    className="absolute inset-0"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gridTemplateRows: 'repeat(3, 1fr)',
                    }}
                  >
                    {Array.from({ length: 9 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-full h-full relative"
                        style={{
                          opacity: i === 4 ? 1 : 0.35,
                          zIndex: i === 4 ? 10 : 1,
                          backgroundImage: `url("${svgDataUrl}")`,
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '100% 100%',
                        }}
                      />
                    ))}
                  </div>
                  {showSeams && (
                    <div
                      className="absolute inset-0 pointer-events-none border border-emerald-600/40"
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gridTemplateRows: 'repeat(3, 1fr)',
                      }}
                    >
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div
                          key={i}
                          className="border border-dashed border-emerald-600/40 flex items-start justify-start p-1"
                          style={{
                            backgroundColor: i === 4 ? 'rgba(5, 150, 105, 0.08)' : 'transparent',
                          }}
                        >
                          {i === 4 && (
                            <span className="text-[8px] font-mono font-bold text-emerald-700 bg-white/90 px-1 py-0.5 rounded border border-emerald-300 shadow-xs">
                              核心单胞
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Map Polygon Simulation */}
              {previewMode === 'map' && (
                <div className="w-full h-[280px] bg-[#cad2c5] rounded border border-slate-300 overflow-hidden relative shadow-xs">
                  <svg viewBox="0 0 300 280" className="w-full h-full">
                    <defs>
                      <pattern id="classicMapPat" patternUnits="userSpaceOnUse" width={64} height={64}>
                        <image href={svgDataUrl} width={64} height={64} />
                      </pattern>
                    </defs>
                    <rect width="300" height="280" fill="#e9edc9" />
                    {/* Water */}
                    <path d="M-10,30 Q80,50 140,160 T310,240" fill="none" stroke="#48cae4" strokeWidth="18" />
                    {/* Landcover Polygon with Pattern Fill */}
                    <path
                      d="M 50,40 Q 180,20 250,70 Q 280,160 210,220 Q 120,260 50,200 Q 20,130 50,40 Z"
                      fill="url(#classicMapPat)"
                      stroke="#588157"
                      strokeWidth="2"
                    />
                    <text x="150" y="145" textAnchor="middle" fill="#1e293b" fontSize="10" fontWeight="bold">
                      林地/湿地保护区
                    </text>
                  </svg>
                </div>
              )}
            </div>

            <div className="text-[10px] text-slate-500 text-center pt-2 flex items-center justify-center space-x-3">
              <span>无缝周期渲染</span>
              {previewMode === 'seamless' && (
                <button
                  onClick={() => setShowSeams(!showSeams)}
                  className="text-emerald-700 underline font-medium"
                >
                  {showSeams ? '隐藏接缝' : '显示接缝'}
                </button>
              )}
            </div>
          </div>

          {/* COLUMN 3: 符号定义 (Classic Symbol Table & Inspector) */}
          <div className="lg:col-span-4 h-full">
            <ClassicSymbolTable
              selectedSymbols={selectedSymbols}
              onUseSymbol={handleUseSymbol}
              onAddSymbol={handleAddSymbol}
              onUpdateSymbolConfig={handleUpdateSymbolConfig}
              onAddCustomSymbol={handleAddCustomSymbol}
              symbolLib={symbolLib}
              customSymbols={customSymbols}
            />
          </div>
        </div>

        {/* BOTTOM ROW: 3 Classic Fieldsets (Point generation, Relaxation, Rendering) */}
        <ClassicControlFieldsets
          config={config}
          onUpdateConfig={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
          onRegenerate={regenerateGrid}
          onRelax={handleRelax}
          onShake={handleShake}
          onJitter={handleJitter}
          onRotate45={handleRotate45}
          onSwap={handleSwap}
          onZigzag={handleZigzag}
          onOpenExport={() => setIsExportOpen(true)}
          onDownloadSvg={handleDownloadSvg}
          onDownloadPng={handleDownloadPng}
          onCopySvg={handleCopySvg}
          isCopied={isCopied}
        />
      </main>

      {/* Export & Download Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        svgContent={svgContent}
        config={config}
      />

      {/* Help & Guide Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
