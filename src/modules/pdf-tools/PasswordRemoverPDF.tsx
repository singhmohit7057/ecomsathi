import React, { useState } from 'react';
import { Unlock, Download, Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import { ToolPage } from './shared/ToolPage';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { FileUploader } from '@/components/common/FileUploader';

export const handle = {
  toolName: 'Remove PDF Password',
  category: 'PDF Tools',
  description: 'Remove password protection from a PDF you own. Password required.',
  relatedTools: [
    { label: 'Merge PDF', to: '/tools/pdf/merge' },
    { label: 'Compress PDF', to: '/tools/pdf/compress' },
    { label: 'Split PDF', to: '/tools/pdf/split' },
  ],
};

export default function PasswordRemoverPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFile = (files: File[]) => {
    setFile(files[0] ?? null);
    setError(null);
    setDownloadUrl(null);
  };

  const handleProcess = async () => {
    if (!file || !password || !agreed) return;
    setError(null);
    setProcessing(true);
    setDownloadUrl(null);

    try {
      const bytes = await file.arrayBuffer();

      let pdfDoc: PDFDocument;
      try {
        pdfDoc = await PDFDocument.load(bytes, { password });
      } catch {
        throw new Error('Incorrect password or the PDF is not password-protected.');
      }

      // Save without password (pdf-lib does not re-apply encryption when saving)
      const outBytes = await pdfDoc.save();
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove password. Please check the password and try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace(/\.pdf$/i, '_unlocked.pdf');
    a.click();
  };

  const canProcess = !!file && !!password && agreed;

  return (
    <ToolPage
      icon={<Unlock size={24} />}
      title="Remove PDF Password"
      description="Remove password protection from your PDFs. You must know the current password."
      category="PDF Tools"
    >
      {/* Legal notice */}
      <Alert
        variant="warning"
        icon
        title="Legal use only"
        message="This tool can only remove passwords if you know the current password. Only use on PDFs you own or have permission to access."
      />

      {/* Upload */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6">
        <FileUploader
          accept={{ 'application/pdf': ['.pdf'] }}
          maxSizeMB={50}
          multiple={false}
          onFiles={handleFile}
          label="Upload password-protected PDF"
        />
      </div>

      {/* Password + agreement */}
      {file && (
        <div className="flex flex-col gap-4 rounded-[8px] border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#0F172A]">Enter Current Password</h2>

          {/* Password input */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#0F172A]">PDF Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter the PDF password"
                autoComplete="current-password"
                className="w-full rounded-[4px] border border-[#94A3B8] py-2.5 pl-3 pr-10 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-[#64748B]">
              The password is used locally in your browser to unlock the PDF. It is not sent to our servers.
            </p>
          </div>

          {/* Legal disclaimer */}
          <label className="flex cursor-pointer items-start gap-3 rounded-[4px] border border-[#FDE68A] bg-[#FFFBEB] p-3">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#D97706]"
            />
            <div className="flex items-start gap-2">
              <ShieldAlert size={16} className="mt-0.5 shrink-0 text-[#D97706]" />
              <p className="text-xs text-[#78350F]">
                <strong>I confirm</strong> that I have the right to access this PDF and that removing
                the password complies with applicable laws and the document owner's permissions.
              </p>
            </div>
          </label>
        </div>
      )}

      {/* Error */}
      {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

      {/* Process */}
      {file && (
        <Button
          onClick={handleProcess}
          loading={processing}
          disabled={!canProcess}
          leftIcon={<Unlock size={16} />}
          size="lg"
        >
          {processing ? 'Removing password…' : 'Remove Password'}
        </Button>
      )}

      {!agreed && file && (
        <p className="text-xs text-[#94A3B8]">Please enter the password and check the legal disclaimer to proceed.</p>
      )}

      {/* Result */}
      {downloadUrl && (
        <div className="flex flex-col gap-3 rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-4">
          <p className="text-sm font-semibold text-[#16A34A]">Password removed successfully!</p>
          <p className="text-sm text-[#15803D]">The unlocked PDF is ready to download.</p>
          <Button onClick={handleDownload} leftIcon={<Download size={16} />}>
            Download Unlocked PDF
          </Button>
        </div>
      )}
    </ToolPage>
  );
}
