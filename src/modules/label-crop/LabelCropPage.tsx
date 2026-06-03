import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  CheckCircle2,
  Upload,
  Download,
  Loader2,
  FileText,
  X,
  AlertCircle,
  Archive,
} from 'lucide-react';
import { useDropzone } from 'react-dropzone';
import { MARKETPLACE_CONFIGS, type MarketplaceCropConfig } from './platforms/coordinates';
import {
  cropPDFLabels,
  cropPDFLabelsBatch,
  renderFirstPagePreview,
  type OutputType,
  type BatchCropResult,
} from './LabelCropEngine';
import { Button } from '@/components/common/Button';

// ---------------------------------------------------------------------------
// Marketplace icon/logo mapping (emoji fallback — replace with actual logos)
// ---------------------------------------------------------------------------

const MARKETPLACE_ICONS: Record<string, string> = {
  amazon: '📦',
  flipkart: '🛒',
  myntra: '👗',
  meesho: '🛍️',
  ajio: '🎽',
  nykaa: '💄',
  snapdeal: '⚡',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Download all batch results individually (sequential, 300ms apart to avoid browser block).
 * Install `fflate` or `jszip` and replace this with a ZIP build for a better UX.
 */
async function downloadBatchResults(
  results: BatchCropResult[],
  outputType: OutputType,
  includeInvoice: boolean,
): Promise<void> {
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    downloadBlob(result.labelBlob, `${result.filename}-labels-${outputType}.pdf`);
    if (includeInvoice && result.invoiceBlob) {
      await new Promise<void>((r) => setTimeout(r, 200));
      downloadBlob(result.invoiceBlob!, `${result.filename}-invoices-${outputType}.pdf`);
    }
    if (i < results.length - 1) {
      await new Promise<void>((r) => setTimeout(r, 300));
    }
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

type Phase =
  | 'idle'
  | 'previewing'
  | 'processing'
  | 'done'
  | 'error';

interface SingleResult {
  labelBlob: Blob;
  invoiceBlob?: Blob;
  filename: string;
}

export const LabelCropPage: React.FC = () => {
  const [selectedMarketplace, setSelectedMarketplace] = useState<string | null>(null);
  const [outputType, setOutputType] = useState<OutputType>('thermal');
  const [includeInvoice, setIncludeInvoice] = useState<boolean>(false);
  const [batchMode, setBatchMode] = useState<boolean>(false);

  // Single file state
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  // Batch files state
  const [batchFiles, setBatchFiles] = useState<File[]>([]);

  // Processing state
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [singleResult, setSingleResult] = useState<SingleResult | null>(null);
  const [batchResults, setBatchResults] = useState<BatchCropResult[] | null>(null);

  const config: MarketplaceCropConfig | null = selectedMarketplace
    ? MARKETPLACE_CONFIGS[selectedMarketplace] ?? null
    : null;

  const hasInvoiceRegion = config?.invoiceRegion != null;

  // -----------------------------------------------------------------------
  // Single file dropzone
  // -----------------------------------------------------------------------

  const onDropSingle = useCallback(
    async (acceptedFiles: File[]) => {
      if (!acceptedFiles.length) return;
      const file = acceptedFiles[0];
      setSingleFile(file);
      setPreviewDataUrl(null);
      setPhase('previewing');
      setSingleResult(null);
      try {
        const preview = await renderFirstPagePreview(file);
        setPreviewDataUrl(preview);
        setPhase('idle');
      } catch {
        setPreviewDataUrl(null);
        setPhase('idle');
      }
    },
    [],
  );

  const { getRootProps: getSingleRootProps, getInputProps: getSingleInputProps, isDragActive: isSingleDrag } =
    useDropzone({
      onDrop: onDropSingle,
      accept: { 'application/pdf': ['.pdf'] },
      multiple: false,
      disabled: phase === 'processing',
    });

  // -----------------------------------------------------------------------
  // Batch dropzone
  // -----------------------------------------------------------------------

  const onDropBatch = useCallback((acceptedFiles: File[]) => {
    setBatchFiles((prev) => {
      const existing = new Set(prev.map((f) => f.name));
      const newFiles = acceptedFiles.filter((f) => !existing.has(f.name));
      return [...prev, ...newFiles];
    });
    setBatchResults(null);
  }, []);

  const { getRootProps: getBatchRootProps, getInputProps: getBatchInputProps, isDragActive: isBatchDrag } =
    useDropzone({
      onDrop: onDropBatch,
      accept: { 'application/pdf': ['.pdf'] },
      multiple: true,
      disabled: phase === 'processing',
    });

  // -----------------------------------------------------------------------
  // Process
  // -----------------------------------------------------------------------

  const handleProcess = async () => {
    if (!config) return;
    setPhase('processing');
    setProgress(0);
    setErrorMsg('');
    setSingleResult(null);
    setBatchResults(null);

    try {
      if (!batchMode) {
        if (!singleFile) return;

        const result = await cropPDFLabels(
          singleFile,
          config,
          outputType,
          includeInvoice && hasInvoiceRegion,
          (pct) => setProgress(pct),
        );

        const baseName = singleFile.name.replace(/\.pdf$/i, '');
        setSingleResult({
          labelBlob: result.labelsPdfBlob,
          invoiceBlob: result.invoicesPdfBlob,
          filename: baseName,
        });
        setPhase('done');
      } else {
        if (!batchFiles.length) return;

        const results = await cropPDFLabelsBatch(
          batchFiles,
          config,
          outputType,
          includeInvoice && hasInvoiceRegion,
          (pct) => setProgress(pct),
        );

        setBatchResults(results);

        setPhase('done');
      }
    } catch (err) {
      console.error('LabelCropPage error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Processing failed');
      setPhase('error');
    }
  };

  const handleReset = () => {
    setSingleFile(null);
    setBatchFiles([]);
    setPreviewDataUrl(null);
    setPhase('idle');
    setProgress(0);
    setErrorMsg('');
    setSingleResult(null);
    setBatchResults(null);
  };

  const canProcess = config != null && (batchMode ? batchFiles.length > 0 : singleFile != null);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[#64748B]">
        <Link to="/" className="hover:text-[#0F172A] transition-colors">Home</Link>
        <ChevronRight size={14} className="shrink-0" />
        <Link to="/tools" className="hover:text-[#0F172A] transition-colors">Tools</Link>
        <ChevronRight size={14} className="shrink-0" />
        <span className="font-medium text-[#0F172A]">Label Crop</span>
      </nav>

      {/* Tool Header */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-[#EFF6FF] text-[#2563EB] text-2xl">
            ✂️
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-[#0F172A] sm:text-2xl">Label Crop</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2.5 py-0.5 text-xs font-medium text-[#16A34A] ring-1 ring-inset ring-[#BBF7D0]">
                <CheckCircle2 size={11} />
                No login required
              </span>
              <span className="inline-flex items-center rounded-full bg-[#FFFBEB] px-2.5 py-0.5 text-xs font-medium text-[#D97706]">
                Free
              </span>
            </div>
            <p className="mt-1 text-sm text-[#475569] sm:text-base">
              Crop shipping labels from marketplace PDFs. Supports Amazon, Flipkart, Myntra, Meesho, AJIO, Nykaa, and Snapdeal.
              Output as Thermal (4×6) or A4 (4 per page).
            </p>
          </div>
        </div>
      </div>

      {/* Step 1: Marketplace */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-4">
        <h2 className="text-base font-semibold text-[#0F172A]">1. Select Marketplace</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {Object.values(MARKETPLACE_CONFIGS).map((cfg) => (
            <button
              key={cfg.slug}
              type="button"
              onClick={() => {
                setSelectedMarketplace(cfg.slug);
                // Reset invoice toggle if new marketplace has no invoice
                if (!cfg.invoiceRegion) setIncludeInvoice(false);
              }}
              className={[
                'flex flex-col items-center gap-2 rounded-[8px] border p-3 transition-all text-center',
                selectedMarketplace === cfg.slug
                  ? 'border-[#2563EB] bg-[#EFF6FF] shadow-sm'
                  : 'border-[#E2E8F0] bg-white hover:border-[#93C5FD] hover:bg-[#F8FAFC]',
              ].join(' ')}
            >
              <span className="text-2xl leading-none">{MARKETPLACE_ICONS[cfg.slug] ?? '🏪'}</span>
              <span
                className={`text-xs font-semibold leading-tight ${
                  selectedMarketplace === cfg.slug ? 'text-[#2563EB]' : 'text-[#0F172A]'
                }`}
              >
                {cfg.marketplace}
              </span>
              {cfg.invoiceRegion && (
                <span className="text-[10px] text-[#64748B]">Label + Invoice</span>
              )}
              {!cfg.invoiceRegion && (
                <span className="text-[10px] text-[#94A3B8]">Label only</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2: Output options */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-4">
        <h2 className="text-base font-semibold text-[#0F172A]">2. Output Options</h2>
        <div className="flex flex-wrap gap-6">
          {/* Output format */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#0F172A]">Output Format</label>
            <div className="flex gap-2">
              {(['thermal', 'a4'] as OutputType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setOutputType(t)}
                  className={[
                    'px-4 py-2 rounded-[4px] text-sm font-medium border transition-colors',
                    outputType === t
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : 'bg-white text-[#475569] border-[#CBD5E1] hover:border-[#2563EB] hover:text-[#2563EB]',
                  ].join(' ')}
                >
                  {t === 'thermal' ? 'Thermal (4×6)' : 'A4 (4 per page)'}
                </button>
              ))}
            </div>
            <p className="text-xs text-[#64748B]">
              {outputType === 'thermal'
                ? '100 × 150 mm thermal printer format — one label per page'
                : 'A4 size — 4 labels arranged in a 2×2 grid per page'}
            </p>
          </div>

          {/* Include invoice */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#0F172A]">Include Invoice</label>
            <label
              className={[
                'flex items-center gap-2 cursor-pointer select-none',
                !hasInvoiceRegion ? 'opacity-50 cursor-not-allowed' : '',
              ].join(' ')}
            >
              <input
                type="checkbox"
                checked={includeInvoice && hasInvoiceRegion}
                onChange={(e) => setIncludeInvoice(e.target.checked)}
                disabled={!hasInvoiceRegion}
                className="h-4 w-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]/20"
              />
              <span className="text-sm text-[#0F172A]">Extract invoices too</span>
            </label>
            {!hasInvoiceRegion && selectedMarketplace && (
              <p className="text-xs text-[#94A3B8]">
                {config?.marketplace} PDFs do not contain an invoice region.
              </p>
            )}
          </div>

          {/* Batch mode */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#0F172A]">Processing Mode</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => { setBatchMode(false); setBatchFiles([]); }}
                className={[
                  'px-4 py-2 rounded-[4px] text-sm font-medium border transition-colors',
                  !batchMode
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-white text-[#475569] border-[#CBD5E1] hover:border-[#2563EB] hover:text-[#2563EB]',
                ].join(' ')}
              >
                Single File
              </button>
              <button
                type="button"
                onClick={() => { setBatchMode(true); setSingleFile(null); setPreviewDataUrl(null); }}
                className={[
                  'px-4 py-2 rounded-[4px] text-sm font-medium border transition-colors',
                  batchMode
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : 'bg-white text-[#475569] border-[#CBD5E1] hover:border-[#2563EB] hover:text-[#2563EB]',
                ].join(' ')}
              >
                Batch (ZIP)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Step 3: Upload */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-4">
        <h2 className="text-base font-semibold text-[#0F172A]">3. Upload PDF{batchMode ? 's' : ''}</h2>

        {!batchMode ? (
          /* Single file upload */
          <div className="flex flex-col gap-4">
            <div
              {...getSingleRootProps()}
              className={[
                'border-2 border-dashed rounded-[8px] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all',
                isSingleDrag ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#2563EB] hover:bg-[#EFF6FF]',
                phase === 'processing' ? 'opacity-60 cursor-not-allowed pointer-events-none' : '',
              ].join(' ')}
            >
              <input {...getSingleInputProps()} />
              <Upload size={32} className={isSingleDrag ? 'text-[#2563EB]' : 'text-[#94A3B8]'} />
              <div className="text-center">
                <p className="text-sm font-medium text-[#0F172A]">
                  {isSingleDrag ? 'Drop PDF here…' : (
                    <>Drag PDF here or <span className="text-[#2563EB] underline">click to browse</span></>
                  )}
                </p>
                <p className="text-xs text-[#64748B] mt-1">PDF files only</p>
              </div>
            </div>

            {singleFile && (
              <div className="flex items-center gap-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px] px-3 py-2">
                <FileText size={16} className="text-[#64748B] shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#0F172A] truncate">{singleFile.name}</p>
                  <p className="text-xs text-[#64748B]">{formatBytes(singleFile.size)}</p>
                </div>
                {phase !== 'processing' && (
                  <button
                    type="button"
                    onClick={() => { setSingleFile(null); setPreviewDataUrl(null); setPhase('idle'); setSingleResult(null); }}
                    className="text-[#94A3B8] hover:text-[#DC2626] transition-colors shrink-0"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            )}

            {/* First page preview */}
            {phase === 'previewing' && (
              <div className="flex items-center gap-2 text-xs text-[#64748B]">
                <Loader2 size={14} className="animate-spin" />
                Loading preview…
              </div>
            )}
            {previewDataUrl && (
              <div className="flex flex-col gap-2">
                <p className="text-xs font-medium text-[#64748B]">Preview (first page)</p>
                <img
                  src={previewDataUrl}
                  alt="PDF first page preview"
                  className="max-w-full max-h-64 rounded-[4px] border border-[#E2E8F0] object-contain shadow-sm"
                />
              </div>
            )}
          </div>
        ) : (
          /* Batch upload */
          <div className="flex flex-col gap-4">
            <div
              {...getBatchRootProps()}
              className={[
                'border-2 border-dashed rounded-[8px] p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all',
                isBatchDrag ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#CBD5E1] bg-[#F8FAFC] hover:border-[#2563EB] hover:bg-[#EFF6FF]',
                phase === 'processing' ? 'opacity-60 cursor-not-allowed pointer-events-none' : '',
              ].join(' ')}
            >
              <input {...getBatchInputProps()} />
              <Upload size={32} className={isBatchDrag ? 'text-[#2563EB]' : 'text-[#94A3B8]'} />
              <div className="text-center">
                <p className="text-sm font-medium text-[#0F172A]">
                  {isBatchDrag ? 'Drop PDFs here…' : (
                    <>Drop multiple PDFs or <span className="text-[#2563EB] underline">click to browse</span></>
                  )}
                </p>
                <p className="text-xs text-[#64748B] mt-1">Multiple PDF files — output will be ZIP</p>
              </div>
            </div>

            {batchFiles.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[#64748B]">{batchFiles.length} file{batchFiles.length !== 1 ? 's' : ''} selected</p>
                  {phase !== 'processing' && (
                    <button
                      type="button"
                      onClick={() => setBatchFiles([])}
                      className="text-xs text-[#DC2626] hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-48 overflow-y-auto flex flex-col gap-1.5">
                  {batchFiles.map((f, i) => (
                    <div key={`${f.name}-${i}`} className="flex items-center gap-2 text-xs text-[#0F172A] bg-[#F8FAFC] border border-[#E2E8F0] rounded-[4px] px-3 py-2">
                      <FileText size={12} className="text-[#64748B] shrink-0" />
                      <span className="flex-1 truncate">{f.name}</span>
                      <span className="text-[#94A3B8] shrink-0">{formatBytes(f.size)}</span>
                      {phase !== 'processing' && (
                        <button
                          type="button"
                          onClick={() => setBatchFiles((prev) => prev.filter((_, idx) => idx !== i))}
                          className="text-[#94A3B8] hover:text-[#DC2626] shrink-0"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Processing progress */}
      {phase === 'processing' && (
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[#0F172A]">
            <Loader2 size={16} className="animate-spin text-[#2563EB]" />
            Processing{batchMode ? ` ${batchFiles.length} file${batchFiles.length !== 1 ? 's' : ''}` : ''}…
          </div>
          <div className="w-full bg-[#E2E8F0] rounded-full h-2">
            <div
              className="bg-[#2563EB] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-[#64748B]">{progress}% — rendering and cropping pages client-side</p>
        </div>
      )}

      {/* Error */}
      {phase === 'error' && (
        <div className="rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] p-4 flex items-start gap-2 text-sm text-[#DC2626]">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="flex-1">{errorMsg}</span>
          <button onClick={handleReset} className="underline hover:text-[#B91C1C] shrink-0">Try again</button>
        </div>
      )}

      {/* Results — Single */}
      {phase === 'done' && singleResult && !batchMode && (
        <div className="rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-[#166534]">Processing complete!</h3>
          <p className="text-xs text-[#475569]">
            Labels extracted from <strong>{singleResult.filename}.pdf</strong> as {outputType === 'thermal' ? 'thermal (100×150 mm)' : 'A4 (4 per page)'} PDF.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              leftIcon={<Download size={16} />}
              onClick={() =>
                downloadBlob(
                  singleResult.labelBlob,
                  `${singleResult.filename}-labels-${outputType}.pdf`,
                )
              }
            >
              Download Labels PDF
            </Button>
            {singleResult.invoiceBlob && (
              <Button
                variant="outline"
                leftIcon={<Download size={16} />}
                onClick={() =>
                  downloadBlob(
                    singleResult.invoiceBlob!,
                    `${singleResult.filename}-invoices-${outputType}.pdf`,
                  )
                }
              >
                Download Invoices PDF
              </Button>
            )}
            <Button variant="ghost" onClick={handleReset}>Process another</Button>
          </div>
        </div>
      )}

      {/* Results — Batch */}
      {phase === 'done' && batchResults && batchMode && (
        <div className="rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-6 flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-[#166534]">
            Batch processing complete! ({batchResults.length} file{batchResults.length !== 1 ? 's' : ''})
          </h3>
          <div className="max-h-40 overflow-y-auto flex flex-col gap-1 text-xs text-[#475569]">
            {batchResults.map((r) => (
              <div key={r.filename} className="flex items-center gap-2">
                <CheckCircle2 size={12} className="text-[#16A34A] shrink-0" />
                <span>{r.filename}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              leftIcon={<Archive size={16} />}
              onClick={() =>
                downloadBatchResults(batchResults, outputType, includeInvoice && hasInvoiceRegion)
              }
            >
              Download All ({batchResults.length} files)
            </Button>
            <Button variant="ghost" onClick={handleReset}>Process new batch</Button>
          </div>
          <p className="text-xs text-[#94A3B8]">
            Files will be downloaded individually. Add <code className="font-mono bg-[#F1F5F9] px-1 rounded">fflate</code> or <code className="font-mono bg-[#F1F5F9] px-1 rounded">jszip</code> to bundle into a ZIP.
          </p>
        </div>
      )}

      {/* Process button */}
      {(phase === 'idle' || phase === 'error') && (
        <div className="flex gap-3">
          <Button
            onClick={handleProcess}
            disabled={!canProcess}
            loading={phase === 'processing'}
          >
            {batchMode
              ? `Process ${batchFiles.length} File${batchFiles.length !== 1 ? 's' : ''}`
              : 'Crop Labels'}
          </Button>
          {(singleFile || batchFiles.length > 0) && (
            <Button variant="ghost" onClick={handleReset}>Reset</Button>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] p-5 flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-[#0F172A]">How it works</h3>
        <ol className="list-decimal list-inside text-xs text-[#475569] space-y-1">
          <li>Select your marketplace (determines crop coordinates)</li>
          <li>Choose Thermal or A4 output format</li>
          <li>Toggle "Include Invoice" if you need the invoice section too</li>
          <li>Upload a PDF (or multiple for batch) — all processing is done in your browser, no data is sent to a server</li>
          <li>Download the cropped labels PDF or ZIP</li>
        </ol>
        <p className="text-xs text-[#94A3B8] mt-1">
          All PDF processing happens entirely in your browser using PDF.js and pdf-lib. Your files are never uploaded.
        </p>
      </div>
    </div>
  );
};

export default LabelCropPage;
