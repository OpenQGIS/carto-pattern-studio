import React from 'react';
import { Plus, Trash2, RotateCw, Sliders, Palette } from 'lucide-react';
import { CartoSymbol, SymbolSelection } from '../types';

interface SymbolControlPanelProps {
  selectedSymbols: SymbolSelection[];
  symbolLib: Record<string, CartoSymbol>;
  onUpdateSymbol: (index: number, updates: Partial<SymbolSelection>) => void;
  onRemoveSymbol: (index: number) => void;
  onOpenPicker: () => void;
}

export const SymbolControlPanel: React.FC<SymbolControlPanelProps> = ({
  selectedSymbols,
  symbolLib,
  onUpdateSymbol,
  onRemoveSymbol,
  onOpenPicker,
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            符号与图元图层 ({selectedSymbols.length})
          </h2>
        </div>
        <button
          onClick={onOpenPicker}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-medium transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>选择/添加图元</span>
        </button>
      </div>

      {selectedSymbols.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
          暂无选中的符号，请点击上方“选择/添加图元”
        </div>
      ) : (
        <div className="space-y-3">
          {selectedSymbols.map((item, index) => {
            const sym = symbolLib[item.symbolId];
            if (!sym) return null;
            const rawSvg = Array.isArray(sym.svg) ? sym.svg[0] : sym.svg;

            return (
              <div
                key={`${item.symbolId}-${index}`}
                className="bg-slate-800/50 border border-slate-800 rounded-lg p-3 space-y-2 hover:border-slate-700 transition"
              >
                {/* Header: Preview, Name, Remove */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded bg-slate-900 border border-slate-700 flex items-center justify-center p-1">
                      <svg
                        viewBox="0 0 16 16"
                        className="w-6 h-6 fill-current text-emerald-400"
                        dangerouslySetInnerHTML={{ __html: rawSvg }}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">{sym.name}</div>
                      <div className="text-[10px] text-slate-400">{sym.categoryLabel}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => onRemoveSymbol(index)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition"
                      title="移除此符号"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Sliders: Scale & Weight */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>缩放大小 (Scale):</span>
                      <span className="font-mono text-emerald-400 font-semibold">{item.scale}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="3.0"
                      step="0.1"
                      value={item.scale}
                      onChange={(e) => onUpdateSymbol(index, { scale: parseFloat(e.target.value) })}
                      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                      <span>混合权重 (Weight):</span>
                      <span className="font-mono text-emerald-400 font-semibold">{item.weight}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={item.weight}
                      onChange={(e) => onUpdateSymbol(index, { weight: parseInt(e.target.value) })}
                      className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>
                </div>

                {/* Toggles: Random Rotate & Individual Color */}
                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-800/80">
                  <label className="flex items-center space-x-1.5 cursor-pointer hover:text-slate-200">
                    <input
                      type="checkbox"
                      checked={item.randomRotate}
                      onChange={(e) => onUpdateSymbol(index, { randomRotate: e.target.checked })}
                      className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                    />
                    <RotateCw className="w-3 h-3 text-slate-400" />
                    <span>随机离散旋转 (Random Rotate)</span>
                  </label>

                  <div className="flex items-center space-x-1.5">
                    <Palette className="w-3 h-3 text-slate-400" />
                    <span>颜色:</span>
                    <input
                      type="color"
                      value={item.color || '#2d6a4f'}
                      onChange={(e) => onUpdateSymbol(index, { color: e.target.value })}
                      className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
