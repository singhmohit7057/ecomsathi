import React from 'react';
import { Printer, Image, Archive, Receipt, FileText } from 'lucide-react';
import type { LabelCropSettings } from '../types';

interface LabelSettingsProps {
  settings: LabelCropSettings;
  onChange: (s: LabelCropSettings) => void;
  hasInvoice: boolean;
  disabled?: boolean;
}

function SegmentBtn({
  active, onClick, disabled, icon, label, desc,
}: {
  active: boolean; onClick: () => void; disabled?: boolean;
  icon: React.ReactNode; label: string; desc?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'flex flex-col items-start gap-0.5 rounded-[8px] border px-3 py-2.5 text-left transition-all',
        active
          ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]'
          : 'border-[#E2E8F0] bg-white text-[#475569] hover:border-[#93C5FD]',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      ].join(' ')}
    >
      <span className="flex items-center gap-1.5 text-sm font-semibold">
        {icon} {label}
      </span>
      {desc && <span className="text-[10px] leading-tight opacity-70">{desc}</span>}
    </button>
  );
}

function Toggle({
  id, checked, onChange, disabled, label, description,
}: {
  id: string; checked: boolean; onChange: (v: boolean) => void;
  disabled?: boolean; label: string; description?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={[
        'flex items-center gap-3 cursor-pointer select-none',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
    >
      <div className="relative shrink-0">
        <input id={id} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} disabled={disabled} className="sr-only" />
        <div className={['h-5 w-9 rounded-full transition-colors', checked ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]'].join(' ')} />
        <div className={['absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform', checked ? 'translate-x-4' : 'translate-x-0.5'].join(' ')} />
      </div>
      <div>
        <span className="text-sm font-medium text-[#0F172A]">{label}</span>
        {description && <p className="text-xs text-[#94A3B8] mt-0.5">{description}</p>}
      </div>
    </label>
  );
}

export const LabelSettings: React.FC<LabelSettingsProps> = ({
  settings, onChange, hasInvoice, disabled = false,
}) => {
  function set<K extends keyof LabelCropSettings>(key: K, value: LabelCropSettings[K]) {
    onChange({ ...settings, [key]: value });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Output Format */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">Output Format</span>
        <div className="grid grid-cols-2 gap-2">
          <SegmentBtn
            active={settings.outputFormat === 'thermal'}
            onClick={() => set('outputFormat', 'thermal')}
            disabled={disabled}
            icon={<Printer size={13} />}
            label="Thermal 4×6"
            desc="100 × 150 mm · 1 per page"
          />
          <SegmentBtn
            active={settings.outputFormat === 'a4'}
            onClick={() => set('outputFormat', 'a4')}
            disabled={disabled}
            icon={<Printer size={13} />}
            label="A4 Sheet"
            desc="4 labels per page"
          />
        </div>
      </div>

      {/* File Type */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wide">File Type</span>
        <div className="grid grid-cols-2 gap-2">
          <SegmentBtn
            active={settings.outputFileType === 'pdf'}
            onClick={() => set('outputFileType', 'pdf')}
            disabled={disabled}
            icon={<FileText size={13} />}
            label="PDF"
            desc="Best for printing"
          />
          <SegmentBtn
            active={settings.outputFileType === 'png'}
            onClick={() => set('outputFileType', 'png')}
            disabled={disabled}
            icon={<Image size={13} />}
            label="PNG"
            desc="High-res images"
          />
        </div>
      </div>

      {/* Toggles row */}
      <div className="flex flex-wrap gap-x-8 gap-y-3 pt-1 border-t border-[#F1F5F9]">
        <Toggle
          id="include-invoice"
          checked={settings.includeInvoice && hasInvoice}
          onChange={(v) => set('includeInvoice', v)}
          disabled={disabled || !hasInvoice}
          label="Extract invoices"
          description={!hasInvoice ? 'Not available for this marketplace' : 'Also extract the invoice region'}
        />
        <Toggle
          id="zip-download"
          checked={settings.zipDownload}
          onChange={(v) => set('zipDownload', v)}
          disabled={disabled}
          label="ZIP download"
          description="Bundle all outputs into one file"
        />
      </div>
    </div>
  );
};

export default LabelSettings;
