/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AppState, ConfigurationPreset } from './types';
import { calculateNesting } from './utils/nesting';
import { trigger1To1Print } from './utils/exporters';
import { loadSavedPresets, savePresetsToStorage } from './utils/presets';
import { TopBar } from './components/TopBar';
import { LeftMatrix } from './components/LeftMatrix';
import { RightInspector } from './components/RightInspector';
import { DraftingCanvas } from './components/DraftingCanvas';
import { ExportModal } from './components/ExportModal';
import { CustomSheetModal } from './components/CustomSheetModal';
import { PresetModal } from './components/PresetModal';
import { ImageEditorModal } from './components/ImageEditorModal';

export default function App() {
  const [state, setState] = useState<AppState>({
    paper: 'A4',
    orientation: 'PORT',
    customW: 300,
    customH: 200,
    shape: 'rect',
    customImage: null,
    customImageName: null,
    customImageAspect: 1.0,
    imageOverlay: null,
    imageOverlayName: null,
    imageMargin: 0.0,
    imagePadding: 0.0,
    imageFit: 'contain',
    imageAlignX: 'center',
    imageAlignY: 'center',
    imageOffsetX: 0.0,
    imageOffsetY: 0.0,
    imageScale: 100,
    hideShapeLines: false,
    partW: 48.0,
    partH: 32.0,
    lockAspect: true,
    radius: 2.5,
    kerf: 0.15,
    spacing: 3.0,
    margin: 8.0,
    strategy: 'ortho',
    allowRotate: true,
    onlyCompleteShapes: true,
    renderMode: 'corners',
    cornerLen: 4.0,
    showGuides: true,
    showCenters: false,
    showTotalShapesOverlay: true,
    showPartNumbers: true,
    exportObjectsOnly: false,
    exportTransparentBg: false,
    showRegistrationMarks: true,
    zoom: 1.0,
    pan: { x: 0, y: 0 },
    exportFormat: 'PNG',
    exportDPI: 300,
    material: '3.0mm Acrylic / Birch',
  });

  const [presets, setPresets] = useState<ConfigurationPreset[]>(() => loadSavedPresets());
  const [gridActive, setGridActive] = useState(true);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCustomSheetOpen, setIsCustomSheetOpen] = useState(false);
  const [isPresetOpen, setIsPresetOpen] = useState(false);
  const [imageEditorState, setImageEditorState] = useState<{
    isOpen: boolean;
    imageSrc: string;
    imageName: string;
    targetType: 'shape' | 'overlay';
  }>({
    isOpen: false,
    imageSrc: '',
    imageName: '',
    targetType: 'overlay',
  });
  const [solveTrigger, setSolveTrigger] = useState(0);

  const mainCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Sync presets changes to localStorage
  useEffect(() => {
    savePresetsToStorage(presets);
  }, [presets]);

  // Compute nesting result whenever state changes or solve trigger fired
  const result = useMemo(() => {
    // referenced to solveTrigger for forced re-calculations
    void solveTrigger;
    return calculateNesting(state);
  }, [state, solveTrigger]);

  const handleStateChange = (patch: Partial<AppState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  };

  const handleSolve = () => {
    setSolveTrigger((prev) => prev + 1);
  };

  const handleQuickPrint = () => {
    trigger1To1Print(state, result);
  };

  const handleResetZoom = () => {
    handleStateChange({ zoom: 1.0 });
  };

  const handleCustomSheetApply = (w: number, h: number) => {
    handleStateChange({
      paper: 'CUSTOM',
      customW: w,
      customH: h,
    });
  };

  const handleSavePreset = (newPreset: ConfigurationPreset) => {
    setPresets((prev) => [newPreset, ...prev.filter((p) => p.id !== newPreset.id)]);
  };

  const handleApplyPreset = (preset: ConfigurationPreset) => {
    setState((prev) => ({
      ...prev,
      ...preset.config,
    }));
  };

  const handleDeletePreset = (presetId: string) => {
    setPresets((prev) => prev.filter((p) => p.id !== presetId));
  };

  const handleOpenImageEditor = (
    imageSrc: string,
    imageName: string,
    targetType: 'shape' | 'overlay'
  ) => {
    setImageEditorState({
      isOpen: true,
      imageSrc,
      imageName,
      targetType,
    });
  };

  const handleSaveEditedImage = (editedDataUrl: string, fileName: string) => {
    if (imageEditorState.targetType === 'overlay') {
      handleStateChange({
        imageOverlay: editedDataUrl,
        imageOverlayName: fileName,
      });
    } else {
      const img = new Image();
      img.onload = () => {
        const aspect = (img.naturalWidth || 1) / (img.naturalHeight || 1);
        const w = state.partW || 48.0;
        const h = parseFloat((w / aspect).toFixed(1));
        handleStateChange({
          shape: 'custom',
          customImage: editedDataUrl,
          customImageName: fileName,
          customImageAspect: aspect,
          partW: w,
          partH: h,
        });
      };
      img.src = editedDataUrl;
    }
  };

  return (
    <div className="bg-[#101418] text-[#e1e2e9] font-sans text-[13px] select-none overflow-hidden h-screen w-screen flex flex-col antialiased">
      {/* Top Application Bar */}
      <TopBar
        state={state}
        result={result}
        onChange={handleStateChange}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenCustomSheet={() => setIsCustomSheetOpen(true)}
        onOpenPresets={() => setIsPresetOpen(true)}
        onQuickPrint={handleQuickPrint}
        onResetZoom={handleResetZoom}
        gridActive={gridActive}
        onToggleGrid={() => setGridActive((prev) => !prev)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Toolbar / Matrix */}
        <LeftMatrix
          state={state}
          result={result}
          onChange={handleStateChange}
          onSolve={handleSolve}
          onOpenPresets={() => setIsPresetOpen(true)}
          onOpenImageEditor={handleOpenImageEditor}
          presetsCount={presets.length}
        />

        {/* Center Drafting Canvas Area */}
        <DraftingCanvas
          state={state}
          result={result}
          gridActive={gridActive}
          canvasRef={mainCanvasRef}
          onChangeZoom={(newZoom) => handleStateChange({ zoom: newZoom })}
          onResetZoom={handleResetZoom}
          onNudgePosition={(dxMm, dyMm) => {
            if (!state.imageOverlay) return;
            handleStateChange({
              imageOffsetX: parseFloat(((state.imageOffsetX || 0) + dxMm).toFixed(2)),
              imageOffsetY: parseFloat(((state.imageOffsetY || 0) + dyMm).toFixed(2)),
            });
          }}
        />

        {/* Right Inspector / Calculation Audit */}
        <RightInspector
          state={state}
          result={result}
          onChange={handleStateChange}
          onOpenExport={() => setIsExportOpen(true)}
          onQuickPrint={handleQuickPrint}
        />
      </div>

      {/* Presets Manager Modal */}
      <PresetModal
        isOpen={isPresetOpen}
        onClose={() => setIsPresetOpen(false)}
        state={state}
        presets={presets}
        onApplyPreset={handleApplyPreset}
        onSavePreset={handleSavePreset}
        onDeletePreset={handleDeletePreset}
      />

      {/* Export Suite Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        state={state}
        result={result}
        mainCanvasRef={mainCanvasRef}
        onChange={handleStateChange}
      />

      {/* Custom Sheet Modal */}
      <CustomSheetModal
        isOpen={isCustomSheetOpen}
        onClose={() => setIsCustomSheetOpen(false)}
        currentW={state.customW}
        currentH={state.customH}
        onApply={handleCustomSheetApply}
      />

      {/* Pre-Import Image Editor Modal */}
      <ImageEditorModal
        isOpen={imageEditorState.isOpen}
        onClose={() => setImageEditorState((prev) => ({ ...prev, isOpen: false }))}
        initialImage={imageEditorState.imageSrc}
        imageName={imageEditorState.imageName}
        onSave={handleSaveEditedImage}
      />
    </div>
  );
}
