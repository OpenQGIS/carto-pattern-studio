export type GridPatternType = 'random' | 'triangular' | 'triangular2' | 'square' | 'snub';

export interface DotPoint {
  x: number;
  y: number;
  type?: number;
}

export interface CartoSymbol {
  id: string;
  name: string;
  category: 'forest' | 'water' | 'geology' | 'agriculture' | 'markers' | 'custom';
  categoryLabel: string;
  svg: string | string[];
  defaultOffsetX?: number;
  defaultOffsetY?: number;
  viewBox?: string;
}

export interface SymbolSelection {
  symbolId: string;
  weight: number; // For multi-symbol mixing (e.g. 70% deciduous, 30% pine)
  scale: number;
  offsetX: number | 'auto';
  offsetY: number | 'auto';
  randomRotate: boolean;
  color?: string; // override color if set
}

export interface GeneratorConfig {
  gridSize: number;       // Size of tile: 64, 128, 256, 512
  dotDist: number;        // Average distance between points
  dotRadius: number;      // Influence radius for relaxation
  dotRadiusY: number;     // Influence radius Y
  metric: number;         // Distance metric (2 = Euclidean, >100 = Chebyshev)
  gridType: GridPatternType;
  seed: string;
  
  // Appearance
  symbolColor: string;
  backgroundColor: string;
  transparentBackground: boolean;
  casingWidth: number;
  casingColor: string;
  pixelAlign: boolean;
  inlineGeometries: boolean; // For GIS/QGIS compatibility
}

export interface PresetPattern {
  id: string;
  name: string;
  description: string;
  config: Partial<GeneratorConfig>;
  symbols: SymbolSelection[];
}
