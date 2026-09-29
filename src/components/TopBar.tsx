import React from 'react';
import { AppState, NestingResult } from '../types';

interface TopBarProps {
  state: AppState;
  result: NestingResult;
  onChange: (patch: Partial<AppState>) => void;
  onOpenExport: () => void;
  onOpenCustomSheet: () => void;
  onOpenPresets: () => void;
  onQuickPrint: () => void;
  onResetZoom: () => void;
  gridActive: boolean;
  onToggleGrid: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  state,
  result,
  onChange,
  onOpenExport,
  onOpenCustomSheet,
  onOpenPresets,
  onQuickPrint,
  onResetZoom,
  gridActive,
  onToggleGrid,
}) => {
  return (
    <header className="bg-[#0b0e13] border-b border-[#414755] flex justify-between items-center w-full px-2 h-9 z-50 shrink-0 select-none">
      <div className="flex items-center gap-3">
        {/* Logo and DSP Indicator */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[13px] font-bold tracking-tight text-[#adc6ff] uppercase flex items-center gap-1.5">
            <span className="material-symbols-outlined text-[#adc6ff] text-[18px]">
              view_in_ar
            </span>
            LASER.NEST // STUDIO v2.4
          </span>
          <span className="bg-[#272a2f] px-1.5 py-0.5 border border-[#414755] text-[10px] font-mono text-[#47e266] flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 bg-[#47e266] rounded-full animate-pulse"></span>
            DSP ONLINE
          </span>
        </div>

        {/* Paper Presets */}
        <div className="hidden md:flex items-center bg-[#191c21] border border-[#414755] p-0.5">
          <button
            type="button"
            className={`px-2 py-0.5 font-mono text-[11px] transition-colors duration-75 ${
              state.paper === 'A4'
                ? 'text-[#adc6ff] border-b-2 border-[#adc6ff] font-semibold'
                : 'text-[#c1c6d7] hover:text-[#e1e2e9]'
            }`}
            onClick={() => onChange({ paper: 'A4' })}
          >
            A4 210x297
          </button>
          <button
            type="button"
            className={`px-2 py-0.5 font-mono text-[11px] transition-colors duration-75 ${
              state.paper === 'A3'
                ? 'text-[#adc6ff] border-b-2 border-[#adc6ff] font-semibold'
                : 'text-[#c1c6d7] hover:text-[#e1e2e9]'
            }`}
            onClick={() => onChange({ paper: 'A3' })}
          >
            A3 297x420
          </button>
          <button
            type="button"
            className={`px-2 py-0.5 font-mono text-[11px] transition-colors duration-75 ${
              state.paper === 'CUSTOM'
                ? 'text-[#adc6ff] border-b-2 border-[#adc6ff] font-semibold'
                : 'text-[#c1c6d7] hover:text-[#e1e2e9]'
            }`}
            onClick={() => {
              onChange({ paper: 'CUSTOM' });
              onOpenCustomSheet();
            }}
          >
            {state.paper === 'CUSTOM'
              ? `Custom ${state.customW}x${state.customH}`
              : 'Custom Sheet'}
          </button>
        </div>

        {/* Orientation Toggles */}
        <div className="hidden md:flex items-center bg-[#191c21] border border-[#414755] p-0.5">
          <button
            type="button"
            className={`px-2 py-0.5 font-mono text-[11px] flex items-center gap-1 transition-colors duration-75 ${
              state.orientation === 'PORT'
                ? 'text-[#adc6ff] border-b-2 border-[#adc6ff] font-semibold'
                : 'text-[#c1c6d7] hover:text-[#e1e2e9]'
            }`}
            onClick={() => onChange({ orientation: 'PORT' })}
          >
            <span className="material-symbols-outlined text-[13px]">portrait</span>
            Portrait
          </button>
          <button
            type="button"
            className={`px-2 py-0.5 font-mono text-[11px] flex items-center gap-1 transition-colors duration-75 ${
              state.orientation === 'LAND'
                ? 'text-[#adc6ff] border-b-2 border-[#adc6ff] font-semibold'
                : 'text-[#c1c6d7] hover:text-[#e1e2e9]'
            }`}
            onClick={() => onChange({ orientation: 'LAND' })}
          >
            <span className="material-symbols-outlined text-[13px]">landscape</span>
            Landscape
          </button>
        </div>
      </div>

      {/* Right Global Actions */}
      <div className="flex items-center gap-1.5">
        {/* Prominent Total Shapes Readout */}
        <button
          type="button"
          className="flex items-center border border-[#414755] hover:border-[#adc6ff] bg-[#191c21] px-2 py-0.5 text-[10px] font-mono cursor-pointer transition-colors"
          onClick={() => onChange({ showTotalShapesOverlay: !state.showTotalShapesOverlay })}
          title="Toggle Total Shapes Sheet Stamp Overlay"
        >
          <span className="text-[#8b90a0] mr-1">TOTAL SHAPES:</span>
          <span className="text-[#47e266] font-bold">{result.totalParts} PCS</span>
        </button>

        <div className="flex items-center border border-[#414755] bg-[#191c21] px-2 py-0.5 text-[10px] font-mono text-[#8b90a0]">
          <span className="text-[#e1e2e9] font-mono font-semibold mr-1">
            1:1 CALIBRATED
          </span>
        </div>

        <button
          type="button"
          className={`p-1 text-[#c1c6d7] hover:bg-[#272a2f] hover:text-[#e1e2e9] transition-colors duration-75 ${
            gridActive ? 'text-[#adc6ff]' : ''
          }`}
          onClick={onToggleGrid}
          title="Toggle Grid Overlay"
        >
          <span className="material-symbols-outlined text-[16px]">grid_4x4</span>
        </button>

        <button
          type="button"
          className="p-1 text-[#c1c6d7] hover:bg-[#272a2f] hover:text-[#e1e2e9] transition-colors duration-75"
          onClick={onResetZoom}
          title="Zoom Sheet 100%"
        >
          <span className="material-symbols-outlined text-[16px]">straighten</span>
        </button>

        <button
          type="button"
          className="bg-[#272a2f] hover:bg-[#36393f] text-[#adc6ff] border border-[#414755] hover:border-[#adc6ff] px-2.5 h-6 font-mono text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
          onClick={onOpenPresets}
          title="Save or Reuse Tooling Presets"
        >
          <span className="material-symbols-outlined text-[14px]">bookmarks</span>
          Presets
        </button>

        <button
          type="button"
          className="bg-[#272a2f] hover:bg-[#36393f] text-[#e1e2e9] border border-[#414755] px-2.5 h-6 font-mono text-[11px] flex items-center gap-1 transition-colors"
          onClick={onQuickPrint}
        >
          <span className="material-symbols-outlined text-[14px]">print</span>
          Quick Print 1:1
        </button>

        <button
          type="button"
          className="bg-[#adc6ff] text-[#00285c] font-mono text-[11px] font-bold px-3 h-6 flex items-center gap-1 hover:brightness-110 active:brightness-90 transition-all cursor-pointer shadow-sm"
          onClick={onOpenExport}
        >
          <span className="material-symbols-outlined text-[14px]">download</span>
          Export Suite (SVG/PNG/DXF)
        </button>
      </div>
    </header>
  );
};
