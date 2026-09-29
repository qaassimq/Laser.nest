import React from 'react';
import { AppState, NestingResult } from '../types';

interface RightInspectorProps {
  state: AppState;
  result: NestingResult;
  onChange: (patch: Partial<AppState>) => void;
  onOpenExport: () => void;
  onQuickPrint: () => void;
}

export const RightInspector: React.FC<RightInspectorProps> = ({
  state,
  result,
  onChange,
  onOpenExport,
  onQuickPrint,
}) => {
  return (
    <aside className="w-64 bg-[#191c21] border-l border-[#414755] flex flex-col justify-between shrink-0 z-30 select-none">
      <div className="p-3 space-y-3 overflow-y-auto">
        {/* Inspector Title */}
        <div className="flex items-center justify-between border-b border-[#414755] pb-2">
          <span className="font-sans text-[12px] font-semibold text-[#e1e2e9]">
            CALCULATION AUDIT
          </span>
          <span className="material-symbols-outlined text-[#8b90a0] text-[16px]">
            fact_check
          </span>
        </div>

        {/* Grid Matrix Details */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#8b90a0] uppercase tracking-wider">
            <span>Bounding Extents</span>
            <span
              className={`text-[9px] px-1 py-0.2 border ${
                state.onlyCompleteShapes
                  ? 'text-[#47e266] border-[#47e266]/30'
                  : 'text-[#ffc07a] border-[#fa9b00]/30'
              }`}
            >
              {state.onlyCompleteShapes ? 'COMPLETE ONLY' : 'ALLOW PARTIAL'}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px]">
            <div className="bg-[#0b0e13] p-1.5 border border-[#414755]">
              <div className="text-[#8b90a0] text-[9px]">Columns</div>
              <div className="text-[#e1e2e9] font-mono text-[12px] font-semibold">
                {result.cols} cols
              </div>
            </div>
            <div className="bg-[#0b0e13] p-1.5 border border-[#414755]">
              <div className="text-[#8b90a0] text-[9px]">Rows</div>
              <div className="text-[#e1e2e9] font-mono text-[12px] font-semibold">
                {result.rows} rows
              </div>
            </div>
            <div className="bg-[#0b0e13] p-1.5 border border-[#414755]">
              <div className="text-[#8b90a0] text-[9px]">Usable Width</div>
              <div className="text-[#e1e2e9] font-mono text-[12px] font-semibold">
                {result.usableW.toFixed(1)}mm
              </div>
            </div>
            <div className="bg-[#0b0e13] p-1.5 border border-[#414755]">
              <div className="text-[#8b90a0] text-[9px]">Usable Height</div>
              <div className="text-[#e1e2e9] font-mono text-[12px] font-semibold">
                {result.usableH.toFixed(1)}mm
              </div>
            </div>
          </div>
          <div className="bg-[#0b0e13] p-1.5 border border-[#414755] flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#8b90a0]">Shape Integrity:</span>
            <span className="text-[#47e266] font-semibold">
              {state.onlyCompleteShapes
                ? `${result.totalParts} complete (partials removed)`
                : `${result.completeCount} complete, ${result.partialCount} partial`}
            </span>
          </div>
        </div>

        {/* Material Properties */}
        <div className="space-y-1.5 pt-1">
          <div className="text-[10px] font-mono text-[#8b90a0] uppercase tracking-wider">
            Substrate Template
          </div>
          <div className="bg-[#0b0e13] border border-[#414755] p-2 space-y-1.5 font-mono text-[10px]">
            <div className="flex justify-between items-center">
              <span className="text-[#c1c6d7]">Material:</span>
              <select
                value={state.material}
                onChange={(e) => onChange({ material: e.target.value })}
                className="bg-[#191c21] border border-[#414755] text-[#e1e2e9] text-[10px] px-1 py-0.5 focus:outline-none cursor-pointer"
              >
                <option value="3.0mm Acrylic / Birch">3.0mm Acrylic / Birch</option>
                <option value="5.0mm Cast Acrylic">5.0mm Cast Acrylic</option>
                <option value="1.5mm MDF Sheet">1.5mm MDF Sheet</option>
                <option value="6.0mm Plywood">6.0mm Plywood</option>
                <option value="0.8mm Brass Shim">0.8mm Brass Shim</option>
                <option value="0.5mm Polycarbonate">0.5mm Polycarbonate</option>
              </select>
            </div>
            <div className="flex justify-between">
              <span className="text-[#c1c6d7]">Print Media:</span>
              <span className="text-[#adc6ff]">Standard 80gsm Bond</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#c1c6d7]">Cut Lines:</span>
              <span className={state.hideShapeLines ? 'text-[#ffc07a]' : 'text-[#47e266]'}>
                {state.hideShapeLines ? 'Hidden (Graphics Only)' : 'Active (Marked)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#c1c6d7]">Canvas Background:</span>
              <span className={state.exportTransparentBg ? 'text-[#47e266] font-semibold' : 'text-[#8b90a0]'}>
                {state.exportTransparentBg ? 'Transparent (Alpha)' : 'Solid White Sheet'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#c1c6d7]">Export Filter:</span>
              <span className={state.exportObjectsOnly ? 'text-[#47e266] font-semibold' : 'text-[#8b90a0]'}>
                {state.exportObjectsOnly ? 'Objects Only (Clean)' : 'Full (Keys & Stamps)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#c1c6d7]">Graphic Overlay:</span>
              <span className={state.imageOverlay ? 'text-[#47e266]' : 'text-[#8b90a0]'}>
                {state.imageOverlay
                  ? `${state.imageAlignY.toUpperCase()}-${state.imageAlignX.toUpperCase()} (${state.imageScale || 100}%)`
                  : 'None'}
              </span>
            </div>
            {state.imageOverlay && (state.imageOffsetX !== 0 || state.imageOffsetY !== 0) && (
              <div className="flex justify-between text-[9px]">
                <span className="text-[#8b90a0]">Overlay Shift:</span>
                <span className="text-[#adc6ff]">
                  X: {state.imageOffsetX >= 0 ? `+${state.imageOffsetX}` : state.imageOffsetX}mm, Y: {state.imageOffsetY >= 0 ? `+${state.imageOffsetY}` : state.imageOffsetY}mm
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Alignment / Cut Rules (Maker Quick-Tip) */}
        <div className="border border-[#414755] p-2 bg-[#0b0e13] space-y-1">
          <div className="text-[10px] font-mono text-[#ffc07a] uppercase font-semibold flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">lightbulb</span>
            MAKER QUICK-TIP
          </div>
          <p className="text-[11px] text-[#c1c6d7] leading-tight font-sans">
            Use <strong className="text-[#e1e2e9]">Corner Marks Only</strong> mode for
            fast template spray-gluing. Align your circular saw or craft knife along ticks
            without washing paper in dark ink toner.
          </p>
        </div>
      </div>

      {/* Action Panel */}
      <div className="p-3 border-t border-[#414755] bg-[#0b0e13] space-y-2">
        <button
          type="button"
          className="w-full bg-[#272a2f] hover:bg-[#36393f] text-[#e1e2e9] border border-[#414755] py-2 font-mono text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          onClick={onOpenExport}
        >
          <span className="material-symbols-outlined text-[15px]">preview</span>
          Generate Picture Preview
        </button>
        <button
          type="button"
          className="w-full bg-[#adc6ff] hover:bg-[#4b8eff] text-[#00285c] py-2 font-mono text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          onClick={onQuickPrint}
        >
          <span className="material-symbols-outlined text-[15px]">print</span>
          1:1 Scale Print Dialog
        </button>
      </div>
    </aside>
  );
};
