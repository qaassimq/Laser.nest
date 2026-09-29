import { AppState, NestingResult, PlacedPart, ShapeType } from '../types';

export const PAPERS: Record<'A4' | 'A3', { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
  A3: { w: 297, h: 420 },
};

export function getSheetDimensions(
  paper: AppState['paper'],
  orientation: AppState['orientation'],
  customW: number,
  customH: number
): { w: number; h: number } {
  let baseW: number;
  let baseH: number;

  if (paper === 'CUSTOM') {
    baseW = customW > 0 ? customW : 300;
    baseH = customH > 0 ? customH : 300;
  } else {
    baseW = PAPERS[paper].w;
    baseH = PAPERS[paper].h;
  }

  if (orientation === 'LAND') {
    return { w: Math.max(baseW, baseH), h: Math.min(baseW, baseH) };
  } else {
    return { w: Math.min(baseW, baseH), h: Math.max(baseW, baseH) };
  }
}

export function computeShapeArea(
  shape: ShapeType,
  w: number,
  h: number,
  radius: number
): number {
  if (shape === 'roundrect') {
    const r = Math.min(radius, w / 2, h / 2);
    return w * h - (4 - Math.PI) * (r * r);
  } else if (shape === 'washer') {
    const outerR = Math.min(w, h) / 2;
    const innerR = outerR * 0.45;
    return Math.PI * (outerR * outerR - innerR * innerR);
  } else if (shape === 'bracket') {
    const holeRadius = 2.0;
    return w * h - 2 * Math.PI * (holeRadius * holeRadius);
  } else if (shape === 'lshape') {
    const thick = Math.min(w, h) * 0.4;
    return thick * h + (w - thick) * thick;
  }
  return w * h;
}

export function computeShapePerimeter(
  shape: ShapeType,
  w: number,
  h: number,
  radius: number
): number {
  if (shape === 'roundrect') {
    const r = Math.min(radius, w / 2, h / 2);
    return 2 * (w - 2 * r) + 2 * (h - 2 * r) + 2 * Math.PI * r;
  } else if (shape === 'washer') {
    const outerR = Math.min(w, h) / 2;
    const innerR = outerR * 0.45;
    return 2 * Math.PI * outerR + 2 * Math.PI * innerR;
  } else if (shape === 'bracket') {
    const holeRadius = 2.0;
    return 2 * (w + h) + 2 * (2 * Math.PI * holeRadius);
  } else if (shape === 'lshape') {
    return 2 * (w + h);
  }
  return 2 * (w + h);
}

export function calculateNesting(state: AppState): NestingResult {
  const startTime = performance.now();
  const sheet = getSheetDimensions(
    state.paper,
    state.orientation,
    state.customW,
    state.customH
  );

  const usableW = Math.max(0, sheet.w - state.margin * 2);
  const usableH = Math.max(0, sheet.h - state.margin * 2);

  const pw = state.partW;
  const ph = state.partH;
  const sp = state.spacing;

  // Evaluate candidate orientations:
  // Candidate A: 0 rotation (pw x ph)
  // Candidate B: 90 rotation (ph x pw) if allowRotate is enabled
  interface LayoutCandidate {
    rotated: boolean;
    partWidth: number;
    partHeight: number;
    cols: number;
    rows: number;
    completeCount: number;
    partialCount: number;
    parts: PlacedPart[];
  }

  function generateLayout(
    partW: number,
    partH: number,
    rotated: boolean
  ): LayoutCandidate {
    const parts: PlacedPart[] = [];
    if (usableW < partW || usableH < partH) {
      return {
        rotated,
        partWidth: partW,
        partHeight: partH,
        cols: 0,
        rows: 0,
        completeCount: 0,
        partialCount: 0,
        parts: [],
      };
    }

    // Determine max columns and rows to evaluate
    const maxCols = state.onlyCompleteShapes
      ? Math.floor((usableW + sp) / (partW + sp))
      : Math.ceil((sheet.w - state.margin) / (partW + sp));

    const maxRows = state.onlyCompleteShapes
      ? Math.floor((usableH + sp) / (partH + sp))
      : Math.ceil((sheet.h - state.margin) / (partH + sp));

    for (let r = 0; r < maxRows; r++) {
      for (let c = 0; c < maxCols; c++) {
        let x = state.margin + c * (partW + sp);
        const y = state.margin + r * (partH + sp);

        if (state.strategy === 'stagger' && r % 2 === 1) {
          x += (partW + sp) * 0.5;
        }

        // Complete check: must sit strictly within usable margins
        const isComplete =
          x >= state.margin - 0.001 &&
          y >= state.margin - 0.001 &&
          x + partW <= sheet.w - state.margin + 0.001 &&
          y + partH <= sheet.h - state.margin + 0.001;

        // If part extends even beyond physical sheet edge, always discard
        if (x + 1 > sheet.w || y + 1 > sheet.h) {
          continue;
        }

        // If only complete shapes is active, omit any incomplete/partial shape
        if (state.onlyCompleteShapes && !isComplete) {
          continue;
        }

        parts.push({
          x,
          y,
          w: partW,
          h: partH,
          rotated,
          row: r,
          col: c,
          isComplete,
          index: parts.length + 1,
        });
      }
    }

    const completeCount = parts.filter((p) => p.isComplete).length;
    const partialCount = parts.filter((p) => !p.isComplete).length;

    return {
      rotated,
      partWidth: partW,
      partHeight: partH,
      cols: maxCols,
      rows: maxRows,
      completeCount,
      partialCount,
      parts,
    };
  }

  const candA = generateLayout(pw, ph, false);
  let best = candA;

  if (state.allowRotate) {
    const candB = generateLayout(ph, pw, true);
    if (candB.parts.length > best.parts.length) {
      best = candB;
    }
  }

  const singleArea = computeShapeArea(state.shape, pw, ph, state.radius);
  const singlePerimeter = computeShapePerimeter(state.shape, pw, ph, state.radius);
  const totalParts = best.parts.length;
  const sheetArea = sheet.w * sheet.h;
  const totalPartArea = totalParts * singleArea;

  const efficiency = sheetArea > 0 ? Math.min(100, (totalPartArea / sheetArea) * 100) : 0;
  const scrap = Math.max(0, 100 - efficiency);

  // Rapid travel between parts ~ 15mm
  const rapidTravel = totalParts * 15;
  const totalCutLengthMm = totalParts * singlePerimeter + rapidTravel;
  const pathLengthMeters = totalCutLengthMm / 1000;

  const endTime = performance.now();
  const solveTimeMs = Math.max(0.4, Number((endTime - startTime).toFixed(1)));

  return {
    sheetW: sheet.w,
    sheetH: sheet.h,
    usableW,
    usableH,
    cols: best.cols,
    rows: best.rows,
    totalParts,
    completeCount: best.completeCount,
    partialCount: best.partialCount,
    efficiency,
    scrap,
    pathLengthMeters,
    solveTimeMs,
    parts: best.parts,
  };
}
