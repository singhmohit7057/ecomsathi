import React from 'react';
import type { LabelCropSettings } from '../types';

interface LabelSettingsProps {
  settings: LabelCropSettings;
  onChange: (s: LabelCropSettings) => void;
  hasInvoice: boolean;
  disabled?: boolean;
}

function Toggle({
  id,
  checked,
  onChange,
  disabled,
  label,
  description,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label: string;
  description?: string;
}) {
  return (
    <label
      htmlFor={id}
      className={[
        'flex items-start gap-3 cursor-pointer select-none group',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ].join(' ')}
    >
      <div className="relative mt-0.5 shrink-0">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className="sr-only"
        />
        <div
          className={[
            'h-5 w-9 rounded-full transition-colors',
            checked ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]',
          ].join(' ')}
        />
        <div
          className={[
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform',
            checked ? 'translate-x-4' : 'translate-x-0.5',
          ].join(' ')}
        />
      </div>
      <div>
        <span className="text-sm font-medium text-[#0F172A]">{label}</span>
        {description && <p className="text-xs text-[#64748B] mt-0.5">{description}</p>}
      </div>
    </label>
  );
}

function SegmentControl<T extends string>({
  label,
  value,
  options,
  onChange,
  disabled,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string; description?: string }>;
  onChange: (v: T) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-[#0F172A]">{label}</span>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(opt.value)}
            className={[
              'px-4 py-2 rounded-[4px] text-sm font-medium border transition-colors',
              value === opt.value
                ? 'bg-[#2563EB] text-white border-[#2563EB]'
                : 'bg-white text-[#475569] border-[#CBD5E1] hover:border-[#2563EB] hover:text-[#2563EB]',
              disabled ? 'opacity-50 cursor-not-allowed' : '',
            ].join(' ')}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export const LabelSettings: React.FC<LabelSettingsProps> = ({
  settings,
  onChange,
  hasInvoice,
  disabled = false,
}) => {
  function set<K extends keyof LabelCropSettings>(key: K, value: LabelCropSettings[K]) {
    onChange({ ...settings, [key]: value });
  }

  return (
    <div className="rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm flex flex-col gap-6">
      <h2 className="text-base font-semibold text-[#0F172A]">Output Options</h2>

      <div className="flex flex-wrap gap-x-8 gap-y-5">
        <SegmentControl
          label="Output Format"
          value={settings.outputFormat}
          onChange={(v) => set('outputFormat', v)}
          disabled={disabled}
          options={[
            { value: 'thermal', label: 'Thermal (4×6)' },
            { value: 'a4',      label: 'A4 (4/page)' },
          ]}
        />

        <SegmentControl
          label="File Type"
          value={settings.outputFileType}
          onChange={(v) => set('outputFileType', v)}
          disabled={disabled}
          options={[
            { value: 'pdf', label: 'PDF' },
            { value: 'png', label: 'PNG' },
          ]}
        />

        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-[#0F172A]">Options</span>
          <Toggle
            id="include-invoice"
            checked={settings.includeInvoice && hasInvoice}
            onChange={(v) => set('includeInvoice', v)}
            disabled={disabled || !hasInvoice}
            label="Extract invoices too"
            description={!hasInvoice ? 'Not available for this marketplace' : undefined}
          />
          <Toggle
            id="zip-download"
            checked={settings.zipDownload}
            onChange={(v) => set('zipDownload', v)}
            disabled={disabled}
            label="Download as ZIP"
            description="Bundle all outputs into one ZIP file"
          />
        </div>
      </div>

      <p className="text-xs text-[#94A3B8]">
        {settings.outputFormat === 'thermal'
          ? 'Thermal — 100 × 150 mm, one label per page, for direct thermal printers'
          : 'A4 — 4 labels in a 2×2 grid per page, for desktop inkjet/laser printers'}
      </p>
    </div>
  );
};

export default LabelSettings;
