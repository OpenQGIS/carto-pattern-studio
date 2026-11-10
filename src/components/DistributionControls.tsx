import React from 'react';
import {
  Grid,
  Zap,
  RotateCw,
  Shuffle,
  Compass,
  ArrowLeftRight,
  Activity,
  Dices,
} from 'lucide-react';
import { GeneratorConfig, GridPatternType } from '../types';

interface DistributionControlsProps {
  config: GeneratorConfig;
  onUpdateConfig: (updates: Partial<GeneratorConfig>) => void;
  onRegenerate: () => void;
  onRelax: (steps: number) => void;
  onShake: () => void;
  onJitter: () => void;
  onRotate45: () => void;
  onSwap: () => void;
  onZigzag: () => void;
  dotCount: number;
}

export const DistributionControls: React.FC<DistributionControlsProps> = ({
  config,
  onUpdateConfig,
  onRegenerate,
  onRelax,
  onShake,
  onJitter,
  onRotate45,
  onSwap,
  onZigzag,
  dotCount,
}) => {
  const gridTypes: { type: GridPatternType; label: string; symbol: string }[] = [
    { type: 'random', label: '随机网格', symbol: '∿' },
    { type: 'triangular', label: '正三角网格', symbol: '☵' },
    { type: 'triangular2', label: '斜三角网格', symbol: '☶' },
    { type: 'square', label: '正方网格', symbol: '☲' },
    { type: 'snub', label: '扭棱正方', symbol: '5' },
  ];

  const handleRandomSeed = () => {
    const newSeed = Math.random().toString(36).substring(2, 8);
    onUpdateConfig({ seed: newSeed });
    onRegenerate();
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Compass className="w-4 h-4 text-emerald-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            周期点位与拓扑松弛 (Distribution & Relaxation)
          </h2>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
          {dotCount} 点位
        </span>
      </div>

      {/* Grid Size & Seed */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] text-slate-400 block mb-1">纹理单胞尺寸 (Tile Size):</label>
          <div className="grid grid-cols-4 gap-1">
            {[64, 128, 256, 512].map((size) => (
              <button
                key={size}
                onClick={() => {
                  onUpdateConfig({ gridSize: size });
                  setTimeout(onRegenerate, 50);
                }}
                className={`py-1 text-xs rounded border transition font-mono ${
                  config.gridSize === size
                    ? 'bg-emerald-600 text-white border-emerald-500 font-bold'
                    : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[11px] text-slate-400 block mb-1">随机种子 (RNG Seed):</label>
          <div className="flex items-center space-x-1">
            <input
              type="text"
              value={config.seed}
              onChange={(e) => onUpdateConfig({ seed: e.target.value })}
              className="flex-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-white font-mono outline-none focus:border-emerald-500"
            />
            <button
              onClick={handleRandomSeed}
              className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
              title="生成新随机种子"
            >
              <Dices className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Initial Grid Pattern Types */}
      <div>
        <label className="text-[11px] text-slate-400 block mb-1">基础分布排列 (Base Grid):</label>
        <div className="grid grid-cols-5 gap-1.5">
          {gridTypes.map((item) => (
            <button
              key={item.type}
              onClick={() => {
                onUpdateConfig({ gridType: item.type });
                setTimeout(onRegenerate, 30);
              }}
              className={`py-1.5 px-1 rounded-lg border text-center transition flex flex-col items-center justify-center ${
                config.gridType === item.type
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-semibold'
                  : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="font-mono text-sm leading-none mb-0.5">{item.symbol}</span>
              <span className="text-[10px] leading-tight truncate w-full">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Dot Distance & Influence Radius */}
      <div className="space-y-3 pt-1">
        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>点位间距 (Dot Distance):</span>
            <span className="font-mono text-emerald-400 font-semibold">{config.dotDist} px</span>
          </div>
          <input
            type="range"
            min="12"
            max="80"
            step="2"
            value={config.dotDist}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              onUpdateConfig({
                dotDist: val,
                dotRadius: Math.max(val + 8, config.dotRadius),
                dotRadiusY: Math.max(val + 8, config.dotRadiusY),
              });
              setTimeout(onRegenerate, 50);
            }}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        <div>
          <div className="flex justify-between text-[11px] text-slate-400 mb-1">
            <span>排斥松弛半径 (Relax Radius):</span>
            <span className="font-mono text-emerald-400 font-semibold">{config.dotRadius} px</span>
          </div>
          <input
            type="range"
            min="16"
            max="128"
            step="4"
            value={config.dotRadius}
            onChange={(e) => {
              const val = parseInt(e.target.value);
              onUpdateConfig({ dotRadius: val, dotRadiusY: val });
            }}
            className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>

      {/* Action Buttons: Relaxation & Geometric Transforms */}
      <div className="pt-2 border-t border-slate-800 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onRelax(1)}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition active:scale-95 shadow-sm"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>拓扑松弛 (Relax 1x)</span>
          </button>

          <button
            onClick={() => onRelax(10)}
            className="flex items-center justify-center space-x-1.5 py-2 px-3 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition active:scale-95 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>深度松弛 (Relax 10x)</span>
          </button>
        </div>

        <div className="grid grid-cols-5 gap-1.5 pt-1">
          <button
            onClick={onShake}
            className="py-1.5 px-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] flex flex-col items-center justify-center transition"
            title="随机扰动 (Shake)"
          >
            <Shuffle className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
            <span>扰动</span>
          </button>

          <button
            onClick={onJitter}
            className="py-1.5 px-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] flex flex-col items-center justify-center transition"
            title="微抖动 (Jitter)"
          >
            <Activity className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
            <span>抖动</span>
          </button>

          <button
            onClick={onRotate45}
            className="py-1.5 px-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] flex flex-col items-center justify-center transition"
            title="旋转45度并重采样 (Rotate 45°)"
          >
            <RotateCw className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
            <span>旋45°</span>
          </button>

          <button
            onClick={onSwap}
            className="py-1.5 px-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] flex flex-col items-center justify-center transition"
            title="对角镜像交换 (Swap X/Y)"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
            <span>镜像</span>
          </button>

          <button
            onClick={onZigzag}
            className="py-1.5 px-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[10px] flex flex-col items-center justify-center transition"
            title="水平错位交错 (Zigzag)"
          >
            <Grid className="w-3.5 h-3.5 text-slate-400 mb-0.5" />
            <span>交错</span>
          </button>
        </div>
      </div>
    </div>
  );
};
