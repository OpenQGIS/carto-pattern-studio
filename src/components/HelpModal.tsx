import React from 'react';
import { HelpCircle, X, CheckCircle, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">关于与使用指南 (About & Guide)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-700 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-emerald-900 text-sm">
              <Sparkles className="w-4 h-4 text-emerald-700" />
              <span>为什么需要周期点和符号图案生成器？</span>
            </div>
            <p className="text-emerald-800">
              在专业制图与 GIS 中，面状地物（如林地、沼泽、碎石坡、果园、潮间带）需要用离散且具有自然分布感的符号进行纹理填充。
              传统的散点在重复拼贴时会在瓦片边界产生生硬的接缝。本工具通过<strong>环面拓扑周期性边界松弛算法</strong>，在保持自然离散分布的同时，实现无限平铺的 100% 绝对无缝拼接。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">核心工作流</h3>
            <ul className="space-y-1.5 list-disc list-inside text-slate-700">
              <li><strong>选择符号：</strong> 在右侧表格中点击 <code>[用途]</code> 立即设为当前图案；点击 <code>[+]</code> 可组合多种符号（如树木+沼泽）。</li>
              <li><strong>点位拓扑松弛 (Relaxation)：</strong> 点击「松弛」或「松弛 ×10」，算法将在环面上基于排斥力场推开邻近点位，获得均质且自然的蓝噪声分布。</li>
              <li><strong>多种空间变换：</strong> 支持扰动、微抖动、45度旋切重采样、对角线镜像交换、水平交错错位等丰富操作。</li>
              <li><strong>无缝校验：</strong> 在中间栏点击「3x3」视图，直观核验横跨边界的图元是否严丝合缝。</li>
            </ul>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-200">
            <h3 className="font-bold text-slate-900 text-sm">GIS 软件兼容性说明 (QGIS / Mapnik)</h3>
            <p>
              许多 GIS 渲染引擎（如 QGIS、Mapnik、ArcGIS）对 SVG 标准中的 <code>&lt;defs&gt;</code> 和 <code>&lt;use&gt;</code> 标签支持存在缺陷。
            </p>
            <div className="flex items-center space-x-2 text-emerald-700 font-semibold">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>本系统默认启用「内联图元展平渲染」技术，将所有路径直接展平并计算坐标变换，在所有主流 GIS 与图形软件中均可 100% 正确渲染。</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
