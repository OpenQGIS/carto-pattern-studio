import React, { useState, useEffect, useMemo, useCallback } from 'react';
import seedrandom from 'seedrandom';
import { Header } from './components/Header';
import { Viewport } from './components/Viewport';
import { SymbolControlPanel } from './components/SymbolControlPanel';
import { DistributionControls } from './components/DistributionControls';
import { AppearanceControls } from './components/AppearanceControls';
import { SymbolPickerModal } from './components/SymbolPickerModal';
import { ExportModal } from './components/ExportModal';
import { HelpModal } from './components/HelpModal';
import { CARTOGRAPHIC_SYMBOLS } from './data/symbolsData';
import { CARTOGRAPHIC_PRESETS } from './data/presets';
import { PatternEngine } from './engine/patternEngine';
import { CartoSymbol, DotPoint, GeneratorConfig, PresetPattern, SymbolSelection } from './types';

const DEFAULT_CONFIG: GeneratorConfig = {
  gridSize: 256,
  dotDist: 34,
  dotRadius: 40,
  dotRadiusY: 40,
  metric: 2,
  gridType: 'random',
  seed: 'carto99',
  symbolColor: '#2d6a4f',
  backgroundColor: '#d8f3dc',
  transparentBackground: false,
  casingWidth: 0,
  casingColor: '#ffffff',
  pixelAlign: false,
  inlineGeometries: true,
};

