export type OutputFormat = 'thermal' | 'a4';

// outputFileType is always 'pdf' — kept in engine for compat but not shown in UI
export type OutputFileType = 'pdf' | 'png';

export interface LabelCropSettings {
  outputFormat: OutputFormat;
}

export interface CropSize {
  widthMm:  number;
  heightMm: number;
}

export interface CropPreview {
  labelUrl:     string;
  invoiceUrl?:  string;
  labelSize?:   CropSize;
  invoiceSize?: CropSize;
}

export interface ProcessedLabel {
  filename:     string;
  labelBlob:    Blob;
  invoiceBlob?: Blob;
}

export interface BatchMergeResult {
  labelsPdf:    Blob;
  invoicesPdf?: Blob;
  preview:      CropPreview;
  fileCount:    number;
  labelCount:   number;
}

export type ProcessPhase = 'idle' | 'previewing' | 'processing' | 'done' | 'error';

export interface MarketplaceInfo {
  slug:           string;
  name:           string;
  displayName:    string;
  emoji:          string;
  tagline:        string;
  description:    string;
  seoTitle:       string;
  seoDescription: string;
  seoKeywords:    string;
  h1:             string;
  features:       string[];
  hasInvoice:     boolean;
  faqs:           Array<{ q: string; a: string }>;
  color:          string;
  bgColor:        string;
}
