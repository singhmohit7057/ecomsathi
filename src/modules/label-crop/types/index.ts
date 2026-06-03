export type OutputFormat = 'thermal' | 'a4';
export type OutputFileType = 'pdf' | 'png';

export interface LabelCropSettings {
  outputFormat: OutputFormat;
  outputFileType: OutputFileType;
  includeInvoice: boolean;
  zipDownload: boolean;
}

export interface ProcessedLabel {
  filename: string;
  labelBlob: Blob;
  invoiceBlob?: Blob;
}

export type ProcessPhase = 'idle' | 'previewing' | 'processing' | 'done' | 'error';

export interface MarketplaceInfo {
  slug: string;
  name: string;
  displayName: string;
  emoji: string;
  tagline: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  h1: string;
  features: string[];
  hasInvoice: boolean;
  faqs: Array<{ q: string; a: string }>;
  color: string;
  bgColor: string;
}
