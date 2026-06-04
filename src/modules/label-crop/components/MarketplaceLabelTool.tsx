import React, { useState, useCallback, useRef } from 'react';
import {
  Loader2, AlertCircle, ChevronLeft, ChevronRight,
  Package, FileText, FolderDown, RotateCcw,
  Upload, Info, Wand2, FileStack, FileUp,
} from 'lucide-react';
import { LabelSettings } from './LabelSettings';
import type { LabelCropSettings, ProcessPhase, CropPreview, BatchMergeResult } from '../types';
import { MARKETPLACE_CONFIGS } from '../platforms/coordinates';
import {
  cropFile, cropFilesBatchMerge, loadPdfForViewer,
  type ViewerPage,
} from '../LabelCropEngine';

const DEFAULT_SETTINGS: LabelCropSettings = { outputFormat: 'thermal' };

interface SingleResult {
  filename:     string;
  labelBlob:    Blob;
  invoiceBlob?: Blob;
  preview:      CropPreview;
}

interface Props {
  slug:            string;
  marketplaceName: string;
  hasInvoice:      boolean;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

// Overlay boxes from config regions
function getOverlays(slug: string, currentPage: ViewerPage | undefined, pageIndex: number) {
  const config = MARKETPLACE_CONFIGS[slug];
  if (!config) return [];
  type Box = { top: string; left: string; width: string; height: string; color: string; bg: string; label: string };
  const boxes: Box[] = [];
  const push = (r: { x: number; y: number; width: number; height: number }, color: string, bg: string, label: string) =>
    boxes.push({ top: `${r.y*100}%`, left: `${r.x*100}%`, width: `${r.width*100}%`, height: `${r.height*100}%`, color, bg, label });

  if (config.pageStrategy === 'multi_page') {
    // Odd pages (0,2,4…) = labels, even pages (1,3,5…) = invoices
    const isLabel   = pageIndex % 2 === 0;
    const isInvoice = pageIndex % 2 === 1;
    if (isLabel)   push({ x:0, y:0, width:1, height:1 }, '#16A34A', 'rgba(22,163,74,0.07)', `Label (order ${Math.floor(pageIndex/2)+1})`);
    if (isInvoice) push({ x:0, y:0, width:1, height:1 }, '#2563EB', 'rgba(37,99,235,0.07)', `Invoice (order ${Math.floor(pageIndex/2)+1})`);
  } else if (config.pageStrategy === 'full_page') {
    push({ x:0, y:0, width:1, height:1 }, '#16A34A', 'rgba(22,163,74,0.07)', 'Label');
  } else if (config.pageStrategy === 'dynamic_split') {
    const fold = currentPage?.foldFraction
      ?? ((config.splitScanRange?.[0] ?? 0.45) + (config.splitScanRange?.[1] ?? 0.62)) / 2;
    const trim = config.marginTrim ?? 0.008;
    push({ x: trim, y: trim,  width: 1 - trim*2, height: fold - trim }, '#16A34A', 'rgba(22,163,74,0.07)', 'Label');
    push({ x: trim, y: fold,  width: 1 - trim*2, height: 0.88 - fold }, '#2563EB', 'rgba(37,99,235,0.07)', 'Invoice');
  } else {
    if (config.labelRegion)   push(config.labelRegion,   '#16A34A', 'rgba(22,163,74,0.07)', 'Label');
    if (config.invoiceRegion) push(config.invoiceRegion, '#2563EB', 'rgba(37,99,235,0.07)', 'Invoice');
  }
  return boxes;
}

// ── Reusable PDF Drop Zone ─────────────────────────────────────────────────
interface DropZoneProps {
  label:       string;
  color:       string;
  hint:        string;
  file:        File | null;
  onFile:      (f: File) => void;
  onClear:     () => void;
  loading:     boolean;
  disabled:    boolean;
}
const DropZone: React.FC<DropZoneProps> = ({ label, color, hint, file, onFile, onClear, loading, disabled }) => (
  <div className="flex flex-col gap-1.5 flex-1 min-w-0">
    <div className="flex items-center justify-between">
      <span className="text-xs font-bold uppercase tracking-wide" style={{ color }}>{label} PDF</span>
      {file && !disabled && (
        <button type="button" onClick={onClear}
          className="text-[10px] text-[#94A3B8] hover:text-[#DC2626] transition-colors flex items-center gap-1">
          <RotateCcw size={10} /> Clear
        </button>
      )}
    </div>
    <label className={[
      'relative flex flex-col items-center justify-center gap-2 rounded-[8px] border-2 border-dashed cursor-pointer transition-all group',
      'p-4 text-center',
      file ? 'border-opacity-60' : '',
      disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '',
    ].join(' ')}
    style={{ borderColor: file ? color : '#CBD5E1', backgroundColor: file ? color + '08' : '#F8FAFC', minHeight: '120px' }}>
      <input type="file" accept=".pdf" className="sr-only" disabled={disabled}
        onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); e.target.value = ''; }} />
      {loading ? (
        <Loader2 size={22} className="animate-spin" style={{ color }} />
      ) : file ? (
        <>
          <div className="flex h-8 w-8 items-center justify-center rounded-full"
            style={{ backgroundColor: color + '20' }}>
            <FileText size={16} style={{ color }} />
          </div>
          <span className="text-xs font-semibold truncate max-w-[140px]" style={{ color }}>{file.name}</span>
          <span className="text-[10px] text-[#64748B]">{(file.size / 1024).toFixed(0)} KB</span>
        </>
      ) : (
        <>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm text-[#94A3B8] group-hover:text-current transition-colors"
            style={{ ['--tw-text-opacity' as string]: 1 }}>
            <Upload size={16} />
          </div>
          <span className="text-xs font-medium text-[#64748B] group-hover:text-[#0F172A] transition-colors">{hint}</span>
          <span className="text-[10px] text-[#94A3B8]">Click or drop PDF</span>
        </>
      )}
    </label>
  </div>
);

