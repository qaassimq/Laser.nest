import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AppState, NestingResult } from '../types';

interface DraftingCanvasProps {
  state: AppState;
  result: NestingResult;
  gridActive: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  onChangeZoom: (newZoom: number) => void;
  onResetZoom: () => void;
  onNudgePosition?: (dxMm: number, dyMm: number) => void;
}

export const DraftingCanvas: React.FC<DraftingCanvasProps> = ({
  state,
  result,
  gridActive,
  canvasRef,
  onChangeZoom,
  onResetZoom,
  onNudgePosition,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const overlayImageElementRef = useRef<HTMLImageElement | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: string; y: string }>({
    x: '000.0',
    y: '000.0',
  });

  // Pan state
  const [isPanning, setIsPanning] = useState(false);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const panStartRef = useRef({ x: 0, y: 0 });

  const pxPerMm = 2.4 * state.zoom;
  const sheetWidthPx = result.sheetW * pxPerMm;
  const sheetHeightPx = result.sheetH * pxPerMm;

  // Pre-load custom image whenever state.customImage changes
  useEffect(() => {
    if (state.customImage) {
      const img = new Image();
      img.onload = () => {
        imageElementRef.current = img;
        drawSheet();
      };
      img.src = state.customImage;
    } else {
      imageElementRef.current = null;
      drawSheet();
    }
  }, [state.customImage]);

  // Pre-load overlay image whenever state.imageOverlay changes
  useEffect(() => {
    if (state.imageOverlay) {
      const img = new Image();
      img.onload = () => {
        overlayImageElementRef.current = img;
        drawSheet();
      };
      img.src = state.imageOverlay;
    } else {
      overlayImageElementRef.current = null;
      drawSheet();
    }
  }, [state.imageOverlay]);

  // Render canvas content
  const drawSheet = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use devicePixelRatio for ultra-sharp high-DPI rendering
    const dpr = window.devicePixelRatio || 1;
    const displayW = Math.round(sheetWidthPx);
    const displayH = Math.round(sheetHeightPx);

    canvas.width = displayW * dpr;
    canvas.height = displayH * dpr;
    canvas.style.width = `${displayW}px`;
    canvas.style.height = `${displayH}px`;

    ctx.save();
    ctx.scale(dpr, dpr);

    // Clear and draw sheet base: pristine clean white fabrication sheet (or transparent if exportTransparentBg)
    if (state.exportTransparentBg) {
      ctx.clearRect(0, 0, displayW, displayH);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, displayW, displayH);
    }

    // Clamping Margin Boundary
    if (state.showGuides && !state.exportObjectsOnly && !state.hideShapeLines) {
      ctx.save();
      ctx.strokeStyle = 'rgba(0, 100, 255, 0.35)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      const mX = state.margin * pxPerMm;
      const mY = state.margin * pxPerMm;
      const mW = (result.sheetW - state.margin * 2) * pxPerMm;
      const mH = (result.sheetH - state.margin * 2) * pxPerMm;
      ctx.strokeRect(mX, mY, mW, mH);
      ctx.restore();
    }

    // Sheet 4-Corner Registration Marks / Keys
    if (state.showRegistrationMarks !== false && !state.exportObjectsOnly && !state.hideShapeLines) {
      const sOff = 4.0 * pxPerMm;
      const sTick = 6.0 * pxPerMm;
      ctx.save();
      ctx.strokeStyle = '#101418';
      ctx.lineWidth = 1.2;

    // TL
    ctx.beginPath();
    ctx.moveTo(sOff, sOff + sTick);
    ctx.lineTo(sOff, sOff);
    ctx.lineTo(sOff + sTick, sOff);
    ctx.stroke();

    // TR
    const rX = displayW - sOff;
    ctx.beginPath();
    ctx.moveTo(rX - sTick, sOff);
    ctx.lineTo(rX, sOff);
    ctx.lineTo(rX, sOff + sTick);
    ctx.stroke();

    // BL
    const bY = displayH - sOff;
    ctx.beginPath();
    ctx.moveTo(sOff, bY - sTick);
    ctx.lineTo(sOff, bY);
    ctx.lineTo(sOff + sTick, bY);
    ctx.stroke();

    // BR
    ctx.beginPath();
    ctx.moveTo(rX - sTick, bY);
    ctx.lineTo(rX, bY);
    ctx.lineTo(rX, bY - sTick);
    ctx.stroke();
    ctx.restore();
    } // End of if (state.showRegistrationMarks !== false && !state.exportObjectsOnly)

    // Render Parts
    const tickLen = Math.min(state.cornerLen, state.partW * 0.45, state.partH * 0.45);

    for (const part of result.parts) {
      const pxX = part.x * pxPerMm;
      const pxY = part.y * pxPerMm;
      const pxW = part.w * pxPerMm;
      const pxH = part.h * pxPerMm;

      // Custom shape drawing preserved even when cutlines are hidden
      if (state.shape === 'custom' && imageElementRef.current) {
        ctx.drawImage(imageElementRef.current, pxX, pxY, pxW, pxH);
      }

      // 1. Draw shape cutlines and contour registration marks (omitted if hideShapeLines is enabled for graphics-only mode)
      if (!state.hideShapeLines) {
      if (state.renderMode === 'corners') {
        // INK-SAVER CORNER MARKS MODE WITH SHAPE CONTOUR AWARENESS
        const clen = tickLen * pxPerMm;

        // Faint blueprint ghost contour so the chosen shape is immediately recognizable
        ctx.save();
        ctx.strokeStyle = 'rgba(75, 142, 255, 0.22)';
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 2]);

        if (state.shape === 'roundrect' && state.radius > 0) {
          const r = Math.min(state.radius * pxPerMm, pxW / 2, pxH / 2);
          ctx.beginPath();
          ctx.roundRect(pxX, pxY, pxW, pxH, r);
          ctx.stroke();
        } else if (state.shape === 'washer') {
          const cx = pxX + pxW / 2;
          const cy = pxY + pxH / 2;
          const outerR = Math.min(pxW, pxH) / 2;
          const innerR = outerR * 0.45;
          ctx.beginPath();
          ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
          ctx.stroke();
        } else if (state.shape === 'bracket') {
          ctx.beginPath();
          ctx.roundRect(pxX, pxY, pxW, pxH, 3 * pxPerMm);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(pxX + pxW * 0.25, pxY + pxH / 2, 2 * pxPerMm, 0, Math.PI * 2);
          ctx.arc(pxX + pxW * 0.75, pxY + pxH / 2, 2 * pxPerMm, 0, Math.PI * 2);
          ctx.stroke();
        } else if (state.shape === 'lshape') {
          const thick = Math.min(pxW, pxH) * 0.4;
          ctx.beginPath();
          ctx.moveTo(pxX, pxY);
          ctx.lineTo(pxX + thick, pxY);
          ctx.lineTo(pxX + thick, pxY + pxH - thick);
          ctx.lineTo(pxX + pxW, pxY + pxH - thick);
          ctx.lineTo(pxX + pxW, pxY + pxH);
          ctx.lineTo(pxX, pxY + pxH);
          ctx.closePath();
          ctx.stroke();
        } else {
          ctx.strokeRect(pxX, pxY, pxW, pxH);
        }
        ctx.restore();

        // High-contrast ink-saver cut marks tailored to each shape
        ctx.save();
        ctx.strokeStyle = '#101418';
        ctx.lineWidth = 1.3;

        if (state.shape === 'washer') {
          // Washer circular quadrant ticks
          const cx = pxX + pxW / 2;
          const cy = pxY + pxH / 2;
          const outerR = Math.min(pxW, pxH) / 2;
          const innerR = outerR * 0.45;
          const qLen = Math.min(clen, 5 * pxPerMm);

          // Outer quadrant cut ticks
          ctx.beginPath();
          // Top
          ctx.moveTo(cx, cy - outerR);
          ctx.lineTo(cx, cy - outerR + qLen);
          // Bottom
          ctx.moveTo(cx, cy + outerR);
          ctx.lineTo(cx, cy + outerR - qLen);
          // Left
          ctx.moveTo(cx - outerR, cy);
          ctx.lineTo(cx - outerR + qLen, cy);
          // Right
          ctx.moveTo(cx + outerR, cy);
          ctx.lineTo(cx + outerR - qLen, cy);
          ctx.stroke();

          // Inner hole center registration
          ctx.beginPath();
          ctx.moveTo(cx - innerR, cy);
          ctx.lineTo(cx + innerR, cy);
          ctx.moveTo(cx, cy - innerR);
          ctx.lineTo(cx, cy + innerR);
          ctx.stroke();
        } else if (state.shape === 'roundrect' && state.radius > 0) {
          // Rounded corner arcs
          const r = Math.min(state.radius * pxPerMm, pxW / 2, pxH / 2);
          // TL Arc
          ctx.beginPath();
          ctx.arc(pxX + r, pxY + r, r, Math.PI, 1.5 * Math.PI);
          ctx.stroke();
          // TR Arc
          ctx.beginPath();
          ctx.arc(pxX + pxW - r, pxY + r, r, 1.5 * Math.PI, 2 * Math.PI);
          ctx.stroke();
          // BR Arc
          ctx.beginPath();
          ctx.arc(pxX + pxW - r, pxY + pxH - r, r, 0, 0.5 * Math.PI);
          ctx.stroke();
          // BL Arc
          ctx.beginPath();
          ctx.arc(pxX + r, pxY + pxH - r, r, 0.5 * Math.PI, Math.PI);
          ctx.stroke();
        } else if (state.shape === 'bracket') {
          // 4 outer corners
          ctx.beginPath();
          ctx.moveTo(pxX, pxY + clen);
          ctx.lineTo(pxX, pxY);
          ctx.lineTo(pxX + clen, pxY);
          ctx.moveTo(pxX + pxW - clen, pxY);
          ctx.lineTo(pxX + pxW, pxY);
          ctx.lineTo(pxX + pxW, pxY + clen);
          ctx.moveTo(pxX + pxW, pxY + pxH - clen);
          ctx.lineTo(pxX + pxW, pxY + pxH);
          ctx.lineTo(pxX + pxW - clen, pxY + pxH);
          ctx.moveTo(pxX + clen, pxY + pxH);
          ctx.lineTo(pxX, pxY + pxH);
          ctx.lineTo(pxX, pxY + pxH - clen);
          ctx.stroke();

          // Center cross on both screw holes
          const h1x = pxX + pxW * 0.25;
          const h2x = pxX + pxW * 0.75;
          const hy = pxY + pxH / 2;
          const cross = 2.5 * pxPerMm;
          ctx.beginPath();
          ctx.moveTo(h1x - cross, hy);
          ctx.lineTo(h1x + cross, hy);
          ctx.moveTo(h1x, hy - cross);
          ctx.lineTo(h1x, hy + cross);
          ctx.moveTo(h2x - cross, hy);
          ctx.lineTo(h2x + cross, hy);
          ctx.moveTo(h2x, hy - cross);
          ctx.lineTo(h2x, hy + cross);
          ctx.stroke();
        } else if (state.shape === 'lshape') {
          // L-shape with 6 distinct corner ticks
          const thick = Math.min(pxW, pxH) * 0.4;
          ctx.beginPath();
          // Top-Left (outer)
          ctx.moveTo(pxX, pxY + clen);
          ctx.lineTo(pxX, pxY);
          ctx.lineTo(pxX + clen, pxY);
          // Top stem right (outer)
          ctx.moveTo(pxX + thick - clen, pxY);
          ctx.lineTo(pxX + thick, pxY);
          ctx.lineTo(pxX + thick, pxY + clen);
          // Inner reflex corner
          ctx.moveTo(pxX + thick, pxY + pxH - thick - clen);
          ctx.lineTo(pxX + thick, pxY + pxH - thick);
          ctx.lineTo(pxX + thick + clen, pxY + pxH - thick);
          // Bottom-Right top corner
          ctx.moveTo(pxX + pxW - clen, pxY + pxH - thick);
          ctx.lineTo(pxX + pxW, pxY + pxH - thick);
          ctx.lineTo(pxX + pxW, pxY + pxH - thick + clen);
          // Bottom-Right bottom corner
          ctx.moveTo(pxX + pxW, pxY + pxH - clen);
          ctx.lineTo(pxX + pxW, pxY + pxH);
          ctx.lineTo(pxX + pxW - clen, pxY + pxH);
          // Bottom-Left (outer)
          ctx.moveTo(pxX + clen, pxY + pxH);
          ctx.lineTo(pxX, pxY + pxH);
          ctx.lineTo(pxX, pxY + pxH - clen);
          ctx.stroke();
        } else if (state.shape === 'custom') {
          // Custom imported picture / shape in corner marks mode
          if (imageElementRef.current) {
            ctx.save();
            ctx.drawImage(imageElementRef.current, pxX, pxY, pxW, pxH);
            ctx.restore();
          }
          // 4 corner ticks
          ctx.beginPath();
          ctx.moveTo(pxX, pxY + clen);
          ctx.lineTo(pxX, pxY);
          ctx.lineTo(pxX + clen, pxY);
          ctx.moveTo(pxX + pxW - clen, pxY);
          ctx.lineTo(pxX + pxW, pxY);
          ctx.lineTo(pxX + pxW, pxY + clen);
          ctx.moveTo(pxX + pxW, pxY + pxH - clen);
          ctx.lineTo(pxX + pxW, pxY + pxH);
          ctx.lineTo(pxX + pxW - clen, pxY + pxH);
          ctx.moveTo(pxX + clen, pxY + pxH);
          ctx.lineTo(pxX, pxY + pxH);
          ctx.lineTo(pxX, pxY + pxH - clen);
          ctx.stroke();
        } else {
          // Standard Rectangle 4 corners
          ctx.beginPath();
          ctx.moveTo(pxX, pxY + clen);
          ctx.lineTo(pxX, pxY);
          ctx.lineTo(pxX + clen, pxY);
          ctx.moveTo(pxX + pxW - clen, pxY);
          ctx.lineTo(pxX + pxW, pxY);
          ctx.lineTo(pxX + pxW, pxY + clen);
          ctx.moveTo(pxX + pxW, pxY + pxH - clen);
          ctx.lineTo(pxX + pxW, pxY + pxH);
          ctx.lineTo(pxX + pxW - clen, pxY + pxH);
          ctx.moveTo(pxX + clen, pxY + pxH);
          ctx.lineTo(pxX, pxY + pxH);
          ctx.lineTo(pxX, pxY + pxH - clen);
          ctx.stroke();
        }

        ctx.restore();
      } else {
        // FULL CAD OUTLINE MODE
        ctx.save();
        ctx.strokeStyle = '#004493';
        ctx.lineWidth = 1.0;
        ctx.fillStyle = state.exportTransparentBg ? 'transparent' : 'rgba(75, 142, 255, 0.04)';

        if (state.shape === 'custom') {
          // Custom imported image outline
          if (!imageElementRef.current) {
            ctx.fillStyle = 'rgba(75, 142, 255, 0.08)';
            ctx.fillRect(pxX, pxY, pxW, pxH);
            ctx.font = `${Math.max(9, 2.8 * pxPerMm)}px "JetBrains Mono", monospace`;
            ctx.fillStyle = '#414755';
            ctx.textAlign = 'center';
            ctx.fillText('NO IMAGE', pxX + pxW / 2, pxY + pxH / 2);
            ctx.textAlign = 'left';
          }
          ctx.strokeRect(pxX, pxY, pxW, pxH);
        } else if (state.shape === 'roundrect' && state.radius > 0) {
          const r = Math.min(state.radius * pxPerMm, pxW / 2, pxH / 2);
          ctx.beginPath();
          ctx.roundRect(pxX, pxY, pxW, pxH, r);
          if (!state.exportTransparentBg && !state.imageOverlay) {
            ctx.fill();
          }
          ctx.stroke();
        } else if (state.shape === 'washer') {
          const cx = pxX + pxW / 2;
          const cy = pxY + pxH / 2;
          const outerR = Math.min(pxW, pxH) / 2;
          const innerR = outerR * 0.45;
          ctx.beginPath();
          ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
          ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true);
          if (!state.exportTransparentBg && !state.imageOverlay) {
            ctx.fill();
          }
          ctx.stroke();
        } else if (state.shape === 'bracket') {
          ctx.beginPath();
          ctx.roundRect(pxX, pxY, pxW, pxH, 3 * pxPerMm);
          if (!state.exportTransparentBg && !state.imageOverlay) {
            ctx.fill();
          }
          ctx.stroke();
          // Dual mounting holes
          ctx.beginPath();
          ctx.arc(pxX + pxW * 0.25, pxY + pxH / 2, 2 * pxPerMm, 0, Math.PI * 2);
          ctx.arc(pxX + pxW * 0.75, pxY + pxH / 2, 2 * pxPerMm, 0, Math.PI * 2);
          ctx.stroke();
        } else if (state.shape === 'lshape') {
          const thick = Math.min(pxW, pxH) * 0.4;
          ctx.beginPath();
          ctx.moveTo(pxX, pxY);
          ctx.lineTo(pxX + thick, pxY);
          ctx.lineTo(pxX + thick, pxY + pxH - thick);
          ctx.lineTo(pxX + pxW, pxY + pxH - thick);
          ctx.lineTo(pxX + pxW, pxY + pxH);
          ctx.lineTo(pxX, pxY + pxH);
          ctx.closePath();
          if (!state.exportTransparentBg && !state.imageOverlay) {
            ctx.fill();
          }
          ctx.stroke();
        } else {
          // Standard Rectangle
          if (!state.exportTransparentBg && !state.imageOverlay) {
            ctx.fillRect(pxX, pxY, pxW, pxH);
          }
          ctx.strokeRect(pxX, pxY, pxW, pxH);
        }
        ctx.restore();
      }

      // Drill Center Registration Crosshairs
      if (state.showCenters && !state.exportObjectsOnly) {
        ctx.save();
        ctx.strokeStyle = '#8b90a0';
        ctx.lineWidth = 0.8;
        const cx = pxX + pxW / 2;
        const cy = pxY + pxH / 2;
        const csz = 2.5 * pxPerMm;
        ctx.beginPath();
        ctx.moveTo(cx - csz, cy);
        ctx.lineTo(cx + csz, cy);
        ctx.moveTo(cx, cy - csz);
        ctx.lineTo(cx, cy + csz);
        ctx.stroke();
        ctx.restore();
      }
      } // End of if (!state.hideShapeLines && !state.exportObjectsOnly)

      // 2. Overlay Imported Image on Top of Shape (with Margin, Padding, Position, Alignment, Offset, Scale & Fit)
      if (state.imageOverlay && overlayImageElementRef.current) {
        const imgEl = overlayImageElementRef.current;
        const totalInset = ((state.imageMargin || 0) + (state.imagePadding || 0)) * pxPerMm;
        const boxX = pxX + totalInset;
        const boxY = pxY + totalInset;
        const boxW = pxW - totalInset * 2;
        const boxH = pxH - totalInset * 2;

        if (boxW > 2 && boxH > 2) {
          const natW = imgEl.naturalWidth || boxW;
          const natH = imgEl.naturalHeight || boxH;
          const fit = state.imageFit || 'contain';
          const alignX = state.imageAlignX || 'center';
          const alignY = state.imageAlignY || 'center';
          const offX = (state.imageOffsetX || 0) * pxPerMm;
          const offY = (state.imageOffsetY || 0) * pxPerMm;
          const scaleMultiplier = (state.imageScale ?? 100) / 100;

          let baseScale = 1;
          if (fit === 'stretch') {
            baseScale = 1;
          } else if (fit === 'cover') {
            baseScale = Math.max(boxW / natW, boxH / natH);
          } else {
            // 'contain' (proportional fit inside box)
            baseScale = Math.min(boxW / natW, boxH / natH);
          }

          const dw = (fit === 'stretch' ? boxW : natW * baseScale) * scaleMultiplier;
          const dh = (fit === 'stretch' ? boxH : natH * baseScale) * scaleMultiplier;

          // Horizontal alignment (Left, Center, Right)
          let dx = boxX;
          if (alignX === 'left') {
            dx = boxX;
          } else if (alignX === 'right') {
            dx = boxX + (boxW - dw);
          } else {
            // Center
            dx = boxX + (boxW - dw) / 2;
          }
          dx += offX;

          // Vertical alignment (Top, Center, Bottom)
          let dy = boxY;
          if (alignY === 'top') {
            dy = boxY;
          } else if (alignY === 'bottom') {
            dy = boxY + (boxH - dh);
          } else {
            // Center
            dy = boxY + (boxH - dh) / 2;
          }
          dy += offY;

          ctx.save();
          // Always clip to part bounding box so image offsets/scales don't bleed onto neighbor parts
          ctx.beginPath();
          ctx.rect(boxX, boxY, boxW, boxH);
          ctx.clip();

          ctx.drawImage(imgEl, dx, dy, dw, dh);
          ctx.restore();
        }
      }

      // Option: Number Each Distributed Shape (#01, #02...)
      if (state.showPartNumbers && !state.exportObjectsOnly && !state.hideShapeLines) {
        ctx.save();
        const tagText = `#${String(part.index).padStart(2, '0')}`;
        const fontSize = Math.max(8, 2.5 * pxPerMm);
        ctx.font = `bold ${fontSize}px "JetBrains Mono", monospace`;
        const textMetrics = ctx.measureText(tagText);
        const tagW = textMetrics.width + 4;
        const tagH = fontSize + 4;
        const tagX = pxX + pxW - tagW - 2;
        const tagY = pxY + pxH - tagH - 2;

        ctx.fillStyle = 'rgba(11, 14, 19, 0.82)';
        ctx.fillRect(tagX, tagY, tagW, tagH);
        ctx.fillStyle = '#47e266';
        ctx.fillText(tagText, tagX + 2, tagY + fontSize);
        ctx.restore();
      }
    }

    // Option: Show Total Shapes Count Stamp on Sheet Canvas
    if (state.showTotalShapesOverlay && !state.exportObjectsOnly && !state.hideShapeLines) {
      ctx.save();
      const stampW = Math.min(displayW - 20, 110 * pxPerMm);
      const stampH = 22 * pxPerMm;
      const stampX = displayW - state.margin * pxPerMm - stampW;
      const stampY = displayH - state.margin * pxPerMm - stampH;

      // Solid high-visibility CAD plate
      ctx.fillStyle = 'rgba(255, 255, 255, 0.96)';
      ctx.strokeStyle = '#101418';
      ctx.lineWidth = 1.2;
      ctx.fillRect(stampX, stampY, stampW, stampH);
      ctx.strokeRect(stampX, stampY, stampW, stampH);

      // Dividing header bar
      ctx.fillStyle = '#0b0e13';
      ctx.fillRect(stampX, stampY, stampW, 7.5 * pxPerMm);

      // Header: TOTAL SHAPES
      ctx.font = `bold ${Math.max(9, 3.0 * pxPerMm)}px "JetBrains Mono", monospace`;
      ctx.fillStyle = '#47e266';
      ctx.fillText(
        `TOTAL SHAPES: ${result.totalParts} PCS`,
        stampX + 3 * pxPerMm,
        stampY + 5.5 * pxPerMm
      );

      // Body metadata
      ctx.font = `${Math.max(7, 2.2 * pxPerMm)}px "JetBrains Mono", monospace`;
      ctx.fillStyle = '#101418';
      ctx.fillText(
        `PACKED YIELD: ${result.efficiency.toFixed(1)}% | ${state.paper} [${result.sheetW}x${result.sheetH}mm]`,
        stampX + 3 * pxPerMm,
        stampY + 12.5 * pxPerMm
      );
      ctx.fillText(
        `PRIMITIVE: ${state.shape.toUpperCase()} | STATUS: ${
          state.onlyCompleteShapes ? '100% COMPLETE ONLY' : 'PERMISSIVE OVERHANG'
        }`,
        stampX + 3 * pxPerMm,
        stampY + 17.5 * pxPerMm
      );

      ctx.restore();
    }

    ctx.restore();
  }, [state, result, pxPerMm, sheetWidthPx, sheetHeightPx, canvasRef]);

  useEffect(() => {
    drawSheet();
  }, [drawSheet]);

  // Mouse Move Cursor Tracker
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStartRef.current.x,
        y: e.clientY - panStartRef.current.y,
      });
      return;
    }

    const rect = canvas.getBoundingClientRect();
    if (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    ) {
      const xMm = (e.clientX - rect.left) / pxPerMm;
      const yMm = (e.clientY - rect.top) / pxPerMm;
      setCursorPos({
        x: Math.min(result.sheetW, Math.max(0, xMm)).toFixed(1).padStart(5, '0'),
        y: Math.min(result.sheetH, Math.max(0, yMm)).toFixed(1).padStart(5, '0'),
      });
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Middle click or Alt+click pans
    if (e.button === 1 || e.altKey) {
      e.preventDefault();
      setIsPanning(true);
      panStartRef.current = {
        x: e.clientX - panOffset.x,
        y: e.clientY - panOffset.y,
      };
    }
  };

  const handleMouseUp = () => {
    if (isPanning) setIsPanning(false);
  };

  // Wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.1 : -0.1;
      const newZoom = Math.min(2.5, Math.max(0.4, state.zoom + delta));
      onChangeZoom(parseFloat(newZoom.toFixed(2)));
    }
  };

  // Keyboard nudge for overlay image position (arrow keys: 0.5mm, shift+arrow: 2.0mm)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!state.imageOverlay || !onNudgePosition) return;
    const step = e.shiftKey ? 2.0 : 0.5;
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onNudgePosition(0, -step);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onNudgePosition(0, step);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onNudgePosition(-step, 0);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      onNudgePosition(step, 0);
    }
  };

  return (
    <main className="flex-1 flex flex-col relative overflow-hidden bg-[#0b0e13] select-none">
      {/* Precision Ruler Bar (Horizontal) */}
      <div className="h-5 bg-[#191c21] border-b border-[#414755] flex items-center pl-6 pr-2 overflow-hidden text-[9px] font-mono text-[#8b90a0] justify-between shrink-0">
        <div className="flex items-center gap-10 opacity-70">
          <span>0mm</span>
          <span>50</span>
          <span>100</span>
          <span>150</span>
          <span>200</span>
          <span>250</span>
          <span>300</span>
          <span>350</span>
          <span>400</span>
        </div>
        <div className="text-[9px] text-[#adc6ff] flex items-center gap-1 font-mono">
          <span className="material-symbols-outlined text-[11px]">crop_free</span>
          <span>
            {state.paper} [{result.sheetW} x {result.sheetH}mm]
          </span>
        </div>
      </div>

      {/* Main Canvas Container with CAD Grid */}
      <div
        ref={containerRef}
        tabIndex={0}
        className={`flex-1 relative overflow-auto flex items-center justify-center p-8 cursor-default outline-none ${
          gridActive ? 'cad-canvas-bg' : 'bg-[#0b0e13]'
        }`}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onKeyDown={handleKeyDown}
      >
        {/* Interactive CAD Canvas Element */}
        <div
          className="relative transition-transform duration-75 shadow-2xl"
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
          }}
        >
          <canvas
            ref={canvasRef}
            className={`block shadow-[0_0_20px_rgba(0,0,0,0.8)] border border-[#272a2f] ${
              state.exportTransparentBg
                ? 'bg-[repeating-conic-gradient(#191c21_0%_25%,#101418_0%_50%)] bg-[length:16px_16px]'
                : 'bg-white'
            }`}
          />

          {/* Floating Sheet HUD Dimension Badges */}
          <div className="absolute -top-5 left-0 right-0 flex justify-center pointer-events-none">
            <span className="bg-[#272a2f] border border-[#414755] text-[#e1e2e9] font-mono text-[10px] px-1.5 py-0.2 shadow-sm flex items-center gap-1.5">
              <span>{result.sheetW.toFixed(1)} mm</span>
              {state.exportTransparentBg && (
                <span className="text-[#47e266] text-[8.5px] font-semibold bg-[#47e266]/10 px-1 border border-[#47e266]/30">
                  TRANSPARENT BG
                </span>
              )}
            </span>
          </div>
          <div className="absolute -left-7 top-0 bottom-0 flex items-center justify-center pointer-events-none">
            <span className="bg-[#272a2f] border border-[#414755] text-[#e1e2e9] font-mono text-[10px] px-1.5 py-0.2 -rotate-90 whitespace-nowrap shadow-sm">
              {result.sheetH.toFixed(1)} mm
            </span>
          </div>
        </div>

        {/* Floating Quick Viewport Tools (Bottom Right) */}
        <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-[#191c21] border border-[#414755] p-1 shadow-lg z-30 select-none">
          <button
            type="button"
            className="p-1 hover:bg-[#272a2f] text-[#c1c6d7] hover:text-[#e1e2e9] cursor-pointer"
            onClick={() => onChangeZoom(Math.max(0.4, Number((state.zoom - 0.15).toFixed(2))))}
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-[16px]">remove</span>
          </button>
          <span className="text-[11px] font-mono px-1.5 text-[#e1e2e9]">
            {Math.round(state.zoom * 100)}%
          </span>
          <button
            type="button"
            className="p-1 hover:bg-[#272a2f] text-[#c1c6d7] hover:text-[#e1e2e9] cursor-pointer"
            onClick={() => onChangeZoom(Math.min(2.5, Number((state.zoom + 0.15).toFixed(2))))}
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
          <div className="h-3 w-px bg-[#414755] mx-0.5" />
          <button
            type="button"
            className="p-1 hover:bg-[#272a2f] text-[#c1c6d7] hover:text-[#e1e2e9] cursor-pointer"
            onClick={() => {
              setPanOffset({ x: 0, y: 0 });
              onResetZoom();
            }}
            title="Fit to Screen (100%)"
          >
            <span className="material-symbols-outlined text-[16px]">
              filter_center_focus
            </span>
          </button>
        </div>

        {/* Live Cursor Tracking Datum (Bottom Left) */}
        <div className="absolute bottom-4 left-4 bg-[#191c21] border border-[#414755] px-2 py-1 text-[10px] font-mono text-[#8b90a0] flex items-center gap-3 select-none">
          <span>
            X: <span className="text-[#e1e2e9]">{cursorPos.x}</span>
          </span>
          <span>
            Y: <span className="text-[#e1e2e9]">{cursorPos.y}</span>
          </span>
          <span className="text-[#47e266]">SNAP: 1.0mm</span>
          {state.exportTransparentBg && (
            <>
              <div className="h-3 w-px bg-[#414755]" />
              <span className="text-[#47e266] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">opacity</span>
                <span>BG: TRANSPARENT</span>
              </span>
            </>
          )}
          {state.hideShapeLines && (
            <>
              <div className="h-3 w-px bg-[#414755]" />
              <span className="text-[#ffc07a] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">visibility_off</span>
                <span>CUTLINES: OFF</span>
              </span>
            </>
          )}
          {state.exportObjectsOnly && (
            <>
              <div className="h-3 w-px bg-[#414755]" />
              <span className="text-[#47e266] font-semibold flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">filter_center_focus</span>
                <span>OBJECTS ONLY</span>
              </span>
            </>
          )}
          {state.imageOverlay && (
            <>
              <div className="h-3 w-px bg-[#414755]" />
              <span className="text-[#adc6ff] flex items-center gap-1">
                <span className="material-symbols-outlined text-[12px]">image</span>
                <span>
                  {state.imageAlignY.toUpperCase()}-{state.imageAlignX.toUpperCase()}
                  {(state.imageOffsetX !== 0 || state.imageOffsetY !== 0) && (
                    <span className="text-[#e1e2e9] ml-1">
                      [{state.imageOffsetX >= 0 ? `+${state.imageOffsetX}` : state.imageOffsetX}, {state.imageOffsetY >= 0 ? `+${state.imageOffsetY}` : state.imageOffsetY}mm]
                    </span>
                  )}
                </span>
              </span>
            </>
          )}
        </div>
      </div>
    </main>
  );
};
