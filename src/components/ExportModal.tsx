import React, { useEffect, useRef } from 'react';
import { AppState, ExportFormat, NestingResult } from '../types';
import {
  downloadBlob,
  exportHighResPNG,
  generateDXF,
  generateSVG,
  trigger1To1Print,
} from '../utils/exporters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  result: NestingResult;
  mainCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  onChange: (patch: Partial<AppState>) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  state,
  result,
  mainCanvasRef,
  onChange,
}) => {
  const thumbCanvasRef = useRef<HTMLCanvasElement>(null);

  // Compute pixel dimensions at selected DPI
  const pxW = Math.round((result.sheetW / 25.4) * state.exportDPI);
  const pxH = Math.round((result.sheetH / 25.4) * state.exportDPI);

  useEffect(() => {
    if (!isOpen) return;

    const thumbCanvas = thumbCanvasRef.current;
    const mainCanvas = mainCanvasRef.current;
    if (!thumbCanvas || !mainCanvas) return;

    const ctx = thumbCanvas.getContext('2d');
    if (!ctx) return;

    thumbCanvas.width = 192;
    thumbCanvas.height = 256;

    if (state.exportTransparentBg) {
      ctx.clearRect(0, 0, thumbCanvas.width, thumbCanvas.height);
      const checkSize = 12;
      for (let y = 0; y < thumbCanvas.height; y += checkSize) {
        for (let x = 0; x < thumbCanvas.width; x += checkSize) {
          ctx.fillStyle = (Math.floor(x / checkSize) + Math.floor(y / checkSize)) % 2 === 0 ? '#1f242d' : '#14181f';
          ctx.fillRect(x, y, checkSize, checkSize);
        }
      }
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, thumbCanvas.width, thumbCanvas.height);
    }

    // Calculate aspect fit
    const aspect = result.sheetW / result.sheetH;
    let drawW = 192;
    let drawH = 256;
    let offsetX = 0;
    let offsetY = 0;

    if (aspect > 192 / 256) {
      drawW = 192;
      drawH = 192 / aspect;
      offsetY = (256 - drawH) / 2;
    } else {
      drawH = 256;
      drawW = 256 * aspect;
      offsetX = (192 - drawW) / 2;
    }

    ctx.drawImage(mainCanvas, offsetX, offsetY, drawW, drawH);
  }, [
    isOpen,
    mainCanvasRef,
    result,
    state.exportObjectsOnly,
    state.exportTransparentBg,
    state.hideShapeLines,
    state.showPartNumbers,
    state.showTotalShapesOverlay,
    state.showRegistrationMarks,
    state.showGuides,
  ]);

  if (!isOpen) return null;

  const handleDownload = () => {
    const filenameBase = `LASER_NEST_${state.paper}_${state.renderMode.toUpperCase()}${state.exportObjectsOnly ? '_OBJECTS_ONLY' : ''}${state.exportTransparentBg ? '_TRANSPARENT' : ''}`;

    if (state.exportFormat === 'PNG') {
      if (mainCanvasRef.current) {
        exportHighResPNG(
          mainCanvasRef.current,
          result.sheetW,
          result.sheetH,
          state.exportDPI,
          `${filenameBase}_${state.exportDPI}DPI.png`,
          state.exportTransparentBg
        );
      }
    } else if (state.exportFormat === 'SVG') {
      const svg = generateSVG(state, result, {
        objectsOnly: state.exportObjectsOnly,
        transparentBg: state.exportTransparentBg,
      });
      downloadBlob(svg, `${filenameBase}_TOOLPATH.svg`, 'image/svg+xml');
    } else if (state.exportFormat === 'DXF') {
      const dxf = generateDXF(state, result, { objectsOnly: state.exportObjectsOnly });
      downloadBlob(dxf, `${filenameBase}_TOOLPATH.dxf`, 'application/dxf');
    }

    onClose();
  };

  const handlePrint = () => {
    trigger1To1Print(state, result);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#191c21] border border-[#414755] w-full max-w-2xl p-5 shadow-2xl relative">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#414755] pb-3 mb-4">
          <div>
            <div className="font-sans text-[15px] font-semibold text-[#e1e2e9]">
              High-Resolution Export Suite
            </div>
            <div className="font-mono text-[10px] text-[#8b90a0]">
              Compile 1:1 precision sheet bitmap or vector toolpaths
            </div>
          </div>
          <button
            type="button"
            className="text-[#8b90a0] hover:text-[#e1e2e9] p-1 cursor-pointer"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="grid grid-cols-2 gap-4">
          {/* Live Mini Preview */}
          <div className="bg-[#0b0e13] border border-[#414755] p-3 flex flex-col items-center justify-center">
            <div className="text-[10px] font-mono text-[#8b90a0] mb-2 text-center">
              Raster Bitmap Snapshot (Scale-Accurate)
            </div>
            <div className={`w-48 h-64 border border-[#8b90a0] flex items-center justify-center overflow-hidden shadow-sm ${
              state.exportTransparentBg
                ? 'bg-[repeating-conic-gradient(#191c21_0%_25%,#101418_0%_50%)] bg-[length:12px_12px]'
                : 'bg-white'
            }`}>
              <canvas
                ref={thumbCanvasRef}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-[10px] font-mono text-[#adc6ff] mt-2">
              {pxW} x {pxH} px @ {state.exportDPI} DPI
            </div>
            <div className="mt-1 flex flex-col gap-1 items-center">
              <span
                className={`text-[8.5px] font-mono px-2 py-0.5 border ${
                  state.exportObjectsOnly
                    ? 'bg-[#47e266]/10 text-[#47e266] border-[#47e266]/40 font-semibold'
                    : 'bg-[#272a2f] text-[#8b90a0] border-[#414755]'
                }`}
              >
                {state.exportObjectsOnly ? 'MODE: OBJECTS ONLY (CLEAN)' : 'MODE: WITH NUMBERING & KEYS'}
              </span>
              <span
                className={`text-[8.5px] font-mono px-2 py-0.5 border ${
                  state.exportTransparentBg
                    ? 'bg-[#47e266]/10 text-[#47e266] border-[#47e266]/40 font-semibold'
                    : 'bg-[#272a2f] text-[#8b90a0] border-[#414755]'
                }`}
              >
                {state.exportTransparentBg ? 'CANVAS: TRANSPARENT (ALPHA)' : 'CANVAS: OPAQUE WHITE'}
              </span>
            </div>
          </div>

          {/* Parameters Selection */}
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-mono text-[#8b90a0] block mb-1">
                TARGET FORMAT
              </label>
              <div className="grid grid-cols-3 gap-1">
                {(['PNG', 'SVG', 'DXF'] as ExportFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    className={`p-2 font-mono text-[11px] text-center cursor-pointer transition-colors ${
                      state.exportFormat === fmt
                        ? 'border border-[#adc6ff] bg-[#272a2f] text-[#adc6ff] font-semibold'
                        : 'border border-[#414755] text-[#8b90a0] hover:text-[#e1e2e9]'
                    }`}
                    onClick={() => onChange({ exportFormat: fmt })}
                  >
                    {fmt === 'PNG' ? 'PNG (Picture)' : fmt === 'SVG' ? 'SVG Vector' : 'CAD DXF'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-[#8b90a0] block mb-1">
                DPI RESOLUTION PRESET
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { dpi: 150, label: '150 Draft' },
                  { dpi: 300, label: '300 Prod' },
                  { dpi: 600, label: '600 Ultra' },
                ].map((item) => (
                  <button
                    key={item.dpi}
                    type="button"
                    className={`p-1.5 font-mono text-[11px] text-center cursor-pointer transition-colors ${
                      state.exportDPI === item.dpi
                        ? 'border border-[#adc6ff] bg-[#272a2f] text-[#adc6ff] font-semibold'
                        : 'border border-[#414755] text-[#8b90a0]'
                    }`}
                    onClick={() => onChange({ exportDPI: item.dpi })}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Objects Only / Hide Numbering & Keys Toggle */}
            <div className="bg-[#0b0e13] border border-[#414755] p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-[#adc6ff]">
                    filter_center_focus
                  </span>
                  <div>
                    <div className="font-mono text-[10.5px] font-semibold text-[#e1e2e9]">
                      Keep Objects Only
                    </div>
                    <div className="text-[8.5px] text-[#8b90a0]">
                      Hide numbering, info stamps, and sheet keys
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.exportObjectsOnly}
                    onChange={(e) => {
                      const val = e.target.checked;
                      onChange({
                        exportObjectsOnly: val,
                        ...(val
                          ? {
                              showPartNumbers: false,
                              showTotalShapesOverlay: false,
                              showRegistrationMarks: false,
                              showGuides: false,
                            }
                          : {
                              showPartNumbers: true,
                              showTotalShapesOverlay: true,
                              showRegistrationMarks: true,
                              showGuides: true,
                            }),
                      });
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-[#32353a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#4b8eff]"></div>
                </label>
              </div>

              {/* Granular Sub-options */}
              <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-[#32353a] text-[9px] font-mono">
                <label className="flex items-center gap-1.5 cursor-pointer text-[#c1c6d7] hover:text-[#e1e2e9]">
                  <input
                    type="checkbox"
                    checked={!state.showPartNumbers}
                    onChange={(e) => onChange({ showPartNumbers: !e.target.checked })}
                    className="w-3 h-3 rounded-none bg-[#191c21] border-[#414755] text-[#4b8eff] focus:ring-0 cursor-pointer"
                  />
                  <span>Hide Part Numbers (#01..)</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-[#c1c6d7] hover:text-[#e1e2e9]">
                  <input
                    type="checkbox"
                    checked={!state.showTotalShapesOverlay}
                    onChange={(e) => onChange({ showTotalShapesOverlay: !e.target.checked })}
                    className="w-3 h-3 rounded-none bg-[#191c21] border-[#414755] text-[#4b8eff] focus:ring-0 cursor-pointer"
                  />
                  <span>Hide Sheet Stamp/Key</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-[#c1c6d7] hover:text-[#e1e2e9]">
                  <input
                    type="checkbox"
                    checked={state.showRegistrationMarks === false}
                    onChange={(e) => onChange({ showRegistrationMarks: !e.target.checked })}
                    className="w-3 h-3 rounded-none bg-[#191c21] border-[#414755] text-[#4b8eff] focus:ring-0 cursor-pointer"
                  />
                  <span>Hide Corner Keys</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-[#c1c6d7] hover:text-[#e1e2e9]">
                  <input
                    type="checkbox"
                    checked={!state.showGuides}
                    onChange={(e) => onChange({ showGuides: !e.target.checked })}
                    className="w-3 h-3 rounded-none bg-[#191c21] border-[#414755] text-[#4b8eff] focus:ring-0 cursor-pointer"
                  />
                  <span>Hide Clamping Guides</span>
                </label>

                <label className="flex items-center gap-1.5 cursor-pointer text-[#c1c6d7] hover:text-[#e1e2e9] col-span-2 pt-1 border-t border-[#32353a]">
                  <input
                    type="checkbox"
                    checked={state.hideShapeLines}
                    onChange={(e) => onChange({ hideShapeLines: e.target.checked })}
                    className="w-3 h-3 rounded-none bg-[#191c21] border-[#414755] text-[#4b8eff] focus:ring-0 cursor-pointer"
                  />
                  <span>Hide Shape Contours (Graphics Only Mode)</span>
                </label>
              </div>
            </div>

            {/* Transparent Sheet Background Option */}
            <div className="bg-[#0b0e13] border border-[#414755] p-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[17px] text-[#adc6ff]">
                    {state.exportTransparentBg ? 'opacity' : 'format_color_fill'}
                  </span>
                  <div>
                    <div className="font-mono text-[10.5px] font-semibold text-[#e1e2e9]">
                      Transparent Sheet Background
                    </div>
                    <div className="text-[8.5px] text-[#8b90a0]">
                      Remove white sheet canvas for alpha transparent export
                    </div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.exportTransparentBg}
                    onChange={(e) => onChange({ exportTransparentBg: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4 bg-[#32353a] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#47e266]"></div>
                </label>
              </div>
              <div className="flex items-center justify-between text-[9px] font-mono text-[#8b90a0] pt-1 border-t border-[#32353a]">
                <span>Canvas Status:</span>
                <span className={state.exportTransparentBg ? 'text-[#47e266] font-semibold' : 'text-[#e1e2e9]'}>
                  {state.exportTransparentBg ? 'TRANSPARENT ALPHA (LIVE IN MAIN & EXPORT)' : 'SOLID WHITE PAPER'}
                </span>
              </div>
            </div>

            <div className="bg-[#0b0e13] p-2.5 border border-[#414755] space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#8b90a0]">Content Layers:</span>
                <span className={state.exportObjectsOnly ? 'text-[#47e266] font-semibold' : 'text-[#e1e2e9]'}>
                  {state.exportObjectsOnly ? 'Clean Objects Only' : 'Objects + Numbering & Keys'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8b90a0]">Active Template:</span>
                <span className="text-[#e1e2e9]">
                  {state.paper} {state.orientation === 'PORT' ? 'Portrait' : 'Landscape'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8b90a0]">Ink Mode:</span>
                <span className="text-[#ffc07a]">
                  {state.renderMode === 'corners'
                    ? 'Corner Marks (Eco Low-Ink)'
                    : 'Full CAD Outlines'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8b90a0]">Part Count:</span>
                <span className="text-[#47e266] font-semibold">
                  {result.totalParts} parts {state.onlyCompleteShapes ? '(100% Complete)' : `(${result.completeCount} full)`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8b90a0]">Boundary Filter:</span>
                <span className={state.onlyCompleteShapes ? 'text-[#47e266]' : 'text-[#ffc07a]'}>
                  {state.onlyCompleteShapes ? 'Complete Shapes Only' : 'Permissive (Overhangs Allowed)'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8b90a0]">Physical Print Area:</span>
                <span className="text-[#e1e2e9]">
                  {result.sheetW.toFixed(1)} x {result.sheetH.toFixed(1)} mm
                </span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-[#414755]/50">
                <span className="text-[#8b90a0]">Print Purification:</span>
                <span className="text-[#47e266] text-[9.5px] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  Zero Grids & Guides
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                className="flex-1 bg-[#adc6ff] hover:bg-[#4b8eff] text-[#00285c] font-mono text-[11px] font-bold py-2 flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                onClick={handleDownload}
              >
                <span className="material-symbols-outlined text-[16px]">
                  file_download
                </span>
                Download File
              </button>
              <button
                type="button"
                className="px-3 bg-[#272a2f] hover:bg-[#36393f] text-[#e1e2e9] border border-[#414755] cursor-pointer"
                onClick={handlePrint}
                title="1:1 Scale Print Dialog"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
