// ============================================================
// EcomSathi — Custom SKU Generator (Template Builder)
// ============================================================
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import {
  Plus,
  Trash2,
  Save,
  FolderOpen,
  GripVertical,
  Settings2,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Card } from '../../components/common/Card';

// ─── Types ────────────────────────────────────────────────
type TokenType = 'brand' | 'category' | 'color' | 'size' | 'sequence' | 'year' | 'custom';
type Separator = '-' | '_' | '/' | '.' | '';

interface Token {
  id: string;
  type: TokenType;
  label: string;
  value: string;        // static value or placeholder
  digits?: number;      // for sequence / year
}

interface SeqSettings {
  start: number;
  padding: number;
  increment: number;
}

interface SavedTemplate {
  id: string;
  name: string;
  tokens: Token[];
  separator: Separator;
  seqSettings: SeqSettings;
  savedAt: string;
}

const LS_KEY = 'ecomsathi_sku_templates';

const TOKEN_PALETTE: { type: TokenType; label: string; color: string }[] = [
  { type: 'brand',    label: 'Brand',    color: 'bg-[#DBEAFE] text-[#1E40AF] border-[#BFDBFE]' },
  { type: 'category', label: 'Category', color: 'bg-[#D1FAE5] text-[#065F46] border-[#A7F3D0]' },
  { type: 'color',    label: 'Color',    color: 'bg-[#FCE7F3] text-[#9D174D] border-[#FBCFE8]' },
  { type: 'size',     label: 'Size',     color: 'bg-[#FEF3C7] text-[#92400E] border-[#FDE68A]' },
  { type: 'sequence', label: 'Sequence', color: 'bg-[#E0E7FF] text-[#3730A3] border-[#C7D2FE]' },
  { type: 'year',     label: 'Year',     color: 'bg-[#FFF7ED] text-[#C2410C] border-[#FED7AA]' },
  { type: 'custom',   label: 'Custom',   color: 'bg-[#F1F5F9] text-[#334155] border-[#E2E8F0]' },
];

const tokenColor = (type: TokenType) =>
  TOKEN_PALETTE.find((t) => t.type === type)?.color ?? 'bg-[#F1F5F9] text-[#334155] border-[#E2E8F0]';

let _id = 0;
const uid = () => `tok_${++_id}`;

const defaultToken = (type: TokenType): Token => ({
  id: uid(),
  type,
  label: TOKEN_PALETTE.find((t) => t.type === type)?.label ?? type,
  value: type === 'custom' ? 'TEXT' : '',
  digits: type === 'sequence' ? 4 : type === 'year' ? 4 : undefined,
});

