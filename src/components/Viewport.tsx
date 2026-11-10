import React, { useState, useMemo } from 'react';
import {
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Eye,
  Grid,
  Map as MapIcon,
  Crosshair,
  Layers,
} from 'lucide-react';
import { DotPoint, GeneratorConfig } from '../types';

interface ViewportProps {
  svgContent: string;
  dots: DotPoint[];
  config: GeneratorConfig;
}

export const Viewport: React.FC<ViewportProps> = ({
  svgContent,
  dots,
  config,
}) => {
  const [activeTab, setActiveTab] = useState<'tile' | 'seamless' | 'map' | 'dots'>('tile');
  const [zoom, setZoom] = useState<number>(1);
  const [showSeams, setShowSeams] = useState<boolean>(true);

  // Convert SVG string to data URL for seamless CSS tiling
  const svgDataUrl = useMemo(() => {
    if (!svgContent) return '';
    const encoded = encodeURIComponent(svgContent);
    return `data:image/svg+xml;charset=utf-8,${encoded}`;
  }, [svgContent]);

  return (
    <div className="flex-1 flex flex-col bg-slate-950 rounded-2xl border border-slate-800/80 overflow-hidden shadow-2xl relative">
      {/* Viewport Top Toolbar */}
      <div className="h-12 bg-slate-900/90 border-b border-slate-800 px-4 flex items-center justify-between z-10">
        {/* View Tabs */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => { setActiveTab('tile'); setZoom(1); }}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTab === 'tile'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>单格单胞 (1x Tile)</span>
          </button>

          <button
            onClick={() => { setActiveTab('seamless'); setZoom(1); }}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTab === 'seamless'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>3x3 无缝矩阵 (Tiling)</span>
          </button>

          <button
            onClick={() => { setActiveTab('map'); setZoom(1); }}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTab === 'map'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>地图实景模拟 (GIS Polygon)</span>
          </button>

          <button
            onClick={() => { setActiveTab('dots'); setZoom(1); }}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-medium transition ${
              activeTab === 'dots'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>点位分布拓扑 (Dots)</span>
          </button>
        </div>

        {/* View Controls: Zoom, Seams, etc. */}
        <div className="flex items-center space-x-2">
          {activeTab === 'seamless' && (
            <button
              onClick={() => setShowSeams(!showSeams)}
              className={`flex items-center space-x-1 text-xs px-2.5 py-1 rounded border transition ${
                showSeams
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title="显示/隐藏拼贴接缝边框"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>接缝线</span>
            </button>
          )}

          <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setZoom((prev) => Math.max(0.5, prev - 0.25))}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="缩小"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono px-2 text-slate-300 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((prev) => Math.min(3, prev + 0.25))}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="放大"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setZoom(1)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title="重置缩放"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas View Area */}
      <div className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        {/* TAB 1: Single Tile View */}
        {activeTab === 'tile' && (
          <div
            className="relative transition-transform duration-100 ease-out shadow-2xl rounded-lg overflow-hidden border border-slate-700/80"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              width: config.gridSize,
              height: config.gridSize,
            }}
          >
            {/* Checkerboard for transparent backgrounds */}
            {config.transparentBackground && (
              <div className="absolute inset-0 bg-[linear-gradient(45deg,#334155_25%,transparent_25%),linear-gradient(-45deg,#334155_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#334155_75%),linear-gradient(-45deg,transparent_75%,#334155_75%)] [background-size:16px_16px] [background-position:0_0,0_8px,8px_-8px,-8px_0px] opacity-40 pointer-events-none" />
            )}

            <div
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />

            {/* Corner & Boundary Guide Badge */}
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-md text-[10px] font-mono text-slate-300 pointer-events-none">
              {config.gridSize} × {config.gridSize} px
            </div>
          </div>
        )}

        {/* TAB 2: 3x3 Seamless Tiling View */}
        {activeTab === 'seamless' && (
          <div
            className="relative transition-transform duration-100 ease-out rounded-xl overflow-hidden shadow-2xl"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              width: config.gridSize * 3,
              height: config.gridSize * 3,
            }}
          >
            {/* 3x3 Grid: Center core tile is 100% opacity, surrounding 8 perimeter tiles are dimmed */}
            <div
              className="w-full h-full"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gridTemplateRows: 'repeat(3, 1fr)',
                backgroundColor: config.transparentBackground ? '#0f172a' : config.backgroundColor,
              }}
            >
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="w-full h-full"
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

            {/* Optional 3x3 Seam Overlay Grid */}
            {showSeams && (
              <div
                className="absolute inset-0 pointer-events-none border-2 border-emerald-500/40"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gridTemplateRows: 'repeat(3, 1fr)',
                }}
              >
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-dashed border-emerald-500/30 flex items-start justify-start p-2"
                    style={{
                      backgroundColor: i === 4 ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                    }}
                  >
                    <span className="text-[10px] font-mono font-bold text-emerald-400/80 bg-slate-900/80 px-1 rounded">
                      {i === 4 ? '核心单胞 (Center)' : `拼贴 #${i + 1}`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Map Polygon Simulator */}
        {activeTab === 'map' && (
          <div
            className="relative bg-[#cad2c5] rounded-xl overflow-hidden shadow-2xl border border-slate-700 transition-transform duration-100"
            style={{
              width: 600,
              height: 480,
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            <svg viewBox="0 0 600 480" className="w-full h-full">
              <defs>
                <pattern
                  id="cartoMapPattern"
                  patternUnits="userSpaceOnUse"
                  width={config.gridSize}
                  height={config.gridSize}
                >
                  <image
                    href={svgDataUrl}
                    width={config.gridSize}
                    height={config.gridSize}
                  />
                </pattern>
              </defs>

              {/* Simulated Base Topography */}
              <rect width="600" height="480" fill="#e9edc9" />

              {/* Contour lines */}
              <path
                d="M-20,120 Q120,60 250,110 T520,70 T650,130"
                fill="none"
                stroke="#c2b69d"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <path
                d="M-20,240 Q150,180 300,230 T650,200"
                fill="none"
                stroke="#c2b69d"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              <path
                d="M-20,380 Q180,320 380,370 T650,340"
                fill="none"
                stroke="#c2b69d"
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />

              {/* Water River */}
              <path
                d="M-20,40 C140,70 160,260 280,310 S450,420 620,450"
                fill="none"
                stroke="#709775"
                strokeWidth="28"
                strokeLinecap="round"
                opacity="0.25"
              />
              <path
                d="M-20,40 C140,70 160,260 280,310 S450,420 620,450"
                fill="none"
                stroke="#48cae4"
                strokeWidth="14"
                strokeLinecap="round"
              />

              {/* Real Cartographic Polygon with Pattern Fill */}
              <path
                d="M 120,90 Q 220,40 360,70 Q 480,110 500,220 Q 520,340 380,370 Q 260,400 160,330 Q 70,260 90,160 Z"
                fill="url(#cartoMapPattern)"
                stroke="#588157"
                strokeWidth="2.5"
                className="drop-shadow-lg"
              />

              {/* Lake Polygon */}
              <path
                d="M 40,320 C 60,280 130,290 140,350 C 150,400 90,440 50,410 C 20,380 20,350 40,320 Z"
                fill="#90e0ef"
                stroke="#0077b6"
                strokeWidth="2"
              />

              {/* Label */}
              <rect x="230" y="210" width="160" height="28" rx="6" fill="#1e293be0" />
              <text x="310" y="228" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold" fontFamily="sans-serif">
                🌲 国家级自然保护区
              </text>
            </svg>
          </div>
        )}

        {/* TAB 4: Dot Coordinates Distribution */}
        {activeTab === 'dots' && (
          <div
            className="relative bg-slate-900 rounded-xl overflow-hidden shadow-2xl border border-slate-800 transition-transform duration-100"
            style={{
              width: config.gridSize,
              height: config.gridSize,
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            <svg
              viewBox={`0 0 ${config.gridSize} ${config.gridSize}`}
              className="w-full h-full"
            >
              {/* Grid axes */}
              <line x1="0" y1="0" x2={config.gridSize} y2="0" stroke="#334155" strokeWidth="2" />
              <line x1="0" y1="0" x2="0" y2={config.gridSize} stroke="#334155" strokeWidth="2" />

              {dots.map((dot, idx) => (
                <g key={idx}>
                  <circle
                    cx={dot.x}
                    cy={dot.y}
                    r={config.dotRadius / 2}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="0.5"
                    strokeDasharray="2 2"
                    opacity="0.3"
                  />
                  <circle
                    cx={dot.x}
                    cy={dot.y}
                    r="2.5"
                    fill="#34d399"
                  />
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
