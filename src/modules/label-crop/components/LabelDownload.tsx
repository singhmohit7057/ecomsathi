import React from 'react';
import { Download, Archive, CheckCircle2, RotateCcw } from 'lucide-react';
import { Button } from '../../../components/common/Button';
import type { ProcessedLabel, LabelCropSettings } from '../types';

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

interface SingleDownloadProps {
  result: ProcessedLabel;
  settings: LabelCropSettings;
  onReset: () => void;
}

export const SingleDownload: React.FC<SingleDownloadProps> = ({ result, settings, onReset }) => {
  const ext = settings.outputFileType;
  const formatLabel = settings.outputFormat === 'thermal' ? 'thermal (100×150 mm)' : 'A4 (4/page)';

  return (
    <div className="rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={18} className="text-[#16A34A] shrink-0" />
        <h3 className="text-sm font-semibold text-[#166534]">Processing complete!</h3>
      </div>
      <p className="text-xs text-[#475569]">
        Labels extracted from <strong>{result.filename}</strong> as {formatLabel} {ext.toUpperCase()}.
      </p>
      <div className="flex flex-wrap gap-3">
        <Button
          leftIcon={<Download size={16} />}
          onClick={() => downloadBlob(result.labelBlob, `${result.filename}-labels-${settings.outputFormat}.${ext}`)}
        >
          Download Labels
        </Button>
        {result.invoiceBlob && (
          <Button
            variant="outline"
            leftIcon={<Download size={16} />}
            onClick={() => downloadBlob(result.invoiceBlob!, `${result.filename}-invoices-${settings.outputFormat}.${ext}`)}
          >
            Download Invoices
          </Button>
        )}
        <Button variant="ghost" leftIcon={<RotateCcw size={15} />} onClick={onReset}>
          Process another
        </Button>
      </div>
    </div>
  );
};

interface BatchDownloadProps {
  zipBlob: Blob | null;
  results: ProcessedLabel[] | null;
  settings: LabelCropSettings;
  onReset: () => void;
  marketplaceName: string;
}

export const BatchDownload: React.FC<BatchDownloadProps> = ({
  zipBlob,
  results,
  settings,
  onReset,
  marketplaceName,
}) => {
  const count = results?.length ?? 0;

  return (
    <div className="rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-6 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <CheckCircle2 size={18} className="text-[#16A34A] shrink-0" />
        <h3 className="text-sm font-semibold text-[#166534]">
          Batch complete! ({count} file{count !== 1 ? 's' : ''})
        </h3>
      </div>

      {results && results.length > 0 && (
        <div className="max-h-36 overflow-y-auto flex flex-col gap-1">
          {results.map((r) => (
            <div key={r.filename} className="flex items-center gap-2 text-xs text-[#475569]">
              <CheckCircle2 size={11} className="text-[#16A34A] shrink-0" />
              <span className="truncate">{r.filename}</span>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {zipBlob ? (
          <Button
            leftIcon={<Archive size={16} />}
            onClick={() =>
              downloadBlob(zipBlob, `${marketplaceName.toLowerCase()}-labels-${settings.outputFormat}.zip`)
            }
          >
            Download ZIP ({count} files)
          </Button>
        ) : (
          results?.map((r) => (
            <Button
              key={r.filename}
              size="sm"
              variant="outline"
              leftIcon={<Download size={14} />}
              onClick={() =>
                downloadBlob(r.labelBlob, `${r.filename}-labels.${settings.outputFileType}`)
              }
            >
              {r.filename}
            </Button>
          ))
        )}
        <Button variant="ghost" leftIcon={<RotateCcw size={15} />} onClick={onReset}>
          New batch
        </Button>
      </div>
    </div>
  );
};
