import fs from 'fs';

const content = fs.readFileSync('src/data/symbolsData.ts', 'utf8');
const jsonStr = content.replace(/^\/\/.*?\nimport.*?\n+export const CARTOGRAPHIC_SYMBOLS: CartoSymbol\[\] = /, '').replace(/;\s*$/, '');
const symbols = JSON.parse(jsonStr);

console.log('Total symbols:', symbols.length);
['wood', 'trees1', 'trees4', 'trees5', 'vpixel'].forEach(name => {
  const s = symbols.find(x => x.name === name || x.id === name);
  if (s) {
    console.log(`\nSymbol: ${s.name}`);
    console.log(`isArray: ${Array.isArray(s.svg)} (length: ${Array.isArray(s.svg) ? s.svg.length : 1})`);
    if (Array.isArray(s.svg)) {
      console.log(`First variant preview: ${s.svg[0].slice(0, 150)}...`);
    } else {
      console.log(`SVG preview: ${s.svg.slice(0, 150)}...`);
    }
  }
});
