import fs from 'fs';

const content = fs.readFileSync('src/data/symbolsData.ts', 'utf8');
const jsonStr = content.replace(/^\/\/.*?\nimport.*?\n+export const CARTOGRAPHIC_SYMBOLS: CartoSymbol\[\] = /, '').replace(/;\s*$/, '');
const symbols = JSON.parse(jsonStr);

let arrayCount = 0;
let singleCount = 0;

symbols.forEach(s => {
  if (Array.isArray(s.svg)) {
    arrayCount++;
    console.log(`Multi-variant symbol: ${s.name} (${s.svg.length} variants)`);
  } else {
    singleCount++;
  }
});

console.log(`\nSingle variant: ${singleCount}, Multi-variant: ${arrayCount}`);
