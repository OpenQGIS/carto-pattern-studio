import React from 'react';
import { Palette, Shield, Sparkles, CheckCircle2 } from 'lucide-react';
import { GeneratorConfig } from '../types';

interface AppearanceControlsProps {
  config: GeneratorConfig;
  onUpdateConfig: (updates: Partial<GeneratorConfig>) => void;
}

export const AppearanceControls: React.FC<AppearanceControlsProps> = ({
  config,
  onUpdateConfig,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2 pb-2 border-b border-slate-800">
        <Palette className="w-4 h-4 text-emerald-400" />
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
          外观色彩与 GIS 兼容渲染 (Styling & GIS Rendering)
        </h2>
      </div>

      {/* Colors: Background & Symbol */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>背景颜色 (Background):</span>
            <input
              type="color"
              disabled={config.transparentBackground}
              value={config.backgroundColor}
              onChange={(e) => onUpdateConfig({ backgroundColor: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent disabled:opacity-30"
            />
          </div>
          <label className="flex items-center space-x-1.5 text-[11px] text-slate-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={config.transparentBackground}
              onChange={(e) => onUpdateConfig({ transparentBackground: e.target.checked })}
              className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
            />
            <span>无底色 (透明背景)</span>
          </label>
        </div>

        <div className="bg-slate-800/40 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>主符号颜色 (Color):</span>
            <input
              type="color"
              value={config.symbolColor}
              onChange={(e) => onUpdateConfig({ symbolColor: e.target.value })}
              className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent"
            />
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            {config.symbolColor.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Halo / Casing */}
      <div className="space-y-2 pt-1">
        <div className="flex justify-between items-center text-[11px] text-slate-400">
          <div className="flex items-center space-x-1.5">
            <Shield className="w-3.5 h-3.5 text-slate-400" />
            <span>符号外发光/白晕 (Casing / Halo):</span>
          </div>
          <span className="font-mono text-emerald-400 font-semibold">{config.casingWidth} px</span>
        </div>
        <div className="flex items-center space-x-3">
          <input
            type="range"
            min="0"
            max="6"
            step="0.5"
            value={config.casingWidth}
            onChange={(e) => onUpdateConfig({ casingWidth: parseFloat(e.target.value) })}
            className="flex-1 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <input
            type="color"
            value={config.casingColor || '#ffffff'}
            onChange={(e) => onUpdateConfig({ casingColor: e.target.value })}
            className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
            title="外晕描边颜色"
          />
        </div>
      </div>

      {/* GIS & Crisp Rendering Options */}
      <div className="pt-2 border-t border-slate-800 space-y-2.5">
        <label className="flex items-start space-x-2.5 cursor-pointer p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/15 transition">
          <input
            type="checkbox"
            checked={config.inlineGeometries}
            onChange={(e) => onUpdateConfig({ inlineGeometries: e.target.checked })}
            className="mt-0.5 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
          />
          <div>
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>内联图元展平渲染 (GIS Inlined Mode - 强烈推荐)</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
              将所有路径几何直接内联在各个位置，避免使用 &lt;defs&gt;&lt;use&gt;。
              完美解决 <strong>QGIS、Mapnik、Mapbox、ArcGIS</strong> 无法正确解析引用符号的渲染兼容性问题。
            </p>
          </div>
        </label>

        <label className="flex items-start space-x-2.5 cursor-pointer p-2 rounded-lg bg-slate-800/40 border border-slate-800 hover:bg-slate-800/60 transition">
          <input
            type="checkbox"
            checked={config.pixelAlign}
            onChange={(e) => onUpdateConfig({ pixelAlign: e.target.checked })}
            className="mt-0.5 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
          />
          <div>
            <div className="text-xs font-semibold text-slate-200">
              整数像素对齐 (Pixel Snapping)
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
              将符号坐标精确四舍五入到整像素位置，消除地图栅格瓦片切片时由于亚像素抗锯齿带来的虚焦与毛边。
            </p>
          </div>
        </label>
      </div>
    </div>
  );
};
