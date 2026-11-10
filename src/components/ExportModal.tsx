import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  X,
  FileCode,
  Image as ImageIcon,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { GeneratorConfig } from '../types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  svgContent: string;
  config: GeneratorConfig;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  svgContent,
  config,
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [pngScale, setPngScale] = useState<number>(2);

  if (!isOpen) return null;

  // Direct download SVG
  const handleDownloadSvg = () => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `carto_pattern_${config.gridSize}x${config.gridSize}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Direct download PNG with canvas rasterization
  const handleDownloadPng = () => {
    const canvas = document.createElement('canvas');
    const size = config.gridSize * pngScale;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      ctx.drawImage(img, 0, 0, size, size);
      const pngUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = pngUrl;
      a.download = `carto_pattern_${size}x${size}_${pngScale}x.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    });
  };

  const cssSnippet = `background-image: url('data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}');\nbackground-repeat: repeat;\nbackground-size: ${config.gridSize}px ${config.gridSize}px;`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">导出无缝图案 (Export Carto Pattern)</h2>
              <p className="text-xs text-slate-400">
                支持直接下载 SVG / 高清 PNG，或复制为 GIS 样式与 CSS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Section 1: SVG Vector Export */}
          <div className="bg-slate-800/50 border border-slate-700/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200">SVG 矢量文件导出 (推荐 GIS)</h3>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                {config.inlineGeometries ? '已启用 QGIS 内联展平' : '标准 Defs 模式'}
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              导出的 SVG 已包含拓扑周期环绕算法计算生成的边界镜像，在任何 GIS 或制图软件中平铺均 100% 无缝。
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadSvg}
                className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-700/20 transition active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>立即下载 SVG 文件 (.svg)</span>
              </button>

              <button
                onClick={() => handleCopy(svgContent, 'svg')}
                className="flex items-center space-x-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs transition"
              >
                {copiedType === 'svg' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">已复制源码</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>复制 SVG 代码</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Section 2: PNG Raster Export */}
          <div className="bg-slate-800/50 border border-slate-700/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-teal-400" />
                <h3 className="text-xs font-bold text-slate-200">PNG 高清光栅图像导出 (Raster PNG)</h3>
              </div>
              <div className="flex items-center space-x-1">
                {[1, 2, 4].map((s) => (
                  <button
                    key={s}
                    onClick={() => setPngScale(s)}
                    className={`px-2 py-0.5 text-xs rounded border transition ${
                      pngScale === s
                        ? 'bg-teal-600 text-white border-teal-500 font-bold'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {s}x {s === 4 ? '(印刷级)' : ''}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              分辨率: <strong className="text-white">{config.gridSize * pngScale} × {config.gridSize * pngScale} px</strong>
              {config.transparentBackground ? ' (保留 Alpha 透明度通道)' : ' (纯色底色)'}。
            </p>
            <button
              onClick={handleDownloadPng}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-md shadow-teal-700/20 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>下载 {pngScale}x 高清 PNG 图片 (.png)</span>
            </button>
          </div>

          {/* Section 3: QGIS Integration Guide */}
          <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-200">如何在 QGIS 中使用此图案？</h3>
            </div>
            <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>点击上方 <strong>“立即下载 SVG 文件”</strong> 将图案保存到本地。</li>
              <li>在 QGIS 中右键图层 -&gt; <strong>属性 (Properties)</strong> -&gt; <strong>符号化 (Symbology)</strong>。</li>
              <li>图层渲染类型选择 <strong>“单一符号”</strong>，将符号图层类型改为 <strong>“SVG 填充 (SVG Fill)”</strong> 或 <strong>“栅格图像填充”</strong>。</li>
              <li>点击纹理路径右侧的 <strong>“浏览”</strong>，选择刚刚下载的 SVG 文件即可完美平铺无缝渲染！</li>
            </ol>
          </div>

          {/* Section 4: Web CSS Snippet */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Web 开发 CSS 平铺代码 (Data URL):</span>
              <button
                onClick={() => handleCopy(cssSnippet, 'css')}
                className="text-xs text-emerald-400 hover:underline flex items-center space-x-1"
              >
                {copiedType === 'css' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'css' ? '已复制' : '复制 CSS'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto border border-slate-800">
              {cssSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
