import React from 'react';
import { HelpCircle, X, CheckCircle, Info, Sparkles } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <HelpCircle className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">关于与使用指南 (About & Guide)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1.5">
            <div className="flex items-center space-x-1.5 font-bold text-emerald-300 text-sm">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>为什么需要周期点和符号图案生成器？</span>
            </div>
            <p className="text-slate-300">
              在专业制图与 GIS 中，面状地物（如林地、沼泽、碎石坡、果园、潮间带）需要用离散且具有自然分布感的符号进行纹理填充。
              传统的伪随机散点在重复拼贴时会在瓦片边界产生生硬的接缝；而规律的正交网格又显得过于机械人工。
              本工具通过<strong>环面拓扑周期性边界松弛算法</strong>，在保持自然离散分布的同时，实现无限平铺的 100% 绝对无缝拼接。
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-white text-sm">核心工作流</h3>
            <ul className="space-y-1.5 list-disc list-inside text-slate-300">
              <li><strong>选择预设或图元：</strong> 支持从 110+ 经典制图符号中选取单种或多种进行混合比例排布。</li>
              <li><strong>点位拓扑松弛 (Relaxation)：</strong> 点击「拓扑松弛」或「深度松弛」，算法将在环面上基于排斥力场推开邻近点位，获得均质且自然的蓝噪声分布。</li>
              <li><strong>多种空间变换：</strong> 支持扰动、微抖动、45度旋切重采样、对角线镜像交换、水平交错错位等丰富操作。</li>
              <li><strong>无缝校验矩阵：</strong> 切换到「3x3 无缝矩阵」视图，可任意缩放平移，直观核验横跨左右或上下边界的图元是否严丝合缝。</li>
              <li><strong>地图多边形实景预览：</strong> 切换到「地图实景模拟」视图，即时预览该图案在等高线山地与湖泊背景下的真实面填充效果。</li>
            </ul>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800">
            <h3 className="font-bold text-white text-sm">GIS 软件兼容性说明 (QGIS / Mapnik)</h3>
            <p>
              许多 GIS 渲染引擎（如 QGIS、Mapnik、ArcGIS）对 SVG 标准中的 <code>&lt;defs&gt;</code> 和 <code>&lt;use&gt;</code> 标签支持存在缺陷，常导致符号丢失或显示为空白。
            </p>
            <div className="flex items-center space-x-2 text-emerald-400 font-semibold">
              <CheckCircle className="w-4 h-4" />
              <span>本系统默认启用「内联图元展平渲染」技术，将所有路径直接展平并计算坐标变换，在所有主流 GIS 与图形软件中均可 100% 正确渲染。</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
