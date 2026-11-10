import React from 'react';
import { Layers, Sparkles, Download, HelpCircle, RefreshCw } from 'lucide-react';
import { CARTOGRAPHIC_PRESETS } from '../data/presets';
import { PresetPattern } from '../types';

interface HeaderProps {
  onSelectPreset: (preset: PresetPattern) => void;
  onOpenExport: () => void;
  onOpenHelp: () => void;
  onReset: () => void;
  activePresetId?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onSelectPreset,
  onOpenExport,
  onOpenHelp,
  onReset,
  activePresetId,
}) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between z-20 sticky top-0 shadow-sm">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
          <Layers className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-lg text-slate-900 tracking-tight">Carto Pattern Studio</h1>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Pro GIS Edition
            </span>
          </div>
          <p className="text-xs text-slate-500">
            地图周期点与符号无缝图案生成工作台 (Compatible with QGIS / Mapnik / Web)
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Preset Selector */}
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg p-1">
          <Sparkles className="w-4 h-4 text-emerald-600 ml-2 mr-1.5" />
          <span className="text-xs text-slate-600 mr-2 font-medium">经典预设:</span>
          <select
            className="bg-white text-xs text-slate-800 border border-slate-300 rounded px-2 py-1 outline-none focus:border-emerald-500 shadow-xs"
            value={activePresetId || ''}
            onChange={(e) => {
              const preset = CARTOGRAPHIC_PRESETS.find(p => p.id === e.target.value);
              if (preset) onSelectPreset(preset);
            }}
          >
            <option value="" disabled>选择预设模版...</option>
            {CARTOGRAPHIC_PRESETS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <button
          onClick={onReset}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-xs font-medium shadow-xs transition"
          title="重置当前设置"
        >
          <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
          <span>重置</span>
        </button>

        <button
          onClick={onOpenHelp}
          className="p-2 rounded-lg bg-white hover:bg-slate-50 text-slate-600 border border-slate-300 shadow-xs transition"
          title="使用说明与 GIS 对接指南"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-700/20 transition active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>导出 SVG / GIS 图案</span>
        </button>
      </div>
    </header>
  );
};
