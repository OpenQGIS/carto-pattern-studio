import seedrandom from 'seedrandom';
import { DotPoint, GeneratorConfig, GridPatternType, SymbolSelection, CartoSymbol } from '../types';

export class PatternEngine {
  /**
   * Generate initial dot grid based on pattern type
   */
  static generateGrid(
    gridSize: number,
    dotDist: number,
    gridType: GridPatternType,
    rng: () => number
  ): DotPoint[] {
    const dots: DotPoint[] = [];
    const dotCntL = Math.max(1, Math.floor(gridSize / dotDist));
    let dotCntL2 = dotCntL;

    if (gridType === 'triangular' || gridType === 'triangular2') {
      dotCntL2 = Math.floor(gridSize / (dotDist * 0.5 * Math.sqrt(3.0)));
      if (dotCntL2 % 2 > 0) dotCntL2 += 1;
    }

    const distCompX = gridSize / dotCntL2;
    const distCompY = gridSize / dotCntL;

    for (let py = 0; py < dotCntL; py++) {
      for (let px = 0; px < dotCntL2; px++) {
        let cx = 0;
        let cy = 0;

        if (gridType === 'triangular') {
          cx = (px + 0.5) * distCompX;
          cy = px % 2 === 0 ? (py + 0.25) * distCompY : (py + 0.75) * distCompY;
        } else if (gridType === 'triangular2') {
          cy = (px + 0.5) * distCompX;
          cx = px % 2 === 0 ? (py + 0.25) * distCompY : (py + 0.75) * distCompY;
        } else if (gridType === 'square') {
          cx = (px + 0.5) * distCompX;
          cy = (py + 0.5) * distCompY;
        } else if (gridType === 'snub') {
          const offset = 1.0 - 0.5 * 0.258819045103;
          dots.push({ x: (px + offset) * distCompX, y: (py + offset) * distCompY, type: 2 });
          dots.push({ x: (px + offset - 0.5) * distCompX, y: (py + offset - 0.5 * 0.258819045103) * distCompY, type: 2 });
          dots.push({ x: (px + offset - 0.5 * 0.258819045103) * distCompX, y: (py + offset - 0.5) * distCompY, type: 2 });
          dots.push({ x: (px + offset - 1 + 0.36520324788187813) * distCompX, y: (py + offset - 1 + 0.36520324788187813) * distCompY, type: 2 });
          continue;
        } else {
          // Default: Random displaced grid
          cx = (px + 0.05 + rng() * 0.9) * (gridSize / dotCntL);
          cy = (py + 0.05 + rng() * 0.9) * (gridSize / dotCntL);
        }

        dots.push({ x: cx, y: cy, type: 2 });
      }
    }

    return dots;
  }

