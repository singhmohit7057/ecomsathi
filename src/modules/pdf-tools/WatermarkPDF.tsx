import React, { useState } from 'react';
import { Stamp, Download } from 'lucide-react';
import { PDFDocument, rgb, StandardFonts, degrees } from 'pdf-lib';
import { ToolPage } from './shared/ToolPage';
import { Button } from '@/components/common/Button';
import { Alert } from '@/components/common/Alert';
import { FileUploader } from '@/components/common/FileUploader';

type WatermarkPosition = 'center' | 'tiled';

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? { r: parseInt(result[1], 16) / 255, g: parseInt(result[2], 16) / 255, b: parseInt(result[3], 16) / 255 }
    : { r: 0.5, g: 0.5, b: 0.5 };
}

export const handle = {
  toolName: 'Watermark PDF',
  category: 'PDF Tools',
  description: 'Add text watermark to your PDF with custom color, opacity, and position.',
  relatedTools: [
    { label: 'Page Numbers', to: '/tools/pdf/page-numbers' },
    { label: 'Rotate PDF', to: '/tools/pdf/rotate' },
    { label: 'Compress PDF', to: '/tools/pdf/compress' },
  ],
};

export default function WatermarkPDF() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('CONFIDENTIAL');
  const [color, setColor] = useState('#808080');
  const [opacity, setOpacity] = useState(30);
  const [fontSize, setFontSize] = useState(48);
  const [rotation, setRotation] = useState(45);
  const [position, setPosition] = useState<WatermarkPosition>('center');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleFile = (files: File[]) => {
    setFile(files[0] ?? null);
    setError(null);
    setDownloadUrl(null);
  };

  const handleProcess = async () => {
    if (!file || !text.trim()) return;
    setError(null);
    setProcessing(true);
    setDownloadUrl(null);

    try {
      const bytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(bytes);
      const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const { r, g, b } = hexToRgb(color);
      const alpha = opacity / 100;

      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(text.trim(), fontSize);

        if (position === 'center') {
          page.drawText(text.trim(), {
            x: width / 2 - textWidth / 2,
            y: height / 2,
            size: fontSize,
            font,
            color: rgb(r, g, b),
            opacity: alpha,
            rotate: degrees(rotation),
          });
        } else {
          // Tiled
          const gapX = textWidth + 60;
          const gapY = fontSize + 60;
          for (let y = 0; y < height + gapY; y += gapY) {
            for (let x = -gapX; x < width + gapX; x += gapX) {
              page.drawText(text.trim(), {
                x,
                y,
                size: fontSize,
                font,
                color: rgb(r, g, b),
                opacity: alpha,
                rotate: degrees(rotation),
              });
            }
          }
        }
      }

      const outBytes = await pdfDoc.save();
      const blob = new Blob([outBytes], { type: 'application/pdf' });
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add watermark. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = file.name.replace(/\.pdf$/i, '_watermarked.pdf');
    a.click();
  };

  return (
    <ToolPage
      icon={<Stamp size={24} />}
      title="Watermark PDF"
      description="Add a custom text watermark to all pages of your PDF."
      category="PDF Tools"
    >
      {/* Upload */}
      <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6">
        <FileUploader
          accept={{ 'application/pdf': ['.pdf'] }}
          maxSizeMB={50}
          multiple={false}
          onFiles={handleFile}
          label="Upload PDF"
        />
      </div>

      {/* Options */}
      {file && (
        <div className="flex flex-col gap-5 rounded-[8px] border border-[#E2E8F0] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#0F172A]">Watermark Settings</h2>

          {/* Text */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-[#0F172A]">Watermark text</label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. CONFIDENTIAL, DRAFT"
              className="rounded-[4px] border border-[#94A3B8] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Color */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#0F172A]">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-[4px] border border-[#94A3B8] p-0.5"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-28 rounded-[4px] border border-[#94A3B8] px-3 py-2 text-sm text-[#0F172A] focus:border-[#2563EB] focus:outline-none"
                />
              </div>
            </div>

            {/* Font size */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#0F172A]">Font size: {fontSize}pt</label>
              <input
                type="range"
                min={12}
                max={120}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="accent-[#2563EB]"
              />
            </div>

            {/* Opacity */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#0F172A]">Opacity: {opacity}%</label>
              <input
                type="range"
                min={5}
                max={100}
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="accent-[#2563EB]"
              />
            </div>

            {/* Rotation */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-[#0F172A]">Rotation: {rotation}°</label>
              <input
                type="range"
                min={-90}
                max={90}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="accent-[#2563EB]"
              />
            </div>
          </div>

          {/* Position */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#0F172A]">Position</label>
            <div className="flex gap-3">
              {(['center', 'tiled'] as WatermarkPosition[]).map((pos) => (
                <label
                  key={pos}
                  className={[
                    'flex cursor-pointer items-center gap-2 rounded-[4px] border px-4 py-2 text-sm font-medium capitalize transition-colors',
                    position === pos
                      ? 'border-[#2563EB] bg-[#EFF6FF] text-[#2563EB]'
                      : 'border-[#E2E8F0] text-[#475569] hover:border-[#94A3B8]',
                  ].join(' ')}
                >
                  <input
                    type="radio"
                    name="position"
                    value={pos}
                    checked={position === pos}
                    onChange={() => setPosition(pos)}
                    className="accent-[#2563EB]"
                  />
                  {pos === 'center' ? 'Center (single)' : 'Tiled (repeat)'}
                </label>
              ))}
            </div>
          </div>

          {/* Preview swatch */}
          <div
            className="flex h-20 items-center justify-center rounded-[4px] border border-dashed border-[#CBD5E1] bg-[#F8FAFC]"
            style={{ overflow: 'hidden' }}
          >
            <span
              style={{
                color,
                fontSize: Math.min(fontSize, 32),
                opacity: opacity / 100,
                transform: `rotate(${-rotation}deg)`,
                fontWeight: 700,
                letterSpacing: 2,
                userSelect: 'none',
              }}
            >
              {text || 'Preview'}
            </span>
          </div>
        </div>
      )}

      {/* Error */}
      {error && <Alert variant="error" message={error} onClose={() => setError(null)} />}

      {/* Process */}
      {file && (
        <Button
          onClick={handleProcess}
          loading={processing}
          leftIcon={<Stamp size={16} />}
          size="lg"
          disabled={!text.trim()}
        >
          {processing ? 'Adding watermark…' : 'Add Watermark'}
        </Button>
      )}

      {/* Result */}
      {downloadUrl && (
        <div className="flex flex-col gap-3 rounded-[8px] border border-[#BBF7D0] bg-[#F0FDF4] p-4">
          <p className="text-sm font-semibold text-[#16A34A]">Watermark added successfully!</p>
          <Button onClick={handleDownload} leftIcon={<Download size={16} />}>
            Download Watermarked PDF
          </Button>
        </div>
      )}
    </ToolPage>
  );
}
