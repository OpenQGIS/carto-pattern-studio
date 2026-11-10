import React, { useState, useMemo } from 'react';
import {
  Search,
  Upload,
  RotateCw,
  Sliders,
  Sparkles,
  Layers,
  Code,
  Palette,
  Crosshair,
  Check,
  Plus,
  Trash2,
} from 'lucide-react';
import { CARTOGRAPHIC_SYMBOLS } from '../data/symbolsData';
import { CartoSymbol, SymbolSelection } from '../types';

interface SymbolStudioProps {
  selectedSymbols: SymbolSelection[];
  onSelectSingleSymbol: (symbolId: string) => void;
  onToggleSymbolInMix: (symbolId: string) => void;
  onUpdateSymbolConfig: (symbolId: string, updates: Partial<SymbolSelection>) => void;
  onRemoveSymbol: (symbolId: string) => void;
  onAddCustomSymbol: (symbol: CartoSymbol) => void;
  symbolLib: Record<string, CartoSymbol>;
  customSymbols: CartoSymbol[];
  masterColor: string;
}

export const SymbolStudio: React.FC<SymbolStudioProps> = ({
  selectedSymbols,
  onSelectSingleSymbol,
  onToggleSymbolInMix,
  onUpdateSymbolConfig,
  onRemoveSymbol,
  onAddCustomSymbol,
  symbolLib,
  customSymbols,
  masterColor,
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mode, setMode] = useState<'single' | 'mix'>('single');
  const [customSvgText, setCustomSvgText] = useState('');
  const [customName, setCustomName] = useState('');
  const [isCustomOpen, setIsCustomOpen] = useState(false);

  const allSymbols = useMemo(() => {
    return [...customSymbols, ...CARTOGRAPHIC_SYMBOLS];
  }, [customSymbols]);

  const categories = [
    { id: 'all', label: '全部 (All)' },
    { id: 'forest', label: '🌲 森林树木' },
    { id: 'water', label: '🌾 湿地沼泽' },
    { id: 'geology', label: '⛰️ 地质岩石' },
    { id: 'agriculture', label: '🌾 农田草地' },
    { id: 'markers', label: '➕ 网格点标' },
    { id: 'custom', label: '✏️ 自定义' },
  ];

  const filteredSymbols = useMemo(() => {
    return allSymbols.filter((s) => {
      const matchCategory = activeTab === 'all' || s.category === activeTab;
      const matchSearch =
        searchQuery.trim() === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [allSymbols, activeTab, searchQuery]);

  // The primary active symbol being inspected
  const primarySelection = selectedSymbols[0] || null;
  const primarySymbol = primarySelection ? symbolLib[primarySelection.symbolId] : null;

  // Custom SVG submit
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSvgText.trim()) return;
    const name = customName.trim() || `custom-${Date.now().toString().slice(-4)}`;
    const id = `custom-${Date.now().toString().slice(-4)}`;

    let cleanSvg = customSvgText.trim();
    const match = cleanSvg.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    if (match && match[1]) {
      cleanSvg = match[1];
    }

    const newSym: CartoSymbol = {
      id,
      name,
      category: 'custom',
      categoryLabel: '自定义符号 (Custom)',
      svg: cleanSvg,
      defaultOffsetX: 8,
      defaultOffsetY: 8,
    };

    onAddCustomSymbol(newSym);
    onSelectSingleSymbol(newSym.id);
    setCustomSvgText('');
    setCustomName('');
    setIsCustomOpen(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCustomSvgText(content);
      if (!customName) {
        setCustomName(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col space-y-4">
      {/* Header & Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            图案符号选择器 (Symbol Gallery)
          </h2>
          <span className="text-[10px] text-slate-400 font-mono">
            ({allSymbols.length} 符号)
          </span>
        </div>

        {/* Single vs Multi-mix mode */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => {
              setMode('single');
              if (selectedSymbols.length > 1) {
                onSelectSingleSymbol(selectedSymbols[0].symbolId);
              }
            }}
            className={`px-2.5 py-1 text-xs rounded-md transition font-medium ${
              mode === 'single'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            单选图案 (Single)
          </button>
          <button
            onClick={() => setMode('mix')}
            className={`px-2.5 py-1 text-xs rounded-md transition font-medium ${
              mode === 'mix'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            多图元混合 (Multi-Mix)
          </button>
        </div>
      </div>

      {/* Category Tabs & Search */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索符号 (如 tree, rock, marsh, grass, cross)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-800/80 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500 transition"
            />
          </div>

          <button
            onClick={() => setIsCustomOpen(!isCustomOpen)}
            className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg border text-xs transition ${
              isCustomOpen
                ? 'bg-emerald-600/30 text-emerald-300 border-emerald-500'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Code className="w-3.5 h-3.5 text-emerald-400" />
            <span>自定义 SVG</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition ${
                activeTab === cat.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom SVG Drawer */}
      {isCustomOpen && (
        <form onSubmit={handleCustomSubmit} className="p-3 bg-slate-800/80 border border-emerald-500/30 rounded-xl space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-emerald-400">导入/粘贴您的专属 SVG 图元:</span>
            <label className="cursor-pointer flex items-center space-x-1 text-slate-300 hover:text-white bg-slate-700 px-2 py-0.5 rounded border border-slate-600 text-[11px]">
              <Upload className="w-3 h-3" />
              <span>上传 .svg 文件</span>
              <input type="file" accept=".svg" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="符号名称 (如 custom-marker)"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full px-2.5 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white outline-none focus:border-emerald-500"
            />
            <textarea
              placeholder="粘贴 SVG 路径代码 (例如: <path d='M10 10 L20 20 Z' />)"
              value={customSvgText}
              onChange={(e) => setCustomSvgText(e.target.value)}
              rows={2}
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono outline-none focus:border-emerald-500 resize-none"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsCustomOpen(false)}
              className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
            >
              保存并应用
            </button>
          </div>
        </form>
      )}

      {/* VISUAL SYMBOLS GRID (Direct 1-Click Selection) */}
      <div className="max-h-56 overflow-y-auto p-1 grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 lg:grid-cols-6 gap-2 bg-slate-950/60 rounded-xl border border-slate-800">
        {filteredSymbols.map((symbol) => {
          const isSelected = selectedSymbols.some((s) => s.symbolId === symbol.id);
          const rawSvg = Array.isArray(symbol.svg) ? symbol.svg[0] : symbol.svg;

          return (
            <button
              key={symbol.id}
              onClick={() => {
                if (mode === 'single') {
                  onSelectSingleSymbol(symbol.id);
                } else {
                  onToggleSymbolInMix(symbol.id);
                }
              }}
              className={`group relative flex flex-col items-center justify-center p-2 rounded-lg border transition text-center ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-500/15 shadow-md shadow-emerald-500/20'
                  : 'border-slate-800/80 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-800'
              }`}
              title={symbol.name}
            >
              {isSelected && (
                <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
              <div className="w-8 h-8 flex items-center justify-center text-slate-300 group-hover:scale-110 group-hover:text-emerald-400 transition">
                <svg
                  viewBox="0 0 16 16"
                  className="w-7 h-7 fill-current text-inherit"
                  dangerouslySetInnerHTML={{ __html: rawSvg }}
                />
              </div>
              <span className="mt-1 text-[10px] text-slate-400 font-mono truncate w-full group-hover:text-slate-200">
                {symbol.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* SELECTED SYMBOLS INSPECTOR / TUNER */}
      {selectedSymbols.length > 0 && (
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              当前应用符号 ({selectedSymbols.length})
            </span>
            <span className="text-[10px] text-slate-400">
              点击下方调节大小、旋转、中心偏移与颜色
            </span>
          </div>

          <div className="space-y-2.5">
            {selectedSymbols.map((sel) => {
              const sym = symbolLib[sel.symbolId];
              if (!sym) return null;
              const rawSvg = Array.isArray(sym.svg) ? sym.svg[0] : sym.svg;

              return (
                <div
                  key={sel.symbolId}
                  className="bg-slate-800/60 border border-slate-700/80 rounded-lg p-3 space-y-2.5"
                >
                  {/* Top Bar: Icon Preview, Name, Weight, Remove */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded bg-slate-900 border border-slate-700 flex items-center justify-center p-0.5">
                        <svg
                          viewBox="0 0 16 16"
                          className="w-5 h-5 fill-current text-emerald-400"
                          dangerouslySetInnerHTML={{ __html: rawSvg }}
                        />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{sym.name}</div>
                        <div className="text-[10px] text-slate-400">{sym.categoryLabel}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {mode === 'mix' && (
                        <div className="flex items-center space-x-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                          <span className="text-[10px] text-slate-400">权重:</span>
                          <span className="text-xs font-mono font-bold text-emerald-400">{sel.weight}</span>
                        </div>
                      )}
                      {selectedSymbols.length > 1 && (
                        <button
                          onClick={() => onRemoveSymbol(sel.symbolId)}
                          className="p-1 rounded text-slate-500 hover:text-rose-400 transition"
                          title="移除"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Controls: Scale Slider & Random Rotate */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                        <span>缩放大小 (Scale):</span>
                        <span className="font-mono text-emerald-400 font-semibold">{sel.scale}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.3"
                        max="3.0"
                        step="0.1"
                        value={sel.scale}
                        onChange={(e) =>
                          onUpdateSymbolConfig(sel.symbolId, { scale: parseFloat(e.target.value) })
                        }
                        className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                    </div>

                    {mode === 'mix' ? (
                      <div>
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>混合比例权重:</span>
                          <span className="font-mono text-emerald-400 font-semibold">{sel.weight}</span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          step="1"
                          value={sel.weight}
                          onChange={(e) =>
                            onUpdateSymbolConfig(sel.symbolId, { weight: parseInt(e.target.value) })
                          }
                          className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 pt-3">
                        <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] text-slate-300">
                          <input
                            type="checkbox"
                            checked={sel.randomRotate}
                            onChange={(e) =>
                              onUpdateSymbolConfig(sel.symbolId, { randomRotate: e.target.checked })
                            }
                            className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                          />
                          <RotateCw className="w-3 h-3 text-slate-400" />
                          <span>随机角度旋转</span>
                        </label>
                      </div>
                    )}
                  </div>

                  {/* Offset & Individual Color */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-750">
                    <div className="flex items-center space-x-2">
                      <Crosshair className="w-3 h-3 text-slate-400" />
                      <span>中心偏移:</span>
                      <span className="font-mono text-slate-300">
                        {sel.offsetX === 'auto' ? '自动' : sel.offsetX}, {sel.offsetY === 'auto' ? '自动' : sel.offsetY}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <Palette className="w-3 h-3 text-slate-400" />
                      <span>独立色彩:</span>
                      <input
                        type="color"
                        value={sel.color || masterColor}
                        onChange={(e) =>
                          onUpdateSymbolConfig(sel.symbolId, { color: e.target.value })
                        }
                        className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