  /**
   * Relax points with periodic boundary conditions (force-directed distance maximization)
   */
  static relax(
    dots: DotPoint[],
    gridSize: number,
    dotRadius: number,
    dotRadiusY: number,
    metric: number = 2,
    steps: number = 1
  ): DotPoint[] {
    let currentDots = dots.map(d => ({ ...d }));
    const stepFactor = 0.02;

    const gridCellSize = Math.max(8, dotRadius);
    const gridCnt = Math.max(1, Math.floor(gridSize / gridCellSize));
    const invRadiusRatio = dotRadius / dotRadiusY;
    const invRadiusRatioSq = invRadiusRatio * invRadiusRatio;

    for (let s = 0; s < steps; s++) {
      // Build spatial hash grid
      const grid: number[][] = Array.from({ length: gridCnt * gridCnt }, () => []);
      for (let i = 0; i < currentDots.length; i++) {
        const ix = Math.min(gridCnt - 1, Math.max(0, Math.floor((currentDots[i].x / gridSize) * gridCnt)));
        const iy = Math.min(gridCnt - 1, Math.max(0, Math.floor((currentDots[i].y / gridSize) * gridCnt)));
        grid[iy * gridCnt + ix].push(i);
      }

      const nextDots = currentDots.map(d => ({ ...d }));

      for (let i = 0; i < currentDots.length; i++) {
        const ptx = currentDots[i].x;
        const pty = currentDots[i].y;
        const ix = Math.min(gridCnt - 1, Math.max(0, Math.floor((ptx / gridSize) * gridCnt)));
        const iy = Math.min(gridCnt - 1, Math.max(0, Math.floor((pty / gridSize) * gridCnt)));

        let ax = 0.0;
        let ay = 0.0;
        let wsum = 0.0;

        for (let diy = iy - 1; diy <= iy + 1; diy++) {
          for (let dix = ix - 1; dix <= ix + 1; dix++) {
            let dix2 = (dix + gridCnt) % gridCnt;
            let diy2 = (diy + gridCnt) % gridCnt;

            const cell = grid[diy2 * gridCnt + dix2];
            for (let j = 0; j < cell.length; j++) {
              const otherIdx = cell[j];
              if (otherIdx === i) continue;

              let ptx2 = currentDots[otherIdx].x;
              let pty2 = currentDots[otherIdx].y;

              let dx = ptx - ptx2;
              let dy = pty - pty2;

              // Periodic wrap distance
              if (Math.abs(dx) > gridSize / 2) {
                if (ptx2 > ptx) dx = ptx - (ptx2 - gridSize);
                else dx = ptx - (ptx2 + gridSize);
              }
              if (Math.abs(dy) > gridSize / 2) {
                if (pty2 > pty) dy = pty - (pty2 - gridSize);
                else dy = pty - (pty2 + gridSize);
              }

              let d = 0;
              if (metric === 2) {
                d = dx * dx + dy * dy * invRadiusRatioSq;
              } else if (metric > 100) {
                const md = Math.max(Math.abs(dx), Math.abs(dy) * invRadiusRatio);
                d = md * md;
              } else {
                d = Math.pow(
                  Math.pow(Math.abs(dx), metric) + Math.pow(Math.abs(dy) * invRadiusRatio, metric),
                  2.0 / metric
                );
              }

              if (d > 0.0 && d < dotRadius * dotRadius) {
                const force = 1.0 / d;
                ax += dx * force;
                ay += dy * force;
                wsum += 1.0;
              }
            }
          }
        }

        if (wsum > 0.0) {
          let nx = currentDots[i].x + (ax / wsum) * dotRadius * stepFactor;
          let ny = currentDots[i].y + (ay / wsum) * dotRadiusY * stepFactor;

          // Wrap boundaries
          if (nx < 0) nx += gridSize;
          if (ny < 0) ny += gridSize;
          if (nx >= gridSize) nx -= gridSize;
          if (ny >= gridSize) ny -= gridSize;

          nextDots[i].x = nx;
          nextDots[i].y = ny;
        }
      }

      currentDots = nextDots;
    }

    return currentDots;
  }

  /**
   * Shake pattern randomly
   */
  static shake(dots: DotPoint[], gridSize: number, dotDist: number, strength: number, rng: () => number): DotPoint[] {
    return dots.map(d => {
      let nx = d.x + (rng() - 0.5) * strength * dotDist;
      let ny = d.y + (rng() - 0.5) * strength * dotDist;
      if (nx < 0) nx += gridSize;
      if (ny < 0) ny += gridSize;
      if (nx >= gridSize) nx -= gridSize;
      if (ny >= gridSize) ny -= gridSize;
      return { ...d, x: nx, y: ny };
    });
  }

  /**
   * Jitter coordinates slightly
   */
  static jitter(dots: DotPoint[], gridSize: number, strength: number = 1.5, rng: () => number): DotPoint[] {
    return dots.map(d => {
      let nx = d.x + (rng() - 0.5) * strength;
      let ny = d.y + (rng() - 0.5) * strength;
      if (nx < 0) nx += gridSize;
      if (ny < 0) ny += gridSize;
      if (nx >= gridSize) nx -= gridSize;
      if (ny >= gridSize) ny -= gridSize;
      return { ...d, x: nx, y: ny };
    });
  }

