import React from 'react';
import { AppState, NestingResult, ShapeType } from '../types';
import { removeWhiteBackground } from '../utils/imageProcessing';

interface LeftMatrixProps {
  state: AppState;
  result: NestingResult;
  onChange: (patch: Partial<AppState>) => void;
  onSolve: () => void;
  onOpenPresets: () => void;
  onOpenImageEditor: (imageSrc: string, imageName: string, targetType: 'shape' | 'overlay') => void;
  presetsCount?: number;
}

export const LeftMatrix: React.FC<LeftMatrixProps> = ({
  state,
  result,
  onChange,
  onSolve,
  onOpenPresets,
  onOpenImageEditor,
  presetsCount = 0,
}) => {
  return (
    <aside className="w-72 bg-[#191c21] border-r border-[#414755] flex flex-col justify-between shrink-0 z-40 overflow-y-auto select-none">
      <div>
        {/* Matrix Header */}
        <div className="border-b border-[#414755] px-3 py-2 bg-[#0b0e13]">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-semibold text-[#e1e2e9] tracking-wider">
              TOOLING MATRIX
            </span>
            <span className="font-mono text-[10px] text-[#adc6ff] bg-[#1d2025] px-1 py-0.5 border border-[#414755]">
              Active: {state.kerf.toFixed(2)}mm Kerf
            </span>
          </div>
          <div className="text-[10px] text-[#8b90a0] font-mono mt-0.5">
            Laser Bed CNC Coordinate Origin [0.0, 0.0]
          </div>
        </div>

        {/* Preset Quick Access Bar */}
        <div className="px-3 py-1.5 bg-[#101418] border-b border-[#414755] flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-1.5 text-[#8b90a0]">
            <span className="material-symbols-outlined text-[13px] text-[#adc6ff]">bookmarks</span>
            <span>CONFIG PRESETS:</span>
          </div>
          <button
            type="button"
            className="text-[#adc6ff] hover:text-[#ffffff] flex items-center gap-0.5 cursor-pointer font-semibold transition-colors"
            onClick={onOpenPresets}
          >
            <span>Save / Reuse ({presetsCount})</span>
            <span className="material-symbols-outlined text-[12px]">chevron_right</span>
          </button>
        </div>

        {/* Section 1: Shape Definition */}
        <div className="p-3 border-b border-[#414755] space-y-2">
          <div className="flex items-center justify-between font-mono text-[10px] text-[#8b90a0]">
            <span>PART PRIMITIVE</span>
            <span className="text-[#adc6ff] font-semibold">STEP 01</span>
          </div>

          {/* Shape Presets (6 Primitives + Import Option) */}
          <div className="grid grid-cols-6 gap-1 bg-[#0b0e13] p-1.5 border border-[#414755] rounded-none shadow-inner">
            <button
              type="button"
              className={`p-1.5 flex flex-col items-center justify-center transition-all duration-100 cursor-pointer relative group ${
                state.shape === 'rect'
                  ? 'bg-[#272a2f] text-[#adc6ff] border-2 border-[#adc6ff] shadow-[0_0_10px_rgba(173,198,255,0.25)] font-bold'
                  : 'text-[#8b90a0] hover:text-[#e1e2e9] hover:bg-[#1d2025] border border-transparent'
              }`}
              onClick={() => onChange({ shape: 'rect' })}
              title="Rectangle (Flat Sharp Cut)"
            >
              <span className="material-symbols-outlined text-[17px]">crop_square</span>
              <span className="text-[7.5px] font-mono mt-0.5 uppercase tracking-tighter">Rect</span>
              {state.shape === 'rect' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#47e266] rounded-full ring-2 ring-[#0b0e13]" />
              )}
            </button>
            <button
              type="button"
              className={`p-1.5 flex flex-col items-center justify-center transition-all duration-100 cursor-pointer relative group ${
                state.shape === 'roundrect'
                  ? 'bg-[#272a2f] text-[#adc6ff] border-2 border-[#adc6ff] shadow-[0_0_10px_rgba(173,198,255,0.25)] font-bold'
                  : 'text-[#8b90a0] hover:text-[#e1e2e9] hover:bg-[#1d2025] border border-transparent'
              }`}
              onClick={() => onChange({ shape: 'roundrect' })}
              title="Rounded Rectangle (Fillet Radius)"
            >
              <span className="material-symbols-outlined text-[17px]">crop_free</span>
              <span className="text-[7.5px] font-mono mt-0.5 uppercase tracking-tighter">Round</span>
              {state.shape === 'roundrect' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#47e266] rounded-full ring-2 ring-[#0b0e13]" />
              )}
            </button>
            <button
              type="button"
              className={`p-1.5 flex flex-col items-center justify-center transition-all duration-100 cursor-pointer relative group ${
                state.shape === 'washer'
                  ? 'bg-[#272a2f] text-[#adc6ff] border-2 border-[#adc6ff] shadow-[0_0_10px_rgba(173,198,255,0.25)] font-bold'
                  : 'text-[#8b90a0] hover:text-[#e1e2e9] hover:bg-[#1d2025] border border-transparent'
              }`}
              onClick={() => onChange({ shape: 'washer' })}
              title="Washer / Flange Ring"
            >
              <span className="material-symbols-outlined text-[17px]">adjust</span>
              <span className="text-[7.5px] font-mono mt-0.5 uppercase tracking-tighter">Wash</span>
              {state.shape === 'washer' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#47e266] rounded-full ring-2 ring-[#0b0e13]" />
              )}
            </button>
            <button
              type="button"
              className={`p-1.5 flex flex-col items-center justify-center transition-all duration-100 cursor-pointer relative group ${
                state.shape === 'bracket'
                  ? 'bg-[#272a2f] text-[#adc6ff] border-2 border-[#adc6ff] shadow-[0_0_10px_rgba(173,198,255,0.25)] font-bold'
                  : 'text-[#8b90a0] hover:text-[#e1e2e9] hover:bg-[#1d2025] border border-transparent'
              }`}
              onClick={() => onChange({ shape: 'bracket' })}
              title="Bracket with Dual Mounting Holes"
            >
              <span className="material-symbols-outlined text-[17px]">hardware</span>
              <span className="text-[7.5px] font-mono mt-0.5 uppercase tracking-tighter">Brkt</span>
              {state.shape === 'bracket' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#47e266] rounded-full ring-2 ring-[#0b0e13]" />
              )}
            </button>
            <button
              type="button"
              className={`p-1.5 flex flex-col items-center justify-center transition-all duration-100 cursor-pointer relative group ${
                state.shape === 'lshape'
                  ? 'bg-[#272a2f] text-[#adc6ff] border-2 border-[#adc6ff] shadow-[0_0_10px_rgba(173,198,255,0.25)] font-bold'
                  : 'text-[#8b90a0] hover:text-[#e1e2e9] hover:bg-[#1d2025] border border-transparent'
              }`}
              onClick={() => onChange({ shape: 'lshape' })}
              title="L-Brace Angle Plate"
            >
              <span className="material-symbols-outlined text-[17px]">straight</span>
              <span className="text-[7.5px] font-mono mt-0.5 uppercase tracking-tighter">L-Bar</span>
              {state.shape === 'lshape' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#47e266] rounded-full ring-2 ring-[#0b0e13]" />
              )}
            </button>
            <button
              type="button"
              className={`p-1.5 flex flex-col items-center justify-center transition-all duration-100 cursor-pointer relative group ${
                state.shape === 'custom'
                  ? 'bg-[#272a2f] text-[#adc6ff] border-2 border-[#adc6ff] shadow-[0_0_10px_rgba(173,198,255,0.25)] font-bold'
                  : 'text-[#8b90a0] hover:text-[#e1e2e9] hover:bg-[#1d2025] border border-transparent'
              }`}
              onClick={() => {
                onChange({ shape: 'custom' });
                if (!state.customImage) {
                  const input = document.getElementById('custom-img-upload-input');
                  input?.click();
                }
              }}
              title="Import My Shape or Picture (PNG/JPG/SVG/WebP)"
            >
              <span className="material-symbols-outlined text-[17px]">add_photo_alternate</span>
              <span className="text-[7.5px] font-mono mt-0.5 uppercase tracking-tighter">Import</span>
              {state.shape === 'custom' && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#47e266] rounded-full ring-2 ring-[#0b0e13]" />
              )}
            </button>
          </div>

          {/* Hidden File Input for Custom Shape / Picture Import */}
          <input
            id="custom-img-upload-input"
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                const dataUrl = ev.target?.result as string;
                const fileName = file.name;
                onOpenImageEditor(dataUrl, fileName, 'shape');
              };
              reader.readAsDataURL(file);
              e.target.value = ''; // reset so same file can be re-selected
            }}
          />

          {/* Custom Shape / Picture Details Panel (when custom is selected) */}
          {state.shape === 'custom' && (
            <div className="bg-[#0b0e13] border border-[#adc6ff]/50 p-2 space-y-2 mt-1 shadow-sm">
              <div className="flex items-center justify-between text-[10px] font-mono">
                <span className="text-[#adc6ff] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">image</span>
                  IMPORTED SHAPE / PICTURE
                </span>
                <button
                  type="button"
                  className="text-[9px] text-[#adc6ff] underline hover:text-[#ffffff] cursor-pointer"
                  onClick={() => document.getElementById('custom-img-upload-input')?.click()}
                >
                  {state.customImage ? 'Replace Image' : 'Select File'}
                </button>
              </div>

              {state.customImage ? (
                <div className="flex items-center gap-2 bg-[#191c21] p-1.5 border border-[#414755]">
                  <div className="w-10 h-10 bg-[repeating-conic-gradient(#191c21_0%_25%,#101418_0%_50%)] bg-[length:8px_8px] border border-[#414755] flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={state.customImage}
                      alt="Uploaded Shape"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-mono text-[#e1e2e9] truncate font-medium">
                      {state.customImageName || 'imported_shape.png'}
                    </div>
                    <div className="text-[9px] font-mono text-[#8b90a0]">
                      Aspect: {state.customImageAspect.toFixed(2)} : 1
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenImageEditor(state.customImage!, state.customImageName || 'imported_shape.png', 'shape')}
                    className="p-1 text-[#adc6ff] hover:text-[#ffffff] bg-[#272a2f] border border-[#414755] hover:border-[#adc6ff] cursor-pointer"
                    title="Edit image (crop, filter, rotate)"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit</span>
                  </button>
                </div>
              ) : (
                <div
                  className="border border-dashed border-[#414755] hover:border-[#adc6ff] p-3 text-center cursor-pointer transition-colors"
                  onClick={() => document.getElementById('custom-img-upload-input')?.click()}
                >
                  <span className="material-symbols-outlined text-[20px] text-[#adc6ff]">
                    upload_file
                  </span>
                  <div className="text-[10px] font-mono text-[#e1e2e9] mt-1">
                    Click to import shape or picture
                  </div>
                  <div className="text-[8.5px] font-mono text-[#8b90a0]">
                    PNG, JPG, SVG, WebP supported
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between font-mono text-[9px] text-[#c1c6d7] pt-0.5">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.lockAspect}
                    onChange={(e) => onChange({ lockAspect: e.target.checked })}
                    className="w-3 h-3 rounded-none bg-[#0b0e13] border-[#414755] text-[#4b8eff] focus:ring-0 cursor-pointer"
                  />
                  <span>Lock Aspect Ratio</span>
                </label>
              </div>
            </div>
          )}

          {/* Active Shape Indicator Readout */}
          <div className="flex items-center justify-between px-1 text-[9px] font-mono text-[#8b90a0]">
            <span>Selected Primitive:</span>
            <span className="text-[#adc6ff] font-semibold uppercase flex items-center gap-1">
              <span className="inline-block w-1 h-1 bg-[#adc6ff] rounded-full" />
              {state.shape === 'rect' && 'Rectangle'}
              {state.shape === 'roundrect' && `Rounded Rect (r=${state.radius}mm)`}
              {state.shape === 'washer' && 'Washer / Flange'}
              {state.shape === 'bracket' && 'Mounting Bracket'}
              {state.shape === 'lshape' && 'L-Brace Angle'}
              {state.shape === 'custom' && (state.customImageName ? `Custom (${state.customImageName})` : 'Custom Imported Shape')}
            </span>
          </div>

          {/* Dimension Micro Steppers */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-[#0b0e13] border border-[#414755] p-1.5 flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#8b90a0] px-1">W</span>
              <div className="flex items-center">
                <input
                  type="number"
                  min="5"
                  max="400"
                  step="1.0"
                  value={state.partW}
                  onChange={(e) => {
                    const newW = Math.max(5, parseFloat(e.target.value) || 5);
                    if (state.lockAspect && state.shape === 'custom' && state.customImageAspect > 0) {
                      const newH = parseFloat((newW / state.customImageAspect).toFixed(1));
                      onChange({ partW: newW, partH: Math.max(5, newH) });
                    } else {
                      onChange({ partW: newW });
                    }
                  }}
                  className="w-14 bg-transparent border-0 text-right p-0 font-mono text-[12px] font-semibold text-[#e1e2e9] focus:outline-none"
                />
                <span className="font-mono text-[10px] text-[#8b90a0] ml-1">mm</span>
              </div>
            </div>

            <div className="bg-[#0b0e13] border border-[#414755] p-1.5 flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#8b90a0] px-1">H</span>
              <div className="flex items-center">
                <input
                  type="number"
                  min="5"
                  max="400"
                  step="1.0"
                  value={state.partH}
                  onChange={(e) => {
                    const newH = Math.max(5, parseFloat(e.target.value) || 5);
                    if (state.lockAspect && state.shape === 'custom' && state.customImageAspect > 0) {
                      const newW = parseFloat((newH * state.customImageAspect).toFixed(1));
                      onChange({ partH: newH, partW: Math.max(5, newW) });
                    } else {
                      onChange({ partH: newH });
                    }
                  }}
                  className="w-14 bg-transparent border-0 text-right p-0 font-mono text-[12px] font-semibold text-[#e1e2e9] focus:outline-none"
                />
                <span className="font-mono text-[10px] text-[#8b90a0] ml-1">mm</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0b0e13] border border-[#414755] p-1.5 flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#8b90a0] px-1">RAD</span>
              <div className="flex items-center">
                <input
                  type="number"
                  min="0"
                  max="25"
                  step="0.5"
                  value={state.radius}
                  onChange={(e) =>
                    onChange({ radius: Math.max(0, parseFloat(e.target.value) || 0) })
                  }
                  className="w-14 bg-transparent border-0 text-right p-0 font-mono text-[12px] font-semibold text-[#e1e2e9] focus:outline-none"
                />
                <span className="font-mono text-[10px] text-[#8b90a0] ml-1">mm</span>
              </div>
            </div>

            <div className="bg-[#0b0e13] border border-[#414755] p-1.5 flex items-center justify-between">
              <span className="font-mono text-[10px] text-[#8b90a0] px-1">KERF</span>
              <div className="flex items-center">
                <input
                  type="number"
                  min="0"
                  max="2.0"
                  step="0.05"
                  value={state.kerf}
                  onChange={(e) =>
                    onChange({ kerf: Math.max(0, parseFloat(e.target.value) || 0) })
                  }
                  className="w-14 bg-transparent border-0 text-right p-0 font-mono text-[12px] font-semibold text-[#e1e2e9] focus:outline-none"
                />
                <span className="font-mono text-[10px] text-[#8b90a0] ml-1">mm</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Spacing & Toolpath Clearance */}
        <div className="p-3 border-b border-[#414755] space-y-2">
          <div className="flex items-center justify-between font-mono text-[10px] text-[#8b90a0]">
            <span>KERF & MARGINS</span>
            <span className="text-[#8b90a0] font-mono text-[10px]">TOLERANCE</span>
          </div>

          {/* Part Spacing Slider */}
          <div className="space-y-1">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-[#c1c6d7]">Cut Spacing (Bridge)</span>
              <span className="text-[#adc6ff] font-semibold">
                {state.spacing.toFixed(1)} mm
              </span>
            </div>
            <input
              type="range"
              min="0.5"
              max="15.0"
              step="0.5"
              value={state.spacing}
              onChange={(e) => onChange({ spacing: parseFloat(e.target.value) })}
              className="w-full h-1 bg-[#32353a] appearance-none cursor-pointer"
            />
          </div>

          {/* Sheet Clamping Margin Slider */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-[#c1c6d7]">Sheet Clamping Margin</span>
              <span className="text-[#adc6ff] font-semibold">
                {state.margin.toFixed(1)} mm
              </span>
            </div>
            <input
              type="range"
              min="2.0"
              max="30.0"
              step="1.0"
              value={state.margin}
              onChange={(e) => onChange({ margin: parseFloat(e.target.value) })}
              className="w-full h-1 bg-[#32353a] appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* Section 4: Image Overlay & Graphic Inset */}
        <div className="p-3 border-b border-[#414755] space-y-2.5">
          <div className="flex items-center justify-between font-mono text-[10px] text-[#8b90a0]">
            <span className="flex items-center gap-1 text-[#adc6ff] font-semibold">
              <span className="material-symbols-outlined text-[13px]">layers</span>
              IMAGE OVERLAY (ON TOP OF SHAPE)
            </span>
            {state.imageOverlay && (
              <button
                type="button"
                className="text-[9px] text-[#ffb4ab] hover:underline cursor-pointer"
                onClick={() => onChange({ imageOverlay: null, imageOverlayName: null })}
              >
                Clear
              </button>
            )}
          </div>

          {/* Hidden File Input for Image Overlay */}
          <input
            id="overlay-img-upload-input"
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (ev) => {
                const dataUrl = ev.target?.result as string;
                const fileName = file.name;
                onOpenImageEditor(dataUrl, fileName, 'overlay');
              };
              reader.readAsDataURL(file);
              e.target.value = ''; // reset so same file can be re-selected
            }}
          />

          {/* Upload / Active Overlay Card */}
          {state.imageOverlay ? (
            <div className="bg-[#0b0e13] border border-[#adc6ff]/50 p-2 space-y-2">
              <div className="flex items-center gap-2 bg-[#191c21] p-1.5 border border-[#414755]">
                <div className="w-10 h-10 bg-[repeating-conic-gradient(#191c21_0%_25%,#101418_0%_50%)] bg-[length:8px_8px] border border-[#414755] flex items-center justify-center overflow-hidden shrink-0">
                  <img
                    src={state.imageOverlay}
                    alt="Overlay Graphic"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-mono text-[#e1e2e9] truncate font-medium">
                    {state.imageOverlayName || 'overlay_image.png'}
                  </div>
                  <div className="text-[8.5px] font-mono text-[#47e266]">
                    Active on all {result.totalParts} nested parts
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenImageEditor(state.imageOverlay!, state.imageOverlayName || 'overlay_image.png', 'overlay')}
                  className="p-1 text-[#adc6ff] hover:text-[#ffffff] bg-[#272a2f] border border-[#414755] hover:border-[#adc6ff] cursor-pointer"
                  title="Edit overlay image (crop, filter, rotate)"
                >
                  <span className="material-symbols-outlined text-[15px]">tune</span>
                </button>
              </div>

              {/* Instant White Background Remover Button */}
              <button
                type="button"
                onClick={async () => {
                  if (!state.imageOverlay) return;
                  const transparentDataUrl = await removeWhiteBackground(state.imageOverlay, 225);
                  onChange({ imageOverlay: transparentDataUrl });
                }}
                className="w-full py-1 px-2 bg-[#191c21] hover:bg-[#272a2f] border border-[#414755] hover:border-[#adc6ff] text-[#adc6ff] font-mono text-[9.5px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                title="Make white or off-white background of this image transparent"
              >
                <span className="material-symbols-outlined text-[13px] text-[#47e266]">auto_fix_high</span>
                <span>Remove Image White Background (Transparent)</span>
              </button>

              {/* Image Fit Mode */}
              <div className="space-y-1 pt-0.5">
                <div className="flex justify-between font-mono text-[9px] text-[#8b90a0]">
                  <span>IMAGE FIT MODE:</span>
                  <span className="text-[#adc6ff] font-semibold uppercase">{state.imageFit || 'contain'}</span>
                </div>
                <div className="grid grid-cols-3 gap-1 font-mono text-[9px]">
                  <button
                    type="button"
                    onClick={() => onChange({ imageFit: 'contain' })}
                    className={`p-1 border text-center cursor-pointer transition-colors ${
                      (state.imageFit || 'contain') === 'contain'
                        ? 'bg-[#272a2f] border-[#adc6ff] text-[#adc6ff] font-semibold'
                        : 'bg-[#191c21] border-[#414755] text-[#8b90a0] hover:text-[#e1e2e9]'
                    }`}
                    title="Fit proportionally inside shape bounds without stretching"
                  >
                    Contain (1:1)
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ imageFit: 'stretch' })}
                    className={`p-1 border text-center cursor-pointer transition-colors ${
                      state.imageFit === 'stretch'
                        ? 'bg-[#272a2f] border-[#adc6ff] text-[#adc6ff] font-semibold'
                        : 'bg-[#191c21] border-[#414755] text-[#8b90a0] hover:text-[#e1e2e9]'
                    }`}
                    title="Stretch image to exact shape dimensions"
                  >
                    Stretch (Fill)
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ imageFit: 'cover' })}
                    className={`p-1 border text-center cursor-pointer transition-colors ${
                      state.imageFit === 'cover'
                        ? 'bg-[#272a2f] border-[#adc6ff] text-[#adc6ff] font-semibold'
                        : 'bg-[#191c21] border-[#414755] text-[#8b90a0] hover:text-[#e1e2e9]'
                    }`}
                    title="Cover entire area and clip excess"
                  >
                    Cover (Bleed)
                  </button>
                </div>
              </div>

              {/* Adjust Margin & Padding */}
              <div className="space-y-2 pt-1 font-mono text-[10px]">
                {/* Margin */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[#c1c6d7]">Image Margin</span>
                      <span className="text-[8.5px] text-[#8b90a0] ml-1">(outer offset):</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max={Math.max(2, Math.floor(Math.min(state.partW, state.partH) * 0.45))}
                        step="0.5"
                        value={state.imageMargin}
                        onChange={(e) =>
                          onChange({
                            imageMargin: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-12 bg-[#191c21] border border-[#414755] text-right px-1 py-0.2 text-[#adc6ff] font-semibold text-[10px] focus:outline-none"
                      />
                      <span className="text-[#8b90a0] text-[9px]">mm</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(2, Math.floor(Math.min(state.partW, state.partH) * 0.45))}
                    step="0.5"
                    value={state.imageMargin}
                    onChange={(e) => onChange({ imageMargin: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-[#32353a] appearance-none cursor-pointer"
                  />
                  <div className="flex gap-1 pt-0.5">
                    {[0, 1, 2, 4].map((val) => (
                      <button
                        key={`m-${val}`}
                        type="button"
                        onClick={() => onChange({ imageMargin: val })}
                        className={`text-[8.5px] px-1.5 py-0.5 border cursor-pointer ${
                          state.imageMargin === val
                            ? 'bg-[#272a2f] border-[#adc6ff] text-[#adc6ff]'
                            : 'bg-[#191c21] border-[#414755] text-[#8b90a0] hover:text-[#e1e2e9]'
                        }`}
                      >
                        {val}mm
                      </button>
                    ))}
                  </div>
                </div>

                {/* Padding */}
                <div className="space-y-1 pt-1">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[#c1c6d7]">Image Padding</span>
                      <span className="text-[8.5px] text-[#8b90a0] ml-1">(inner inset):</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max={Math.max(2, Math.floor(Math.min(state.partW, state.partH) * 0.45))}
                        step="0.5"
                        value={state.imagePadding}
                        onChange={(e) =>
                          onChange({
                            imagePadding: Math.max(0, parseFloat(e.target.value) || 0),
                          })
                        }
                        className="w-12 bg-[#191c21] border border-[#414755] text-right px-1 py-0.2 text-[#adc6ff] font-semibold text-[10px] focus:outline-none"
                      />
                      <span className="text-[#8b90a0] text-[9px]">mm</span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={Math.max(2, Math.floor(Math.min(state.partW, state.partH) * 0.45))}
                    step="0.5"
                    value={state.imagePadding}
                    onChange={(e) => onChange({ imagePadding: parseFloat(e.target.value) })}
                    className="w-full h-1 bg-[#32353a] appearance-none cursor-pointer"
                  />
                  <div className="flex gap-1 pt-0.5">
                    {[0, 1, 2, 4].map((val) => (
                      <button
                        key={`p-${val}`}
                        type="button"
                        onClick={() => onChange({ imagePadding: val })}
                        className={`text-[8.5px] px-1.5 py-0.5 border cursor-pointer ${
                          state.imagePadding === val
                            ? 'bg-[#272a2f] border-[#adc6ff] text-[#adc6ff]'
                            : 'bg-[#191c21] border-[#414755] text-[#8b90a0] hover:text-[#e1e2e9]'
                        }`}
                      >
                        {val}mm
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hide Shape Lines Toggle */}
                <label className="flex items-center justify-between p-1.5 bg-[#191c21] border border-[#414755] cursor-pointer hover:border-[#adc6ff] transition-colors select-none mt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={state.hideShapeLines}
                      onChange={(e) => onChange({ hideShapeLines: e.target.checked })}
                      className="w-3.5 h-3.5 rounded-none bg-[#0b0e13] border-[#414755] text-[#4b8eff] focus:ring-0 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#e1e2e9] font-medium">Hide Shape Cut Lines</span>
                      <span className="text-[8.5px] text-[#8b90a0]">Only display overlaid image without shape contours</span>
                    </div>
                  </div>
                  <span className={`text-[8.5px] font-mono px-1 py-0.2 border ${state.hideShapeLines ? 'text-[#ffc07a] border-[#fa9b00]/40 bg-[#fa9b00]/10' : 'text-[#8b90a0] border-[#414755]'}`}>
                    {state.hideShapeLines ? 'HIDDEN' : 'VISIBLE'}
                  </span>
                </label>

                {/* Transparent Sheet Canvas Toggle */}
                <label className="flex items-center justify-between p-1.5 bg-[#191c21] border border-[#414755] cursor-pointer hover:border-[#adc6ff] transition-colors select-none mt-1">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={state.exportTransparentBg}
                      onChange={(e) => onChange({ exportTransparentBg: e.target.checked })}
                      className="w-3.5 h-3.5 rounded-none bg-[#0b0e13] border-[#414755] text-[#4b8eff] focus:ring-0 cursor-pointer"
                    />
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#e1e2e9] font-medium">Transparent Sheet Canvas</span>
                      <span className="text-[8.5px] text-[#8b90a0]">Remove white sheet background in main canvas & exports</span>
                    </div>
                  </div>
                  <span className={`text-[8.5px] font-mono px-1 py-0.2 border ${state.exportTransparentBg ? 'text-[#47e266] border-[#47e266]/40 bg-[#47e266]/10 font-semibold' : 'text-[#8b90a0] border-[#414755]'}`}>
                    {state.exportTransparentBg ? 'TRANSPARENT' : 'WHITE'}
                  </span>
                </label>

                {/* Image Position & Alignment Suite */}
                <div className="border-t border-[#414755] pt-2 space-y-2 font-mono text-[10px]">
                  <div className="flex justify-between items-center">
                    <span className="text-[#e1e2e9] font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px] text-[#adc6ff]">
                        pin_drop
                      </span>
                      Image Position & Alignment
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onChange({
                          imageAlignX: 'center',
                          imageAlignY: 'center',
                          imageOffsetX: 0,
                          imageOffsetY: 0,
                          imageScale: 100,
                        })
                      }
                      className="text-[8.5px] text-[#8b90a0] hover:text-[#adc6ff] underline cursor-pointer"
                      title="Reset alignment to Center (0,0, 100%)"
                    >
                      Reset
                    </button>
                  </div>

                  {/* Vertical Placement (Top, Center, Bottom) */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] text-[#8b90a0]">
                      <span>Vertical Placement:</span>
                      <span className="text-[#adc6ff] font-semibold uppercase">
                        {state.imageAlignY || 'center'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {(['top', 'center', 'bottom'] as const).map((vPos) => (
                        <button
                          key={`vpos-${vPos}`}
                          type="button"
                          onClick={() => onChange({ imageAlignY: vPos })}
                          className={`py-1 px-1.5 border text-center cursor-pointer transition-colors flex items-center justify-center gap-1 text-[9.5px] ${
                            (state.imageAlignY || 'center') === vPos
                              ? 'bg-[#272a2f] border-[#adc6ff] text-[#adc6ff] font-semibold shadow-sm'
                              : 'bg-[#191c21] border-[#414755] text-[#8b90a0] hover:text-[#e1e2e9]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {vPos === 'top'
                              ? 'vertical_align_top'
                              : vPos === 'bottom'
                              ? 'vertical_align_bottom'
                              : 'vertical_align_center'}
                          </span>
                          <span className="capitalize">{vPos}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Horizontal Placement (Left, Center, Right) */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[9px] text-[#8b90a0]">
                      <span>Horizontal Placement:</span>
                      <span className="text-[#adc6ff] font-semibold uppercase">
                        {state.imageAlignX || 'center'}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {(['left', 'center', 'right'] as const).map((hPos) => (
                        <button
                          key={`hpos-${hPos}`}
                          type="button"
                          onClick={() => onChange({ imageAlignX: hPos })}
                          className={`py-1 px-1.5 border text-center cursor-pointer transition-colors flex items-center justify-center gap-1 text-[9.5px] ${
                            (state.imageAlignX || 'center') === hPos
                              ? 'bg-[#272a2f] border-[#adc6ff] text-[#adc6ff] font-semibold shadow-sm'
                              : 'bg-[#191c21] border-[#414755] text-[#8b90a0] hover:text-[#e1e2e9]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[12px]">
                            {hPos === 'left'
                              ? 'align_horizontal_left'
                              : hPos === 'right'
                              ? 'align_horizontal_right'
                              : 'align_horizontal_center'}
                          </span>
                          <span className="capitalize">{hPos}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 3x3 Interactive Anchor Matrix Grid */}
                  <div className="bg-[#101418] border border-[#414755] p-2 flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-[#c1c6d7] font-medium">9-Point Anchor Grid</span>
                      <span className="text-[8px] text-[#8b90a0]">
                        Click any cell to snap position
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-0.5 bg-[#0b0e13] p-1 border border-[#32353a]">
                      {(
                        [
                          ['top', 'left'],
                          ['top', 'center'],
                          ['top', 'right'],
                          ['center', 'left'],
                          ['center', 'center'],
                          ['center', 'right'],
                          ['bottom', 'left'],
                          ['bottom', 'center'],
                          ['bottom', 'right'],
                        ] as const
                      ).map(([yA, xA]) => {
                        const isSelected =
                          (state.imageAlignY || 'center') === yA &&
                          (state.imageAlignX || 'center') === xA;
                        return (
                          <button
                            key={`grid-${yA}-${xA}`}
                            type="button"
                            onClick={() =>
                              onChange({
                                imageAlignY: yA,
                                imageAlignX: xA,
                              })
                            }
                            className={`w-5 h-5 flex items-center justify-center border transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-[#4b8eff]/30 border-[#adc6ff] text-[#adc6ff]'
                                : 'bg-[#191c21] border-[#32353a] hover:border-[#8b90a0] text-[#606573]'
                            }`}
                            title={`Anchor: ${yA.toUpperCase()} - ${xA.toUpperCase()}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isSelected ? 'bg-[#adc6ff] shadow-[0_0_4px_#adc6ff]' : 'bg-[#606573]'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Fine Nudge Offsets (Y & X in mm) */}
                  <div className="space-y-2 pt-1 border-t border-[#32353a]">
                    {/* Y Offset */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[#c1c6d7] text-[9.5px]">
                          Offset Y <span className="text-[#8b90a0]">(Vert Nudge):</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.5"
                            value={state.imageOffsetY ?? 0}
                            onChange={(e) =>
                              onChange({
                                imageOffsetY: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-12 bg-[#191c21] border border-[#414755] text-right px-1 py-0.2 text-[#adc6ff] font-semibold text-[10px] focus:outline-none"
                          />
                          <span className="text-[#8b90a0] text-[9px]">mm</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={-Math.max(10, Math.floor(state.partH * 0.5))}
                        max={Math.max(10, Math.floor(state.partH * 0.5))}
                        step="0.5"
                        value={state.imageOffsetY ?? 0}
                        onChange={(e) => onChange({ imageOffsetY: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-[#32353a] appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between gap-1 pt-0.5">
                        {[-2, -0.5, 0, 0.5, 2].map((val) => (
                          <button
                            key={`offy-${val}`}
                            type="button"
                            onClick={() => onChange({ imageOffsetY: val })}
                            className={`text-[8px] flex-1 py-0.5 border cursor-pointer ${
                              (state.imageOffsetY ?? 0) === val
                                ? 'bg-[#272a2f] border-[#adc6ff] text-[#adc6ff]'
                                : 'bg-[#191c21] border-[#414755] text-[#8b90a0] hover:text-[#e1e2e9]'
                            }`}
                          >
                            {val > 0 ? `+${val}` : val}mm
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* X Offset */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[#c1c6d7] text-[9.5px]">
                          Offset X <span className="text-[#8b90a0]">(Horiz Nudge):</span>
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step="0.5"
                            value={state.imageOffsetX ?? 0}
                            onChange={(e) =>
                              onChange({
                                imageOffsetX: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-12 bg-[#191c21] border border-[#414755] text-right px-1 py-0.2 text-[#adc6ff] font-semibold text-[10px] focus:outline-none"
                          />
                          <span className="text-[#8b90a0] text-[9px]">mm</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={-Math.max(10, Math.floor(state.partW * 0.5))}
                        max={Math.max(10, Math.floor(state.partW * 0.5))}
                        step="0.5"
                        value={state.imageOffsetX ?? 0}
                        onChange={(e) => onChange({ imageOffsetX: parseFloat(e.target.value) })}
                        className="w-full h-1 bg-[#32353a] appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between gap-1 pt-0.5">
                        {[-2, -0.5, 0, 0.5, 2].map((val) => (
                          <button
                            key={`offx-${val}`}
                            type="button"
                            onClick={() => onChange({ imageOffsetX: val })}
                            className={`text-[8px] flex-1 py-0.5 border cursor-pointer ${
                              (state.imageOffsetX ?? 0) === val
                                ? 'bg-[#272a2f] border-[#adc6ff] text-[#adc6ff]'
                                : 'bg-[#191c21] border-[#414755] text-[#8b90a0] hover:text-[#e1e2e9]'
                            }`}
                          >
                            {val > 0 ? `+${val}` : val}mm
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image Scale / Size Multiplier */}
                    <div className="space-y-1 pt-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[#c1c6d7] text-[9.5px]">
                          Overlay Size / Scale:
                        </span>
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            min="20"
                            max="200"
                            step="5"
                            value={state.imageScale ?? 100}
                            onChange={(e) =>
                              onChange({
                                imageScale: Math.max(10, Math.min(300, parseInt(e.target.value) || 100)),
                              })
                            }
                            className="w-12 bg-[#191c21] border border-[#414755] text-right px-1 py-0.2 text-[#adc6ff] font-semibold text-[10px] focus:outline-none"
                          />
                          <span className="text-[#8b90a0] text-[9px]">%</span>
                        </div>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="200"
                        step="5"
                        value={state.imageScale ?? 100}
                        onChange={(e) => onChange({ imageScale: parseInt(e.target.value) })}
                        className="w-full h-1 bg-[#32353a] appearance-none cursor-pointer"
                      />
                      <div className="flex gap-1 pt-0.5">
                        {[50, 75, 100, 125].map((val) => (
                          <button
                            key={`scale-${val}`}
                            type="button"
                            onClick={() => onChange({ imageScale: val })}
                            className={`text-[8.5px] px-1.5 py-0.5 border cursor-pointer ${
                              (state.imageScale ?? 100) === val
                                ? 'bg-[#272a2f] border-[#adc6ff] text-[#adc6ff]'
                                : 'bg-[#191c21] border-[#414755] text-[#8b90a0] hover:text-[#e1e2e9]'
                            }`}
                          >
                            {val}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Helper shortcut notice */}
                    <div className="text-[8px] text-[#8b90a0] bg-[#0b0e13] p-1.5 border border-[#32353a] flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[12px] text-[#adc6ff]">
                        keyboard
                      </span>
                      <span>
                        Tip: Click canvas and press <span className="text-[#e1e2e9] font-semibold">Arrow keys</span> (or Shift+Arrows) to nudge image in real-time.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div
              className="border border-dashed border-[#414755] hover:border-[#adc6ff] p-3 text-center cursor-pointer transition-colors bg-[#0b0e13]"
              onClick={() => document.getElementById('overlay-img-upload-input')?.click()}
            >
              <span className="material-symbols-outlined text-[20px] text-[#adc6ff]">
                add_photo_alternate
              </span>
              <div className="text-[10.5px] font-mono text-[#e1e2e9] mt-1 font-medium">
                Import Image on Top of Shape
              </div>
              <div className="text-[8.5px] font-mono text-[#8b90a0]">
                Overlay logo, picture, or graphic inside each nested part
              </div>
            </div>
          )}

          {/* Hide shape lines independent toggle even without image */}
          {!state.imageOverlay && (
            <label className="flex items-center justify-between p-1.5 bg-[#0b0e13] border border-[#414755] cursor-pointer hover:border-[#adc6ff] transition-colors select-none">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.hideShapeLines}
                  onChange={(e) => onChange({ hideShapeLines: e.target.checked })}
                  className="w-3.5 h-3.5 rounded-none bg-[#0b0e13] border-[#414755] text-[#4b8eff] focus:ring-0 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#e1e2e9] font-medium font-mono">Hide Shape Cut Lines</span>
                  <span className="text-[8.5px] text-[#8b90a0] font-mono">Suppress cutlines / corner marks on canvas & prints</span>
                </div>
              </div>
              <span className={`text-[8.5px] font-mono px-1 py-0.2 border ${state.hideShapeLines ? 'text-[#ffc07a] border-[#fa9b00]/40 bg-[#fa9b00]/10' : 'text-[#8b90a0] border-[#414755]'}`}>
                {state.hideShapeLines ? 'HIDDEN' : 'VISIBLE'}
              </span>
            </label>
          )}
        </div>

        {/* Section 3: Packing & Ink-Saver Options */}
        <div className="p-3 border-b border-[#414755] space-y-2.5">
          <div className="flex items-center justify-between font-mono text-[10px] text-[#8b90a0]">
            <span>PACKING & INK-SAVER RENDER</span>
            <span className="bg-[#00320d] text-[#47e266] px-1 py-0.2 font-mono text-[9px] uppercase border border-[#47e266]/40">
              Maker-Mode
            </span>
          </div>

          {/* Primary Fill Action */}
          <button
            type="button"
            className="w-full bg-[#4b8eff] hover:bg-[#adc6ff] text-[#00285c] font-mono text-[11px] font-bold py-1.5 px-2 flex items-center justify-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            onClick={onSolve}
          >
            <span className="material-symbols-outlined text-[16px]">
              auto_awesome_motion
            </span>
            Fill Sheet (Max Yield)
          </button>

          {/* Strategy Grid/Stagger */}
          <div className="grid grid-cols-2 gap-1 bg-[#0b0e13] p-1 border border-[#414755]">
            <button
              type="button"
              className={`px-2 py-1 font-mono text-[10px] transition-colors cursor-pointer ${
                state.strategy === 'ortho'
                  ? 'bg-[#272a2f] text-[#adc6ff] border border-[#adc6ff]'
                  : 'text-[#c1c6d7] hover:text-[#e1e2e9] hover:bg-[#1d2025]'
              }`}
              onClick={() => onChange({ strategy: 'ortho' })}
            >
              Orthogonal
            </button>
            <button
              type="button"
              className={`px-2 py-1 font-mono text-[10px] transition-colors cursor-pointer ${
                state.strategy === 'stagger'
                  ? 'bg-[#272a2f] text-[#adc6ff] border border-[#adc6ff]'
                  : 'text-[#c1c6d7] hover:text-[#e1e2e9] hover:bg-[#1d2025]'
              }`}
              onClick={() => onChange({ strategy: 'stagger' })}
            >
              Staggered (Offset)
            </button>
          </div>

          {/* Packing Constraints: 90° Rotations & Complete Shapes Only */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between font-mono text-[10px]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={state.allowRotate}
                  onChange={(e) => onChange({ allowRotate: e.target.checked })}
                  className="w-3.5 h-3.5 rounded-none bg-[#0b0e13] border-[#414755] text-[#4b8eff] focus:ring-0 cursor-pointer"
                />
                <span className="text-[#c1c6d7]">Allow 90° Rotations</span>
              </label>
            </div>

            {/* Option: Keep Only Complete Shapes */}
            <label className="flex items-center justify-between p-1.5 bg-[#0b0e13] border border-[#414755] cursor-pointer hover:border-[#adc6ff] transition-colors select-none">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={state.onlyCompleteShapes}
                  onChange={(e) => onChange({ onlyCompleteShapes: e.target.checked })}
                  className="w-3.5 h-3.5 rounded-none bg-[#0b0e13] border-[#414755] text-[#4b8eff] focus:ring-0 cursor-pointer"
                />
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono text-[#e1e2e9] font-medium flex items-center gap-1">
                    Keep Only Complete Shapes
                    {state.onlyCompleteShapes && (
                      <span className="material-symbols-outlined text-[13px] text-[#47e266]">
                        verified
                      </span>
                    )}
                  </span>
                  <span className="text-[8.5px] font-mono text-[#8b90a0]">
                    {state.onlyCompleteShapes
                      ? 'Omit partial or clipped boundary parts'
                      : 'Show partial edge parts across boundaries'}
                  </span>
                </div>
              </div>
              <span
                className={`text-[8.5px] font-mono px-1 py-0.5 border ${
                  state.onlyCompleteShapes
                    ? 'text-[#47e266] border-[#47e266]/40 bg-[#00320d]/40 font-semibold'
                    : 'text-[#ffc07a] border-[#fa9b00]/40 bg-[#fa9b00]/10'
                }`}
              >
                {state.onlyCompleteShapes ? 'STRICT' : 'PERMISSIVE'}
              </span>
            </label>
          </div>

          {/* Minimalist Render Mode Toggle */}
          <div className="bg-[#0b0e13] p-2 border border-[#414755] space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] font-semibold text-[#ffc07a]">
                RENDER MODE
              </span>
              <span className="text-[9px] font-mono px-1 py-0.5 bg-[#272a2f] border border-[#414755] text-[#c1c6d7]">
                Print Test
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                className={`p-1 text-center font-mono text-[10px] cursor-pointer transition-colors ${
                  state.renderMode === 'full'
                    ? 'bg-[#adc6ff] text-[#00285c] font-semibold border border-[#adc6ff]'
                    : 'text-[#c1c6d7] border border-transparent hover:border-[#414755]'
                }`}
                onClick={() => onChange({ renderMode: 'full' })}
              >
                Full Outlines
              </button>
              <button
                type="button"
                className={`p-1 text-center font-mono text-[10px] cursor-pointer transition-colors ${
                  state.renderMode === 'corners'
                    ? 'bg-[#adc6ff] text-[#00285c] font-semibold border border-[#adc6ff]'
                    : 'text-[#c1c6d7] border border-transparent hover:border-[#414755]'
                }`}
                onClick={() => onChange({ renderMode: 'corners' })}
              >
                Corner Marks
              </button>
            </div>

            {/* Corner length stepper if corner mode */}
            {state.renderMode === 'corners' && (
              <div className="pt-1">
                <div className="flex justify-between text-[10px] font-mono text-[#8b90a0]">
                  <span>Corner Tick Length</span>
                  <span className="text-[#adc6ff] font-semibold">
                    {state.cornerLen.toFixed(1)} mm
                  </span>
                </div>
                <input
                  type="range"
                  min="1.5"
                  max="10.0"
                  step="0.5"
                  value={state.cornerLen}
                  onChange={(e) => onChange({ cornerLen: parseFloat(e.target.value) })}
                  className="w-full h-1 bg-[#32353a] appearance-none cursor-pointer mt-1"
                />
                <div className="text-[9px] text-[#47e266] font-mono flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-[11px]">eco</span>
                  Conserves 86% printer toner & ink
                </div>
              </div>
            )}

            <div className="space-y-1.5 pt-1 border-t border-[#414755]/60">
              {/* Option: Keep Objects Only (Hide Numbering & Keys) */}
              <label className="flex items-center justify-between p-1.5 bg-[#0b0e13] border border-[#414755] cursor-pointer hover:border-[#adc6ff] transition-colors select-none mb-1">
                <div className="flex items-center gap-2">
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
                    className="w-3.5 h-3.5 rounded-none bg-[#191c21] border-[#414755] text-[#4b8eff] focus:ring-0 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-[#e1e2e9] font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-[#adc6ff]">
                        filter_center_focus
                      </span>
                      Objects Only Mode
                    </span>
                    <span className="text-[8.5px] font-mono text-[#8b90a0]">
                      Hide numbering, info stamps & keys
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[8.5px] font-mono px-1 py-0.2 border ${
                    state.exportObjectsOnly
                      ? 'text-[#47e266] border-[#47e266]/40 bg-[#00320d]/40 font-semibold'
                      : 'text-[#8b90a0] border-[#414755]'
                  }`}
                >
                  {state.exportObjectsOnly ? 'ACTIVE' : 'OFF'}
                </span>
              </label>

              {/* Transparent Sheet Canvas Toggle */}
              <label className="flex items-center justify-between p-1.5 bg-[#0b0e13] border border-[#414755] cursor-pointer hover:border-[#adc6ff] transition-colors select-none mb-1">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={state.exportTransparentBg}
                    onChange={(e) => onChange({ exportTransparentBg: e.target.checked })}
                    className="w-3.5 h-3.5 rounded-none bg-[#191c21] border-[#414755] text-[#4b8eff] focus:ring-0 cursor-pointer"
                  />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-mono text-[#e1e2e9] font-medium flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px] text-[#adc6ff]">
                        opacity
                      </span>
                      Transparent Canvas
                    </span>
                    <span className="text-[8.5px] font-mono text-[#8b90a0]">
                      Remove white sheet background (alpha export)
                    </span>
                  </div>
                </div>
                <span
                  className={`text-[8.5px] font-mono px-1 py-0.2 border ${
                    state.exportTransparentBg
                      ? 'text-[#47e266] border-[#47e266]/40 bg-[#00320d]/40 font-semibold'
                      : 'text-[#8b90a0] border-[#414755]'
                  }`}
                >
                  {state.exportTransparentBg ? 'ACTIVE' : 'OFF'}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-mono text-[10px] text-[#c1c6d7]">
                <input
                  type="checkbox"
                  checked={state.showTotalShapesOverlay}
                  onChange={(e) => onChange({ showTotalShapesOverlay: e.target.checked })}
                  className="w-3 h-3 rounded-none bg-[#0b0e13] border-[#414755] text-[#4b8eff] focus:ring-0 cursor-pointer"
                />
                <span className="flex items-center gap-1.5">
                  <span>Display Total Shapes Count Stamp</span>
                  <span className="text-[9px] text-[#47e266] font-semibold bg-[#00320d] px-1 py-0.2 border border-[#47e266]/40">
                    {result.totalParts} PCS
                  </span>
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-mono text-[10px] text-[#c1c6d7]">
                <input
                  type="checkbox"
                  checked={state.showPartNumbers}
                  onChange={(e) => onChange({ showPartNumbers: e.target.checked })}
                  className="w-3 h-3 rounded-none bg-[#0b0e13] border-[#414755] text-[#4b8eff] focus:ring-0 cursor-pointer"
                />
                <span>Number Each Distributed Shape (#01, #02...)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-mono text-[10px] text-[#c1c6d7]">
                <input
                  type="checkbox"
                  checked={state.showGuides}
                  onChange={(e) => onChange({ showGuides: e.target.checked })}
                  className="w-3 h-3 rounded-none bg-[#0b0e13] border-[#414755] text-[#4b8eff] focus:ring-0 cursor-pointer"
                />
                <span>Display Sheet Dimension Bounds</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer font-mono text-[10px] text-[#c1c6d7]">
                <input
                  type="checkbox"
                  checked={state.showCenters}
                  onChange={(e) => onChange({ showCenters: e.target.checked })}
                  className="w-3 h-3 rounded-none bg-[#0b0e13] border-[#414755] text-[#4b8eff] focus:ring-0 cursor-pointer"
                />
                <span>Drill Center Registration Crosshairs</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Footer Telemetry */}
      <div className="p-3 bg-[#0b0e13] border-t border-[#414755]">
        <div className="flex items-center justify-between font-mono text-[10px] mb-1.5">
          <span className="text-[#8b90a0]">NEST TELEMETRY</span>
          <span className="text-[#47e266] font-semibold">
            {result.solveTimeMs}ms SOLVE
          </span>
        </div>

        <div className="space-y-1 font-mono text-[10px]">
          <div className="flex justify-between items-center">
            <span className="text-[#c1c6d7]">Packed Parts:</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[#e1e2e9] font-bold text-[11px]">
                {result.totalParts} pcs
              </span>
              {state.onlyCompleteShapes ? (
                <span className="text-[9px] text-[#47e266] bg-[#00320d] px-1 py-0.2 border border-[#47e266]/30">
                  100% COMPLETE
                </span>
              ) : (
                <span className="text-[9px] text-[#ffc07a] bg-[#fa9b00]/10 px-1 py-0.2 border border-[#fa9b00]/30">
                  {result.completeCount} full / {result.partialCount} partial
                </span>
              )}
            </div>
          </div>
          <div className="flex justify-between">
            <span className="text-[#c1c6d7]">Sheet Yield Efficiency:</span>
            <span className="text-[#adc6ff] font-bold">
              {result.efficiency.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-[#32353a] h-1.5 overflow-hidden">
            <div
              className="bg-[#adc6ff] h-full transition-all duration-300"
              style={{ width: `${result.efficiency.toFixed(1)}%` }}
            />
          </div>
          <div className="flex justify-between pt-1 text-[9px]">
            <span className="text-[#8b90a0]">Scrap Waste:</span>
            <span className="text-[#8b90a0] font-semibold">
              {result.scrap.toFixed(1)}%
            </span>
          </div>
          <div className="flex justify-between text-[9px]">
            <span className="text-[#8b90a0]">Estimated Cut Path:</span>
            <span className="text-[#c1c6d7] font-semibold">
              {result.pathLengthMeters.toFixed(1)} m
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
