import React, { useState, useRef, useEffect, useCallback } from 'react';

interface ImageEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialImage: string;
  imageName: string;
  onSave: (editedDataUrl: string, fileName: string) => void;
}

export const ImageEditorModal: React.FC<ImageEditorModalProps> = ({
  isOpen,
  onClose,
  initialImage,
  imageName,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  // Transformations
  const [rotation, setRotation] = useState<number>(0); // 0, 90, 180, 270
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Tonal & Filters
  const [brightness, setBrightness] = useState<number>(100); // 0 - 200%
  const [contrast, setContrast] = useState<number>(100); // 0 - 200%
  const [grayscale, setGrayscale] = useState<boolean>(false);
  const [invert, setInvert] = useState<boolean>(false);
  const [removeWhiteBg, setRemoveWhiteBg] = useState<boolean>(false);
  const [whiteThreshold, setWhiteThreshold] = useState<number>(225); // 180 - 255
  const [stampMode, setStampMode] = useState<boolean>(false);
  const [stampThreshold, setStampThreshold] = useState<number>(128); // 50 - 200

  // Crop Insets (%)
  const [cropTop, setCropTop] = useState<number>(0);
  const [cropBottom, setCropBottom] = useState<number>(0);
  const [cropLeft, setCropLeft] = useState<number>(0);
  const [cropRight, setCropRight] = useState<number>(0);

  // Calculated resolution readout
  const [outDims, setOutDims] = useState<{ w: number; h: number; aspect: number }>({
    w: 0,
    h: 0,
    aspect: 1,
  });

  // Load image
  useEffect(() => {
    if (initialImage) {
      const img = new Image();
      img.onload = () => {
        setImageObj(img);
      };
      img.src = initialImage;
    }
  }, [initialImage]);

  // Redraw canvas with all edits applied
  const applyEdits = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imageObj) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const naturalW = imageObj.naturalWidth;
    const naturalH = imageObj.naturalHeight;

    // Crop box in natural image pixels
    const sx = (cropLeft / 100) * naturalW;
    const sy = (cropTop / 100) * naturalH;
    const sw = Math.max(10, naturalW * (1 - (cropLeft + cropRight) / 100));
    const sh = Math.max(10, naturalH * (1 - (cropTop + cropBottom) / 100));

    // Handle rotation
    const isSideways = rotation % 180 !== 0;
    const outW = Math.round(isSideways ? sh : sw);
    const outH = Math.round(isSideways ? sw : sh);

    canvas.width = outW;
    canvas.height = outH;
    setOutDims({ w: outW, h: outH, aspect: parseFloat((outW / (outH || 1)).toFixed(2)) });

    ctx.save();
    ctx.clearRect(0, 0, outW, outH);

    // Color filters
    let filterString = `brightness(${brightness}%) contrast(${contrast}%)`;
    if (grayscale) filterString += ' grayscale(100%)';
    if (invert) filterString += ' invert(100%)';
    ctx.filter = filterString;

    // Center translation for rotation/flipping
    ctx.translate(outW / 2, outH / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);

    // Draw source cropped rect centered
    ctx.drawImage(imageObj, sx, sy, sw, sh, -sw / 2, -sh / 2, sw, sh);

    ctx.restore();

    // Post-processing for transparency and stamp threshold if enabled
    if (removeWhiteBg || stampMode) {
      const imgData = ctx.getImageData(0, 0, outW, outH);
      const data = imgData.data;
      const len = data.length;

      for (let i = 0; i < len; i += 4) {
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        const a = data[i + 3];

        if (a === 0) continue;

        // Stamp mode thresholding (1-bit monochrome)
        if (stampMode) {
          const lum = 0.299 * r + 0.587 * g + 0.114 * b;
          if (lum < stampThreshold) {
            r = 16;
            g = 20;
            b = 24;
          } else {
            r = 255;
            g = 255;
            b = 255;
          }
          data[i] = r;
          data[i + 1] = g;
          data[i + 2] = b;
        }

        // White background transparency
        if (removeWhiteBg) {
          const avg = (r + g + b) / 3;
          const diff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
          if ((r >= whiteThreshold && g >= whiteThreshold && b >= whiteThreshold) || (avg >= whiteThreshold && diff < 30)) {
            data[i + 3] = 0; // Transparent
          }
        }
      }

      ctx.putImageData(imgData, 0, 0);
    }
  }, [
    imageObj,
    brightness,
    contrast,
    grayscale,
    invert,
    rotation,
    flipH,
    flipV,
    cropTop,
    cropBottom,
    cropLeft,
    cropRight,
    removeWhiteBg,
    whiteThreshold,
    stampMode,
    stampThreshold,
  ]);

  useEffect(() => {
    if (isOpen && imageObj) {
      applyEdits();
    }
  }, [isOpen, imageObj, applyEdits]);

  if (!isOpen) return null;

  const handleReset = () => {
    setBrightness(100);
    setContrast(100);
    setGrayscale(false);
    setInvert(false);
    setRemoveWhiteBg(false);
    setWhiteThreshold(240);
    setStampMode(false);
    setStampThreshold(128);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setCropTop(0);
    setCropBottom(0);
    setCropLeft(0);
    setCropRight(0);
  };

  const handleCropPreset = (targetRatio: number | null) => {
    if (!imageObj) return;
    if (targetRatio === null) {
      // Free / Reset
      setCropTop(0);
      setCropBottom(0);
      setCropLeft(0);
      setCropRight(0);
      return;
    }

    const nw = imageObj.naturalWidth;
    const nh = imageObj.naturalHeight;
    const currentRatio = nw / nh;

    if (currentRatio > targetRatio) {
      // Too wide, crop sides
      const desiredW = nh * targetRatio;
      const pct = Math.max(0, Math.min(45, (((nw - desiredW) / nw) * 100) / 2));
      setCropLeft(Math.round(pct));
      setCropRight(Math.round(pct));
      setCropTop(0);
      setCropBottom(0);
    } else {
      // Too tall, crop top/bottom
      const desiredH = nw / targetRatio;
      const pct = Math.max(0, Math.min(45, (((nh - desiredH) / nh) * 100) / 2));
      setCropTop(Math.round(pct));
      setCropBottom(Math.round(pct));
      setCropLeft(0);
      setCropRight(0);
    }
  };

  const handleApplyAndSave = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl, imageName);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-[4px] z-50 flex items-center justify-center p-3 select-none animate-fadeIn">
      <div className="bg-[#191c21] border border-[#414755] w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-[#414755] bg-[#0b0e13]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#adc6ff] text-[18px]">
              tune
            </span>
            <div>
              <div className="font-sans text-[13px] font-semibold text-[#e1e2e9] flex items-center gap-2">
                <span>Pre-Import Image Editor</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#272a2f] text-[#adc6ff] border border-[#414755]">
                  {outDims.w} × {outDims.h} px ({outDims.aspect}:1)
                </span>
              </div>
              <div className="font-mono text-[9.5px] text-[#8b90a0]">
                {imageName} • Crop, clean transparent background, rotate, and filter
              </div>
            </div>
          </div>
          <button
            type="button"
            className="text-[#8b90a0] hover:text-[#e1e2e9] p-1 cursor-pointer transition-colors"
            onClick={onClose}
            title="Close editor without saving"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Editor Body */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Canvas Preview Area (8 cols) */}
          <div className="md:col-span-8 bg-[#0b0e13] p-4 flex flex-col items-center justify-center overflow-auto relative border-b md:border-b-0 md:border-r border-[#414755]">
            <div className="relative max-w-full max-h-[60vh] flex items-center justify-center shadow-lg border border-[#32353a] bg-[repeating-conic-gradient(#191c21_0%_25%,#101418_0%_50%)] bg-[length:16px_16px]">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-[56vh] object-contain block"
              />
            </div>
            <div className="mt-2 text-[9.5px] font-mono text-[#8b90a0] flex items-center gap-3">
              <span>Checkerboard = Transparent Alpha</span>
              <span>•</span>
              <span>1:1 Export Fidelity</span>
            </div>
          </div>

          {/* Right Controls Panel (4 cols) */}
          <div className="md:col-span-4 p-3 overflow-y-auto space-y-3 bg-[#191c21] font-mono text-[10.5px]">
            {/* Rotation & Flip Controls */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-[#8b90a0] uppercase tracking-wider font-semibold">
                Orientation & Transform
              </div>
              <div className="grid grid-cols-4 gap-1">
                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev + 270) % 360)}
                  className="p-1.5 bg-[#0b0e13] border border-[#414755] hover:border-[#adc6ff] text-[#e1e2e9] flex flex-col items-center justify-center cursor-pointer transition-colors"
                  title="Rotate Counter-Clockwise 90°"
                >
                  <span className="material-symbols-outlined text-[16px]">rotate_left</span>
                  <span className="text-[8px] mt-0.5">-90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRotation((prev) => (prev + 90) % 360)}
                  className="p-1.5 bg-[#0b0e13] border border-[#414755] hover:border-[#adc6ff] text-[#e1e2e9] flex flex-col items-center justify-center cursor-pointer transition-colors"
                  title="Rotate Clockwise 90°"
                >
                  <span className="material-symbols-outlined text-[16px]">rotate_right</span>
                  <span className="text-[8px] mt-0.5">+90°</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFlipH((prev) => !prev)}
                  className={`p-1.5 border flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    flipH
                      ? 'bg-[#272a2f] border-[#adc6ff] text-[#adc6ff]'
                      : 'bg-[#0b0e13] border-[#414755] text-[#e1e2e9]'
                  }`}
                  title="Flip Horizontally"
                >
                  <span className="material-symbols-outlined text-[16px]">flip</span>
                  <span className="text-[8px] mt-0.5">Flip H</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFlipV((prev) => !prev)}
                  className={`p-1.5 border flex flex-col items-center justify-center cursor-pointer transition-colors ${
                    flipV
                      ? 'bg-[#272a2f] border-[#adc6ff] text-[#adc6ff]'
                      : 'bg-[#0b0e13] border-[#414755] text-[#e1e2e9]'
                  }`}
                  title="Flip Vertically"
                >
                  <span className="material-symbols-outlined text-[16px] rotate-90">flip</span>
                  <span className="text-[8px] mt-0.5">Flip V</span>
                </button>
              </div>
            </div>

            {/* Quick Color & Tonal Filters */}
            <div className="space-y-1.5 pt-1">
              <div className="text-[10px] text-[#8b90a0] uppercase tracking-wider font-semibold">
                Color & Tonal Filters
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setGrayscale((prev) => !prev)}
                  className={`p-1.5 border text-center cursor-pointer transition-colors flex items-center justify-center gap-1 ${
                    grayscale
                      ? 'bg-[#272a2f] border-[#adc6ff] text-[#adc6ff] font-semibold'
                      : 'bg-[#0b0e13] border-[#414755] text-[#8b90a0] hover:text-[#e1e2e9]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">filter_b_and_w</span>
                  Grayscale (B&W)
                </button>
                <button
                  type="button"
                  onClick={() => setInvert((prev) => !prev)}
                  className={`p-1.5 border text-center cursor-pointer transition-colors flex items-center justify-center gap-1 ${
                    invert
                      ? 'bg-[#272a2f] border-[#adc6ff] text-[#adc6ff] font-semibold'
                      : 'bg-[#0b0e13] border-[#414755] text-[#8b90a0] hover:text-[#e1e2e9]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px]">invert_colors</span>
                  Invert Tones
                </button>
              </div>

              {/* Laser / Print Enhancements: Transparent Background & 1-bit Stamp */}
              <div className="space-y-2 pt-1">
                <label className="flex items-center justify-between p-1.5 bg-[#0b0e13] border border-[#414755] cursor-pointer hover:border-[#adc6ff] transition-colors">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={removeWhiteBg}
                      onChange={(e) => setRemoveWhiteBg(e.target.checked)}
                      className="w-3.5 h-3.5 rounded-none bg-[#191c21] border-[#414755] text-[#4b8eff] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[#e1e2e9] text-[10px]">Remove White Background</span>
                  </div>
                  <span className={`text-[8.5px] px-1 border ${removeWhiteBg ? 'text-[#47e266] border-[#47e266]/40' : 'text-[#8b90a0] border-[#414755]'}`}>
                    {removeWhiteBg ? 'ON' : 'OFF'}
                  </span>
                </label>

                {removeWhiteBg && (
                  <div className="pl-4 pr-1 space-y-1">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-[#8b90a0]">White Tolerance:</span>
                      <span className="text-[#adc6ff]">{whiteThreshold}</span>
                    </div>
                    <input
                      type="range"
                      min="180"
                      max="255"
                      step="1"
                      value={whiteThreshold}
                      onChange={(e) => setWhiteThreshold(parseInt(e.target.value))}
                      className="w-full h-1 bg-[#32353a] appearance-none cursor-pointer"
                    />
                  </div>
                )}

                <label className="flex items-center justify-between p-1.5 bg-[#0b0e13] border border-[#414755] cursor-pointer hover:border-[#adc6ff] transition-colors">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={stampMode}
                      onChange={(e) => setStampMode(e.target.checked)}
                      className="w-3.5 h-3.5 rounded-none bg-[#191c21] border-[#414755] text-[#4b8eff] focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[#e1e2e9] text-[10px]">1-Bit Laser Stamp Threshold</span>
                  </div>
                  <span className={`text-[8.5px] px-1 border ${stampMode ? 'text-[#47e266] border-[#47e266]/40' : 'text-[#8b90a0] border-[#414755]'}`}>
                    {stampMode ? 'ACTIVE' : 'OFF'}
                  </span>
                </label>

                {stampMode && (
                  <div className="pl-4 pr-1 space-y-1">
                    <div className="flex justify-between text-[9px]">
                      <span className="text-[#8b90a0]">Stamp Cut Threshold:</span>
                      <span className="text-[#adc6ff]">{stampThreshold}</span>
                    </div>
                    <input
                      type="range"
                      min="40"
                      max="220"
                      step="2"
                      value={stampThreshold}
                      onChange={(e) => setStampThreshold(parseInt(e.target.value))}
                      className="w-full h-1 bg-[#32353a] appearance-none cursor-pointer"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Brightness & Contrast Sliders */}
            <div className="space-y-2 pt-1 border-t border-[#414755]">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#8b90a0]">Brightness:</span>
                  <span className="text-[#adc6ff] font-semibold">{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="200"
                  step="5"
                  value={brightness}
                  onChange={(e) => setBrightness(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#32353a] appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-[#8b90a0]">Contrast:</span>
                  <span className="text-[#adc6ff] font-semibold">{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="200"
                  step="5"
                  value={contrast}
                  onChange={(e) => setContrast(parseInt(e.target.value))}
                  className="w-full h-1 bg-[#32353a] appearance-none cursor-pointer"
                />
              </div>
            </div>

            {/* Crop Aspect Ratio Presets & Edge Inset Cropping */}
            <div className="space-y-2 pt-1 border-t border-[#414755]">
              <div className="flex items-center justify-between text-[10px] text-[#8b90a0] uppercase tracking-wider font-semibold">
                <span>Crop & Aspect Ratio</span>
                {(cropTop > 0 || cropBottom > 0 || cropLeft > 0 || cropRight > 0) && (
                  <button
                    type="button"
                    onClick={() => handleCropPreset(null)}
                    className="text-[#adc6ff] text-[9px] hover:underline cursor-pointer"
                  >
                    Reset Crop
                  </button>
                )}
              </div>

              {/* Crop Ratio Presets */}
              <div className="grid grid-cols-4 gap-1">
                <button
                  type="button"
                  onClick={() => handleCropPreset(1.0)}
                  className="p-1 bg-[#0b0e13] border border-[#414755] hover:border-[#adc6ff] text-center text-[#e1e2e9] text-[9px] cursor-pointer"
                  title="Crop to 1:1 Square"
                >
                  1:1 Sq
                </button>
                <button
                  type="button"
                  onClick={() => handleCropPreset(4 / 3)}
                  className="p-1 bg-[#0b0e13] border border-[#414755] hover:border-[#adc6ff] text-center text-[#e1e2e9] text-[9px] cursor-pointer"
                  title="Crop to 4:3 Standard"
                >
                  4:3
                </button>
                <button
                  type="button"
                  onClick={() => handleCropPreset(16 / 9)}
                  className="p-1 bg-[#0b0e13] border border-[#414755] hover:border-[#adc6ff] text-center text-[#e1e2e9] text-[9px] cursor-pointer"
                  title="Crop to 16:9 Widescreen"
                >
                  16:9
                </button>
                <button
                  type="button"
                  onClick={() => handleCropPreset(null)}
                  className="p-1 bg-[#0b0e13] border border-[#414755] hover:border-[#adc6ff] text-center text-[#8b90a0] text-[9px] cursor-pointer"
                  title="Reset to Full Image"
                >
                  Full
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[9.5px]">
                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[#8b90a0]">Top Inset:</span>
                    <span className="text-[#e1e2e9]">{cropTop}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="45"
                    value={cropTop}
                    onChange={(e) => setCropTop(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#32353a] appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[#8b90a0]">Bottom:</span>
                    <span className="text-[#e1e2e9]">{cropBottom}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="45"
                    value={cropBottom}
                    onChange={(e) => setCropBottom(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#32353a] appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[#8b90a0]">Left:</span>
                    <span className="text-[#e1e2e9]">{cropLeft}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="45"
                    value={cropLeft}
                    onChange={(e) => setCropLeft(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#32353a] appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between mb-0.5">
                    <span className="text-[#8b90a0]">Right:</span>
                    <span className="text-[#e1e2e9]">{cropRight}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="45"
                    value={cropRight}
                    onChange={(e) => setCropRight(parseInt(e.target.value))}
                    className="w-full h-1 bg-[#32353a] appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-[#414755] flex gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-1.5 bg-[#0b0e13] border border-[#414755] text-[#8b90a0] hover:text-[#e1e2e9] text-center cursor-pointer transition-colors"
              >
                Reset All Edits
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-[#414755] bg-[#0b0e13] flex items-center justify-between">
          <button
            type="button"
            className="px-3 py-1.5 font-mono text-[11px] text-[#8b90a0] hover:text-[#e1e2e9] cursor-pointer transition-colors"
            onClick={onClose}
          >
            Cancel
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleApplyAndSave}
              className="px-4 py-1.5 bg-[#adc6ff] hover:bg-[#4b8eff] text-[#00285c] font-mono text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <span className="material-symbols-outlined text-[15px]">done_all</span>
              Apply & Import Image
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