  /**
   * Rotate pattern 45 degrees and scale to fit
   */
  static rotate45(dots: DotPoint[], gridSize: number): DotPoint[] {
    const newDots: DotPoint[] = [];
    const sqrt2 = Math.SQRT2;

    for (let i = 0; i < dots.length; i++) {
      for (let dy = -1.0; dy <= 1.0; dy++) {
        for (let dx = -1.0; dx <= 1.0; dx++) {
          const ox = (dots[i].x + gridSize * (dx - 0.5)) / sqrt2;
          const oy = (dots[i].y + gridSize * (dy - 0.5)) / sqrt2;

          const cx = (ox / sqrt2 + oy / sqrt2) + gridSize * 0.5001;
          const cy = (-ox / sqrt2 + oy / sqrt2) + gridSize * 0.5001;

          if (cx >= 0 && cy >= 0 && cx < gridSize && cy < gridSize) {
            newDots.push({ x: cx, y: cy, type: 2 });
          }
        }
      }
    }
    return newDots;
  }

  /**
   * Swap X and Y coordinates (diagonal mirror)
   */
  static swap(dots: DotPoint[]): DotPoint[] {
    return dots.map(d => ({ ...d, x: d.y, y: d.x }));
  }

  /**
   * Horizontal zigzag displacement
   */
  static zigzag(dots: DotPoint[], gridSize: number): DotPoint[] {
    return dots.map(d => {
      let nx = d.x + (d.y % 16 > 8 ? 4 : -4);
      if (nx < 0) nx += gridSize;
      if (nx >= gridSize) nx -= gridSize;
      return { ...d, x: nx };
    });
  }

