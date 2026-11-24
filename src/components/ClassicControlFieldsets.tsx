import React, { useEffect, useRef, useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { GeneratorConfig, GridPatternType } from '../types';

interface ClassicControlFieldsetsProps {
  config: GeneratorConfig;
  onUpdateConfig: (updates: Partial<GeneratorConfig>) => void;
  onRegenerate: () => void;
  onRelax: (steps: number) => void;
  onShake: () => void;
  onJitter: () => void;
  onRotate45: () => void;
  onSwap: () => void;
  onZigzag: () => void;
  onOpenExport: () => void;
  onDownloadSvg: () => void;
  onDownloadPng: () => void;
  onCopySvg: () => void;
  isCopied: boolean;
}

export const ClassicControlFieldsets: React.FC<ClassicControlFieldsetsProps> = ({
  config,
  onUpdateConfig,
  onRegenerate,
  onRelax,
  onShake,
  onJitter,
  onRotate45,
  onSwap,
  onZigzag,
  onOpenExport,
  onDownloadSvg,
  onDownloadPng,
  onCopySvg,
  isCopied,
}) => {
  const [distInput, setDistInput] = useState(String(config.dotDist));
  const isTypingRef = useRef(false);

  useEffect(() => {
    setDistInput(String(config.dotDist));
  }, [config.dotDist]);

  const parseClampedDist = (raw: string): number => {
    const parsed = parseInt(raw, 10);
    if (Number.isNaN(parsed)) return config.dotDist;
    return Math.min(80, Math.max(10, parsed));
  };

  const commitDotDist = (raw: string, extraUpdates: Partial<GeneratorConfig> = {}) => {
    const val = parseClampedDist(raw);
    setDistInput(String(val));
    onUpdateConfig({
      dotDist: val,
      dotRadius: Math.max(val + 8, config.dotRadius),
      ...extraUpdates,
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 flex-shrink-0">
      {/* Fieldset 1: 点生成 (Point Generation) */}
      <fieldset className="border border-slate-300 rounded-lg p-2 bg-white shadow-2xs">
        <legend className="px-1.5 text-[11px] font-bold text-slate-800 bg-white rounded border border-slate-200">
          点生成 (Point generation)
        </legend>
        <div className="space-y-1.5 text-xs text-slate-700">
          <div className="flex items-center space-x-1.5">
            <span className="font-medium text-[11px]">点距:</span>
            <input
              type="number"
              min="10"
              max="80"
              value={distInput}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  isTypingRef.current = false;
                  commitDotDist(distInput);
                  return;
                }
                isTypingRef.current = e.key !== 'ArrowUp' && e.key !== 'ArrowDown';
              }}
              onChange={(e) => {
                const raw = e.target.value;
                setDistInput(raw);
                const inputType = (e.nativeEvent as InputEvent | undefined)?.inputType;
                const isSpinnerOrArrow = !isTypingRef.current && (!inputType || inputType === 'insertReplacementText');
                isTypingRef.current = false;
                if (isSpinnerOrArrow) {
                  commitDotDist(raw);
                }
              }}
              className="w-11 px-1 py-0.5 bg-white border border-slate-300 rounded text-center font-mono text-[11px] text-slate-900 outline-none focus:border-emerald-500 shadow-2xs"
            />
            <button
              onClick={() => {
                commitDotDist(distInput, { seed: Math.random().toString(36).substring(2, 8) });
              }}
              className="px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded transition shadow-2xs"
              title="生成新随机点图案"
            >
              生成 (generate)
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[10px] text-slate-500 font-medium">基准:</span>
            {[
              { type: 'random' as GridPatternType, label: '∿ 随机', title: '随机分布网格' },
              { type: 'triangular' as GridPatternType, label: '☵ 正三角', title: '正三角网格' },
              { type: 'triangular2' as GridPatternType, label: '☶ 斜三角', title: '斜向三角网格' },
              { type: 'square' as GridPatternType, label: '☲ 正方', title: '正交方格' },
              { type: 'diamond' as GridPatternType, label: '◇ 45°菱方', title: '45° 方向正方形错位（菱形/梅花点阵）' },
              { type: 'vrect' as GridPatternType, label: '▯ 竖矩形', title: '竖向长方形网格（高 > 宽）' },
              { type: 'vbrick' as GridPatternType, label: '▥ 竖错位', title: '竖向砖墙错位网格（奇偶列上下错半格）' },
              { type: 'snub' as GridPatternType, label: '5 扭棱', title: '扭棱正方网格' },
            ].map((g) => (
              <button
                key={g.type}
                onClick={() => {
                  onUpdateConfig({ gridType: g.type });
                  setTimeout(onRegenerate, 50);
                }}
                className={`px-1.5 py-0.5 text-[10px] rounded border transition ${
                  config.gridType === g.type
                    ? 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-2xs'
                    : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                }`}
                title={g.title}
              >
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </fieldset>

      {/* Fieldset 2: 松弛 (Relaxation) */}
      <fieldset className="border border-slate-300 rounded-lg p-2 bg-white shadow-2xs">
        <legend className="px-1.5 text-[11px] font-bold text-slate-800 bg-white rounded border border-slate-200">
          松弛 (Relaxation)
        </legend>
        <div className="space-y-1.5 text-xs text-slate-700">
          <div className="flex flex-wrap items-center gap-1.5">
            <div className="flex items-center space-x-1 text-[11px]">
              <span>半径:</span>
              <input
                type="number"
                value={config.dotRadius}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 32;
                  onUpdateConfig({ dotRadius: val, dotRadiusY: val });
                }}
                className="w-10 px-1 py-0.5 bg-white border border-slate-300 rounded text-center font-mono text-[11px] text-slate-900 outline-none focus:border-emerald-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center space-x-1 text-[11px]">
              <span>半径Y:</span>
              <input
                type="number"
                value={config.dotRadiusY}
                onChange={(e) => onUpdateConfig({ dotRadiusY: parseInt(e.target.value) || 32 })}
                className="w-10 px-1 py-0.5 bg-white border border-slate-300 rounded text-center font-mono text-[11px] text-slate-900 outline-none focus:border-emerald-500 shadow-2xs"
              />
            </div>

            <div className="flex items-center space-x-1 text-[11px]">
              <span>范式:</span>
              <input
                type="number"
                value={config.metric}
                onChange={(e) => onUpdateConfig({ metric: parseInt(e.target.value) || 2 })}
                className="w-8 px-1 py-0.5 bg-white border border-slate-300 rounded text-center font-mono text-[11px] text-slate-900 outline-none focus:border-emerald-500 shadow-2xs"
                title="距离范式（通常为2，即欧氏距离）"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            <button
              onClick={() => onRelax(1)}
              className="px-1.5 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[11px] font-medium transition shadow-2xs"
            >
              松弛 (relax)
            </button>
            <button
              onClick={() => onRelax(10)}
              className="px-1.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] rounded transition shadow-2xs"
            >
              松弛 ×10
            </button>
            <button
              onClick={onShake}
              className="px-1.5 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] transition"
              title="随机轻微扰动"
            >
              扰动
            </button>
            <button
              onClick={onJitter}
              className="px-1.5 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] transition"
              title="位置微抖动"
            >
              抖动
            </button>
            <button
              onClick={onRotate45}
              className="px-1.5 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] transition"
              title="旋转45度并重采样"
            >
              旋45°
            </button>
            <button
              onClick={onSwap}
              className="px-1.5 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] transition"
              title="对角线镜像交换"
            >
              镜像
            </button>
            <button
              onClick={onZigzag}
              className="px-1.5 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-300 rounded text-[11px] transition"
              title="水平错位交错"
            >
              交错
            </button>
          </div>
        </div>
      </fieldset>

      {/* Fieldset 3: 渲染与导出 (Rendering & Export) */}
      <fieldset className="border border-slate-300 rounded-lg p-2 bg-white shadow-2xs">
        <legend className="px-1.5 text-[11px] font-bold text-slate-800 bg-white rounded border border-slate-200">
          渲染与导出 (Rendering)
        </legend>
        <div className="space-y-1.5 text-xs text-slate-700">
          <div className="flex items-center space-x-1.5 text-[11px]">
            <span>外晕:</span>
            <input
              type="number"
              min="0"
              max="6"
              value={config.casingWidth}
              onChange={(e) => onUpdateConfig({ casingWidth: parseFloat(e.target.value) || 0 })}
              className="w-9 px-1 py-0.5 bg-white border border-slate-300 rounded text-center font-mono text-[11px] text-slate-900 outline-none focus:border-emerald-500 shadow-2xs"
            />
            <button
              onClick={() => onUpdateConfig({ inlineGeometries: !config.inlineGeometries })}
              className={`px-1.5 py-0.5 rounded text-[10px] border transition ${
                config.inlineGeometries
                  ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
              title="将图元路径直接展平内联，保证 QGIS / Mapnik 100% 渲染"
            >
              内联渲染 (inlined)
            </button>

            <button
              onClick={() => onUpdateConfig({ pixelAlign: !config.pixelAlign })}
              className={`px-1.5 py-0.5 rounded text-[10px] border transition ${
                config.pixelAlign
                  ? 'bg-blue-600 text-white border-blue-600 font-semibold shadow-2xs'
                  : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
              }`}
              title="整数像素对齐，避免虚焦"
            >
              像素对齐
            </button>
          </div>

          {/* Quick Action Export Buttons */}
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            <button
              onClick={onDownloadSvg}
              className="flex items-center space-x-1 px-2.5 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded shadow-2xs transition active:scale-95"
            >
              <Download className="w-3 h-3" />
              <span>下载 SVG</span>
            </button>

            <button
              onClick={onDownloadPng}
              className="px-2 py-0.5 bg-slate-700 hover:bg-slate-800 text-white rounded font-medium text-[11px] shadow-2xs transition"
            >
              下载 PNG
            </button>

            <button
              onClick={onCopySvg}
              className="flex items-center space-x-1 px-2 py-0.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded border border-slate-300 text-[11px] shadow-2xs transition"
            >
              {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3 text-slate-500" />}
              <span>{isCopied ? '已复制' : '代码'}</span>
            </button>

            <button
              onClick={onOpenExport}
              className="px-1.5 py-0.5 bg-white hover:bg-slate-50 text-slate-600 rounded border border-slate-300 text-[10px] transition shadow-2xs"
            >
              更多...
            </button>
          </div>
        </div>
      </fieldset>
    </div>
  );
};
