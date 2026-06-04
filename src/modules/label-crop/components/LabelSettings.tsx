import React from 'react';
import type { LabelCropSettings } from '../types';

interface LabelSettingsProps {
  settings:  LabelCropSettings;
  onChange:  (s: LabelCropSettings) => void;
  disabled?: boolean;
}

export const LabelSettings: React.FC<LabelSettingsProps> = ({
  settings, onChange, disabled = false,
}) => (
  <div className="flex rounded-[8px] border border-[#E2E8F0] overflow-hidden w-full">
    {([
      { value: 'thermal', label: 'Thermal 4×6', sub: '100×150 mm · 1/page' },
      { value: 'a4',      label: 'A4 Sheet',    sub: '4 labels/page'       },
    ] as const).map((opt, i) => (
      <button
        key={opt.value}
        type="button"
        disabled={disabled}
        onClick={() => onChange({ ...settings, outputFormat: opt.value })}
        className={[
          'flex-1 flex flex-col items-center gap-0.5 px-3 py-2.5 text-center transition-colors',
          i === 0 ? '' : 'border-l border-[#E2E8F0]',
          settings.outputFormat === opt.value
            ? 'bg-[#2563EB] text-white'
            : 'bg-white text-[#475569] hover:bg-[#F8FAFC]',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        ].join(' ')}
      >
        <span className="text-sm font-bold leading-tight">{opt.label}</span>
        <span className={[
          'text-[10px] leading-tight',
          settings.outputFormat === opt.value ? 'text-blue-100' : 'text-[#94A3B8]',
        ].join(' ')}>{opt.sub}</span>
      </button>
    ))}
  </div>
);

export default LabelSettings;
