import React, { useState, useMemo } from 'react';
import { Search, X, Plus, Upload, Check } from 'lucide-react';
import { CARTOGRAPHIC_SYMBOLS } from '../data/symbolsData';
import { CartoSymbol } from '../types';

interface SymbolPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSymbol: (symbol: CartoSymbol) => void;
  onAddCustomSymbol: (symbol: CartoSymbol) => void;
  customSymbols: CartoSymbol[];
  activeSymbolIds: string[];
}

export const SymbolPickerModal: React.FC<SymbolPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectSymbol,
  onAddCustomSymbol,
  customSymbols,
  activeSymbolIds,
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customSvgText, setCustomSvgText] = useState('');
  const [customName, setCustomName] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const allSymbols = useMemo(() => {
    return [...customSymbols, ...CARTOGRAPHIC_SYMBOLS];
  }, [customSymbols]);

  const categories = [
    { id: 'all', label: '全部符号 (All)' },
    { id: 'forest', label: '🌲 森林与树木 (Forest)' },
    { id: 'water', label: '🌾 湿地水体 (Wetlands)' },
    { id: 'geology', label: '⛰️ 地质地貌 (Geology)' },
    { id: 'agriculture', label: '🌾 农作草地 (Crops)' },
    { id: 'markers', label: '➕ 网格点标 (Markers)' },
    { id: 'custom', label: '✨ 自定义 (Custom)' },
  ];

  const filteredSymbols = useMemo(() => {
    return allSymbols.filter(s => {
      const matchCategory = activeTab === 'all' || s.category === activeTab;
      const matchSearch =
        searchQuery.trim() === '' ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [allSymbols, activeTab, searchQuery]);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSvgText.trim()) return;
    const name = customName.trim() || `custom-${Date.now()}`;
    const id = `custom-${Date.now()}`;

    // Extract path or contents from <svg> if wrapped
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
    onSelectSymbol(newSym);
    setCustomSvgText('');
    setCustomName('');
    setIsAddingCustom(false);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">制图符号图库 (Cartographic Symbols)</h2>
            <p className="text-xs text-slate-400">
              包含 110+ 经典地图制图与地质图元符号，支持直接上传自定义 SVG 图元
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Actions Bar */}
        <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="搜索符号名称 (如 tree, rock, marsh, grass)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500 transition"
            />
          </div>

          <button
            onClick={() => setIsAddingCustom(!isAddingCustom)}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-medium transition"
          >
            <Plus className="w-4 h-4" />
            <span>{isAddingCustom ? '收起自定义' : '导入自定义 SVG'}</span>
          </button>
        </div>

        {/* Custom SVG Form Drawer */}
        {isAddingCustom && (
          <form onSubmit={handleCustomSubmit} className="p-4 mx-6 my-2 bg-slate-800/60 border border-emerald-500/30 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-400">新建/导入自定义 SVG 图元</span>
              <label className="cursor-pointer text-xs flex items-center space-x-1 text-slate-300 hover:text-white bg-slate-700 px-2.5 py-1 rounded border border-slate-600">
                <Upload className="w-3.5 h-3.5" />
                <span>从 SVG 文件导入</span>
                <input type="file" accept=".svg" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <input
                type="text"
                placeholder="符号名称 (如 custom-tree)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="col-span-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white outline-none focus:border-emerald-500"
              />
              <textarea
                placeholder="在此粘贴 SVG 代码 (如 <svg><path d='...'/></svg> 或 <path d='...'/>)"
                value={customSvgText}
                onChange={(e) => setCustomSvgText(e.target.value)}
                rows={2}
                className="col-span-3 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-white font-mono outline-none focus:border-emerald-500 resize-none"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddingCustom(false)}
                className="px-3 py-1 rounded text-xs text-slate-400 hover:text-white"
              >
                取消
              </button>
              <button
                type="submit"
                className="px-4 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium"
              >
                确认添加并选择
              </button>
            </div>
          </form>
        )}

        {/* Category Tabs */}
        <div className="px-6 py-2 border-b border-slate-800 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition ${
                activeTab === cat.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Symbols Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
          {filteredSymbols.map((symbol) => {
            const isSelected = activeSymbolIds.includes(symbol.id);
            const rawSvg = Array.isArray(symbol.svg) ? symbol.svg[0] : symbol.svg;

            return (
              <button
                key={symbol.id}
                onClick={() => {
                  onSelectSymbol(symbol);
                }}
                className={`group relative flex flex-col items-center justify-center p-3 rounded-xl border transition text-center ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10'
                    : 'border-slate-800 bg-slate-800/40 hover:border-slate-700 hover:bg-slate-800'
                }`}
                title={symbol.name}
              >
                {isSelected && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-900 flex items-center justify-center">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
                <div className="w-12 h-12 flex items-center justify-center text-slate-200 group-hover:scale-110 transition">
                  <svg
                    viewBox="0 0 16 16"
                    className="w-10 h-10 fill-current text-slate-200"
                    dangerouslySetInnerHTML={{ __html: rawSvg }}
                  />
                </div>
                <span className="mt-2 text-[11px] text-slate-300 font-mono truncate w-full group-hover:text-emerald-400">
                  {symbol.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