export default function App() {
  const [config, setConfig] = useState<GeneratorConfig>(DEFAULT_CONFIG);
  const [selectedSymbols, setSelectedSymbols] = useState<SymbolSelection[]>([
    {
      symbolId: 'tree-broad-o1',
      weight: 6,
      scale: 1.1,
      offsetX: 'auto',
      offsetY: 'auto',
      randomRotate: false,
      color: '#2d6a4f',
    },
    {
      symbolId: 'tree-needle-o1',
      weight: 4,
      scale: 1.1,
      offsetX: 'auto',
      offsetY: 'auto',
      randomRotate: false,
      color: '#1b4332',
    },
  ]);
  const [customSymbols, setCustomSymbols] = useState<CartoSymbol[]>([]);
  const [activePresetId, setActivePresetId] = useState<string>('osm-mixed-forest');
  const [dots, setDots] = useState<DotPoint[]>([]);

  // Modals state
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Symbol lookup map
  const symbolLib = useMemo(() => {
    const map: Record<string, CartoSymbol> = {};
    CARTOGRAPHIC_SYMBOLS.forEach((s) => {
      map[s.id] = s;
    });
    customSymbols.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [customSymbols]);

  // Generate initial grid
  const regenerateGrid = useCallback(() => {
    const rng = seedrandom(config.seed);
    const newDots = PatternEngine.generateGrid(
      config.gridSize,
      config.dotDist,
      config.gridType,
      rng
    );
    // Relax once initially to ensure nice spacing
    const relaxed = PatternEngine.relax(
      newDots,
      config.gridSize,
      config.dotRadius,
      config.dotRadiusY,
      config.metric,
      2
    );
    setDots(relaxed);
  }, [config.gridSize, config.dotDist, config.gridType, config.dotRadius, config.dotRadiusY, config.metric, config.seed]);

  // Initial mount trigger
  useEffect(() => {
    regenerateGrid();
  }, [regenerateGrid]);

  // Handlers for relaxation and transforms
  const handleRelax = (steps: number) => {
    const relaxed = PatternEngine.relax(
      dots,
      config.gridSize,
      config.dotRadius,
      config.dotRadiusY,
      config.metric,
      steps
    );
    setDots(relaxed);
  };

  const handleShake = () => {
    const rng = seedrandom();
    const shaken = PatternEngine.shake(dots, config.gridSize, config.dotDist, 0.25, rng);
    setDots(shaken);
  };

  const handleJitter = () => {
    const rng = seedrandom();
    const jittered = PatternEngine.jitter(dots, config.gridSize, 2.0, rng);
    setDots(jittered);
  };

  const handleRotate45 = () => {
    const rotated = PatternEngine.rotate45(dots, config.gridSize);
    setDots(rotated);
  };

  const handleSwap = () => {
    const swapped = PatternEngine.swap(dots);
    setDots(swapped);
  };

  const handleZigzag = () => {
    const zigzagged = PatternEngine.zigzag(dots, config.gridSize);
    setDots(zigzagged);
  };

  // Symbol management
  const handleSelectSymbol = (symbol: CartoSymbol) => {
    const exists = selectedSymbols.some((s) => s.symbolId === symbol.id);
    if (!exists) {
      setSelectedSymbols((prev) => [
        ...prev,
        {
          symbolId: symbol.id,
          weight: 5,
          scale: 1.0,
          offsetX: 'auto',
          offsetY: 'auto',
          randomRotate: false,
          color: config.symbolColor,
        },
      ]);
    }
    setIsPickerOpen(false);
  };

  const handleUpdateSymbol = (index: number, updates: Partial<SymbolSelection>) => {
    setSelectedSymbols((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], ...updates };
      return copy;
    });
  };

  const handleRemoveSymbol = (index: number) => {
    setSelectedSymbols((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddCustomSymbol = (symbol: CartoSymbol) => {
    setCustomSymbols((prev) => [symbol, ...prev]);
  };

  // Preset switching
  const handleSelectPreset = (preset: PresetPattern) => {
    setActivePresetId(preset.id);
    setConfig((prev) => ({
      ...prev,
      ...preset.config,
    }));
    if (preset.symbols) {
      setSelectedSymbols(preset.symbols);
    }
    setTimeout(regenerateGrid, 50);
  };

  const handleReset = () => {
    const defaultPreset = CARTOGRAPHIC_PRESETS[0];
    handleSelectPreset(defaultPreset);
  };

  // Generate SVG string using engine
  const svgContent = useMemo(() => {
    return PatternEngine.buildSvgString(dots, selectedSymbols, symbolLib, config);
  }, [dots, selectedSymbols, symbolLib, config]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Navbar */}
      <Header
        onSelectPreset={handleSelectPreset}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onReset={handleReset}
        activePresetId={activePresetId}
      />

      {/* Main Studio Workspace */}
      <main className="flex-1 flex flex-col lg:flex-row p-4 gap-4 overflow-hidden">
        {/* Left Side: Center Viewport */}
        <section className="flex-1 flex flex-col min-h-[460px] lg:min-h-0">
          <Viewport
            svgContent={svgContent}
            dots={dots}
            config={config}
          />
        </section>

        {/* Right Side: Control Panels (Scrollable) */}
        <aside className="w-full lg:w-[420px] xl:w-[460px] flex flex-col space-y-4 overflow-y-auto max-h-[calc(100vh-5rem)] pr-1">
          {/* Symbol Layers Panel */}
          <SymbolControlPanel
            selectedSymbols={selectedSymbols}
            symbolLib={symbolLib}
            onUpdateSymbol={handleUpdateSymbol}
            onRemoveSymbol={handleRemoveSymbol}
            onOpenPicker={() => setIsPickerOpen(true)}
          />

          {/* Distribution & Relaxation Panel */}
          <DistributionControls
            config={config}
            onUpdateConfig={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
            onRegenerate={regenerateGrid}
            onRelax={handleRelax}
            onShake={handleShake}
            onJitter={handleJitter}
            onRotate45={handleRotate45}
            onSwap={handleSwap}
            onZigzag={handleZigzag}
            dotCount={dots.length}
          />

          {/* Appearance & GIS Compatibility Panel */}
          <AppearanceControls
            config={config}
            onUpdateConfig={(updates) => setConfig((prev) => ({ ...prev, ...updates }))}
          />
        </aside>
      </main>

      {/* Symbol Picker Modal */}
      <SymbolPickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelectSymbol={handleSelectSymbol}
        onAddCustomSymbol={handleAddCustomSymbol}
        customSymbols={customSymbols}
        activeSymbolIds={selectedSymbols.map((s) => s.symbolId)}
      />

      {/* Export & Download Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        svgContent={svgContent}
        config={config}
      />

      {/* Help & Guide Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </div>
  );
}