// ─── Component ────────────────────────────────────────────
export const CustomSKUGenerator: React.FC = () => {
  const [tokens, setTokens] = useState<Token[]>([
    defaultToken('brand'),
    defaultToken('category'),
    defaultToken('sequence'),
  ]);
  const [separator, setSeparator] = useState<Separator>('-');
  const [seqSettings, setSeqSettings] = useState<SeqSettings>({ start: 1, padding: 4, increment: 1 });
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [count, setCount] = useState(1);
  const [generated, setGenerated] = useState<string[]>([]);
  const [savedTemplates, setSavedTemplates] = useState<SavedTemplate[]>([]);
  const [templateName, setTemplateName] = useState('');
  const [showSaved, setShowSaved] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // Load saved templates
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setSavedTemplates(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  // ── Token Building ─────────────────────────────────────
  const buildSKU = useCallback(
    (seq: number, vals: Record<string, string>): string => {
      const year = new Date().getFullYear();
      const parts: string[] = [];

      tokens.forEach((tok) => {
        let part = '';
        switch (tok.type) {
          case 'brand':
          case 'category':
          case 'color':
          case 'size':
            part = ((vals[tok.id] || tok.value || tok.type).toUpperCase().replace(/\s+/g, ''));
            break;
          case 'custom':
            part = (tok.value || 'TXT').toUpperCase().replace(/\s+/g, '');
            break;
          case 'sequence':
            part = String(seq).padStart(tok.digits ?? seqSettings.padding, '0');
            break;
          case 'year':
            part = tok.digits === 2 ? String(year).slice(-2) : String(year);
            break;
        }
        if (part) parts.push(part);
      });

      return parts.join(separator);
    },
    [tokens, separator, seqSettings.padding],
  );

  // ── Sample Previews ────────────────────────────────────
  const previews = useMemo(() => {
    return [1, 2, 3].map((i) => buildSKU(seqSettings.start + (i - 1) * seqSettings.increment, formValues));
  }, [buildSKU, seqSettings, formValues]);

  // ── Drag & Drop ────────────────────────────────────────
  const handleDragStart = (id: string) => setDraggingId(id);
  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    setDragOverId(id);
  };
  const handleDrop = (targetId: string) => {
    if (!draggingId || draggingId === targetId) return;
    setTokens((prev) => {
      const arr = [...prev];
      const fromIdx = arr.findIndex((t) => t.id === draggingId);
      const toIdx = arr.findIndex((t) => t.id === targetId);
      const [item] = arr.splice(fromIdx, 1);
      arr.splice(toIdx, 0, item);
      return arr;
    });
    setDraggingId(null);
    setDragOverId(null);
  };

  // ── Generate ───────────────────────────────────────────
  const handleGenerate = () => {
    const result: string[] = [];
    for (let i = 0; i < count; i++) {
      const seq = seqSettings.start + i * seqSettings.increment;
      result.push(buildSKU(seq, formValues));
    }
    setGenerated(result);
    toast.success(`Generated ${result.length} SKU${result.length > 1 ? 's' : ''}`);
  };

  // ── Save Template ──────────────────────────────────────
  const handleSave = () => {
    if (!templateName.trim()) { toast.error('Enter a template name'); return; }
    const tmpl: SavedTemplate = {
      id: uid(),
      name: templateName.trim(),
      tokens,
      separator,
      seqSettings,
      savedAt: new Date().toISOString(),
    };
    const updated = [...savedTemplates, tmpl];
    setSavedTemplates(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    setTemplateName('');
    toast.success(`Template "${tmpl.name}" saved`);
  };

  // ── Load Template ──────────────────────────────────────
  const handleLoad = (tmpl: SavedTemplate) => {
    setTokens(tmpl.tokens);
    setSeparator(tmpl.separator);
    setSeqSettings(tmpl.seqSettings);
    setShowSaved(false);
    toast.success(`Loaded "${tmpl.name}"`);
  };

  const handleDeleteTemplate = (id: string) => {
    const updated = savedTemplates.filter((t) => t.id !== id);
    setSavedTemplates(updated);
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A] flex items-center gap-2">
          <Settings2 className="w-6 h-6 text-[#2563EB]" />
          Custom SKU Template Builder
        </h1>
        <p className="text-[#64748B] mt-1 text-sm">
          Drag token blocks to build your SKU template visually.
        </p>
      </div>

      {/* Token Palette */}
      <Card variant="shadowed" padding="md">
        <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Add Token Blocks</h2>
        <div className="flex flex-wrap gap-2">
          {TOKEN_PALETTE.map((tp) => (
            <button
              key={tp.type}
              onClick={() => setTokens((prev) => [...prev, defaultToken(tp.type)])}
              className={`px-3 py-1.5 rounded-[6px] border text-xs font-semibold transition-transform hover:scale-105 ${tp.color}`}
            >
              + {tp.label}
            </button>
          ))}
        </div>
      </Card>

      {/* Template Builder (DnD) */}
      <Card variant="shadowed" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-[#0F172A]">Template</h2>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-[#64748B] text-xs">Separator:</span>
            <div className="relative">
              <select
                value={separator}
                onChange={(e) => setSeparator(e.target.value as Separator)}
                className="border border-[#E2E8F0] rounded-[6px] px-2 py-1 text-xs bg-white appearance-none pr-6 focus:outline-none focus:border-[#2563EB]"
              >
                <option value="-">Hyphen (-)</option>
                <option value="_">Underscore (_)</option>
                <option value="/">Slash (/)</option>
                <option value=".">Dot (.)</option>
                <option value="">None</option>
              </select>
              <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-[#64748B] pointer-events-none" />
            </div>
          </div>
        </div>

        {tokens.length === 0 && (
          <div className="text-center py-8 text-[#94A3B8] text-sm">
            Add token blocks above to start building your template.
          </div>
        )}

        <div className="flex flex-wrap gap-2 min-h-[60px] p-2 bg-[#F8FAFC] rounded-[6px] border border-dashed border-[#E2E8F0]">
          {tokens.map((tok, i) => (
            <React.Fragment key={tok.id}>
              <div
                draggable
                onDragStart={() => handleDragStart(tok.id)}
                onDragOver={(e) => handleDragOver(e, tok.id)}
                onDrop={() => handleDrop(tok.id)}
                onDragEnd={() => { setDraggingId(null); setDragOverId(null); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border text-xs font-semibold cursor-grab active:cursor-grabbing transition-all ${tokenColor(tok.type)} ${dragOverId === tok.id ? 'scale-105 shadow-md' : ''}`}
              >
                <GripVertical className="w-3 h-3 opacity-50" />
                <span>{tok.label}</span>
                {(tok.type === 'sequence') && (
                  <span className="text-[10px] opacity-70">({tok.digits ?? seqSettings.padding}d)</span>
                )}
                {tok.type === 'custom' && (
                  <input
                    type="text"
                    value={tok.value}
                    onChange={(e) => setTokens((prev) => prev.map((t) => t.id === tok.id ? { ...t, value: e.target.value } : t))}
                    className="w-16 bg-transparent border-b border-current text-xs font-mono focus:outline-none"
                    placeholder="TEXT"
                  />
                )}
                <button
                  onClick={() => setTokens((prev) => prev.filter((t) => t.id !== tok.id))}
                  className="opacity-50 hover:opacity-100 ml-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              {i < tokens.length - 1 && (
                <span className="self-center text-[#94A3B8] text-xs font-mono">
                  {separator || '|'}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Token Value Inputs */}
        {tokens.filter((t) => !['sequence', 'year', 'custom'].includes(t.type)).length > 0 && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {tokens
              .filter((t) => !['sequence', 'year', 'custom'].includes(t.type))
              .map((tok) => (
                <Input
                  key={tok.id}
                  label={tok.label}
                  placeholder={tok.type.toUpperCase()}
                  value={formValues[tok.id] || ''}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, [tok.id]: e.target.value }))}
                  size="sm"
                />
              ))}
          </div>
        )}
      </Card>

      {/* Sequence Settings */}
      <Card variant="shadowed" padding="md">
        <h2 className="text-sm font-semibold text-[#0F172A] mb-4">Sequence Settings</h2>
        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Start Number"
            type="number"
            min="1"
            value={String(seqSettings.start)}
            onChange={(e) => setSeqSettings((prev) => ({ ...prev, start: Number(e.target.value) }))}
          />
          <div>
            <label className="block text-xs font-medium text-[#374151] mb-1">Padding Length</label>
            <div className="relative">
              <select
                value={seqSettings.padding}
                onChange={(e) => setSeqSettings((prev) => ({ ...prev, padding: Number(e.target.value) }))}
                className="w-full border border-[#E2E8F0] rounded-[6px] px-3 py-2.5 text-sm appearance-none bg-white focus:outline-none focus:border-[#2563EB]"
              >
                <option value={3}>3 digits (001)</option>
                <option value={4}>4 digits (0001)</option>
                <option value={5}>5 digits (00001)</option>
                <option value={6}>6 digits (000001)</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
            </div>
          </div>
          <Input
            label="Increment"
            type="number"
            min="1"
            value={String(seqSettings.increment)}
            onChange={(e) => setSeqSettings((prev) => ({ ...prev, increment: Number(e.target.value) }))}
          />
        </div>
      </Card>

      {/* Live Preview (3 samples) */}
      <Card variant="highlight" padding="md">
        <p className="text-xs font-semibold text-[#92400E] mb-3">Preview (3 samples)</p>
        <div className="space-y-1.5">
          {previews.map((sku, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-[#92400E] w-4">{i + 1}.</span>
              <span className="font-mono text-[#0F172A] font-bold text-sm tracking-widest">{sku || '—'}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Generate + Save */}
      <Card variant="shadowed" padding="md">
        <div className="flex flex-wrap gap-3 items-end">
          <Input
            label="Generate Count"
            type="number"
            min="1"
            max="1000"
            value={String(count)}
            onChange={(e) => setCount(Number(e.target.value))}
            size="sm"
          />
          <Button onClick={handleGenerate}>
            Generate {count > 1 ? `${count} SKUs` : 'SKU'}
          </Button>
        </div>
      </Card>

      {/* Save / Load Templates */}
      <Card variant="shadowed" padding="md">
        <h2 className="text-sm font-semibold text-[#0F172A] mb-3">Save / Load Template</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Template name…"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            size="sm"
          />
          <Button variant="ghost" size="sm" onClick={handleSave} leftIcon={<Save className="w-3.5 h-3.5" />}>
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSaved((v) => !v)}
            leftIcon={<FolderOpen className="w-3.5 h-3.5" />}
          >
            Saved ({savedTemplates.length})
          </Button>
        </div>

        {showSaved && savedTemplates.length > 0 && (
          <div className="mt-3 space-y-2">
            {savedTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="flex items-center justify-between p-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px]"
              >
                <div>
                  <p className="text-xs font-semibold text-[#0F172A]">{tmpl.name}</p>
                  <p className="text-[10px] text-[#94A3B8]">
                    {new Date(tmpl.savedAt).toLocaleDateString()} • {tmpl.tokens.map((t) => t.label).join(` ${tmpl.separator} `)}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" onClick={() => handleLoad(tmpl)}>Load</Button>
                  <button
                    onClick={() => handleDeleteTemplate(tmpl.id)}
                    className="p-1 text-[#94A3B8] hover:text-red-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showSaved && savedTemplates.length === 0 && (
          <p className="mt-2 text-xs text-[#94A3B8]">No saved templates yet.</p>
        )}
      </Card>

      {/* Generated Output */}
      {generated.length > 0 && (
        <Card variant="foam" padding="md">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-semibold text-[#065F46]">{generated.length} SKU{generated.length > 1 ? 's' : ''} Generated</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const blob = new Blob([generated.join('\n')], { type: 'text/plain' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'custom-skus.txt';
                a.click();
              }}
            >
              Download .txt
            </Button>
          </div>
          <div className="font-mono text-sm text-[#0F172A] space-y-1 max-h-48 overflow-y-auto">
            {generated.map((sku, i) => (
              <div key={i} className="flex items-center gap-2 group">
                <span className="text-[#94A3B8] text-xs w-5">{i + 1}.</span>
                <span className="font-bold tracking-widest">{sku}</span>
                <button
                  onClick={() => { navigator.clipboard.writeText(sku); toast.success('Copied!'); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-[#94A3B8] hover:text-[#2563EB]"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default CustomSKUGenerator;
