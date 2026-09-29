import React, { useState } from 'react';
import { AppState, ConfigurationPreset } from '../types';
import { extractConfigFromState } from '../utils/presets';

interface PresetModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: AppState;
  presets: ConfigurationPreset[];
  onApplyPreset: (preset: ConfigurationPreset) => void;
  onSavePreset: (newPreset: ConfigurationPreset) => void;
  onDeletePreset: (presetId: string) => void;
}

export const PresetModal: React.FC<PresetModalProps> = ({
  isOpen,
  onClose,
  state,
  presets,
  onApplyPreset,
  onSavePreset,
  onDeletePreset,
}) => {
  const defaultSuggestedName = `${state.shape.toUpperCase()} ${state.partW.toFixed(0)}x${state.partH.toFixed(0)}mm (${state.paper} ${state.orientation === 'PORT' ? 'Port' : 'Land'})`;
  const [presetName, setPresetName] = useState(defaultSuggestedName);
  const [activeTab, setActiveTab] = useState<'load' | 'save'>('load');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim()) return;

    const newPreset: ConfigurationPreset = {
      id: `preset-user-${Date.now()}`,
      name: presetName.trim(),
      createdAt: Date.now(),
      isBuiltIn: false,
      config: extractConfigFromState(state),
    };

    onSavePreset(newPreset);
    setSuccessMsg(`Preset "${newPreset.name}" successfully saved!`);
    setTimeout(() => {
      setSuccessMsg(null);
      setActiveTab('load');
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-[2px] z-50 flex items-center justify-center p-4 select-none">
      <div className="bg-[#191c21] border border-[#414755] w-full max-w-xl shadow-2xl relative flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#414755] p-3 bg-[#0b0e13]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#adc6ff] text-[18px]">
              bookmarks
            </span>
            <div>
              <div className="font-sans text-[13px] font-semibold text-[#e1e2e9]">
                Fabrication Presets & Template Library
              </div>
              <div className="font-mono text-[9.5px] text-[#8b90a0]">
                Save current tooling configurations or quickly reuse previous templates
              </div>
            </div>
          </div>
          <button
            type="button"
            className="text-[#8b90a0] hover:text-[#e1e2e9] p-1 cursor-pointer"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#414755] bg-[#101418] text-[11px] font-mono">
          <button
            type="button"
            className={`flex-1 py-2 text-center border-b-2 cursor-pointer transition-colors ${
              activeTab === 'load'
                ? 'border-[#adc6ff] text-[#adc6ff] font-semibold bg-[#191c21]'
                : 'border-transparent text-[#8b90a0] hover:text-[#e1e2e9]'
            }`}
            onClick={() => setActiveTab('load')}
          >
            Saved Presets ({presets.length})
          </button>
          <button
            type="button"
            className={`flex-1 py-2 text-center border-b-2 cursor-pointer transition-colors ${
              activeTab === 'save'
                ? 'border-[#adc6ff] text-[#adc6ff] font-semibold bg-[#191c21]'
                : 'border-transparent text-[#8b90a0] hover:text-[#e1e2e9]'
            }`}
            onClick={() => {
              setPresetName(defaultSuggestedName);
              setActiveTab('save');
            }}
          >
            + Save Current Setup
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {successMsg && (
            <div className="bg-[#00320d] border border-[#47e266] text-[#47e266] px-3 py-2 text-[11px] font-mono flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              {successMsg}
            </div>
          )}

          {activeTab === 'save' && (
            <form onSubmit={handleSave} className="space-y-3">
              <div>
                <label className="text-[10px] font-mono text-[#8b90a0] block mb-1">
                  PRESET NAME
                </label>
                <input
                  type="text"
                  required
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  placeholder="e.g. 3mm Acrylic Badges - A4 Staggered"
                  className="w-full bg-[#0b0e13] border border-[#414755] px-2.5 py-1.5 font-mono text-[12px] text-[#e1e2e9] focus:outline-none focus:border-[#adc6ff]"
                />
              </div>

              {/* Snapshot of Current Configuration to be Saved */}
              <div className="bg-[#0b0e13] border border-[#414755] p-3 space-y-1.5 font-mono text-[10.5px]">
                <div className="text-[9.5px] text-[#adc6ff] font-semibold uppercase mb-1 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">tune</span>
                  Configuration Snapshot to be Stored:
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[#c1c6d7]">
                  <div>
                    <span className="text-[#8b90a0]">Sheet:</span> {state.paper} ({state.orientation})
                  </div>
                  <div>
                    <span className="text-[#8b90a0]">Shape:</span> {state.shape.toUpperCase()}
                  </div>
                  <div>
                    <span className="text-[#8b90a0]">Part Size:</span> {state.partW.toFixed(1)} x {state.partH.toFixed(1)} mm
                  </div>
                  <div>
                    <span className="text-[#8b90a0]">Spacing/Margin:</span> {state.spacing} / {state.margin} mm
                  </div>
                  <div>
                    <span className="text-[#8b90a0]">Kerf Offset:</span> {state.kerf} mm
                  </div>
                  <div>
                    <span className="text-[#8b90a0]">Render Mode:</span> {state.renderMode === 'corners' ? 'Corner Marks' : 'Full CAD Outlines'}
                  </div>
                  <div>
                    <span className="text-[#8b90a0]">Complete Filter:</span> {state.onlyCompleteShapes ? 'Strict Only' : 'Permissive'}
                  </div>
                  <div>
                    <span className="text-[#8b90a0]">Total Shapes Stamp:</span> {state.showTotalShapesOverlay ? 'Active' : 'Off'}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  className="px-3 py-1.5 font-mono text-[11px] text-[#8b90a0] hover:text-[#e1e2e9] cursor-pointer"
                  onClick={() => setActiveTab('load')}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#adc6ff] hover:bg-[#4b8eff] text-[#00285c] font-mono text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[15px]">save</span>
                  Save Preset
                </button>
              </div>
            </form>
          )}

          {activeTab === 'load' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8b90a0]">
                <span>SELECT PRESET TO REUSE</span>
                <span>{presets.length} Presets Available</span>
              </div>

              <div className="space-y-2">
                {presets.map((preset) => {
                  const c = preset.config;
                  return (
                    <div
                      key={preset.id}
                      className="bg-[#0b0e13] border border-[#414755] hover:border-[#adc6ff] p-2.5 transition-all flex flex-col justify-between gap-2 group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="font-mono text-[11.5px] font-bold text-[#e1e2e9] flex items-center gap-1.5">
                            {preset.name}
                            {preset.isBuiltIn && (
                              <span className="text-[8px] font-mono text-[#adc6ff] bg-[#272a2f] px-1 py-0.2 border border-[#414755]">
                                SYSTEM
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-[9.5px] font-mono text-[#8b90a0]">
                            <span>{c.paper} {c.orientation}</span>
                            <span>•</span>
                            <span className="text-[#adc6ff]">{c.shape.toUpperCase()} {c.partW}x{c.partH}mm</span>
                            <span>•</span>
                            <span>Spacing {c.spacing}mm</span>
                            <span>•</span>
                            <span className="text-[#47e266]">{c.onlyCompleteShapes ? 'Strict Complete' : 'Permissive'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {!preset.isBuiltIn && (
                            <button
                              type="button"
                              className="p-1 text-[#8b90a0] hover:text-[#ffb4ab] transition-colors cursor-pointer"
                              onClick={() => onDeletePreset(preset.id)}
                              title="Delete this custom preset"
                            >
                              <span className="material-symbols-outlined text-[16px]">
                                delete
                              </span>
                            </button>
                          )}
                          <button
                            type="button"
                            className="bg-[#272a2f] group-hover:bg-[#adc6ff] group-hover:text-[#00285c] text-[#adc6ff] font-mono text-[10.5px] font-semibold px-3 py-1 border border-[#414755] group-hover:border-[#adc6ff] flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                            onClick={() => {
                              onApplyPreset(preset);
                              onClose();
                            }}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              restore
                            </span>
                            Load & Reuse
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#414755] p-2.5 bg-[#0b0e13] flex items-center justify-between font-mono text-[10px] text-[#8b90a0]">
          <span>Saved locally in browser storage</span>
          <button
            type="button"
            className="text-[#adc6ff] hover:underline cursor-pointer"
            onClick={() => setActiveTab('save')}
          >
            + Create New Preset
          </button>
        </div>
      </div>
    </div>
  );
};
