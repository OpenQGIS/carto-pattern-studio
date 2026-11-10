import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  X,
  FileCode,
  Image as ImageIcon,
  MapPin,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-800">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">导出无缝图案 (Export Pattern)</h2>
              <p className="text-xs text-slate-500">
                直接下载 SVG / 高清 PNG，或复制为 GIS 样式与 CSS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Section 1: SVG Vector Export */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileCode className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900">SVG 矢量文件导出 (推荐 GIS)</h3>
              </div>
              <span className="text-[10px] text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full font-semibold">
                {config.inlineGeometries ? '已启用 QGIS 内联展平' : '标准 Defs 模式'}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              导出的 SVG 已包含拓扑周期环绕算法计算生成的边界镜像，在任何 GIS 或制图软件中平铺均 100% 无缝。
            </p>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDownloadSvg}
                className="flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>立即下载 SVG 文件 (.svg)</span>
              </button>

              <button
                onClick={() => handleCopy(svgContent, 'svg')}
                className="flex items-center space-x-1.5 py-2 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs shadow-xs transition"
              >
                {copiedType === 'svg' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-medium">已复制源码</span>
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
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ImageIcon className="w-4 h-4 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900">PNG 高清图像导出</h3>
              </div>
              <div className="flex items-center space-x-1">
                {[1, 2, 4].map((s) => (
                  <button
                    key={s}
                    onClick={() => setPngScale(s)}
                    className={`px-2 py-0.5 text-xs rounded border transition ${
                      pngScale === s
                        ? 'bg-blue-600 text-white border-blue-600 font-bold'
                        : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {s}x {s === 4 ? '(印刷级)' : ''}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              输出像素: <strong className="text-slate-900">{config.gridSize * pngScale} × {config.gridSize * pngScale} px</strong>
              {config.transparentBackground ? ' (透明通道)' : ' (纯色底色)'}。
            </p>
            <button
              onClick={handleDownloadPng}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>下载 {pngScale}x PNG 图片 (.png)</span>
            </button>
          </div>

          {/* Section 3: QGIS Integration Guide */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-1.5">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-amber-700" />
              <h3 className="text-xs font-bold text-amber-900">如何在 QGIS 中使用此图案？</h3>
            </div>
            <ol className="text-xs text-amber-800 space-y-1 list-decimal list-inside leading-relaxed">
              <li>点击上方 <strong>“立即下载 SVG 文件”</strong>。</li>
              <li>在 QGIS 中右键目标面图层 -&gt; <strong>属性 (Properties)</strong> -&gt; <strong>符号化 (Symbology)</strong>。</li>
              <li>将符号图层类型改为 <strong>“SVG 填充 (SVG Fill)”</strong>，浏览选中下载的 `.svg` 文件即可。</li>
            </ol>
          </div>

          {/* Section 4: Web CSS Snippet */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs text-slate-600">
              <span className="font-medium">Web 开发 CSS 平铺代码 (Data URL):</span>
              <button
                onClick={() => handleCopy(cssSnippet, 'css')}
                className="text-xs text-emerald-700 hover:underline flex items-center space-x-1"
              >
                {copiedType === 'css' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                <span>{copiedType === 'css' ? '已复制' : '复制 CSS'}</span>
              </button>
            </div>
            <pre className="p-2.5 bg-slate-900 rounded-lg text-[11px] font-mono text-slate-200 overflow-x-auto border border-slate-700">
              {cssSnippet}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
