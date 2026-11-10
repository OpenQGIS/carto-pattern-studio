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
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between z-20 sticky top-0">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <Layers className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="font-bold text-lg text-white tracking-tight">Carto Pattern Studio</h1>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Pro GIS Edition
            </span>
          </div>
          <p className="text-xs text-slate-400">
            地图周期点与符号无缝图案生成工作台 (Compatible with QGIS / Mapnik / Web)
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Preset Selector */}
        <div className="flex items-center bg-slate-800/80 border border-slate-700/60 rounded-lg p-1">
          <Sparkles className="w-4 h-4 text-emerald-400 ml-2 mr-1.5" />
          <span className="text-xs text-slate-400 mr-2">经典预设:</span>
          <select
            className="bg-slate-900 text-xs text-slate-200 border border-slate-700 rounded px-2 py-1 outline-none focus:border-emerald-500"
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
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition"
          title="重置当前设置"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>重置</span>
        </button>

        <button
          onClick={onOpenHelp}
          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          title="使用说明与 GIS 对接指南"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenExport}
          className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs shadow-md shadow-emerald-700/20 transition active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>导出 SVG / GIS 图案</span>
        </button>
      </div>
    </header>
  );
};
