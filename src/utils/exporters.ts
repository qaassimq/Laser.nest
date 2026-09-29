import { AppState, NestingResult, PlacedPart } from '../types';

export function generateSVG(
  state: AppState,
  result: NestingResult,
  options: {
    forPrint?: boolean;
    omitGuides?: boolean;
    objectsOnly?: boolean;
    transparentBg?: boolean;
  } = {}
): string {
  const { sheetW, sheetH, parts } = result;
  const tickLen = Math.min(state.cornerLen, state.partW * 0.45, state.partH * 0.45);
  const forPrint = options.forPrint ?? false;
  const isObjectsOnly = options.objectsOnly ?? state.exportObjectsOnly ?? false;
  const isTransparent = options.transparentBg ?? state.exportTransparentBg ?? false;

  let paths = '';

  // Clamping Margin Boundary: ONLY if NOT in print mode, NOT in objects-only mode, and showGuides is enabled
  if (!forPrint && !isObjectsOnly && state.showGuides && !options.omitGuides) {
    paths += `  <!-- Clamping Margin Guide -->\n`;
    paths += `  <rect x="${state.margin}" y="${state.margin}" width="${result.usableW}" height="${result.usableH}" fill="none" stroke="#4b8eff" stroke-width="0.2" stroke-dasharray="2,2" opacity="0.6"/>\n`;
  }

  // Sheet 4-Corner Registration Marks (omitted in print mode and objects-only mode so edges stay pure)
  if (!forPrint && !isObjectsOnly && state.showRegistrationMarks !== false) {
    const sOff = 4.0;
    const sTick = 6.0;
    paths += `  <!-- Sheet Registration Marks -->\n`;
    paths += `  <path d="M ${sOff} ${sOff + sTick} L ${sOff} ${sOff} L ${sOff + sTick} ${sOff}" fill="none" stroke="#000000" stroke-width="0.4"/>\n`;
    paths += `  <path d="M ${sheetW - sOff - sTick} ${sOff} L ${sheetW - sOff} ${sOff} L ${sheetW - sOff} ${sOff + sTick}" fill="none" stroke="#000000" stroke-width="0.4"/>\n`;
    paths += `  <path d="M ${sOff} ${sheetH - sOff - sTick} L ${sOff} ${sheetH - sOff} L ${sOff + sTick} ${sheetH - sOff}" fill="none" stroke="#000000" stroke-width="0.4"/>\n`;
    paths += `  <path d="M ${sheetW - sOff - sTick} ${sheetH - sOff} L ${sheetW - sOff} ${sheetH - sOff} L ${sheetW - sOff} ${sheetH - sOff - sTick}" fill="none" stroke="#000000" stroke-width="0.4"/>\n`;
  }

  // Nested Parts (ONLY what needs to be printed/cut)
  paths += `  <!-- Nested Fabrication Parts (${parts.length} total) -->\n`;
  for (const part of parts) {
    const { x, y, w, h } = part;

    // 1. Underlying Shape Cut Lines (unless hideShapeLines is enabled)
    if (!state.hideShapeLines) {
      if (state.shape === 'custom') {
        // Custom imported image / shape
        if (state.customImage) {
          paths += `  <image href="${state.customImage}" x="${x}" y="${y}" width="${w}" height="${h}" preserveAspectRatio="none"/>\n`;
        }
        if (state.renderMode === 'corners') {
          const clen = Math.min(tickLen, w * 0.45, h * 0.45);
          paths += `  <path d="M ${x} ${y + clen} L ${x} ${y} L ${x + clen} ${y}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
          paths += `  <path d="M ${x + w - clen} ${y} L ${x + w} ${y} L ${x + w} ${y + clen}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
          paths += `  <path d="M ${x + w} ${y + h - clen} L ${x + w} ${y + h} L ${x + w - clen} ${y + h}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
          paths += `  <path d="M ${x + clen} ${y + h} L ${x} ${y + h} L ${x} ${y + h - clen}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
        } else {
          paths += `  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#004493" stroke-width="0.3"/>\n`;
        }
      } else if (state.renderMode === 'corners') {
        // Shape-aware corner & registration marks (ink-saver)
        const clen = Math.min(tickLen, w * 0.45, h * 0.45);
        if (state.shape === 'washer') {
          const cx = x + w / 2;
          const cy = y + h / 2;
          const outerR = Math.min(w, h) / 2;
          const innerR = outerR * 0.45;
          const qlen = Math.min(clen, 5.0);
          // Outer quadrant ticks
          paths += `  <line x1="${cx}" y1="${cy - outerR}" x2="${cx}" y2="${cy - outerR + qlen}" stroke="#101418" stroke-width="0.35"/>\n`;
          paths += `  <line x1="${cx}" y1="${cy + outerR}" x2="${cx}" y2="${cy + outerR - qlen}" stroke="#101418" stroke-width="0.35"/>\n`;
          paths += `  <line x1="${cx - outerR}" y1="${cy}" x2="${cx - outerR + qlen}" y2="${cy}" stroke="#101418" stroke-width="0.35"/>\n`;
          paths += `  <line x1="${cx + outerR}" y1="${cy}" x2="${cx + outerR - qlen}" y2="${cy}" stroke="#101418" stroke-width="0.35"/>\n`;
          // Inner hole registration cross
          paths += `  <line x1="${cx - innerR}" y1="${cy}" x2="${cx + innerR}" y2="${cy}" stroke="#101418" stroke-width="0.3"/>\n`;
          paths += `  <line x1="${cx}" y1="${cy - innerR}" x2="${cx}" y2="${cy + innerR}" stroke="#101418" stroke-width="0.3"/>\n`;
        } else if (state.shape === 'roundrect' && state.radius > 0) {
          const r = Math.min(state.radius, w / 2, h / 2);
          paths += `  <path d="M ${x} ${y + r} A ${r} ${r} 0 0 1 ${x + r} ${y}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
          paths += `  <path d="M ${x + w - r} ${y} A ${r} ${r} 0 0 1 ${x + w} ${y + r}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
          paths += `  <path d="M ${x + w} ${y + h - r} A ${r} ${r} 0 0 1 ${x + w - r} ${y + h}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
          paths += `  <path d="M ${x + r} ${y + h} A ${r} ${r} 0 0 1 ${x} ${y + h - r}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
        } else if (state.shape === 'bracket') {
          paths += `  <path d="M ${x} ${y + clen} L ${x} ${y} L ${x + clen} ${y}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
          paths += `  <path d="M ${x + w - clen} ${y} L ${x + w} ${y} L ${x + w} ${y + clen}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
          paths += `  <path d="M ${x + w} ${y + h - clen} L ${x + w} ${y + h} L ${x + w - clen} ${y + h}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
          paths += `  <path d="M ${x + clen} ${y + h} L ${x} ${y + h} L ${x} ${y + h - clen}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
          // Dual hole crosshairs
          const h1x = x + w * 0.25;
          const h2x = x + w * 0.75;
          const hy = y + h / 2;
          paths += `  <line x1="${h1x - 2}" y1="${hy}" x2="${h1x + 2}" y2="${hy}" stroke="#101418" stroke-width="0.3"/>\n`;
          paths += `  <line x1="${h1x}" y1="${hy - 2}" x2="${h1x}" y2="${hy + 2}" stroke="#101418" stroke-width="0.3"/>\n`;
          paths += `  <line x1="${h2x - 2}" y1="${hy}" x2="${h2x + 2}" y2="${hy}" stroke="#101418" stroke-width="0.3"/>\n`;
          paths += `  <line x1="${h2x}" y1="${hy - 2}" x2="${h2x}" y2="${hy + 2}" stroke="#101418" stroke-width="0.3"/>\n`;
        } else if (state.shape === 'lshape') {
          const thick = Math.min(w, h) * 0.4;
          paths += `  <path d="M ${x} ${y + clen} L ${x} ${y} L ${x + clen} ${y}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
          paths += `  <path d="M ${x + thick - clen} ${y} L ${x + thick} ${y} L ${x + thick} ${y + clen}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
          paths += `  <path d="M ${x + thick} ${y + h - thick - clen} L ${x + thick} ${y + h - thick} L ${x + thick + clen} ${y + h - thick}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
          paths += `  <path d="M ${x + w - clen} ${y + h - thick} L ${x + w} ${y + h - thick} L ${x + w} ${y + h - thick + clen}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
          paths += `  <path d="M ${x + w} ${y + h - clen} L ${x + w} ${y + h} L ${x + w - clen} ${y + h}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
          paths += `  <path d="M ${x + clen} ${y + h} L ${x} ${y + h} L ${x} ${y + h - clen}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
        } else {
          // TL
          paths += `  <path d="M ${x} ${y + clen} L ${x} ${y} L ${x + clen} ${y}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
          // TR
          paths += `  <path d="M ${x + w - clen} ${y} L ${x + w} ${y} L ${x + w} ${y + clen}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
          // BR
          paths += `  <path d="M ${x + w} ${y + h - clen} L ${x + w} ${y + h} L ${x + w - clen} ${y + h}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
          // BL
          paths += `  <path d="M ${x + clen} ${y + h} L ${x} ${y + h} L ${x} ${y + h - clen}" fill="none" stroke="#101418" stroke-width="0.35"/>\n`;
        }
      } else {
        // Full shape geometry
        if (state.shape === 'roundrect' && state.radius > 0) {
          const r = Math.min(state.radius, w / 2, h / 2);
          paths += `  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" ry="${r}" fill="none" stroke="#004493" stroke-width="0.3"/>\n`;
        } else if (state.shape === 'washer') {
          const cx = x + w / 2;
          const cy = y + h / 2;
          const outerR = Math.min(w, h) / 2;
          const innerR = outerR * 0.45;
          paths += `  <circle cx="${cx}" cy="${cy}" r="${outerR}" fill="none" stroke="#004493" stroke-width="0.3"/>\n`;
          paths += `  <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="#004493" stroke-width="0.3"/>\n`;
        } else if (state.shape === 'bracket') {
          paths += `  <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" ry="3" fill="none" stroke="#004493" stroke-width="0.3"/>\n`;
          paths += `  <circle cx="${x + w * 0.25}" cy="${y + h / 2}" r="2" fill="none" stroke="#004493" stroke-width="0.3"/>\n`;
          paths += `  <circle cx="${x + w * 0.75}" cy="${y + h / 2}" r="2" fill="none" stroke="#004493" stroke-width="0.3"/>\n`;
        } else if (state.shape === 'lshape') {
          const thick = Math.min(w, h) * 0.4;
          const d = `M ${x} ${y} L ${x + thick} ${y} L ${x + thick} ${y + h - thick} L ${x + w} ${y + h - thick} L ${x + w} ${y + h} L ${x} ${y + h} Z`;
          paths += `  <path d="${d}" fill="none" stroke="#004493" stroke-width="0.3"/>\n`;
        } else {
          paths += `  <rect x="${x}" y="${y}" width="${w}" height="${h}" fill="none" stroke="#004493" stroke-width="0.3"/>\n`;
        }
      }

      if (state.showCenters) {
        const cx = x + w / 2;
        const cy = y + h / 2;
        const csz = 2.0;
        paths += `  <line x1="${cx - csz}" y1="${cy}" x2="${cx + csz}" y2="${cy}" stroke="#8b90a0" stroke-width="0.2"/>\n`;
        paths += `  <line x1="${cx}" y1="${cy - csz}" x2="${cx}" y2="${cy + csz}" stroke="#8b90a0" stroke-width="0.2"/>\n`;
      }
    }

    // 2. Overlaid Image on Top of Shape
    if (state.imageOverlay) {
      const inset = (state.imageMargin || 0) + (state.imagePadding || 0);
      const imgX = x + inset;
      const imgY = y + inset;
      const imgW = Math.max(0.1, w - inset * 2);
      const imgH = Math.max(0.1, h - inset * 2);
      const fit = state.imageFit || 'contain';
      const alignX = state.imageAlignX || 'center';
      const alignY = state.imageAlignY || 'center';
      const offX = state.imageOffsetX || 0;
      const offY = state.imageOffsetY || 0;
      const scaleMultiplier = (state.imageScale ?? 100) / 100;

      let xAspect = 'xMid';
      if (alignX === 'left') xAspect = 'xMin';
      else if (alignX === 'right') xAspect = 'xMax';

      let yAspect = 'YMid';
      if (alignY === 'top') yAspect = 'YMin';
      else if (alignY === 'bottom') yAspect = 'YMax';

      let preserveAspect = `${xAspect}${yAspect} meet`;
      if (fit === 'stretch') preserveAspect = 'none';
      else if (fit === 'cover') preserveAspect = `${xAspect}${yAspect} slice`;

      if (offX !== 0 || offY !== 0 || scaleMultiplier !== 1) {
        const transX = offX + (scaleMultiplier !== 1 ? (imgW * (1 - scaleMultiplier)) / 2 : 0);
        const transY = offY + (scaleMultiplier !== 1 ? (imgH * (1 - scaleMultiplier)) / 2 : 0);
        paths += `  <svg x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" overflow="hidden">\n`;
        paths += `    <g transform="translate(${transX.toFixed(2)}, ${transY.toFixed(2)}) scale(${scaleMultiplier.toFixed(3)})">\n`;
        paths += `      <image href="${state.imageOverlay}" x="0" y="0" width="${imgW}" height="${imgH}" preserveAspectRatio="${preserveAspect}"/>\n`;
        paths += `    </g>\n`;
        paths += `  </svg>\n`;
      } else {
        paths += `  <svg x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" overflow="hidden">\n`;
        paths += `    <image href="${state.imageOverlay}" x="0" y="0" width="${imgW}" height="${imgH}" preserveAspectRatio="${preserveAspect}"/>\n`;
        paths += `  </svg>\n`;
      }
    }

    if (state.showPartNumbers && !isObjectsOnly) {
      paths += `  <text x="${x + w - 1.5}" y="${y + h - 1.5}" font-size="2.2" font-family="'JetBrains Mono', monospace" text-anchor="end" fill="#101418">#${String(part.index).padStart(2, '0')}</text>\n`;
    }
  }

  // Base sheet: If transparent, omit rect. If forPrint or isObjectsOnly, pure white with NO outer stroke/border line so paper edges stay clean
  const baseRect = isTransparent
    ? ''
    : forPrint || isObjectsOnly
    ? `  <rect x="0" y="0" width="${sheetW}" height="${sheetH}" fill="#ffffff" stroke="none"/>`
    : `  <rect x="0" y="0" width="${sheetW}" height="${sheetH}" fill="#ffffff" stroke="#c1c6d7" stroke-width="0.2"/>`;

  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<!-- Generated by LASER.NEST // STUDIO v2.4 (CAD Sheet Nesting Utility) -->
<!-- Mode: ${forPrint ? 'PRINT (CLEAN PARTS ONLY - ZERO GRIDS/GUIDES)' : isObjectsOnly ? 'CLEAN OBJECTS ONLY' : 'VECTOR'} | Parts: ${parts.length} -->
<svg width="${sheetW}mm" height="${sheetH}mm" viewBox="0 0 ${sheetW} ${sheetH}" xmlns="http://www.w3.org/2000/svg">
${baseRect}
${paths}
</svg>`;
}

export function generateDXF(
  state: AppState,
  result: NestingResult,
  options: { objectsOnly?: boolean } = {}
): string {
  const { sheetW, sheetH, parts } = result;
  const tickLen = Math.min(state.cornerLen, state.partW * 0.45, state.partH * 0.45);
  const isObjectsOnly = options.objectsOnly ?? state.exportObjectsOnly ?? false;

  let entities = '';

  function addLine(x1: number, y1: number, x2: number, y2: number, layer = 'CUT') {
    // In DXF standard, Y is typically up from bottom, but standard CAD units support:
    entities += `0\nLINE\n8\n${layer}\n10\n${x1.toFixed(3)}\n20\n${(sheetH - y1).toFixed(3)}\n30\n0.0\n11\n${x2.toFixed(3)}\n21\n${(sheetH - y2).toFixed(3)}\n31\n0.0\n`;
  }

  function addCircle(cx: number, cy: number, r: number, layer = 'CUT') {
    entities += `0\nCIRCLE\n8\n${layer}\n10\n${cx.toFixed(3)}\n20\n${(sheetH - cy).toFixed(3)}\n30\n0.0\n40\n${r.toFixed(3)}\n`;
  }

  // Sheet border (omitted if objectsOnly so only nested parts are exported)
  if (!isObjectsOnly) {
    addLine(0, 0, sheetW, 0, 'BOUNDS');
    addLine(sheetW, 0, sheetW, sheetH, 'BOUNDS');
    addLine(sheetW, sheetH, 0, sheetH, 'BOUNDS');
    addLine(0, sheetH, 0, 0, 'BOUNDS');
  }

  // Parts
  for (const part of parts) {
    const { x, y, w, h } = part;

    if (!state.hideShapeLines) {
      if (state.renderMode === 'corners') {
        const clen = Math.min(tickLen, w * 0.45, h * 0.45);
        // TL
        addLine(x, y + clen, x, y);
        addLine(x, y, x + clen, y);
        // TR
        addLine(x + w - clen, y, x + w, y);
        addLine(x + w, y, x + w, y + clen);
        // BR
        addLine(x + w, y + h - clen, x + w, y + h);
        addLine(x + w, y + h, x + w - clen, y + h);
        // BL
        addLine(x + clen, y + h, x, y + h);
        addLine(x, y + h, x, y + h - clen);
      } else {
        if (state.shape === 'washer') {
          const cx = x + w / 2;
          const cy = y + h / 2;
          const outerR = Math.min(w, h) / 2;
          const innerR = outerR * 0.45;
          addCircle(cx, cy, outerR);
          addCircle(cx, cy, innerR);
        } else if (state.shape === 'bracket') {
          addLine(x, y, x + w, y);
          addLine(x + w, y, x + w, y + h);
          addLine(x + w, y + h, x, y + h);
          addLine(x, y + h, x, y);
          addCircle(x + w * 0.25, y + h / 2, 2.0);
          addCircle(x + w * 0.75, y + h / 2, 2.0);
        } else if (state.shape === 'lshape') {
          const thick = Math.min(w, h) * 0.4;
          addLine(x, y, x + thick, y);
          addLine(x + thick, y, x + thick, y + h - thick);
          addLine(x + thick, y + h - thick, x + w, y + h - thick);
          addLine(x + w, y + h - thick, x + w, y + h);
          addLine(x + w, y + h, x, y + h);
          addLine(x, y + h, x, y);
        } else {
          addLine(x, y, x + w, y);
          addLine(x + w, y, x + w, y + h);
          addLine(x + w, y + h, x, y + h);
          addLine(x, y + h, x, y);
        }
      }

      if (state.showCenters) {
        const cx = x + w / 2;
        const cy = y + h / 2;
        const sz = 1.5;
        addLine(cx - sz, cy, cx + sz, cy, 'CENTERS');
        addLine(cx, cy - sz, cx, cy + sz, 'CENTERS');
      }
    }
  }

  return `0
SECTION
2
HEADER
9
$ACADVER
1
AC1009
0
ENDSEC
0
SECTION
2
ENTITIES
${entities}0
ENDSEC
0
EOF
`;
}

export function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportHighResPNG(
  canvas: HTMLCanvasElement,
  sheetW: number,
  sheetH: number,
  dpi: number,
  filename: string,
  transparentBg = false
) {
  const scale = dpi / 25.4; // px per mm
  const targetW = Math.round(sheetW * scale);
  const targetH = Math.round(sheetH * scale);

  const offscreen = document.createElement('canvas');
  offscreen.width = targetW;
  offscreen.height = targetH;
  const ctx = offscreen.getContext('2d');
  if (!ctx) return;

  // Background: Transparent alpha or solid white
  if (transparentBg) {
    ctx.clearRect(0, 0, targetW, targetH);
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, targetW, targetH);
  }

  // Scaled rendering of the source canvas
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, targetW, targetH);

  offscreen.toBlob(
    (blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    },
    'image/png',
    1.0
  );
}

export function trigger1To1Print(state: AppState, result: NestingResult) {
  // Generate strictly clean printable SVG: zero grids, zero clamping guides, zero outer borders
  const svg = generateSVG(state, result, {
    forPrint: true,
    omitGuides: true,
    objectsOnly: state.exportObjectsOnly,
  });
  const orientation = state.orientation === 'LAND' ? 'landscape' : 'portrait';

  // Use a hidden iframe to prevent popup-blockers and support sandbox/iframe execution
  let frame = document.getElementById('laser-nest-print-frame') as HTMLIFrameElement | null;
  if (!frame) {
    frame = document.createElement('iframe');
    frame.id = 'laser-nest-print-frame';
    frame.style.position = 'fixed';
    frame.style.right = '0';
    frame.style.bottom = '0';
    frame.style.width = '0';
    frame.style.height = '0';
    frame.style.border = '0';
    document.body.appendChild(frame);
  }

  const frameDoc = frame.contentWindow?.document;
  if (!frameDoc) return;

  frameDoc.open();
  frameDoc.write(`<!doctype html>
<html>
  <head>
    <title>LASER.NEST 1:1 Scale Print [${result.sheetW} x ${result.sheetH} mm]</title>
    <style>
      @page {
        size: ${result.sheetW}mm ${result.sheetH}mm ${orientation};
        margin: 0mm;
      }
      *, *::before, *::after {
        box-sizing: border-box;
      }
      html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: ${result.sheetW}mm;
        height: ${result.sheetH}mm;
        background: #ffffff !important;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      svg {
        width: ${result.sheetW}mm;
        height: ${result.sheetH}mm;
        display: block;
        background: #ffffff !important;
      }
      @media print {
        body {
          background: transparent !important;
        }
      }
    </style>
  </head>
  <body>
    ${svg}
  </body>
</html>`);
  frameDoc.close();

  // Trigger print after iframe renders
  setTimeout(() => {
    try {
      frame?.contentWindow?.focus();
      frame?.contentWindow?.print();
    } catch {
      // Fallback
    }
  }, 250);
}
