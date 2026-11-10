import React, { useState, useMemo } from 'react';
import { Search, Plus, Upload, Check, RotateCw, Eye } from 'lucide-react';
import { CARTOGRAPHIC_SYMBOLS } from '../data/symbolsData';
import { CartoSymbol, SymbolSelection } from '../types';

interface ClassicSymbolTableProps {
  selectedSymbols: SymbolSelection[];
  onUseSymbol: (symbolId: string) => void;
  onAddSymbol: (symbolId: string) => void;
  onUpdateSymbolConfig: (symbolId: string, updates: Partial<SymbolSelection>) => void;
  onAddCustomSymbol: (symbol: CartoSymbol) => void;
  symbolLib: Record<string, CartoSymbol>;
  customSymbols: CartoSymbol[];
}

export const ClassicSymbolTable: React.FC<ClassicSymbolTableProps> = ({
  selectedSymbols,
  onUseSymbol,
  onAddSymbol,
  onUpdateSymbolConfig,
  onAddCustomSymbol,
  symbolLib,
  customSymbols,
}) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isAddingCustom, setIsAddingCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customSvg, setCustomSvg] = useState('');

  const allSymbols = useMemo(() => {
    return [...customSymbols, ...CARTOGRAPHIC_SYMBOLS];
  }, [customSymbols]);

  const filtered = useMemo(() => {
    return allSymbols.filter((s) => {
      const matchCat = activeCategory === 'all' || s.category === activeCategory;
      const matchSearch =
        search.trim() === '' ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase()) ||
        s.categoryLabel.includes(search);
      return matchCat && matchSearch;
    });
  }, [allSymbols, activeCategory, search]);

  // Primary active symbol for inspection bar
  const activeSymbolId = selectedSymbols[0]?.symbolId || allSymbols[0].id;
  const activeSelection = selectedSymbols.find((s) => s.symbolId === activeSymbolId) || {
    symbolId: activeSymbolId,
    weight: 10,
    scale: 1.0,
    offsetX: 'auto',
    offsetY: 'auto',
    randomRotate: false,
  };
  const activeSymbolObj = symbolLib[activeSymbolId] || allSymbols[0];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSvg.trim()) return;
    const name = customName.trim() || `custom_${Date.now().toString().slice(-4)}`;
    const id = `custom-${Date.now().toString().slice(-4)}`;

    let clean = customSvg.trim();
    const match = clean.match(/<svg[^>]*>([\s\S]*?)<\/svg>/i);
    if (match && match[1]) clean = match[1];

    const newSym: CartoSymbol = {
      id,
      name,
      category: 'custom',
      categoryLabel: '自定义符号 (Custom)',
      svg: clean,
      defaultOffsetX: 8,
      defaultOffsetY: 8,
    };
    onAddCustomSymbol(newSym);
    onUseSymbol(newSym.id);
    setCustomName('');
    setCustomSvg('');
    setIsAddingCustom(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setCustomSvg(event.target?.result as string);
      if (!customName) setCustomName(file.name.replace(/\.[^/.]+$/, ''));
    };
    reader.readAsText(file);
  };

  const activeRawSvg = Array.isArray(activeSymbolObj.svg)
    ? activeSymbolObj.svg[0]
    : activeSymbolObj.svg;

  return (
    <div className="flex flex-col h-full bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="px-3 py-2 bg-slate-850 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <strong className="text-xs text-slate-200">符号定义 (Symbol Definition):</strong>
          <span className="text-[10px] text-emerald-400 font-mono">
            已选组合: {selectedSymbols.map((s) => symbolLib[s.symbolId]?.name || s.symbolId).join(' + ')}
          </span>
        </div>
        <button
          onClick={() => setIsAddingCustom(!isAddingCustom)}
          className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
        >
          <Plus className="w-3 h-3" />
          <span>{isAddingCustom ? '收起' : '自定义SVG'}</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="p-2 border-b border-slate-800 bg-slate-900/80 space-y-1.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索符号名称 (如 tree, rock, marsh, reed, bog)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar text-[10px]">
          {[
            { id: 'all', label: '全部' },
            { id: 'forest', label: '🌲 树木' },
            { id: 'water', label: '🌾 湿地' },
            { id: 'geology', label: '⛰️ 岩石' },
            { id: 'agriculture', label: '🌾 农作' },
            { id: 'markers', label: '➕ 标记' },
            { id: 'custom', label: '✏️ 自定义' },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-2 py-0.5 rounded transition whitespace-nowrap ${
                activeCategory === c.id
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom SVG Input Form */}
      {isAddingCustom && (
        <form onSubmit={handleCustomSubmit} className="p-2.5 bg-slate-800/90 border-b border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-400 font-semibold">导入自定义 SVG 路径:</span>
            <label className="cursor-pointer text-[10px] text-slate-300 hover:text-white bg-slate-700 px-2 py-0.5 rounded border border-slate-600 flex items-center space-x-1">
              <Upload className="w-2.5 h-2.5" />
              <span>上传文件</span>
              <input type="file" accept=".svg" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
          <input
            type="text"
            placeholder="符号名称"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs text-white outline-none focus:border-emerald-500"
          />
          <textarea
            placeholder="在此粘贴 SVG 代码 (<path d='...' />)"
            value={customSvg}
            onChange={(e) => setCustomSvg(e.target.value)}
            rows={2}
            className="w-full px-2 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-white outline-none focus:border-emerald-500 resize-none"
          />
          <div className="flex justify-end space-x-1.5">
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="px-2 py-0.5 text-xs text-slate-400 hover:text-white"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-3 py-0.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium"
            >
              确定导入
            </button>
          </div>
        </form>
      )}

      {/* The Classic Symbol Table */}
      <div className="flex-1 overflow-y-auto max-h-[300px] border-b border-slate-800 bg-slate-950/40">
        <table className="w-full border-collapse text-xs">
          <tbody>
            {filtered.map((item) => {
              const isPrimary = selectedSymbols[0]?.symbolId === item.id;
              const isIncluded = selectedSymbols.some((s) => s.symbolId === item.id);
              const rawSvg = Array.isArray(item.svg) ? item.svg[0] : item.svg;

              return (
                <tr
                  key={item.id}
                  className={`border-b border-slate-800/60 transition hover:bg-slate-800/50 ${
                    isPrimary
                      ? 'bg-emerald-500/10'
                      : isIncluded
                      ? 'bg-teal-500/5'
                      : ''
                  }`}
                >
                  {/* Name */}
                  <td className="py-1.5 px-3 font-mono text-slate-300 truncate max-w-[140px]" title={item.name}>
                    {item.name}
                  </td>

                  {/* "用途 / 使用" Button (Sets as single active symbol) */}
                  <td className="py-1.5 px-1.5 w-14 text-center">
                    <button
                      onClick={() => onUseSymbol(item.id)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                        isPrimary
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-indigo-600/70 hover:bg-indigo-600 text-indigo-100'
                      }`}
                      title="设为唯一当前图案 (Use as pattern)"
                    >
                      {isPrimary ? '已用' : '用途'}
                    </button>
                  </td>

                  {/* "+" Button (Adds to multi-mix combination) */}
                  <td className="py-1.5 px-1.5 w-8 text-center">
                    <button
                      onClick={() => onAddSymbol(item.id)}
                      className={`w-5 h-5 rounded text-xs font-bold transition flex items-center justify-center ${
                        isIncluded
                          ? 'bg-emerald-700 text-white'
                          : 'bg-indigo-700/80 hover:bg-indigo-600 text-indigo-100'
                      }`}
                      title="添加到混合组合 (Add to combination)"
                    >
                      +
                    </button>
                  </td>

                  {/* Symbol Icon Preview */}
                  <td className="py-1.5 px-3 w-10 text-center">
                    <div className="w-6 h-6 mx-auto flex items-center justify-center text-slate-200">
                      <svg
                        viewBox="0 0 16 16"
                        className="w-5 h-5 fill-current text-slate-200"
                        dangerouslySetInnerHTML={{ __html: rawSvg }}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* The Classic Symbol Bar / Inspector (Bottom of Column 3) */}
      <div className="p-3 bg-slate-900 flex flex-wrap items-center gap-3 text-xs text-slate-300">
        {/* Enlarged Symbol Preview Box */}
        <div className="w-12 h-12 bg-slate-950 border border-slate-700 rounded-lg flex items-center justify-center p-1 shadow-inner relative group">
          <svg
            viewBox="0 0 16 16"
            className="w-9 h-9 fill-current text-emerald-400"
            dangerouslySetInnerHTML={{ __html: activeRawSvg }}
          />
          <div className="absolute inset-0 border border-dashed border-emerald-500/40 pointer-events-none rounded-lg" />
        </div>

        {/* Offsets X / Y */}
        <div className="flex items-center space-x-1">
          <span className="text-slate-400">偏移:</span>
          <input
            type="text"
            value={activeSelection.offsetX === 'auto' ? '8' : activeSelection.offsetX}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              onUpdateSymbolConfig(activeSymbolId, { offsetX: val });
            }}
            className="w-8 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-xs font-mono text-white outline-none focus:border-emerald-500"
            title="X 轴中心对齐偏移"
          />
          <input
            type="text"
            value={activeSelection.offsetY === 'auto' ? '8' : activeSelection.offsetY}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0;
              onUpdateSymbolConfig(activeSymbolId, { offsetY: val });
            }}
            className="w-8 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-xs font-mono text-white outline-none focus:border-emerald-500"
            title="Y 轴中心对齐偏移"
          />
        </div>

        {/* Scale */}
        <div className="flex items-center space-x-1">
          <span className="text-slate-400">比例:</span>
          <input
            type="number"
            step="0.1"
            min="0.2"
            max="4.0"
            value={activeSelection.scale || 1.0}
            onChange={(e) => {
              const val = parseFloat(e.target.value) || 1.0;
              onUpdateSymbolConfig(activeSymbolId, { scale: val });
            }}
            className="w-12 px-1 py-0.5 bg-slate-800 border border-slate-700 rounded text-center text-xs font-mono text-white outline-none focus:border-emerald-500"
            title="缩放比例"
          />
        </div>

        {/* Random Rotate Checkbox */}
        <label className="flex items-center space-x-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={activeSelection.randomRotate || false}
            onChange={(e) =>
              onUpdateSymbolConfig(activeSymbolId, { randomRotate: e.target.checked })
            }
            className="rounded bg-slate-800 border-slate-700 text-emerald-500 focus:ring-0"
          />
          <span>随机旋转</span>
        </label>

        {/* Auto offset button */}
        <button
          onClick={() =>
            onUpdateSymbolConfig(activeSymbolId, { offsetX: 'auto', offsetY: 'auto' })
          }
          className="px-2 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[11px] transition"
          title="重置中心偏移"
        >
          居中
        </button>
      </div>
    </div>
  );
};
