import React, { useState, useMemo } from 'react';
import { Search, Plus, Upload, Sliders, Trash2, RefreshCw } from 'lucide-react';
import { CARTOGRAPHIC_SYMBOLS } from '../data/symbolsData';
import { CartoSymbol, SymbolSelection } from '../types';
import { AutoSvgIcon } from './AutoSvgIcon';

interface ClassicSymbolTableProps {
  selectedSymbols: SymbolSelection[];
  onUseSymbol: (symbolId: string) => void;
  onAddSymbol: (symbolId: string) => void;
  onRemoveSymbol?: (symbolId: string) => void;
  onUpdateSymbolConfig: (symbolId: string, updates: Partial<SymbolSelection>) => void;
  onAddCustomSymbol: (symbol: CartoSymbol) => void;
  symbolLib: Record<string, CartoSymbol>;
  customSymbols: CartoSymbol[];
}

const PALETTE = ['#059669', '#2563eb', '#d97706', '#7c3aed', '#db2777', '#0891b2', '#16a34a'];

export const ClassicSymbolTable: React.FC<ClassicSymbolTableProps> = ({
  selectedSymbols,
  onUseSymbol,
  onAddSymbol,
  onRemoveSymbol,
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
  const [inspectedSymbolId, setInspectedSymbolId] = useState<string | null>(null);

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

  // Ensure inspectedSymbolId points to an existing selected symbol
  const currentInspectedId = useMemo(() => {
    if (inspectedSymbolId && selectedSymbols.some((s) => s.symbolId === inspectedSymbolId)) {
      return inspectedSymbolId;
    }
    return selectedSymbols[0]?.symbolId || allSymbols[0]?.id;
  }, [inspectedSymbolId, selectedSymbols, allSymbols]);

  const activeSelection = selectedSymbols.find((s) => s.symbolId === currentInspectedId) || {
    symbolId: currentInspectedId,
    weight: 10,
    scale: 1.0,
    offsetX: 'auto',
    offsetY: 'auto',
    randomRotate: false,
  };
  const activeSymbolObj = symbolLib[currentInspectedId] || allSymbols[0];

  const totalWeight = useMemo(() => {
    return selectedSymbols.reduce((sum, s) => sum + Math.max(1, Math.round(s.weight || 1)), 0);
  }, [selectedSymbols]);

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

  const handleRemove = (symbolId: string) => {
    if (onRemoveSymbol) {
      onRemoveSymbol(symbolId);
    } else {
      onAddSymbol(symbolId);
    }
  };

  const handleEqualizeWeights = () => {
    selectedSymbols.forEach((s) => {
      onUpdateSymbolConfig(s.symbolId, { weight: 5 });
    });
  };

  const activeVariants = Array.isArray(activeSymbolObj?.svg)
    ? activeSymbolObj.svg
    : [activeSymbolObj?.svg || ''];

  return (
    <div className="flex flex-col h-full bg-white border border-slate-300 rounded-xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2 overflow-hidden">
          <strong className="text-xs text-slate-800 whitespace-nowrap">符号定义:</strong>
          <span
            className="text-[10px] text-emerald-700 font-mono font-medium truncate max-w-[220px]"
            title={selectedSymbols.map((s) => symbolLib[s.symbolId]?.name || s.symbolId).join(' + ')}
          >
            {selectedSymbols.length > 1 ? `已混选 (${selectedSymbols.length}个): ` : '已选: '}
            {selectedSymbols.map((s) => symbolLib[s.symbolId]?.name || s.symbolId).join(' + ')}
          </span>
        </div>
        <button
          onClick={() => setIsAddingCustom(!isAddingCustom)}
          className="text-[11px] text-emerald-700 hover:text-emerald-800 font-medium flex items-center space-x-1 flex-shrink-0"
        >
          <Plus className="w-3 h-3" />
          <span>{isAddingCustom ? '收起' : '自定义SVG'}</span>
        </button>
      </div>

      {/* Multi-Symbol Mix & Weight Manager (Visible when 2 or more symbols are selected) */}
      {selectedSymbols.length > 1 && (
        <div className="p-2.5 bg-gradient-to-b from-emerald-50/80 to-slate-50/90 border-b border-emerald-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span>多要素权重分配 (Multi-Symbol Mix)</span>
            </div>
            <button
              onClick={handleEqualizeWeights}
              className="text-[10px] text-emerald-700 hover:text-emerald-800 bg-white border border-emerald-300 rounded px-1.5 py-0.5 shadow-2xs font-medium flex items-center space-x-1"
              title="将所有要素权重设为均等比例"
            >
              <RefreshCw className="w-2.5 h-2.5" />
              <span>均等比例 (1:1)</span>
            </button>
          </div>

          {/* Visual Proportion Segmented Progress Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-200 mb-2 border border-slate-300/80 shadow-inner">
            {selectedSymbols.map((s, idx) => {
              const currentWeight = Math.max(1, Math.round(s.weight || 1));
              const pct = Math.round((currentWeight / totalWeight) * 100);
              const color = PALETTE[idx % PALETTE.length];
              return (
                <div
                  key={s.symbolId}
                  style={{ width: `${pct}%`, backgroundColor: color }}
                  className="h-full transition-all duration-200 relative flex items-center justify-center"
                  title={`${symbolLib[s.symbolId]?.name || s.symbolId}: 权重 ${currentWeight} (${pct}%)`}
                >
                  {pct >= 14 && (
                    <span className="text-[9px] font-bold text-white drop-shadow-xs px-0.5 select-none font-mono">
                      {pct}%
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Per-Symbol Weight Slider & Controls */}
          <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-0.5">
            {selectedSymbols.map((s, idx) => {
              const symObj = symbolLib[s.symbolId];
              const isInspected = currentInspectedId === s.symbolId;
              const currentWeight = Math.max(1, Math.round(s.weight || 1));
              const pct = Math.round((currentWeight / totalWeight) * 100);
              const color = PALETTE[idx % PALETTE.length];
              const previewSvg = Array.isArray(symObj?.svg) ? symObj.svg[0] : (symObj?.svg || '');

              return (
                <div
                  key={s.symbolId}
                  onClick={() => setInspectedSymbolId(s.symbolId)}
                  className={`flex items-center justify-between p-1.5 rounded-lg border text-xs transition cursor-pointer ${
                    isInspected
                      ? 'bg-white border-emerald-500 shadow-xs ring-1 ring-emerald-400/40'
                      : 'bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                  title="点击可切换至下方微调此要素的偏移/比例/旋转"
                >
                  {/* Symbol Color Pill + Icon + Name */}
                  <div className="flex items-center space-x-1.5 min-w-[90px] max-w-[120px] flex-shrink-0">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-2xs"
                      style={{ backgroundColor: color }}
                    />
                    <div className="w-5 h-5 flex items-center justify-center bg-slate-50 rounded border border-slate-200 flex-shrink-0">
                      <AutoSvgIcon
                        svgContent={previewSvg}
                        viewBox={symObj?.variantViewBoxes?.[0]}
                        className="w-3.5 h-3.5 text-slate-800"
                      />
                    </div>
                    <span className="font-mono text-[11px] truncate font-medium text-slate-800" title={symObj?.name || s.symbolId}>
                      {symObj?.name || s.symbolId}
                    </span>
                  </div>

                  {/* Weight Slider & Stepper */}
                  <div
                    className="flex items-center space-x-1 flex-1 px-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSymbolConfig(s.symbolId, {
                          weight: Math.max(1, currentWeight - 1),
                        })
                      }
                      className="w-4 h-4 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold border border-slate-300 transition"
                      title="减少权重"
                    >
                      -
                    </button>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      step="1"
                      value={currentWeight}
                      onChange={(e) => {
                        onUpdateSymbolConfig(s.symbolId, {
                          weight: parseInt(e.target.value) || 1,
                        });
                      }}
                      className="flex-1 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      title={`权重: ${currentWeight} / 10`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateSymbolConfig(s.symbolId, {
                          weight: Math.min(10, currentWeight + 1),
                        })
                      }
                      className="w-4 h-4 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold border border-slate-300 transition"
                      title="增加权重"
                    >
                      +
                    </button>
                    <span className="font-mono text-[11px] font-bold text-slate-700 w-12 text-right flex-shrink-0">
                      {currentWeight} <span className="text-[10px] font-normal text-slate-400">({pct}%)</span>
                    </span>
                  </div>

                  {/* Delete from mix */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(s.symbolId);
                    }}
                    className="w-5 h-5 flex items-center justify-center rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition ml-1 flex-shrink-0"
                    title="从组合中移除此要素"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="p-2 border-b border-slate-200 bg-slate-50/50 space-y-1.5">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="搜索符号名称 (如 tree, rock, marsh, reed, bog)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 shadow-xs"
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
                  ? 'bg-emerald-600 text-white font-medium shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom SVG Input Form */}
      {isAddingCustom && (
        <form onSubmit={handleCustomSubmit} className="p-2.5 bg-emerald-50/60 border-b border-emerald-200 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-emerald-800 font-semibold">导入自定义 SVG 路径:</span>
            <label className="cursor-pointer text-[10px] text-slate-700 hover:text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 flex items-center space-x-1 shadow-xs">
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
            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs text-slate-900 outline-none focus:border-emerald-500"
          />
          <textarea
            placeholder="在此粘贴 SVG 代码 (<path d='...' />)"
            value={customSvg}
            onChange={(e) => setCustomSvg(e.target.value)}
            rows={2}
            className="w-full px-2 py-1 bg-white border border-slate-300 rounded text-xs font-mono text-slate-900 outline-none focus:border-emerald-500 resize-none"
          />
          <div className="flex justify-end space-x-1.5">
            <button
              type="button"
              onClick={() => setIsAddingCustom(false)}
              className="px-2 py-0.5 text-xs text-slate-500 hover:text-slate-800"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-3 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium shadow-xs"
            >
              确定导入
            </button>
          </div>
        </form>
      )}

      {/* The Classic Symbol Table with Full Multi-variant Icons Display */}
      <div className="flex-1 overflow-y-auto min-h-[160px] max-h-[300px] border-b border-slate-200 bg-white">
        <table className="w-full border-collapse text-xs">
          <tbody>
            {filtered.map((item, idx) => {
              const isPrimary = selectedSymbols[0]?.symbolId === item.id;
              const selectedItem = selectedSymbols.find((s) => s.symbolId === item.id);
              const isIncluded = !!selectedItem;
              const variants = Array.isArray(item.svg) ? item.svg : [item.svg];

              return (
                <tr
                  key={item.id}
                  className={`border-b border-slate-200/80 transition ${
                    isPrimary
                      ? 'bg-emerald-50/90'
                      : isIncluded
                      ? 'bg-blue-50/60'
                      : idx % 2 === 1
                      ? 'bg-slate-50/50 hover:bg-slate-100/60'
                      : 'hover:bg-slate-100/60'
                  }`}
                >
                  {/* Name */}
                  <td className="py-1.5 px-3 font-mono text-slate-800 whitespace-nowrap min-w-[90px]" title={item.name}>
                    {item.name}
                  </td>

                  {/* "用途" Button */}
                  <td className="py-1.5 px-1 w-14 text-center">
                    <button
                      onClick={() => onUseSymbol(item.id)}
                      className={`px-2 py-0.5 rounded text-[11px] font-semibold transition ${
                        isPrimary
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-[#768dd6] hover:bg-[#637bc7] text-white shadow-xs'
                      }`}
                      title="设为唯一当前图案 (Use as exclusive single pattern)"
                    >
                      {isPrimary ? '已用' : '用途'}
                    </button>
                  </td>

                  {/* "+" Button (Adds or shows weight in multi-symbol mix) */}
                  <td className="py-1.5 px-1 w-12 text-center">
                    <button
                      onClick={() => onAddSymbol(item.id)}
                      className={`px-1.5 py-0.5 rounded text-xs font-bold transition inline-flex items-center justify-center space-x-0.5 ${
                        isIncluded
                          ? 'bg-emerald-600 text-white shadow-xs hover:bg-emerald-700'
                          : 'bg-[#f1a27e] hover:bg-[#e4926d] text-white shadow-xs'
                      }`}
                      title={
                        isIncluded
                          ? `已加入混合 (权重: ${selectedItem?.weight || 1})，再次点击可移出`
                          : '添加到多要素混合'
                      }
                    >
                      <span>+</span>
                      {isIncluded && (
                        <span className="text-[10px] font-mono ml-0.5">
                          {selectedItem?.weight || 1}
                        </span>
                      )}
                    </button>
                  </td>

                  {/* Full Multi-Variant SVG Icons Display (separated by '|') */}
                  <td className="py-1.5 px-2">
                    <div className="flex items-center overflow-x-auto no-scrollbar py-0.5 space-x-0.5">
                      {variants.map((vSvg, vIdx) => (
                        <div key={vIdx} className="flex items-center flex-shrink-0">
                          {vIdx > 0 && (
                            <span className="text-slate-300 text-[10px] px-1 select-none font-mono">
                              |
                            </span>
                          )}
                          <div className="w-5 h-5 flex items-center justify-center">
                            <AutoSvgIcon
                              svgContent={vSvg}
                              viewBox={item.variantViewBoxes?.[vIdx]}
                              className="w-4 h-4 text-slate-800"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}

            {/* Custom symbol row at bottom matching original tool */}
            <tr className="border-b border-slate-200/80 bg-slate-50/50">
              <td className="py-1.5 px-3 font-mono text-slate-600">custom</td>
              <td className="py-1.5 px-1 w-14 text-center">
                <button
                  onClick={() => setIsAddingCustom(true)}
                  className="px-2 py-0.5 rounded text-[11px] font-semibold bg-[#768dd6] hover:bg-[#637bc7] text-white shadow-xs"
                >
                  用途
                </button>
              </td>
              <td colSpan={2} className="py-1.5 px-2 text-slate-500 italic text-[11px]">
                | 请使用下方输入框或点击右上方“自定义SVG”
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* The Classic Symbol Bar / Inspector (Bottom of Column 3) */}
      <div className="p-3 bg-slate-50 flex flex-col gap-2 text-xs text-slate-700">
        {/* If multiple symbols are selected, show switcher for which symbol is being tuned */}
        {selectedSymbols.length > 1 && (
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex items-center space-x-1.5 text-[11px]">
              <span className="text-slate-500 font-medium">微调要素参数:</span>
              <span className="font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded border border-emerald-300 font-mono">
                {activeSymbolObj?.name || currentInspectedId}
              </span>
            </div>
            <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
              {selectedSymbols.map((s) => {
                const isCurrent = s.symbolId === currentInspectedId;
                const sym = symbolLib[s.symbolId];
                return (
                  <button
                    key={s.symbolId}
                    type="button"
                    onClick={() => setInspectedSymbolId(s.symbolId)}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                      isCurrent
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-white border border-slate-300 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {sym?.name || s.symbolId}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Enlarged Symbol Preview Box with All Variants */}
          <div className="min-w-12 h-12 bg-white border border-slate-300 rounded-lg flex items-center justify-center p-1 shadow-xs relative overflow-x-auto no-scrollbar gap-1">
            {activeVariants.slice(0, 4).map((vSvg, vIdx) => (
              <AutoSvgIcon
                key={vIdx}
                svgContent={vSvg}
                viewBox={activeSymbolObj?.variantViewBoxes?.[vIdx]}
                className="w-8 h-8 text-emerald-700 flex-shrink-0"
              />
            ))}
            {activeVariants.length > 4 && (
              <span className="text-[10px] text-slate-400 font-mono">+{activeVariants.length - 4}</span>
            )}
            <div className="absolute inset-0 border border-dashed border-emerald-400/50 pointer-events-none rounded-lg" />
          </div>

          {/* Offsets X / Y */}
          <div className="flex items-center space-x-1">
            <span className="text-slate-600 font-medium">偏移:</span>
            <input
              type="text"
              value={activeSelection.offsetX === 'auto' ? (activeSymbolObj?.defaultOffsetX ?? 8) : activeSelection.offsetX}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                onUpdateSymbolConfig(currentInspectedId, { offsetX: val });
              }}
              className="w-8 px-1 py-0.5 bg-white border border-slate-300 rounded text-center text-xs font-mono text-slate-900 outline-none focus:border-emerald-500 shadow-xs"
              title="X 轴中心对齐偏移"
            />
            <input
              type="text"
              value={activeSelection.offsetY === 'auto' ? (activeSymbolObj?.defaultOffsetY ?? 8) : activeSelection.offsetY}
              onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                onUpdateSymbolConfig(currentInspectedId, { offsetY: val });
              }}
              className="w-8 px-1 py-0.5 bg-white border border-slate-300 rounded text-center text-xs font-mono text-slate-900 outline-none focus:border-emerald-500 shadow-xs"
              title="Y 轴中心对齐偏移"
            />
          </div>

          {/* Scale */}
          <div className="flex items-center space-x-1">
            <span className="text-slate-600 font-medium">比例:</span>
            <input
              type="number"
              step="0.1"
              min="0.2"
              max="4.0"
              value={activeSelection.scale || 1.0}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 1.0;
                onUpdateSymbolConfig(currentInspectedId, { scale: val });
              }}
              className="w-12 px-1 py-0.5 bg-white border border-slate-300 rounded text-center text-xs font-mono text-slate-900 outline-none focus:border-emerald-500 shadow-xs"
              title="缩放比例"
            />
          </div>

          {/* Random Rotate Checkbox */}
          <label className="flex items-center space-x-1 cursor-pointer select-none text-slate-700">
            <input
              type="checkbox"
              checked={activeSelection.randomRotate || false}
              onChange={(e) =>
                onUpdateSymbolConfig(currentInspectedId, { randomRotate: e.target.checked })
              }
              className="rounded bg-white border-slate-300 text-emerald-600 focus:ring-0"
            />
            <span>随机旋转</span>
          </label>

          {/* Auto offset button */}
          <button
            onClick={() =>
              onUpdateSymbolConfig(currentInspectedId, { offsetX: 'auto', offsetY: 'auto' })
            }
            className="px-2 py-0.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] shadow-xs transition"
            title="重置中心偏移"
          >
            居中
          </button>
        </div>
      </div>
    </div>
  );
};
