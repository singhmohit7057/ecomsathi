import React, { useState, useCallback, useEffect } from 'react';
import {
  CheckCircle2, Loader2, AlertCircle, Layers, FileUp, Scissors,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { SingleUploader, BatchUploader } from './LabelUploader';
import { LabelSettings } from './LabelSettings';
import { LabelPreview } from './LabelPreview';
import { SingleDownload, BatchDownload } from './LabelDownload';
import type { LabelCropSettings, ProcessPhase, ProcessedLabel } from '../types';
import { MARKETPLACE_CONFIGS } from '../platforms/coordinates';
import {
  cropFile, cropFilesAsZip, cropFilesBatch, renderFirstPagePreview,
} from '../LabelCropEngine';

const DEFAULT_SETTINGS: LabelCropSettings = {
  outputFormat: 'thermal',
  outputFileType: 'pdf',
  includeInvoice: false,
  zipDownload: true,
};

interface Props {
  slug: string;
  marketplaceName: string;
  hasInvoice: boolean;
}

export const MarketplaceLabelTool: React.FC<Props> = ({ slug, marketplaceName, hasInvoice }) => {
  const config = MARKETPLACE_CONFIGS[slug];

  const [batchMode, setBatchMode]     = useState(false);
  const [settings, setSettings]       = useState<LabelCropSettings>({ ...DEFAULT_SETTINGS, includeInvoice: false });
  const [singleFile, setSingleFile]   = useState<File | null>(null);
  const [previewUrl, setPreviewUrl]   = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [batchFiles, setBatchFiles]   = useState<File[]>([]);
  const [phase, setPhase]             = useState<ProcessPhase>('idle');
  const [progress, setProgress]       = useState(0);
  const [errorMsg, setErrorMsg]       = useState('');
  const [singleResult, setSingleResult] = useState<ProcessedLabel | null>(null);
  const [batchResults, setBatchResults] = useState<ProcessedLabel[] | null>(null);
  const [zipBlob, setZipBlob]         = useState<Blob | null>(null);

  /* preview on file select */
  useEffect(() => {
    if (!singleFile) { setPreviewUrl(null); return; }
    let cancelled = false;
    setPreviewLoading(true);
    setPreviewUrl(null);
    renderFirstPagePreview(singleFile)
      .then((url) => { if (!cancelled) setPreviewUrl(url); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setPreviewLoading(false); });
    return () => { cancelled = true; };
  }, [singleFile]);

  const handleAddFiles = useCallback((newFiles: File[]) => {
    setBatchFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      return [...prev, ...newFiles.filter((f) => !existing.has(f.name))];
    });
  }, []);

  const handleProcess = async () => {
    if (!config) { setErrorMsg(`No crop config for "${slug}"`); setPhase('error'); return; }
    setPhase('processing'); setProgress(0); setErrorMsg('');
    setSingleResult(null); setBatchResults(null); setZipBlob(null);

    try {
      const inv = settings.includeInvoice && hasInvoice;
      if (!batchMode) {
        if (!singleFile) return;
        const result = await cropFile(singleFile, config, settings.outputFormat, settings.outputFileType, inv, setProgress);
        const base = singleFile.name.replace(/\.(pdf|png|jpe?g)$/i, '');
        setSingleResult({
          filename: base,
          labelBlob:   result.labelsPdfBlob   ?? result.labelsPngBlobs?.[0]   ?? new Blob(),
          invoiceBlob: result.invoicesPdfBlob ?? result.invoicesPngBlobs?.[0],
        });
      } else {
        if (!batchFiles.length) return;
        if (settings.zipDownload) {
          const zip = await cropFilesAsZip(batchFiles, config, settings.outputFormat, settings.outputFileType, inv, setProgress);
          setZipBlob(zip);
          setBatchResults(batchFiles.map((f) => ({
            filename: f.name.replace(/\.(pdf|png|jpe?g)$/i, ''),
            labelBlob: new Blob(),
          })));
        } else {
          setBatchResults(await cropFilesBatch(batchFiles, config, settings.outputFormat, settings.outputFileType, inv, setProgress));
        }
      }
      setPhase('done');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Processing failed');
      setPhase('error');
    }
  };

  const handleReset = () => {
    setSingleFile(null); setBatchFiles([]); setPreviewUrl(null); setPreviewLoading(false);
    setPhase('idle'); setProgress(0); setErrorMsg('');
    setSingleResult(null); setBatchResults(null); setZipBlob(null);
  };

  const canProcess  = batchMode ? batchFiles.length > 0 : singleFile != null;
  const isProcessing = phase === 'processing';

  if (!config) {
    return (
      <div className="rounded-[10px] border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-sm text-[#DC2626]">
        Crop configuration for "{marketplaceName}" not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">

      {/* ── Step 1 : Output settings ─────────────────────────────────── */}
      <div className="rounded-[10px] border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-white text-[10px] font-bold">1</span>
          <h2 className="text-sm font-semibold text-[#0F172A]">Output Options</h2>
        </div>
        <div className="p-5">
          <LabelSettings settings={settings} onChange={setSettings} hasInvoice={hasInvoice} disabled={isProcessing} />
        </div>
      </div>

      {/* ── Step 2 : Upload ──────────────────────────────────────────── */}
      <div className="rounded-[10px] border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#F1F5F9] bg-[#F8FAFC]">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-white text-[10px] font-bold">2</span>
            <h2 className="text-sm font-semibold text-[#0F172A]">Upload Files</h2>
          </div>
          {/* Mode toggle */}
          <div className="flex rounded-[6px] border border-[#E2E8F0] overflow-hidden">
            {[
              { label: 'Single', icon: <FileUp size={13} />, active: !batchMode },
              { label: 'Batch',  icon: <Layers size={13} />, active: batchMode  },
            ].map(({ label, icon, active }) => (
              <button
                key={label}
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  if (label === 'Single') { setBatchMode(false); setBatchFiles([]); setPhase('idle'); }
                  else                   { setBatchMode(true);  setSingleFile(null); setPreviewUrl(null); setPhase('idle'); }
                }}
                className={[
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors',
                  active ? 'bg-[#2563EB] text-white' : 'bg-white text-[#64748B] hover:text-[#2563EB]',
                ].join(' ')}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 flex flex-col gap-4">
          {!batchMode ? (
            <SingleUploader
              file={singleFile}
              onFile={(f) => { setSingleFile(f); setPhase('idle'); setSingleResult(null); }}
              onRemove={() => { setSingleFile(null); setPreviewUrl(null); setPhase('idle'); setSingleResult(null); }}
              disabled={isProcessing}
            />
          ) : (
            <BatchUploader
              files={batchFiles}
              onFiles={handleAddFiles}
              onRemove={(i) => setBatchFiles((prev) => prev.filter((_, idx) => idx !== i))}
              onClear={() => setBatchFiles([])}
              disabled={isProcessing}
            />
          )}
          {!batchMode && <LabelPreview previewUrl={previewUrl} isLoading={previewLoading} />}
        </div>
      </div>

      {/* ── Step 3 : Process button ──────────────────────────────────── */}
      {(phase === 'idle' || phase === 'error') && (
        <div className="rounded-[10px] border border-[#E2E8F0] bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-[#F1F5F9] bg-[#F8FAFC]">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB] text-white text-[10px] font-bold">3</span>
            <h2 className="text-sm font-semibold text-[#0F172A]">Process</h2>
          </div>
          <div className="p-5 flex gap-3">
            <Button
              onClick={handleProcess}
              disabled={!canProcess}
              loading={isProcessing}
              leftIcon={<Scissors size={15} />}
            >
              {batchMode
                ? `Crop ${batchFiles.length > 0 ? batchFiles.length + ' ' : ''}Label${batchFiles.length !== 1 ? 's' : ''}`
                : 'Crop Labels'}
            </Button>
            {(singleFile || batchFiles.length > 0) && (
              <Button variant="ghost" onClick={handleReset}>Reset</Button>
            )}
          </div>
        </div>
      )}

      {/* ── Progress ─────────────────────────────────────────────────── */}
      {isProcessing && (
        <div className="rounded-[10px] border border-[#BFDBFE] bg-[#EFF6FF] p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-[#1D4ED8]">
            <Loader2 size={16} className="animate-spin" />
            {batchMode
              ? `Cropping ${batchFiles.length} file${batchFiles.length !== 1 ? 's' : ''}…`
              : 'Cropping label…'}
          </div>
          <div className="w-full bg-[#BFDBFE] rounded-full h-2">
            <div className="bg-[#2563EB] h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-[#3B82F6]">{progress}% complete — processing locally, no upload</p>
        </div>
      )}

      {/* ── Error ────────────────────────────────────────────────────── */}
      {phase === 'error' && (
        <div className="rounded-[10px] border border-[#FCA5A5] bg-[#FEF2F2] p-4 flex items-start gap-3 text-sm text-[#DC2626]">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="flex-1">{errorMsg}</span>
          <button onClick={handleReset} className="text-xs underline hover:text-[#B91C1C] shrink-0">Try again</button>
        </div>
      )}

      {/* ── Result — single ──────────────────────────────────────────── */}
      {phase === 'done' && singleResult && !batchMode && (
        <SingleDownload result={singleResult} settings={settings} onReset={handleReset} />
      )}

      {/* ── Result — batch ───────────────────────────────────────────── */}
      {phase === 'done' && batchMode && (
        <BatchDownload
          zipBlob={zipBlob}
          results={batchResults}
          settings={settings}
          onReset={handleReset}
          marketplaceName={marketplaceName}
        />
      )}

      {/* ── How it works (collapsible info) ──────────────────────────── */}
      <div className="rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <p className="text-xs font-semibold text-[#0F172A] mb-2 flex items-center gap-1.5">
          <CheckCircle2 size={13} className="text-[#16A34A]" /> How it works
        </p>
        <ol className="list-decimal list-inside space-y-1 text-xs text-[#475569]">
          <li>Select output format (Thermal 4×6 or A4) and file type (PDF or PNG)</li>
          <li>Toggle "Extract invoices" if needed</li>
          <li>Upload PDF, PNG or JPG — single or multiple files</li>
          <li>Click Crop Labels — everything runs in your browser, nothing is uploaded</li>
          <li>Download individual files or a single ZIP archive</li>
        </ol>
        <p className="text-[11px] text-[#94A3B8] mt-2">Powered by PDF.js + pdf-lib. Files never leave your device.</p>
      </div>

    </div>
  );
};

export default MarketplaceLabelTool;
