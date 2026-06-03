import React, { useState, useCallback, useEffect } from 'react';
import {
  CheckCircle2,
  Loader2,
  AlertCircle,
  Layers,
  FileUp,
} from 'lucide-react';
import { Button } from '../../../components/common/Button';
import { SingleUploader, BatchUploader } from './LabelUploader';
import { LabelSettings } from './LabelSettings';
import { LabelPreview } from './LabelPreview';
import { SingleDownload, BatchDownload } from './LabelDownload';
import type { LabelCropSettings, ProcessPhase, ProcessedLabel } from '../types';
import { MARKETPLACE_CONFIGS } from '../platforms/coordinates';
import {
  cropFile,
  cropFilesAsZip,
  cropFilesBatch,
  renderFirstPagePreview,
} from '../LabelCropEngine';

const DEFAULT_SETTINGS: LabelCropSettings = {
  outputFormat: 'thermal',
  outputFileType: 'pdf',
  includeInvoice: false,
  zipDownload: true,
};

interface MarketplaceLabelToolProps {
  slug: string;
  marketplaceName: string;
  hasInvoice: boolean;
}

export const MarketplaceLabelTool: React.FC<MarketplaceLabelToolProps> = ({
  slug,
  marketplaceName,
  hasInvoice,
}) => {
  const config = MARKETPLACE_CONFIGS[slug];

  const [batchMode, setBatchMode] = useState(false);
  const [settings, setSettings] = useState<LabelCropSettings>({
    ...DEFAULT_SETTINGS,
    includeInvoice: false,
  });

  // Single file
  const [singleFile, setSingleFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Batch files
  const [batchFiles, setBatchFiles] = useState<File[]>([]);

  // Processing
  const [phase, setPhase] = useState<ProcessPhase>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');

  // Results
  const [singleResult, setSingleResult] = useState<ProcessedLabel | null>(null);
  const [batchResults, setBatchResults] = useState<ProcessedLabel[] | null>(null);
  const [zipBlob, setZipBlob] = useState<Blob | null>(null);

  // Generate preview when single file selected
  useEffect(() => {
    if (!singleFile) {
      setPreviewUrl(null);
      return;
    }
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
    if (!config) {
      setErrorMsg(`No crop config found for "${slug}"`);
      setPhase('error');
      return;
    }

    setPhase('processing');
    setProgress(0);
    setErrorMsg('');
    setSingleResult(null);
    setBatchResults(null);
    setZipBlob(null);

    try {
      const includeInvoice = settings.includeInvoice && hasInvoice;

      if (!batchMode) {
        if (!singleFile) return;
        const result = await cropFile(
          singleFile,
          config,
          settings.outputFormat,
          settings.outputFileType,
          includeInvoice,
          setProgress,
        );
        const baseName = singleFile.name.replace(/\.(pdf|png|jpe?g)$/i, '');
        setSingleResult({
          filename: baseName,
          labelBlob: result.labelsPdfBlob ?? result.labelsPngBlobs?.[0] ?? new Blob(),
          invoiceBlob: result.invoicesPdfBlob ?? result.invoicesPngBlobs?.[0],
        });
      } else {
        if (!batchFiles.length) return;

        if (settings.zipDownload) {
          const zip = await cropFilesAsZip(
            batchFiles,
            config,
            settings.outputFormat,
            settings.outputFileType,
            includeInvoice,
            setProgress,
          );
          setZipBlob(zip);
          setBatchResults(batchFiles.map((f) => ({
            filename: f.name.replace(/\.(pdf|png|jpe?g)$/i, ''),
            labelBlob: new Blob(),
          })));
        } else {
          const results = await cropFilesBatch(
            batchFiles,
            config,
            settings.outputFormat,
            settings.outputFileType,
            includeInvoice,
            setProgress,
          );
          setBatchResults(results);
        }
      }

      setPhase('done');
    } catch (err) {
      console.error('Label crop error:', err);
      setErrorMsg(err instanceof Error ? err.message : 'Processing failed');
      setPhase('error');
    }
  };

  const handleReset = () => {
    setSingleFile(null);
    setBatchFiles([]);
    setPreviewUrl(null);
    setPreviewLoading(false);
    setPhase('idle');
    setProgress(0);
    setErrorMsg('');
    setSingleResult(null);
    setBatchResults(null);
    setZipBlob(null);
  };

  const canProcess = batchMode ? batchFiles.length > 0 : singleFile != null;
  const isProcessing = phase === 'processing';

  if (!config) {
    return (
      <div className="rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] p-4 text-sm text-[#DC2626]">
        Configuration for "{marketplaceName}" not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Output options */}
      <LabelSettings
        settings={settings}
        onChange={setSettings}
        hasInvoice={hasInvoice}
        disabled={isProcessing}
      />

      {/* Mode toggle */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-base font-semibold text-[#0F172A]">Upload Files</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setBatchMode(false); setBatchFiles([]); setPhase('idle'); }}
              disabled={isProcessing}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-sm font-medium border transition-colors',
                !batchMode
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-white text-[#475569] border-[#CBD5E1] hover:border-[#2563EB] hover:text-[#2563EB]',
              ].join(' ')}
            >
              <FileUp size={14} />
              Single
            </button>
            <button
              type="button"
              onClick={() => { setBatchMode(true); setSingleFile(null); setPreviewUrl(null); setPhase('idle'); }}
              disabled={isProcessing}
              className={[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-sm font-medium border transition-colors',
                batchMode
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-white text-[#475569] border-[#CBD5E1] hover:border-[#2563EB] hover:text-[#2563EB]',
              ].join(' ')}
            >
              <Layers size={14} />
              Batch
            </button>
          </div>
        </div>

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

        {/* Preview */}
        {!batchMode && (
          <LabelPreview previewUrl={previewUrl} isLoading={previewLoading} />
        )}
      </div>

      {/* Progress */}
      {isProcessing && (
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-5 shadow-sm flex flex-col gap-3">
          <div className="flex items-center gap-2 text-sm font-medium text-[#0F172A]">
            <Loader2 size={16} className="animate-spin text-[#2563EB]" />
            {batchMode
              ? `Processing ${batchFiles.length} file${batchFiles.length !== 1 ? 's' : ''}…`
              : 'Processing…'}
          </div>
          <div className="w-full bg-[#E2E8F0] rounded-full h-2">
            <div
              className="bg-[#2563EB] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-[#64748B]">{progress}% — client-side processing, no upload</p>
        </div>
      )}

      {/* Error */}
      {phase === 'error' && (
        <div className="rounded-[8px] border border-[#FCA5A5] bg-[#FEF2F2] p-4 flex items-start gap-2 text-sm text-[#DC2626]">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="flex-1">{errorMsg}</span>
          <button onClick={handleReset} className="underline hover:text-[#B91C1C] shrink-0">
            Try again
          </button>
        </div>
      )}

      {/* Done — single */}
      {phase === 'done' && singleResult && !batchMode && (
        <SingleDownload result={singleResult} settings={settings} onReset={handleReset} />
      )}

      {/* Done — batch */}
      {phase === 'done' && batchMode && (
        <BatchDownload
          zipBlob={zipBlob}
          results={batchResults}
          settings={settings}
          onReset={handleReset}
          marketplaceName={marketplaceName}
        />
      )}

      {/* Process / Reset */}
      {(phase === 'idle' || phase === 'error') && (
        <div className="flex gap-3">
          <Button
            onClick={handleProcess}
            disabled={!canProcess}
            loading={isProcessing}
            leftIcon={<CheckCircle2 size={16} />}
          >
            {batchMode
              ? `Crop ${batchFiles.length || ''} Label${batchFiles.length !== 1 ? 's' : ''}`.trim()
              : 'Crop Labels'}
          </Button>
          {(singleFile || batchFiles.length > 0) && (
            <Button variant="ghost" onClick={handleReset}>Reset</Button>
          )}
        </div>
      )}

      {/* How it works */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] p-5 flex flex-col gap-2">
        <h3 className="text-sm font-semibold text-[#0F172A]">How it works</h3>
        <ol className="list-decimal list-inside text-xs text-[#475569] space-y-1">
          <li>Choose output format (Thermal 4×6 or A4) and file type (PDF or PNG)</li>
          <li>Toggle "Extract invoices" if you also need the invoice section</li>
          <li>Upload one or multiple files — PDF, PNG, JPG all supported</li>
          <li>Click "Crop Labels" — all processing runs in your browser, nothing is uploaded</li>
          <li>Download individual files or a single ZIP archive</li>
        </ol>
        <p className="text-xs text-[#94A3B8] mt-1">
          Powered by PDF.js and pdf-lib. Your files never leave your device.
        </p>
      </div>
    </div>
  );
};

export default MarketplaceLabelTool;
