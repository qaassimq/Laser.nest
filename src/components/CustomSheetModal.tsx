import React, { useState } from 'react';

interface CustomSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentW: number;
  currentH: number;
  onApply: (w: number, h: number) => void;
}

export const CustomSheetModal: React.FC<CustomSheetModalProps> = ({
  isOpen,
  onClose,
  currentW,
  currentH,
  onApply,
}) => {
  const [w, setW] = useState(currentW);
  const [h, setH] = useState(currentH);

  if (!isOpen) return null;

  const presets = [
    { name: 'K40 Standard', w: 300, h: 200 },
    { name: 'Glowforge Basic', w: 500, h: 280 },
    { name: 'Boss Laser 1630', w: 760, h: 400 },
    { name: 'FabLab A2 Bed', w: 594, h: 420 },
    { name: 'Square 300x300', w: 300, h: 300 },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#191c21] border border-[#414755] w-full max-w-md p-4 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-[#414755] pb-2 mb-3">
          <div className="font-sans text-[13px] font-semibold text-[#e1e2e9]">
            Custom Laser Bed / Sheet Dimensions
          </div>
          <button
            type="button"
            className="text-[#8b90a0] hover:text-[#e1e2e9] p-1 cursor-pointer"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0b0e13] border border-[#414755] p-2">
              <label className="text-[10px] font-mono text-[#8b90a0] block mb-1">
                SHEET WIDTH (X)
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min="20"
                  max="1500"
                  step="5"
                  value={w}
                  onChange={(e) => setW(Math.max(20, parseFloat(e.target.value) || 20))}
                  className="w-full bg-transparent border-0 font-mono text-[14px] text-[#e1e2e9] focus:outline-none"
                />
                <span className="text-[10px] font-mono text-[#8b90a0]">mm</span>
              </div>
            </div>

            <div className="bg-[#0b0e13] border border-[#414755] p-2">
              <label className="text-[10px] font-mono text-[#8b90a0] block mb-1">
                SHEET HEIGHT (Y)
              </label>
              <div className="flex items-center">
                <input
                  type="number"
                  min="20"
                  max="1500"
                  step="5"
                  value={h}
                  onChange={(e) => setH(Math.max(20, parseFloat(e.target.value) || 20))}
                  className="w-full bg-transparent border-0 font-mono text-[14px] text-[#e1e2e9] focus:outline-none"
                />
                <span className="text-[10px] font-mono text-[#8b90a0]">mm</span>
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono text-[#8b90a0] mb-1.5">
              COMMON FABRICATION BED PRESETS
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {presets.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  className="text-left p-1.5 bg-[#0b0e13] hover:bg-[#272a2f] border border-[#414755] transition-colors cursor-pointer"
                  onClick={() => {
                    setW(p.w);
                    setH(p.h);
                  }}
                >
                  <div className="text-[10px] font-sans text-[#e1e2e9]">{p.name}</div>
                  <div className="text-[9px] font-mono text-[#adc6ff]">
                    {p.w} x {p.h} mm
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-[#414755]">
            <button
              type="button"
              className="px-3 py-1.5 font-mono text-[11px] text-[#8b90a0] hover:text-[#e1e2e9] cursor-pointer"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-1.5 bg-[#adc6ff] hover:bg-[#4b8eff] text-[#00285c] font-mono text-[11px] font-bold cursor-pointer transition-colors"
              onClick={() => {
                onApply(w, h);
                onClose();
              }}
            >
              Apply Dimensions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
