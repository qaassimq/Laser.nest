export type ShapeType = 'rect' | 'roundrect' | 'washer' | 'bracket' | 'lshape' | 'custom';
export type PaperType = 'A4' | 'A3' | 'CUSTOM';
export type Orientation = 'PORT' | 'LAND';
export type Strategy = 'ortho' | 'stagger';
export type RenderMode = 'full' | 'corners';
export type ExportFormat = 'PNG' | 'SVG' | 'DXF';
export type ImageAlignX = 'left' | 'center' | 'right';
export type ImageAlignY = 'top' | 'center' | 'bottom';

export interface ConfigurationPreset {
  id: string;
  name: string;
  createdAt: number;
  isBuiltIn?: boolean;
  config: {
    paper: PaperType;
    orientation: Orientation;
    customW: number;
    customH: number;
    shape: ShapeType;
    customImage?: string | null;
    customImageName?: string | null;
    customImageAspect?: number;
    imageOverlay?: string | null;
    imageOverlayName?: string | null;
    imageMargin?: number;
    imagePadding?: number;
    imageFit?: 'contain' | 'stretch' | 'cover';
    imageAlignX?: ImageAlignX;
    imageAlignY?: ImageAlignY;
    imageOffsetX?: number;
    imageOffsetY?: number;
    imageScale?: number;
    hideShapeLines?: boolean;
    partW: number;
    partH: number;
    lockAspect?: boolean;
    radius: number;
    kerf: number;
    spacing: number;
    margin: number;
    strategy: Strategy;
    allowRotate: boolean;
    onlyCompleteShapes: boolean;
    renderMode: RenderMode;
    cornerLen: number;
    showGuides: boolean;
    showCenters: boolean;
    showTotalShapesOverlay: boolean;
    showPartNumbers: boolean;
    exportObjectsOnly?: boolean;
    exportTransparentBg?: boolean;
    showRegistrationMarks?: boolean;
    material: string;
  };
}

export interface PlacedPart {
  x: number; // mm from sheet origin
  y: number; // mm from sheet origin
  w: number;
  h: number;
  rotated: boolean;
  row: number;
  col: number;
  isComplete: boolean; // whether the shape is 100% complete within usable bounds
  index: number; // 1-based part sequence number
}

export interface NestingResult {
  sheetW: number;
  sheetH: number;
  usableW: number;
  usableH: number;
  cols: number;
  rows: number;
  totalParts: number;
  completeCount: number;
  partialCount: number;
  efficiency: number;
  scrap: number;
  pathLengthMeters: number;
  solveTimeMs: number;
  parts: PlacedPart[];
}

export interface AppState {
  paper: PaperType;
  orientation: Orientation;
  customW: number;
  customH: number;
  shape: ShapeType;
  customImage: string | null; // Data URL for imported shape or picture
  customImageName: string | null;
  customImageAspect: number; // width / height ratio
  imageOverlay: string | null; // Data URL for image overlaid on top of parts
  imageOverlayName: string | null;
  imageMargin: number; // mm margin from shape outer boundary
  imagePadding: number; // mm inset/padding for image inside shape
  imageFit: 'contain' | 'stretch' | 'cover'; // Aspect fit mode for overlaid image
  imageAlignX: ImageAlignX; // 'left' | 'center' | 'right' horizontal placement
  imageAlignY: ImageAlignY; // 'top' | 'center' | 'bottom' vertical placement
  imageOffsetX: number; // mm fine-tuning offset in X
  imageOffsetY: number; // mm fine-tuning offset in Y
  imageScale: number; // % scale sizing inside part (default 100)
  hideShapeLines: boolean; // Hide cut/corner/contour lines of the shape
  partW: number;
  partH: number;
  lockAspect: boolean;
  radius: number;
  kerf: number;
  spacing: number;
  margin: number;
  strategy: Strategy;
  allowRotate: boolean;
  onlyCompleteShapes: boolean;
  renderMode: RenderMode;
  cornerLen: number;
  showGuides: boolean;
  showCenters: boolean;
  showTotalShapesOverlay: boolean; // Displays total shapes count stamp on sheet
  showPartNumbers: boolean; // Displays #01, #02... on each part
  exportObjectsOnly: boolean; // Hide numbering, keys, stamps, and guides to export pure objects only
  exportTransparentBg: boolean; // Transparent sheet background instead of white canvas on export
  showRegistrationMarks: boolean; // Sheet 4-corner registration marks/keys
  zoom: number;
  pan: { x: number; y: number };
  exportFormat: ExportFormat;
  exportDPI: number;
  material: string;
}
