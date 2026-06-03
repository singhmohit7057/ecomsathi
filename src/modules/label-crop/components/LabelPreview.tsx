import React from 'react';
import { Loader2 } from 'lucide-react';

interface LabelPreviewProps {
  previewUrl: string | null;
  isLoading: boolean;
}

export const LabelPreview: React.FC<LabelPreviewProps> = ({ previewUrl, isLoading }) => {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-xs text-[#64748B] py-2">
        <Loader2 size={14} className="animate-spin" />
        Generating preview…
      </div>
    );
  }

  if (!previewUrl) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs font-medium text-[#64748B]">Preview — first page</p>
      <div className="rounded-[6px] border border-[#E2E8F0] overflow-hidden bg-[#F8FAFC] inline-block max-w-full">
        <img
          src={previewUrl}
          alt="Label preview — first page"
          className="max-w-full max-h-72 object-contain"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default LabelPreview;