  /**
   * Render pattern into standard SVG markup with periodic boundary wrapping
   */
  static buildSvgString(
    dots: DotPoint[],
    selectedSymbols: SymbolSelection[],
    symbolLib: Record<string, CartoSymbol>,
    config: GeneratorConfig
  ): string {
    const {
      gridSize,
      dotRadius,
      symbolColor,
      backgroundColor,
      transparentBackground,
      casingWidth,
      casingColor,
      pixelAlign,
      inlineGeometries,
      seed,
    } = config;

    const rng = seedrandom(seed);

    if (dots.length === 0 || selectedSymbols.length === 0) {
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${gridSize}" height="${gridSize}" viewBox="0 0 ${gridSize} ${gridSize}"></svg>`;
    }

    // Prepare symbol pool according to weights
    const symbolPool: SymbolSelection[] = [];
    selectedSymbols.forEach(s => {
      const w = Math.max(1, Math.round(s.weight || 1));
      for (let k = 0; k < w; k++) {
        symbolPool.push(s);
      }
    });

    // Helper to get raw SVG inner content of a symbol
    const getSymbolSnippet = (sym: CartoSymbol, color: string, casing: boolean, casingW: number) => {
      let rawSvg = Array.isArray(sym.svg) ? sym.svg.join('') : sym.svg;
      
      // Inject fill color if not in casing mode
      if (casing && casingW > 0) {
        return `<g stroke="${casingColor || '#ffffff'}" stroke-width="${casingW}" stroke-linejoin="round" stroke-linecap="round" fill="none">${rawSvg}</g>`;
      }
      return `<g fill="${color}">${rawSvg}</g>`;
    };

    let defsContent = '';
    const symIdMap: Record<string, { main: string; casing?: string }> = {};

    if (!inlineGeometries) {
      selectedSymbols.forEach(sel => {
        const symbol = symbolLib[sel.symbolId];
        if (!symbol) return;
        const mainId = `sym-${sel.symbolId}`;
        const casingId = `sym-${sel.symbolId}-casing`;
        
        symIdMap[sel.symbolId] = { main: mainId, casing: casingWidth > 0 ? casingId : undefined };

        if (casingWidth > 0) {
          defsContent += `<g id="${casingId}">${getSymbolSnippet(symbol, symbolColor, true, casingWidth)}</g>\n`;
        }
        defsContent += `<g id="${mainId}">${getSymbolSnippet(symbol, sel.color || symbolColor, false, 0)}</g>\n`;
      });
    }

    // Periodic placement collector
    let patternElements = '';

    dots.forEach((dot, idx) => {
      let cx = dot.x;
      let cy = dot.y;

      if (pixelAlign) {
        cx = Math.round(cx - 0.5);
        cy = Math.round(cy - 0.5);
      }

      // Pick symbol from pool deterministically based on index + seed
      const symIndex = Math.floor(rng() * symbolPool.length);
      const sel = symbolPool[symIndex];
      const symbol = symbolLib[sel.symbolId];
      if (!symbol) return;

      const scale = sel.scale || 1.0;
      const offX = sel.offsetX === 'auto' ? (symbol.defaultOffsetX ?? 8) : sel.offsetX;
      const offY = sel.offsetY === 'auto' ? (symbol.defaultOffsetY ?? 8) : sel.offsetY;

      // Rotation calculation
      let rotAngle = 0;
      if (sel.randomRotate) {
        // 13 discrete steps or continuous
        rotAngle = Math.floor(rng() * 12) * 30;
      }

      // Render helper for an offset instance
      const renderAt = (x: number, y: number) => {
        const transformStr = `translate(${x}, ${y}) scale(${scale}) rotate(${rotAngle}) translate(${-offX}, ${-offY})`;

        if (inlineGeometries) {
          let inner = '';
          if (casingWidth > 0) {
            inner += getSymbolSnippet(symbol, symbolColor, true, casingWidth);
          }
          inner += getSymbolSnippet(symbol, sel.color || symbolColor, false, 0);
          return `<g transform="${transformStr}">${inner}</g>\n`;
        } else {
          const ids = symIdMap[sel.symbolId];
          let inner = '';
          if (casingWidth > 0 && ids.casing) {
            inner += `<use href="#${ids.casing}" />`;
          }
          inner += `<use href="#${ids.main}" />`;
          return `<g transform="${transformStr}">${inner}</g>\n`;
        }
      };

      // Base symbol placement
      patternElements += renderAt(cx, cy);

      // Periodic boundary wrapping:
      // If close to left border, duplicate to right border
      const threshold = dotRadius * scale + 16;

      if (cx < threshold) {
        patternElements += renderAt(cx + gridSize, cy);
        if (cy < threshold) patternElements += renderAt(cx + gridSize, cy + gridSize);
        else if (cy > gridSize - threshold) patternElements += renderAt(cx + gridSize, cy - gridSize);
      } else if (cx > gridSize - threshold) {
        patternElements += renderAt(cx - gridSize, cy);
        if (cy < threshold) patternElements += renderAt(cx - gridSize, cy + gridSize);
        else if (cy > gridSize - threshold) patternElements += renderAt(cx - gridSize, cy - gridSize);
      }

      if (cy < threshold) {
        patternElements += renderAt(cx, cy + gridSize);
        if (cx < threshold) patternElements += renderAt(cx + gridSize, cy + gridSize);
        else if (cx > gridSize - threshold) patternElements += renderAt(cx - gridSize, cy + gridSize);
      } else if (cy > gridSize - threshold) {
        patternElements += renderAt(cx, cy - gridSize);
        if (cx < threshold) patternElements += renderAt(cx + gridSize, cy - gridSize);
        else if (cx > gridSize - threshold) patternElements += renderAt(cx - gridSize, cy - gridSize);
      }
    });

    const bgRect = transparentBackground
      ? ''
      : `<rect width="${gridSize}" height="${gridSize}" fill="${backgroundColor}" />\n`;

    return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${gridSize}" height="${gridSize}" viewBox="0 0 ${gridSize} ${gridSize}">
  <defs>
    <clipPath id="cartoClip">
      <rect x="0" y="0" width="${gridSize}" height="${gridSize}" />
    </clipPath>
    ${defsContent}
  </defs>
  ${bgRect}
  <g id="Pattern" clip-path="url(#cartoClip)">
    ${patternElements}
  </g>
</svg>`;
  }
}