// ── PDF Viewer panel ─────────────────────────────────────────────────────────
interface ViewerPanelProps {
  title:       string;
  color:       string;
  pages:       ViewerPage[];
  pageIndex:   number;
  overlays:    ReturnType<typeof getOverlays>;
  onPrev:      () => void;
  onNext:      () => void;
}
const ViewerPanel: React.FC<ViewerPanelProps> = ({ title, color, pages, pageIndex, overlays, onPrev, onNext }) => (
  <div className="flex-1 min-w-0 flex flex-col bg-white">
    <div className="flex items-start justify-between px-4 pt-4 pb-3">
      <div>
        <p className="text-sm font-bold" style={{ color }}>{title} Preview</p>
        {pages.length > 0 && <p className="text-xs text-[#64748B] mt-0.5">Total Pages: {pages.length}</p>}
      </div>
      {pages.length > 0 && (
        <span className="inline-flex items-center rounded-full text-white text-xs font-bold px-3 py-1"
          style={{ backgroundColor: color }}>
          Page {pageIndex + 1}
        </span>
      )}
    </div>

    <div className="bg-[#E9EBF0] mx-4 rounded-[8px] flex items-center justify-center" style={{ minHeight: '280px' }}>
      {pages.length > 0 ? (
        <div className="relative m-3 bg-white rounded-[4px] shadow-[0_4px_20px_rgba(0,0,0,0.15)] overflow-hidden"
          style={{ maxWidth: '280px', width: '100%' }}>
          <img src={pages[pageIndex].dataUrl} alt={`Page ${pageIndex + 1}`} className="w-full h-auto block" draggable={false} />
          {overlays.map((box, i) => (
            <div key={i} className="absolute pointer-events-none" style={{
              top: box.top, left: box.left, width: box.width, height: box.height,
              border: `1.5px dashed ${box.color}`, backgroundColor: box.bg, boxSizing: 'border-box',
            }}>
              <span className="absolute top-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded text-white leading-none"
                style={{ backgroundColor: box.color }}>{box.label}</span>
            </div>
          ))}
        </div>
      ) : (
        <span className="text-xs text-[#94A3B8] p-8 text-center">Upload a PDF to preview</span>
      )}
    </div>

    <div className="px-4 py-2.5 flex items-center justify-center gap-3">
      {pages.length > 1 ? (
        <>
          <button type="button" onClick={onPrev} disabled={pageIndex === 0}
            className="flex items-center gap-1 rounded-[6px] text-white text-xs font-semibold px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: color }}>
            <ChevronLeft size={13} /> Prev
          </button>
          <span className="text-xs font-semibold text-[#0F172A]">{pageIndex + 1} / {pages.length}</span>
          <button type="button" onClick={onNext} disabled={pageIndex === pages.length - 1}
            className="flex items-center gap-1 rounded-[6px] text-white text-xs font-semibold px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: color }}>
            Next <ChevronRight size={13} />
          </button>
        </>
      ) : (
        <span className="text-[10px] text-[#94A3B8]">{pages.length === 1 ? '1 page' : ''}</span>
      )}
    </div>
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────
export const MarketplaceLabelTool: React.FC<Props> = ({ slug, marketplaceName, hasInvoice }) => {
  const config = MARKETPLACE_CONFIGS[slug];

  const [settings,      setSettings]      = useState<LabelCropSettings>(DEFAULT_SETTINGS);
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  // Standard single/batch state
  const [viewerPages,   setViewerPages]   = useState<ViewerPage[]>([]);
  const [pageIndex,     setPageIndex]     = useState(0);
  // Split viewer indices for multi_page (Amazon) — odd pages=labels, even pages=invoices
  const [splitLabelIdx,   setSplitLabelIdx]   = useState(0);
  const [splitInvoiceIdx, setSplitInvoiceIdx] = useState(0);
  const [currentFile,   setCurrentFile]   = useState<File | null>(null);
  const [viewerLoading, setViewerLoading] = useState(false);
  const [singleResult,  setSingleResult]  = useState<SingleResult | null>(null);
  const [batchFiles,    setBatchFiles]    = useState<File[]>([]);
  const [batchResult,   setBatchResult]   = useState<BatchMergeResult | null>(null);
  const [phase,    setPhase]    = useState<ProcessPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Dual-upload state (Myntra full_page)
  const [labelFile,       setLabelFile]       = useState<File | null>(null);
  const [invoiceFile,     setInvoiceFile]      = useState<File | null>(null);
  const [labelPages,      setLabelPages]       = useState<ViewerPage[]>([]);
  const [invoicePages,    setInvoicePages]     = useState<ViewerPage[]>([]);
  const [labelPageIdx,    setLabelPageIdx]     = useState(0);
  const [invoicePageIdx,  setInvoicePageIdx]   = useState(0);
  const [labelLoading,    setLabelLoading]     = useState(false);
  const [invoiceLoading,  setInvoiceLoading]   = useState(false);
  const [labelBlob,       setLabelBlob]        = useState<Blob | null>(null);
  const [invoiceBlob,     setInvoiceBlob]      = useState<Blob | null>(null);
  const [labelPreview,    setLabelPreview]     = useState<string | null>(null);
  const [invoicePreview,  setInvoicePreview]   = useState<string | null>(null);
  const [dualPhase,       setDualPhase]        = useState<'idle'|'processing'|'done'|'error'>('idle');
  const [dualProgress,    setDualProgress]     = useState(0);
  const [dualError,       setDualError]        = useState('');

  if (!config) return (
    <div className="rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-sm text-[#DC2626]">
      Configuration for "{marketplaceName}" not found.
    </div>
  );

  const isDualUpload   = config.pageStrategy === 'full_page';
  const includeInvoice = !isDualUpload && hasInvoice;
  const isProcessing   = phase === 'processing';
  const fmt            = settings.outputFormat;

  const BADGE = {
    multi_page:    { icon: <FileStack size={12} />, label: 'Multi-page PDF',     color: '#2563EB', bg: '#EFF6FF' },
    single_page:   { icon: <FileUp    size={12} />, label: 'Single-page PDF',    color: '#7C3AED', bg: '#F5F3FF' },
    full_page:     { icon: <FileUp    size={12} />, label: 'Separate PDF files',  color: '#0891B2', bg: '#F0F9FF' },
    dynamic_split: { icon: <Wand2     size={12} />, label: 'Auto-detect split',   color: '#D97706', bg: '#FFFBEB' },
  } as const;
  const badge = BADGE[config.pageStrategy];

  // ── Dual upload handlers (Myntra) ─────────────────────────────────────────
  const handleLabelFile = useCallback(async (file: File) => {
    setLabelFile(file);
    setLabelBlob(null);
    setLabelPreview(null);
    setLabelLoading(true);
    try {
      const pages = await loadPdfForViewer(file, config).catch(() => [] as ViewerPage[]);
      setLabelPages(pages);
      setLabelPageIdx(0);
    } finally { setLabelLoading(false); }
  }, [config]);

  const handleInvoiceFile = useCallback(async (file: File) => {
    setInvoiceFile(file);
    setInvoiceBlob(null);
    setInvoicePreview(null);
    setInvoiceLoading(true);
    try {
      const pages = await loadPdfForViewer(file, config).catch(() => [] as ViewerPage[]);
      setInvoicePages(pages);
      setInvoicePageIdx(0);
    } finally { setInvoiceLoading(false); }
  }, [config]);

  const handleDualProcess = useCallback(async () => {
    if (!labelFile && !invoiceFile) return;
    setDualPhase('processing');
    setDualProgress(0);
    setDualError('');
    setLabelBlob(null);
    setInvoiceBlob(null);
    setLabelPreview(null);
    setInvoicePreview(null);
    try {
      let total = (labelFile ? 1 : 0) + (invoiceFile ? 1 : 0);
      let done  = 0;

      if (labelFile) {
        const r = await cropFilesBatchMerge([labelFile], config, settingsRef.current.outputFormat, false,
          p => setDualProgress(Math.round((done / total * 100) + p / total)));
        setLabelBlob(r.labelsPdf);
        setLabelPreview(r.preview.labelUrl);
        done++;
      }
      if (invoiceFile) {
        const r = await cropFilesBatchMerge([invoiceFile], config, settingsRef.current.outputFormat, false,
          p => setDualProgress(Math.round((done / total * 100) + p / total)));
        setInvoiceBlob(r.labelsPdf); // invoice pages treated as full labels
        setInvoicePreview(r.preview.labelUrl);
        done++;
      }
      setDualProgress(100);
      setDualPhase('done');
    } catch (err) {
      setDualError(err instanceof Error ? err.message : 'Processing failed');
      setDualPhase('error');
    }
  }, [labelFile, invoiceFile, config]);

  const handleDualReset = () => {
    setLabelFile(null); setInvoiceFile(null);
    setLabelPages([]); setInvoicePages([]);
    setLabelPageIdx(0); setInvoicePageIdx(0);
    setLabelBlob(null); setInvoiceBlob(null);
    setLabelPreview(null); setInvoicePreview(null);
    setDualPhase('idle'); setDualProgress(0); setDualError('');
    setLabelLoading(false); setInvoiceLoading(false);
  };

  const handleDualSettingsChange = useCallback((s: LabelCropSettings) => {
    setSettings(s);
    if (dualPhase === 'done' && (labelFile || invoiceFile)) {
      setDualPhase('idle');
      setLabelBlob(null); setInvoiceBlob(null);
      setLabelPreview(null); setInvoicePreview(null);
    }
  }, [dualPhase, labelFile, invoiceFile]);

  // ── Standard single/batch handlers ────────────────────────────────────────
  const processSingleFile = useCallback(async (file: File, outputFormat: LabelCropSettings['outputFormat']) => {
    setSingleResult(null); setErrorMsg(''); setPhase('processing'); setProgress(0);
    try {
      const result = await cropFile(file, config, outputFormat, 'pdf', includeInvoice, setProgress);
      setSingleResult({ filename: file.name.replace(/\.(pdf|png|jpe?g)$/i, ''), labelBlob: result.labelBlob, invoiceBlob: result.invoiceBlob, preview: result.preview });
      setPhase('done');
    } catch (err) { setErrorMsg(err instanceof Error ? err.message : 'Processing failed.'); setPhase('error'); }
  }, [config, includeInvoice]);

  const handleFiles = useCallback(async (files: File[]) => {
    if (!files.length) return;
    if (files.length === 1) {
      const file = files[0];
      setCurrentFile(file); setBatchFiles([]); setViewerPages([]); setPageIndex(0);
      setSingleResult(null); setBatchResult(null); setErrorMsg(''); setViewerLoading(true);
      const [pages] = await Promise.all([
        loadPdfForViewer(file, config).catch(() => [] as ViewerPage[]),
        processSingleFile(file, settingsRef.current.outputFormat),
      ]);
      setViewerPages(pages); setViewerLoading(false);
    } else {
      setCurrentFile(null); setViewerPages([]); setBatchFiles(files);
      setSingleResult(null); setBatchResult(null); setErrorMsg(''); setPhase('processing'); setProgress(0);
      try {
        const result = await cropFilesBatchMerge(files, config, settingsRef.current.outputFormat, includeInvoice, setProgress);
        setBatchResult(result); setPhase('done');
      } catch (err) { setErrorMsg(err instanceof Error ? err.message : 'Processing failed.'); setPhase('error'); }
    }
  }, [config, includeInvoice, processSingleFile]);

  const handleSettingsChange = useCallback((s: LabelCropSettings) => {
    setSettings(s);
    if (currentFile) { setSingleResult(null); processSingleFile(currentFile, s.outputFormat); }
    else if (batchFiles.length > 1) {
      setBatchResult(null); setPhase('processing'); setProgress(0);
      cropFilesBatchMerge(batchFiles, config, s.outputFormat, includeInvoice, setProgress)
        .then(r => { setBatchResult(r); setPhase('done'); })
        .catch(err => { setErrorMsg(err instanceof Error ? err.message : 'Failed'); setPhase('error'); });
    }
  }, [currentFile, batchFiles, config, includeInvoice, processSingleFile]);

  const handleReset = () => {
    setCurrentFile(null); setViewerPages([]); setPageIndex(0);
    setSplitLabelIdx(0); setSplitInvoiceIdx(0);
    setBatchFiles([]); setPhase('idle'); setProgress(0);
    setErrorMsg(''); setSingleResult(null); setBatchResult(null); setViewerLoading(false);
  };

  const overlays  = getOverlays(slug, viewerPages[pageIndex], pageIndex);
  const hasFiles  = currentFile || batchFiles.length > 0;

  const HOW_IT_WORKS: Record<string, string[]> = {
    single_page:   [`Upload your ${marketplaceName} PDF — each page has both label and invoice`, 'Drop 1 file to view · multiple files to merge', 'Choose Thermal 4×6 or A4 then download'],
    multi_page:    [`Upload your ${marketplaceName} PDF — page 1 = label, page 2 = invoice`, 'Drop 1 file to view · multiple files to merge all labels', 'Choose Thermal 4×6 or A4 then download'],
    full_page:     ['Upload your Myntra Label PDF in the left box', 'Upload your Myntra Invoice PDF in the right box', 'Choose output format → Crop → Download each separately'],
    dynamic_split: [`Upload your ${marketplaceName} PDF — label + invoice share each page`, 'The tool auto-detects the "Fold Here" separator on each page', 'Drop multiple files to merge all into one PDF per type'],
  };

  return (
    <div className="flex flex-col gap-5">

      {/* Info banner */}
      {config.note && (
        <div className="rounded-[8px] border p-3.5 flex gap-3"
          style={{ borderColor: badge.color + '40', backgroundColor: badge.bg }}>
          <Info size={14} className="shrink-0 mt-0.5" style={{ color: badge.color }} />
          <div className="flex flex-col gap-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide rounded-full px-2.5 py-0.5 w-fit"
              style={{ backgroundColor: badge.color + '1A', color: badge.color }}>
              {badge.icon} {badge.label}
            </span>
            <p className="text-xs text-[#475569] leading-relaxed">{config.note}</p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          MYNTRA — Dual upload UI
      ══════════════════════════════════════════════════════════════════ */}
      {isDualUpload ? (
        <div className="flex flex-col gap-5">

          {/* Page Layout */}
          <div className="rounded-[10px] border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-[#F1F5F9] bg-[#F8FAFC]">
              <h3 className="text-sm font-bold text-[#0F172A]">Page Layout</h3>
            </div>
            <div className="p-4">
              <LabelSettings settings={settings} onChange={handleDualSettingsChange} disabled={dualPhase === 'processing'} />
            </div>
          </div>

          {/* Two upload boxes */}
          <div className="flex flex-col sm:flex-row gap-4">
            <DropZone
              label="Label" color="#16A34A" hint="Drop Myntra Label PDF"
              file={labelFile} onFile={handleLabelFile} onClear={() => { setLabelFile(null); setLabelPages([]); setLabelBlob(null); setLabelPreview(null); }}
              loading={labelLoading} disabled={dualPhase === 'processing'}
            />
            <DropZone
              label="Invoice" color="#2563EB" hint="Drop Myntra Invoice PDF"
              file={invoiceFile} onFile={handleInvoiceFile} onClear={() => { setInvoiceFile(null); setInvoicePages([]); setInvoiceBlob(null); setInvoicePreview(null); }}
              loading={invoiceLoading} disabled={dualPhase === 'processing'}
            />
          </div>

          {/* PDF Viewers side by side */}
          {(labelPages.length > 0 || invoicePages.length > 0) && (
            <div className="flex flex-col lg:flex-row gap-0 border border-[#E2E8F0] rounded-[10px] overflow-hidden bg-white shadow-sm divide-y lg:divide-y-0 lg:divide-x divide-[#E2E8F0]">
              <ViewerPanel
                title="Label" color="#16A34A"
                pages={labelPages} pageIndex={labelPageIdx}
                overlays={getOverlays(slug, labelPages[labelPageIdx], labelPageIdx)}
                onPrev={() => setLabelPageIdx(i => Math.max(0, i-1))}
                onNext={() => setLabelPageIdx(i => Math.min(labelPages.length-1, i+1))}
              />
              <ViewerPanel
                title="Invoice" color="#2563EB"
                pages={invoicePages} pageIndex={invoicePageIdx}
                overlays={getOverlays(slug, invoicePages[invoicePageIdx], invoicePageIdx)}
                onPrev={() => setInvoicePageIdx(i => Math.max(0, i-1))}
                onNext={() => setInvoicePageIdx(i => Math.min(invoicePages.length-1, i+1))}
              />
            </div>
          )}

          {/* Crop button */}
          {(labelFile || invoiceFile) && dualPhase !== 'done' && (
            <button type="button" onClick={handleDualProcess} disabled={dualPhase === 'processing'}
              className="flex items-center justify-center gap-2 rounded-[8px] bg-[#2563EB] text-white text-sm font-bold px-6 py-3 hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {dualPhase === 'processing'
                ? <><Loader2 size={15} className="animate-spin" /> Processing… {dualProgress}%</>
                : <>Crop {[labelFile && 'Labels', invoiceFile && 'Invoices'].filter(Boolean).join(' + ')}</>}
            </button>
          )}

          {/* Progress bar */}
          {dualPhase === 'processing' && (
            <div className="w-full bg-[#E2E8F0] rounded-full h-1.5">
              <div className="bg-[#2563EB] h-1.5 rounded-full transition-all" style={{ width: `${dualProgress}%` }} />
            </div>
          )}

          {/* Error */}
          {dualPhase === 'error' && (
            <div className="rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] p-3 flex items-start gap-2 text-xs text-[#DC2626]">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              <span className="flex-1">{dualError}</span>
              <button onClick={handleDualReset} className="underline shrink-0">Reset</button>
            </div>
          )}

          {/* Results — crop previews + downloads */}
          {dualPhase === 'done' && (
            <div className="rounded-[10px] border border-[#BBF7D0] bg-[#F0FDF4] overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 bg-[#DCFCE7]">
                <span className="text-sm font-bold text-[#166534]">Done!</span>
                <button type="button" onClick={handleDualReset}
                  className="flex items-center gap-1 text-xs text-[#16A34A] hover:text-[#166534]">
                  <RotateCcw size={12} /> Process new files
                </button>
              </div>

              {/* Preview thumbnails */}
              <div className="p-5 grid grid-cols-2 gap-4">
                {[
                  { preview: labelPreview,   blob: labelBlob,   color: '#16A34A', label: 'Labels',   filename: `myntra-labels-${fmt}.pdf` },
                  { preview: invoicePreview, blob: invoiceBlob, color: '#2563EB', label: 'Invoices', filename: `myntra-invoices-${fmt}.pdf` },
                ].map(item => (
                  <div key={item.label} className="flex flex-col gap-2">
                    <div className="relative rounded-[6px] border overflow-hidden bg-[#F8FAFC]"
                      style={{ borderColor: item.color + '55' }}>
                      {item.preview ? (
                        <>
                          <img src={item.preview} alt={item.label} className="w-full object-contain block" style={{ maxHeight: '160px' }} />
                          <div className="absolute bottom-0 left-0 right-0 px-2 py-1 flex items-center"
                            style={{ backgroundColor: item.color + 'E6' }}>
                            <span className="text-[10px] font-bold text-white">{item.label}</span>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-center h-20 text-xs text-[#94A3B8]">Not uploaded</div>
                      )}
                    </div>
                    {item.blob && (
                      <button type="button" onClick={() => downloadBlob(item.blob!, item.filename)}
                        className="w-full flex items-center justify-center gap-2 rounded-[6px] text-white text-xs font-bold py-2.5 transition-colors hover:opacity-90"
                        style={{ backgroundColor: item.color }}>
                        <Package size={13} /> Download {item.label}
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {/* Download Both */}
              {labelBlob && invoiceBlob && (
                <div className="px-5 pb-5">
                  <button type="button"
                    onClick={() => {
                      downloadBlob(labelBlob!, `myntra-labels-${fmt}.pdf`);
                      setTimeout(() => downloadBlob(invoiceBlob!, `myntra-invoices-${fmt}.pdf`), 250);
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-[8px] bg-[#0F172A] text-white text-sm font-bold py-3 hover:bg-[#1E293B] transition-colors">
                    <FolderDown size={15} /> Download Both
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

      ) : (
      /* ══════════════════════════════════════════════════════════════════
          ALL OTHER MARKETPLACES — standard viewer UI
      ══════════════════════════════════════════════════════════════════ */
        <>
          {hasFiles && (
            <div className="flex justify-end">
              <button type="button" onClick={handleReset}
                className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#DC2626] transition-colors">
                <RotateCcw size={12} /> Change file{batchFiles.length > 1 ? 's' : ''}
              </button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-0 items-stretch border border-[#E2E8F0] rounded-[10px] overflow-hidden bg-white shadow-sm">
            {/* LEFT — viewer area: split panels for Amazon, single panel for others */}
            <div className="flex-1 min-w-0 flex flex-col bg-white">

            {/* Amazon split viewers (label + invoice side by side) */}
            {config.pageStrategy === 'multi_page' && viewerPages.length > 0 && (() => {
              const splitLabelPages   = viewerPages.filter(p => p.pageType === 'label');
              const splitInvoicePages = viewerPages.filter(p => p.pageType === 'invoice');
              const orderCount = splitLabelPages.length;
              return (
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2 px-5 pt-4 pb-2">
                    <span className="text-sm font-bold text-[#0F172A]">PDF Preview</span>
                    <span className="text-xs text-[#64748B]">— {orderCount} order{orderCount !== 1 ? 's' : ''} · {viewerPages.length} pages</span>
                  </div>
                  <div className="flex flex-col sm:flex-row flex-1 divide-y sm:divide-y-0 sm:divide-x divide-[#E2E8F0] mx-3 mb-3 border border-[#E2E8F0] rounded-[8px] overflow-hidden">
                    <ViewerPanel
                      title="Labels" color="#16A34A"
                      pages={splitLabelPages} pageIndex={splitLabelIdx}
                      overlays={[{ top:'0%', left:'0%', width:'100%', height:'100%', color:'#16A34A', bg:'rgba(22,163,74,0.07)', label:`Label (order ${splitLabelIdx+1})` }]}
                      onPrev={() => setSplitLabelIdx(i => Math.max(0, i-1))}
                      onNext={() => setSplitLabelIdx(i => Math.min(splitLabelPages.length-1, i+1))}
                    />
                    <ViewerPanel
                      title="Invoices" color="#2563EB"
                      pages={splitInvoicePages} pageIndex={splitInvoiceIdx}
                      overlays={splitInvoicePages.length > 0 ? [{ top:'0%', left:'0%', width:'100%', height:'100%', color:'#2563EB', bg:'rgba(37,99,235,0.07)', label:`Invoice (order ${splitInvoiceIdx+1})` }] : []}
                      onPrev={() => setSplitInvoiceIdx(i => Math.max(0, i-1))}
                      onNext={() => setSplitInvoiceIdx(i => Math.min(splitInvoicePages.length-1, i+1))}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Standard single viewer (all non-Amazon, or Amazon before file loaded) */}
            {!(config.pageStrategy === 'multi_page' && viewerPages.length > 0) && (<>
              <div className="flex items-start justify-between px-5 pt-4 pb-3">
                <div>
                  <p className="text-base font-bold text-[#0F172A]">PDF Preview</p>
                  {viewerPages.length > 0 && <p className="text-xs text-[#64748B] mt-0.5">Total Pages: {viewerPages.length}</p>}
                  {batchFiles.length > 1 && <p className="text-xs text-[#64748B] mt-0.5">{batchFiles.length} files</p>}
                </div>
                {viewerPages.length > 0 && (
                  <span className="inline-flex items-center rounded-full bg-[#2563EB] text-white text-xs font-bold px-4 py-1.5">
                    Page {pageIndex + 1}
                  </span>
                )}
              </div>

              <div className="bg-[#E9EBF0] mx-5 rounded-[8px] flex items-center justify-center" style={{ minHeight: '320px' }}>
                {viewerPages.length > 0 ? (
                  <div className="relative m-4 bg-white rounded-[4px] shadow-[0_4px_20px_rgba(0,0,0,0.15)] overflow-hidden"
                    style={{ maxWidth: '320px', width: '100%' }}>
                    <img src={viewerPages[pageIndex].dataUrl} alt={`Page ${pageIndex + 1}`} className="w-full h-auto block" draggable={false} />
                    {overlays.map((box, i) => (
                      <div key={i} className="absolute pointer-events-none" style={{
                        top: box.top, left: box.left, width: box.width, height: box.height,
                        border: `1.5px dashed ${box.color}`, backgroundColor: box.bg, boxSizing: 'border-box',
                      }}>
                        <span className="absolute top-1 left-1 text-[10px] font-bold px-1.5 py-0.5 rounded text-white leading-none"
                          style={{ backgroundColor: box.color }}>{box.label}</span>
                      </div>
                    ))}
                  </div>
                ) : isProcessing && batchFiles.length > 1 ? (
                  <div className="flex flex-col items-center gap-3 text-[#2563EB] p-8">
                    <Loader2 size={36} className="animate-spin" />
                    <span className="text-sm font-semibold">Processing {batchFiles.length} files… {progress}%</span>
                    <div className="w-48 bg-[#BFDBFE] rounded-full h-2">
                      <div className="bg-[#2563EB] h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                ) : batchResult ? (
                  <div className="m-4 bg-white rounded-[4px] shadow-md overflow-hidden" style={{ maxWidth: '320px', width: '100%' }}>
                    <img src={batchResult.preview.labelUrl} alt="Batch preview" className="w-full h-auto block" />
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center gap-4 cursor-pointer group m-4 w-full"
                    style={{ minHeight: '260px' }}>
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg" multiple className="sr-only"
                      onChange={e => { const files = Array.from(e.target.files ?? []); if (files.length) handleFiles(files); e.target.value = ''; }} />
                    {viewerLoading ? (
                      <div className="flex flex-col items-center gap-3 text-[#2563EB]">
                        <Loader2 size={36} className="animate-spin" />
                        <span className="text-sm font-semibold">Loading PDF…</span>
                      </div>
                    ) : (
                      <>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md text-[#94A3B8] group-hover:text-[#2563EB] transition-colors">
                          <Upload size={28} />
                        </div>
                        <div className="text-center">
                          <p className="text-base font-semibold text-[#475569] group-hover:text-[#2563EB] transition-colors">Drop {marketplaceName} PDF here</p>
                          <p className="text-sm text-[#94A3B8] mt-1">or <span className="text-[#2563EB] underline">click to browse</span></p>
                          <p className="text-xs text-[#94A3B8] mt-2">1 file → page viewer &nbsp;·&nbsp; multiple files → auto batch merge</p>
                        </div>
                      </>
                    )}
                  </label>
                )}
              </div>

              <div className="px-5 py-3 flex items-center justify-center gap-4">
                {viewerPages.length > 1 ? (
                  <>
                    <button type="button" onClick={() => setPageIndex(i => Math.max(0, i-1))} disabled={pageIndex === 0}
                      className="flex items-center gap-1 rounded-[6px] bg-[#2563EB] text-white text-sm font-semibold px-4 py-1.5 hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <ChevronLeft size={15} /> Previous
                    </button>
                    <span className="text-sm font-semibold text-[#0F172A] min-w-[48px] text-center">{pageIndex + 1} / {viewerPages.length}</span>
                    <button type="button" onClick={() => setPageIndex(i => Math.min(viewerPages.length-1, i+1))} disabled={pageIndex === viewerPages.length - 1}
                      className="flex items-center gap-1 rounded-[6px] bg-[#2563EB] text-white text-sm font-semibold px-4 py-1.5 hover:bg-[#1D4ED8] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      Next <ChevronRight size={15} />
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-[#94A3B8]">{viewerPages.length === 1 ? '1 page' : 'Upload a PDF to preview'}</span>
                )}
              </div>
            </>)}
            </div>

            {/* RIGHT — sidebar */}
            <div className="w-full lg:w-[280px] shrink-0 border-l border-[#E2E8F0] flex flex-col overflow-y-auto">
              <div className="px-4 py-4 border-b border-[#E2E8F0]">
                <h3 className="text-base font-bold text-[#0F172A] mb-3">Page Layout</h3>
                <LabelSettings settings={settings} onChange={handleSettingsChange} disabled={isProcessing} />
              </div>

              <div className="px-4 py-4 border-b border-[#E2E8F0]">
                <h3 className="text-base font-bold text-[#0F172A] mb-3">Crop Preview</h3>
                {isProcessing ? (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-[#2563EB]"><Loader2 size={12} className="animate-spin" /> Cropping… {progress}%</div>
                    <div className="w-full bg-[#E2E8F0] rounded-full h-1.5">
                      <div className="bg-[#2563EB] h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                ) : (singleResult || batchResult) ? (() => {
                  const preview    = singleResult?.preview ?? batchResult!.preview;
                  const labelCount = batchResult?.labelCount;
                  return (
                    <div className="flex flex-col gap-3">
                      {[
                        { url: preview.labelUrl,   size: preview.labelSize,   color: '#16A34A', label: `Label${labelCount ? ` (${labelCount})` : ''}` },
                        { url: preview.invoiceUrl, size: preview.invoiceSize, color: '#2563EB', label: `Invoice${labelCount ? ` (${labelCount})` : ''}` },
                      ].map(item => (
                        <div key={item.label} className="relative rounded-[6px] border overflow-hidden bg-[#F8FAFC]"
                          style={{ borderColor: item.color + '55' }}>
                          {item.url ? (
                            <>
                              <img src={item.url} alt={item.label} className="w-full object-contain block" style={{ maxHeight: '180px' }} />
                              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-2 py-1"
                                style={{ backgroundColor: item.color + 'E6' }}>
                                <span className="text-[10px] font-bold text-white leading-none">{item.label}</span>
                                {item.size && <span className="text-[9px] text-white/80 leading-none">{item.size.widthMm}×{item.size.heightMm} mm</span>}
                              </div>
                            </>
                          ) : (
                            <div className="flex items-center justify-center h-16 text-[10px] text-[#94A3B8]">No invoice</div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })() : phase === 'error' ? (
                  <div className="flex items-start gap-1.5 text-xs text-[#DC2626]"><AlertCircle size={12} className="shrink-0 mt-0.5" /><span className="leading-tight">{errorMsg}</span></div>
                ) : (
                  <p className="text-xs text-[#94A3B8]">Upload a PDF to see preview</p>
                )}
              </div>

              <div className="px-4 py-4 flex flex-col gap-2">
                <h3 className="text-base font-bold text-[#0F172A] mb-1">Download PDF</h3>
                {singleResult && (
                  <>
                    <button type="button" onClick={() => downloadBlob(singleResult.labelBlob, `${singleResult.filename}-label-${fmt}.pdf`)}
                      className="w-full flex items-center justify-center gap-2 rounded-[8px] bg-[#2563EB] text-white text-sm font-bold py-3 hover:bg-[#1D4ED8] transition-colors">
                      <Package size={15} /> Download Label
                    </button>
                    <button type="button" disabled={!singleResult.invoiceBlob}
                      onClick={() => singleResult.invoiceBlob && downloadBlob(singleResult.invoiceBlob!, `${singleResult.filename}-invoice-${fmt}.pdf`)}
                      className="w-full flex items-center justify-center gap-2 rounded-[8px] border-2 border-[#CBD5E1] text-[#0F172A] bg-white text-sm font-bold py-3 hover:bg-[#F8FAFC] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <FileText size={15} /> Download Invoice
                    </button>
                    <button type="button" disabled={!singleResult.invoiceBlob}
                      onClick={() => { downloadBlob(singleResult.labelBlob, `${singleResult.filename}-label-${fmt}.pdf`); if (singleResult.invoiceBlob) setTimeout(() => downloadBlob(singleResult.invoiceBlob!, `${singleResult.filename}-invoice-${fmt}.pdf`), 250); }}
                      className="w-full flex items-center justify-center gap-2 rounded-[8px] bg-[#0F172A] text-white text-sm font-bold py-3 hover:bg-[#1E293B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <FolderDown size={15} /> Download Both
                    </button>
                  </>
                )}
                {batchResult && (
                  <>
                    <button type="button" onClick={() => downloadBlob(batchResult.labelsPdf, `${marketplaceName.toLowerCase()}-labels-${fmt}.pdf`)}
                      className="w-full flex items-center justify-center gap-2 rounded-[8px] bg-[#2563EB] text-white text-sm font-bold py-3 hover:bg-[#1D4ED8] transition-colors">
                      <Package size={15} /> Download Labels PDF
                    </button>
                    {batchResult.invoicesPdf && (
                      <button type="button" onClick={() => downloadBlob(batchResult.invoicesPdf!, `${marketplaceName.toLowerCase()}-invoices-${fmt}.pdf`)}
                        className="w-full flex items-center justify-center gap-2 rounded-[8px] border-2 border-[#CBD5E1] text-[#0F172A] bg-white text-sm font-bold py-3 hover:bg-[#F8FAFC] transition-colors">
                        <FileText size={15} /> Download Invoices PDF
                      </button>
                    )}
                    {batchResult.invoicesPdf && (
                      <button type="button" onClick={() => { downloadBlob(batchResult.labelsPdf, `${marketplaceName.toLowerCase()}-labels-${fmt}.pdf`); setTimeout(() => downloadBlob(batchResult.invoicesPdf!, `${marketplaceName.toLowerCase()}-invoices-${fmt}.pdf`), 250); }}
                        className="w-full flex items-center justify-center gap-2 rounded-[8px] bg-[#0F172A] text-white text-sm font-bold py-3 hover:bg-[#1E293B] transition-colors">
                        <FolderDown size={15} /> Download Both
                      </button>
                    )}
                  </>
                )}
                {!singleResult && !batchResult && (
                  <>
                    <button type="button" disabled className="w-full flex items-center justify-center gap-2 rounded-[8px] bg-[#2563EB] text-white text-sm font-bold py-3 opacity-40 cursor-not-allowed"><Package size={15} /> Download Label</button>
                    <button type="button" disabled className="w-full flex items-center justify-center gap-2 rounded-[8px] border-2 border-[#CBD5E1] text-[#0F172A] bg-white text-sm font-bold py-3 opacity-40 cursor-not-allowed"><FileText size={15} /> Download Invoice</button>
                    <button type="button" disabled className="w-full flex items-center justify-center gap-2 rounded-[8px] bg-[#0F172A] text-white text-sm font-bold py-3 opacity-40 cursor-not-allowed"><FolderDown size={15} /> Download Both</button>
                  </>
                )}
              </div>
            </div>
          </div>

          {phase === 'error' && (
            <div className="rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] p-3 flex items-start gap-2 text-xs text-[#DC2626]">
              <AlertCircle size={13} className="shrink-0 mt-0.5" />
              <span className="flex-1">{errorMsg}</span>
              <button onClick={handleReset} className="underline shrink-0">Reset</button>
            </div>
          )}
        </>
      )}

      {/* How it works */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <p className="text-xs font-semibold text-[#0F172A] mb-2 flex items-center gap-1.5">
          <span className="text-[#16A34A]">⊙</span> How it works
        </p>
        <ol className="list-decimal list-inside space-y-1 text-xs text-[#475569]">
          {(HOW_IT_WORKS[config.pageStrategy] ?? []).map((s, i) => <li key={i}>{s}</li>)}
        </ol>
        <p className="text-[11px] text-[#94A3B8] mt-2">Powered by PDF.js + pdf-lib. Files never leave your device.</p>
      </div>

    </div>
  );
};

export default MarketplaceLabelTool;
