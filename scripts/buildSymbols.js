import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

let raw = fs.readFileSync(path.join(rootDir, 'temp_jsdotpattern', 'symbols.js'), 'utf8');
raw = raw.replace(/var SelSyms\s*=/, 'const SelSyms =') + '\nexport default SelSyms;';
const exportPath = path.join(rootDir, 'temp_jsdotpattern', 'symbols_export.mjs');
fs.writeFileSync(exportPath, raw);

import(pathToFileURL(exportPath).href).then((mod) => {
  const list = mod.default;
  
  function getCategory(name) {
    const n = name.toLowerCase();
    if (n.includes('tree') || n.includes('forest') || n.includes('wood') || n.includes('scrub')) {
      return { category: 'forest', categoryLabel: '森林与树木 (Forest & Trees)' };
    }
    if (n.includes('marsh') || n.includes('bog') || n.includes('reed') || n.includes('reef') || n.includes('mangrove')) {
      return { category: 'water', categoryLabel: '湿地与水体 (Wetlands & Water)' };
    }
    if (n.includes('rock') || n.includes('scree') || n.includes('quarry') || n.includes('heap')) {
      return { category: 'geology', categoryLabel: '地质与地貌 (Geology & Relief)' };
    }
    if (n.includes('rice') || n.includes('sugarcane') || n.includes('wheat') || n.includes('pineapple') || n.includes('flower') || n.includes('grass')) {
      return { category: 'agriculture', categoryLabel: '农作物与植被 (Agriculture & Grass)' };
    }
    return { category: 'markers', categoryLabel: '点状与网格符号 (Markers & Symbols)' };
  }

  const processed = list.map((item) => {
    const cat = getCategory(item.name);
    return {
      id: item.name.replace(/\s+/g, '-'),
      name: item.name,
      category: cat.category,
      categoryLabel: cat.categoryLabel,
      svg: item.svg,
      defaultOffsetX: 8,
      defaultOffsetY: 8,
    };
  });

  const outPath = path.join(rootDir, 'src', 'data', 'symbolsData.ts');
  const content = `// Auto-generated cartographic symbols library
import { CartoSymbol } from '../types';

export const CARTOGRAPHIC_SYMBOLS: CartoSymbol[] = ${JSON.stringify(processed, null, 2)};
`;

  fs.writeFileSync(outPath, content, 'utf8');
  console.log(`Successfully written ${processed.length} symbols to ${outPath}`);
});
