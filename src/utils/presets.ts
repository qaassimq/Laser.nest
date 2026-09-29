import { AppState, ConfigurationPreset } from '../types';

export const DEFAULT_PRESETS: ConfigurationPreset[] = [
  {
    id: 'preset-default-badges',
    name: 'Acrylic Maker Badges (48x32mm, A4)',
    createdAt: Date.now() - 86400000 * 3,
    isBuiltIn: true,
    config: {
      paper: 'A4',
      orientation: 'PORT',
      customW: 300,
      customH: 200,
      shape: 'rect',
      partW: 48.0,
      partH: 32.0,
      lockAspect: true,
      radius: 2.5,
      kerf: 0.15,
      spacing: 3.0,
      margin: 8.0,
      strategy: 'ortho',
      allowRotate: true,
      onlyCompleteShapes: true,
      renderMode: 'corners',
      cornerLen: 4.0,
      showGuides: true,
      showCenters: false,
      showTotalShapesOverlay: true,
      showPartNumbers: true,
      material: '3.0mm Acrylic / Birch',
    },
  },
  {
    id: 'preset-default-washers',
    name: 'Silicone Gaskets & Washers (Ø36mm, A4)',
    createdAt: Date.now() - 86400000 * 2,
    isBuiltIn: true,
    config: {
      paper: 'A4',
      orientation: 'PORT',
      customW: 300,
      customH: 200,
      shape: 'washer',
      partW: 36.0,
      partH: 36.0,
      lockAspect: true,
      radius: 0,
      kerf: 0.12,
      spacing: 2.5,
      margin: 6.0,
      strategy: 'stagger',
      allowRotate: false,
      onlyCompleteShapes: true,
      renderMode: 'corners',
      cornerLen: 3.5,
      showGuides: true,
      showCenters: true,
      showTotalShapesOverlay: true,
      showPartNumbers: true,
      material: '0.8mm Brass Shim',
    },
  },
  {
    id: 'preset-default-brackets',
    name: 'CNC Dual-Hole Brackets (64x38mm, A3)',
    createdAt: Date.now() - 86400000,
    isBuiltIn: true,
    config: {
      paper: 'A3',
      orientation: 'LAND',
      customW: 420,
      customH: 297,
      shape: 'bracket',
      partW: 64.0,
      partH: 38.0,
      lockAspect: false,
      radius: 3.0,
      kerf: 0.2,
      spacing: 4.0,
      margin: 10.0,
      strategy: 'ortho',
      allowRotate: true,
      onlyCompleteShapes: true,
      renderMode: 'full',
      cornerLen: 4.0,
      showGuides: true,
      showCenters: true,
      showTotalShapesOverlay: true,
      showPartNumbers: true,
      material: '6.0mm Plywood',
    },
  },
];

const PRESETS_STORAGE_KEY = 'laser_nest_presets_v2';

export function loadSavedPresets(): ConfigurationPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_STORAGE_KEY);
    if (!raw) return DEFAULT_PRESETS;
    const parsed = JSON.parse(raw) as ConfigurationPreset[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load presets from localStorage', err);
  }
  return DEFAULT_PRESETS;
}

export function savePresetsToStorage(presets: ConfigurationPreset[]): void {
  try {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
  } catch (err) {
    console.error('Failed to save presets to localStorage', err);
  }
}

export function extractConfigFromState(state: AppState): ConfigurationPreset['config'] {
  return {
    paper: state.paper,
    orientation: state.orientation,
    customW: state.customW,
    customH: state.customH,
    shape: state.shape,
    customImage: state.customImage,
    customImageName: state.customImageName,
    customImageAspect: state.customImageAspect,
    imageOverlay: state.imageOverlay,
    imageOverlayName: state.imageOverlayName,
    imageMargin: state.imageMargin,
    imagePadding: state.imagePadding,
    imageFit: state.imageFit,
    imageAlignX: state.imageAlignX,
    imageAlignY: state.imageAlignY,
    imageOffsetX: state.imageOffsetX,
    imageOffsetY: state.imageOffsetY,
    imageScale: state.imageScale,
    hideShapeLines: state.hideShapeLines,
    partW: state.partW,
    partH: state.partH,
    lockAspect: state.lockAspect,
    radius: state.radius,
    kerf: state.kerf,
    spacing: state.spacing,
    margin: state.margin,
    strategy: state.strategy,
    allowRotate: state.allowRotate,
    onlyCompleteShapes: state.onlyCompleteShapes,
    renderMode: state.renderMode,
    cornerLen: state.cornerLen,
    showGuides: state.showGuides,
    showCenters: state.showCenters,
    showTotalShapesOverlay: state.showTotalShapesOverlay,
    showPartNumbers: state.showPartNumbers,
    exportObjectsOnly: state.exportObjectsOnly,
    exportTransparentBg: state.exportTransparentBg,
    showRegistrationMarks: state.showRegistrationMarks,
    material: state.material,
  };
}
