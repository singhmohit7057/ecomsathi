// ============================================================
// EcomSathi — SKU & Label Tools Hub
// ============================================================
import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
  Tag,
  Layers,
  GitBranch,
  Settings2,
  QrCode,
  Layout,
  Printer,
  ArrowRight,
  Package,
} from 'lucide-react';
import { Card } from '../../components/common/Card';

// Lazy imports
import { SingleSKUGenerator } from './SingleSKUGenerator';
import { BulkSKUGenerator } from './BulkSKUGenerator';
import { VariantSKUGenerator } from './VariantSKUGenerator';
import { CustomSKUGenerator } from './CustomSKUGenerator';
import { BarcodeGenerator } from './BarcodeGenerator';
import { LabelGenerator } from './LabelGenerator';
import { LabelPrinter } from './LabelPrinter';

// ─── Tool Registry ─────────────────────────────────────────
const TOOLS = [
  {
    id: 'single',
    path: 'single',
    name: 'Single SKU Generator',
    description: 'Generate a single SKU from brand, category, variant fields with live preview and barcode.',
    icon: Tag,
    color: 'text-[#2563EB]',
    bg: 'bg-[#EFF6FF]',
    badge: null,
  },
  {
    id: 'bulk',
    path: 'bulk',
    name: 'Bulk SKU Generator',
    description: 'Generate 1–1000 SKUs at once from a form or CSV upload. Download as CSV or PDF labels.',
    icon: Layers,
    color: 'text-[#7C3AED]',
    bg: 'bg-[#F5F3FF]',
    badge: 'CSV',
  },
  {
    id: 'variant',
    path: 'variant',
    name: 'Variant SKU Generator',
    description: 'Generate all combinations of Color × Size × Material — matrix preview and bulk export.',
    icon: GitBranch,
    color: 'text-[#059669]',
    bg: 'bg-[#ECFDF5]',
    badge: null,
  },
  {
    id: 'custom',
    path: 'custom',
    name: 'Custom Template Builder',
    description: 'Drag-and-drop token blocks to build your own SKU template. Save presets to localStorage.',
    icon: Settings2,
    color: 'text-[#D97706]',
    bg: 'bg-[#FFFBEB]',
    badge: 'Templates',
  },
  {
    id: 'barcode',
    path: 'barcode',
    name: 'Barcode Generator',
    description: 'Generate EAN-13, Code 128, UPC-A, Code 39 barcodes. Download as SVG, PNG, or PDF.',
    icon: QrCode,
    color: 'text-[#DC2626]',
    bg: 'bg-[#FFF1F2]',
    badge: null,
  },
  {
    id: 'label',
    path: 'label',
    name: 'Label Designer',
    description: 'Canvas-based label editor with drag-and-drop elements. Generate single or bulk labels.',
    icon: Layout,
    color: 'text-[#0891B2]',
    bg: 'bg-[#ECFEFF]',
    badge: 'Canvas',
  },
  {
    id: 'printer',
    path: 'printer',
    name: 'Label Printer',
    description: 'Arrange labels in 1-up, 2-up, 4-up, or thermal layouts. Print or download PDF.',
    icon: Printer,
    color: 'text-[#374151]',
    bg: 'bg-[#F1F5F9]',
    badge: null,
  },
] as const;

// ─── Hub Component ─────────────────────────────────────────
const SKUToolsHub: React.FC = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-[12px] bg-[#EFF6FF] border border-[#BFDBFE] mb-4">
          <Package className="w-7 h-7 text-[#2563EB]" />
        </div>
        <h1 className="text-3xl font-bold text-[#0F172A] mb-2">SKU & Label Tools</h1>
        <p className="text-[#64748B] text-base max-w-xl mx-auto">
          Free tools to generate SKUs, barcodes, and product labels. No login required.
          Supports EAN-13, Code 128, QR, UPC-A. Export to CSV, PNG, or PDF.
        </p>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: '7 Tools', sub: 'All Free' },
          { label: 'EAN-13', sub: 'Barcode' },
          { label: 'Code 128', sub: 'Barcode' },
          { label: 'Variants', sub: 'Combos' },
          { label: 'CSV/PDF', sub: 'Export' },
          { label: 'No Login', sub: 'Required' },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-3 bg-white border border-[#E2E8F0] rounded-[8px]">
            <p className="text-sm font-bold text-[#0F172A]">{stat.label}</p>
            <p className="text-xs text-[#94A3B8]">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Tool Cards */}
      <div>
        <h2 className="text-lg font-bold text-[#0F172A] mb-4">Choose a Tool</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.id} to={tool.path} className="group block">
                <Card variant="shadowed" padding="md" className="h-full transition-all duration-200 group-hover:shadow-[#1E293B_3px_3px_0px_0px] group-hover:border-[#93C5FD]">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-[8px] ${tool.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${tool.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[#0F172A] leading-tight">{tool.name}</h3>
                        {tool.badge && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-[#F1F5F9] text-[#64748B] rounded font-medium">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-[#64748B] leading-relaxed mb-4">{tool.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#2563EB] group-hover:underline flex items-center gap-1">
                      Open Tool
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-xs text-[#94A3B8] pb-4">
        All tools run entirely in your browser. No data is sent to any server.
      </div>
    </div>
  );
};

// ─── Breadcrumb ────────────────────────────────────────────
const SKUBreadcrumb: React.FC = () => {
  const location = useLocation();
  const pathParts = location.pathname.split('/').filter(Boolean);
  const isRoot = pathParts[pathParts.length - 1] === 'sku-tools' || location.pathname.endsWith('/sku-tools');
  const toolName = TOOLS.find((t) => pathParts.includes(t.path))?.name;

  if (isRoot || !toolName) return null;

  return (
    <nav className="flex items-center gap-2 text-xs text-[#64748B] mb-6">
      <Link to="/sku-tools" className="hover:text-[#2563EB] font-medium">SKU Tools</Link>
      <span>/</span>
      <span className="text-[#0F172A] font-medium">{toolName}</span>
    </nav>
  );
};

// ─── Root Module with Routing ──────────────────────────────
const SKUToolsModule: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 sm:px-6 py-6">
      <SKUBreadcrumb />
      <Routes>
        <Route index element={<SKUToolsHub />} />
        <Route path="single"  element={<SingleSKUGenerator />} />
        <Route path="bulk"    element={<BulkSKUGenerator />} />
        <Route path="variant" element={<VariantSKUGenerator />} />
        <Route path="custom"  element={<CustomSKUGenerator />} />
        <Route path="barcode" element={<BarcodeGenerator />} />
        <Route path="label"   element={<LabelGenerator />} />
        <Route path="printer" element={<LabelPrinter />} />
      </Routes>
    </div>
  );
};

export default SKUToolsModule;
