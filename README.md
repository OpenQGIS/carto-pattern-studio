# Carto Pattern Studio

> **地图周期点与符号无缝图案生成工作台 (Cartographic Periodic Dot & Symbol Pattern Generator)**
> 
> 专为制图师、GIS 专家、地图样式设计师及 Web 开发者打造的现代化无缝纹理与符号图案生成器，完全兼容 **QGIS、Mapnik、Mapbox、ArcGIS、Illustrator** 及 Web 矢量/栅格导出。

---

## 💡 背景与解决的问题

在上一话题中，制图师在使用老式 `jsdotpattern`（周期点和符号图案生成器）时常遭遇以下痛点：
1. **浏览器安全拦截**：现代浏览器拦截原生 `data:` 协议下载链接（`Not allowed to navigate top frame to data URL`）。
2. **GIS 渲染兼容缺陷**：老版工具依赖 `<defs><use>` 结构，导致 QGIS、Mapnik、ArcGIS 渲染时图元严重丢失、位移或显示空白。
3. **扩展困难**：老版依赖本地 Shell 脚本 `symbols_json.sh` 才能打包符号；缺乏现代化的多符号混配、即时预览及地图实景渲染模拟。

**Carto Pattern Studio** 将其完整现代化升级，并提供了全套现代 Web UI 与制图工程化能力：
- ✅ **全套 110+ 经典制图符号内置**：涵盖森林、树木、沼泽水体、碎石地质、农田作物、网格与标记。
- ✅ **支持自定义 SVG**：支持直接上传本地 `.svg` 文件或粘贴 SVG 代码。
- ✅ **拓扑周期边界松弛算法 (Periodic Relaxation)**：环面拓扑排斥力场算法，生成绝对 100% 无缝的自然蓝噪声分布。
- ✅ **GIS 展平内联导出 (Inlined Mode)**：一键直接下载展平内联 SVG，无需 `<defs><use>`，完美解决 QGIS / Mapnik 兼容性。
- ✅ **四种全功能视口**：
  - **单胞单格 (1x Tile)**：精确调试单格尺寸与边界溢出。
  - **3x3 无缝矩阵 (Seamless Grid)**：带接缝检测辅助线的无限平铺校验。
  - **地图多边形实景 (GIS Polygon Simulator)**：模拟等高线与水体环境中的面状地物填充效果。
  - **点位拓扑 (Dots)**：查看力场分布与点位坐标。
- ✅ **多格式一键导出**：SVG（GIS 兼容内联版 / 标准版）、PNG（1x/2x/4x 印刷级 300+ DPI）、CSS Data URL 代码复制。

---

## 🚀 快速启动

### 本地运行

```bash
# 1. 安装依赖
npm install

# 2. 启动开发服务器
npm run dev
```

浏览器打开 `http://localhost:5173` 即可使用。

### 构建生产包

```bash
npm run build
```

产物输出至 `dist` 目录，为纯静态前端文件，可直接部署至 GitHub Pages、Vercel 或本地离线静态服务器。

---

## 🗺️ 在 QGIS 中使用生成的 SVG 纹理

1. 在 **Carto Pattern Studio** 界面右上角点击 **「导出 SVG / GIS 图案」**，点击 **「立即下载 SVG 文件 (.svg)」**。
2. 打开 **QGIS**，右键目标面图层 -> **属性 (Layer Properties)** -> **符号化 (Symbology)**。
3. 符号图层类型选择：
   - **「SVG 填充 (SVG Fill)」** 或 **「点符号填充 (Point Pattern Fill)」**。
4. 纹理文件路径点击右侧 **「...」** 浏览并选中下载的 `.svg` 文件。
5. 调整纹理宽度（建议设置为 10~25 mm 或地图单位），即可实现平滑、自然、无边界黑线或瑕疵的专业地图纹理填充！

---

## 📦 技术栈

- **框架**: React 18 + TypeScript + Vite
- **样式**: Tailwind CSS
- **图标**: Lucide React
- **随机算法**: `seedrandom` 确定性伪随机数生成器
- **几何引擎**: 环面拓扑空间哈希与排斥力场松弛引擎 (Toroidal Periodic Relaxation Engine)

---

## 📄 许可证

- 软件代码基于 MIT License 开源。
- 内置制图符号（源自 OpenStreetMap Carto 及 Christoph Hormann `imagico` 原作，已遵循 CC0 规范开放）。
