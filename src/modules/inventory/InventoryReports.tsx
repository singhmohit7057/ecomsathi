// ============================================================
// EcomSathi — Inventory Reports
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import { Download, FileText, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/common/Button';
import { useAuth } from '@/hooks/useAuth';
import { getInventory, getStockMovements, getWarehouses } from '@/services/inventoryService';
import type { InventoryItem, StockMovement, Warehouse } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

type ReportTab = 'valuation' | 'movement_summary' | 'reorder' | 'warehouse_summary';

interface ValuationRow {
  productName: string;
  sku: string;
  warehouse: string;
  quantity: number;
  unitCost: number;
  totalValue: number;
}

interface MovementSummaryRow {
  sku: string;
  purchase: number;
  sale: number;
  return: number;
  adjustment: number;
  damage: number;
  transfer_in: number;
  transfer_out: number;
  netChange: number;
}

interface WarehouseSummaryRow {
  warehouse: string;
  skuCount: number;
  totalQty: number;
  totalValue: number;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function csvDownload(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

function tableToCsv(headers: string[], rows: (string | number)[][]): string {
  return [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
}

// ─── Component ────────────────────────────────────────────────────────────────

export const InventoryReports: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ReportTab>('valuation');

  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(false);

  // Date range for movement reports
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1);
    return d.toISOString().slice(0, 10);
  });
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10));

  // ── fetch ─────────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!user?.org_id) return;
    setLoading(true);
    try {
      const [inv, mov, whs] = await Promise.all([
        getInventory(user.org_id),
        getStockMovements(user.org_id, {
          dateFrom, dateTo: `${dateTo}T23:59:59Z`, pageSize: 1000
        }),
        getWarehouses(user.org_id),
      ]);
      setInventoryItems(inv as unknown as InventoryItem[]);
      setMovements(mov.data as unknown as StockMovement[]);
      setWarehouses(whs as unknown as Warehouse[]);
    } catch {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  }, [user?.org_id, dateFrom, dateTo]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  // ── Valuation Report ──────────────────────────────────────────────────────
  const valuationRows: ValuationRow[] = inventoryItems.map(item => {
    const cost = (item.variant as unknown as { cost_price?: number })?.cost_price ?? 0;
    return {
      productName: item.product?.name ?? '—',
      sku: item.variant?.sku ?? '—',
      warehouse: item.warehouse?.name ?? '—',
      quantity: item.quantity,
      unitCost: cost,
      totalValue: item.quantity * cost,
    };
  });
  const totalValuation = valuationRows.reduce((s, r) => s + r.totalValue, 0);

  // ── Movement Summary ──────────────────────────────────────────────────────
  const movSummaryMap: Record<string, MovementSummaryRow> = {};
  for (const m of movements) {
    const mov = m as unknown as {
      variant?: { sku?: string } | null;
      movement_type: string;
      quantity: number;
    };
    const sku = mov.variant?.sku ?? m.variant_id;
    if (!movSummaryMap[sku]) {
      movSummaryMap[sku] = {
        sku,
        purchase: 0, sale: 0, return: 0, adjustment: 0,
        damage: 0, transfer_in: 0, transfer_out: 0, netChange: 0,
      };
    }
    const row = movSummaryMap[sku];
    const type = mov.movement_type as keyof Omit<MovementSummaryRow, 'sku' | 'netChange'>;
    if (type in row && type !== 'sku' && type !== 'netChange') {
      (row[type] as number) += mov.quantity;
    }
    row.netChange += mov.quantity;
  }
  const movSummaryRows = Object.values(movSummaryMap);

  // ── Reorder Report ────────────────────────────────────────────────────────
  const reorderRows = inventoryItems
    .filter(i => i.quantity <= i.low_stock_threshold)
    .sort((a, b) => {
      const pctA = a.low_stock_threshold > 0 ? a.quantity / a.low_stock_threshold : 0;
      const pctB = b.low_stock_threshold > 0 ? b.quantity / b.low_stock_threshold : 0;
      return pctA - pctB;
    });

  // ── Warehouse Summary ─────────────────────────────────────────────────────
  const whSummaryMap: Record<string, WarehouseSummaryRow> = {};
  for (const item of inventoryItems) {
    const whName = item.warehouse?.name ?? item.warehouse_id;
    if (!whSummaryMap[whName]) {
      whSummaryMap[whName] = { warehouse: whName, skuCount: 0, totalQty: 0, totalValue: 0 };
    }
    const cost = (item.variant as unknown as { cost_price?: number })?.cost_price ?? 0;
    whSummaryMap[whName].skuCount += 1;
    whSummaryMap[whName].totalQty += item.quantity;
    whSummaryMap[whName].totalValue += item.quantity * cost;
  }
  const whSummaryRows = Object.values(whSummaryMap);

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    switch (activeTab) {
      case 'valuation': {
        const csv = tableToCsv(
          ['Product', 'SKU', 'Warehouse', 'Quantity', 'Unit Cost', 'Total Value'],
          valuationRows.map(r => [r.productName, r.sku, r.warehouse, r.quantity, r.unitCost.toFixed(2), r.totalValue.toFixed(2)])
        );
        csvDownload(csv, `stock-valuation-${dateTo}.csv`);
        break;
      }
      case 'movement_summary': {
        const csv = tableToCsv(
          ['SKU', 'Purchase', 'Sale', 'Return', 'Adjustment', 'Damage', 'Transfer In', 'Transfer Out', 'Net Change'],
          movSummaryRows.map(r => [r.sku, r.purchase, r.sale, r.return, r.adjustment, r.damage, r.transfer_in, r.transfer_out, r.netChange])
        );
        csvDownload(csv, `movement-summary-${dateFrom}-to-${dateTo}.csv`);
        break;
      }
      case 'reorder': {
        const csv = tableToCsv(
          ['Product', 'SKU', 'Warehouse', 'Current Stock', 'Threshold'],
          reorderRows.map(i => [i.product?.name ?? '', i.variant?.sku ?? '', i.warehouse?.name ?? '', i.quantity, i.low_stock_threshold])
        );
        csvDownload(csv, `reorder-report-${new Date().toISOString().slice(0, 10)}.csv`);
        break;
      }
      case 'warehouse_summary': {
        const csv = tableToCsv(
          ['Warehouse', 'SKU Count', 'Total Qty', 'Total Value (₹)'],
          whSummaryRows.map(r => [r.warehouse, r.skuCount, r.totalQty, r.totalValue.toFixed(2)])
        );
        csvDownload(csv, `warehouse-summary-${new Date().toISOString().slice(0, 10)}.csv`);
        break;
      }
    }
    toast.success('CSV exported');
  };

  const handleExportPDF = async () => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ orientation: 'landscape' });
      doc.setFontSize(16);
      doc.text('EcomSathi — Inventory Report', 14, 15);
      doc.setFontSize(10);
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 14, 22);

      let y = 32;
      if (activeTab === 'valuation') {
        doc.setFontSize(12);
        doc.text('Stock Valuation', 14, y);
        y += 7;
        doc.setFontSize(9);
        valuationRows.slice(0, 50).forEach(r => {
          doc.text(`${r.sku} | ${r.warehouse} | Qty: ${r.quantity} | Cost: ₹${r.unitCost.toFixed(2)} | Total: ₹${r.totalValue.toFixed(2)}`, 14, y);
          y += 6;
          if (y > 185) { doc.addPage(); y = 15; }
        });
        doc.setFontSize(11);
        doc.text(`Total Value: ₹${totalValuation.toFixed(2)}`, 14, y + 4);
      } else {
        doc.text('See CSV export for full data.', 14, y);
      }

      doc.save(`inventory-report-${activeTab}-${new Date().toISOString().slice(0, 10)}.pdf`);
      toast.success('PDF exported');
    } catch {
      toast.error('PDF export failed — jspdf may not be installed');
    }
  };

  const TABS: { id: ReportTab; label: string }[] = [
    { id: 'valuation', label: 'Stock Valuation' },
    { id: 'movement_summary', label: 'Movement Summary' },
    { id: 'reorder', label: 'Reorder Report' },
    { id: 'warehouse_summary', label: 'Warehouse Summary' },
  ];

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#0F172A]">Inventory Reports</h1>
          <p className="text-sm text-[#64748B] mt-0.5">Analyse stock, movements, and valuations</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" size="sm" leftIcon={<RefreshCw size={14} />} onClick={() => void fetchData()}>
            Refresh
          </Button>
          <Button variant="ghost" size="sm" leftIcon={<Download size={14} />} onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="ghost" size="sm" leftIcon={<FileText size={14} />} onClick={() => void handleExportPDF()}>
            Export PDF
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#E2E8F0] flex gap-0 overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={[
              'px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
              activeTab === tab.id
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-[#64748B] hover:text-[#0F172A]',
            ].join(' ')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Date range (for movement reports) */}
      {(activeTab === 'movement_summary') && (
        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-sm text-[#64748B]">Date Range:</label>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="border border-[#94A3B8] rounded-[4px] px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          />
          <span className="text-[#94A3B8]">—</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="border border-[#94A3B8] rounded-[4px] px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20"
          />
          <Button variant="outline" size="sm" onClick={() => void fetchData()}>Apply</Button>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#2563EB] border-t-transparent" />
        </div>
      ) : (
        <>
          {/* Stock Valuation */}
          {activeTab === 'valuation' && (
            <div className="bg-white border border-[#E2E8F0] rounded-[8px] shadow-[#1E293B_2px_2px_0px_0px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                      <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Product</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">SKU</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Warehouse</th>
                      <th className="px-4 py-3 text-right font-semibold text-[#0F172A]">Qty</th>
                      <th className="px-4 py-3 text-right font-semibold text-[#0F172A]">Unit Cost</th>
                      <th className="px-4 py-3 text-right font-semibold text-[#0F172A]">Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {valuationRows.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-8 text-center text-[#94A3B8]">No data</td></tr>
                    ) : valuationRows.map((row, idx) => (
                      <tr key={idx} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                        <td className="px-4 py-3 text-[#0F172A]">{row.productName}</td>
                        <td className="px-4 py-3 font-mono text-xs text-[#475569]">{row.sku}</td>
                        <td className="px-4 py-3 text-[#64748B]">{row.warehouse}</td>
                        <td className="px-4 py-3 text-right">{row.quantity}</td>
                        <td className="px-4 py-3 text-right text-[#64748B]">₹{row.unitCost.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right font-medium text-[#0F172A]">₹{row.totalValue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#F8FAFC] border-t border-[#E2E8F0]">
                      <td colSpan={5} className="px-4 py-3 text-right font-bold text-[#0F172A]">Total Inventory Value:</td>
                      <td className="px-4 py-3 text-right font-bold text-[#2563EB] text-base">₹{totalValuation.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Movement Summary */}
          {activeTab === 'movement_summary' && (
            <div className="bg-white border border-[#E2E8F0] rounded-[8px] shadow-[#1E293B_2px_2px_0px_0px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                      <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">SKU</th>
                      <th className="px-4 py-3 text-right font-semibold text-[#16A34A]">Purchase</th>
                      <th className="px-4 py-3 text-right font-semibold text-[#DC2626]">Sale</th>
                      <th className="px-4 py-3 text-right font-semibold text-[#0284C7]">Return</th>
                      <th className="px-4 py-3 text-right font-semibold text-[#64748B]">Adjust</th>
                      <th className="px-4 py-3 text-right font-semibold text-[#64748B]">Damage</th>
                      <th className="px-4 py-3 text-right font-semibold text-[#64748B]">T.In</th>
                      <th className="px-4 py-3 text-right font-semibold text-[#64748B]">T.Out</th>
                      <th className="px-4 py-3 text-right font-semibold text-[#0F172A]">Net</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movSummaryRows.length === 0 ? (
                      <tr><td colSpan={9} className="px-4 py-8 text-center text-[#94A3B8]">No movements in this period</td></tr>
                    ) : movSummaryRows.map((row, idx) => (
                      <tr key={idx} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                        <td className="px-4 py-3 font-mono text-xs text-[#475569]">{row.sku}</td>
                        <td className="px-4 py-3 text-right text-[#16A34A]">{row.purchase || '—'}</td>
                        <td className="px-4 py-3 text-right text-[#DC2626]">{row.sale || '—'}</td>
                        <td className="px-4 py-3 text-right text-[#0284C7]">{row.return || '—'}</td>
                        <td className="px-4 py-3 text-right text-[#64748B]">{row.adjustment || '—'}</td>
                        <td className="px-4 py-3 text-right text-[#64748B]">{row.damage || '—'}</td>
                        <td className="px-4 py-3 text-right text-[#64748B]">{row.transfer_in || '—'}</td>
                        <td className="px-4 py-3 text-right text-[#64748B]">{row.transfer_out || '—'}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${row.netChange >= 0 ? 'text-[#16A34A]' : 'text-[#DC2626]'}`}>
                          {row.netChange >= 0 ? '+' : ''}{row.netChange}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Reorder Report */}
          {activeTab === 'reorder' && (
            <div className="bg-white border border-[#E2E8F0] rounded-[8px] shadow-[#1E293B_2px_2px_0px_0px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                      <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Product</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">SKU</th>
                      <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Warehouse</th>
                      <th className="px-4 py-3 text-right font-semibold text-[#DC2626]">Current</th>
                      <th className="px-4 py-3 text-right font-semibold text-[#0F172A]">Threshold</th>
                      <th className="px-4 py-3 text-right font-semibold text-[#0F172A]">Shortfall</th>
                      <th className="px-4 py-3 text-center font-semibold text-[#0F172A]">Urgency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reorderRows.length === 0 ? (
                      <tr><td colSpan={7} className="px-4 py-8 text-center text-[#94A3B8]">No items need reordering</td></tr>
                    ) : reorderRows.map((item, idx) => {
                      const pct = item.low_stock_threshold > 0
                        ? Math.round((item.quantity / item.low_stock_threshold) * 100) : 0;
                      return (
                        <tr key={idx} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                          <td className="px-4 py-3 font-medium text-[#0F172A]">{item.product?.name ?? '—'}</td>
                          <td className="px-4 py-3 font-mono text-xs text-[#475569]">{item.variant?.sku ?? '—'}</td>
                          <td className="px-4 py-3 text-[#64748B]">{item.warehouse?.name ?? '—'}</td>
                          <td className={`px-4 py-3 text-right font-bold ${item.quantity <= 0 ? 'text-[#DC2626]' : 'text-[#D97706]'}`}>
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 text-right text-[#64748B]">{item.low_stock_threshold}</td>
                          <td className="px-4 py-3 text-right text-[#DC2626] font-medium">
                            {Math.max(0, item.low_stock_threshold - item.quantity)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 bg-[#E2E8F0] rounded-full h-1.5">
                                <div
                                  className={`h-full rounded-full ${pct <= 0 ? 'bg-[#DC2626]' : pct <= 25 ? 'bg-[#F97316]' : 'bg-[#D97706]'}`}
                                  style={{ width: `${Math.min(100, pct)}%` }}
                                />
                              </div>
                              <span className="text-xs text-[#94A3B8]">{pct}%</span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Warehouse Summary */}
          {activeTab === 'warehouse_summary' && (
            <div className="bg-white border border-[#E2E8F0] rounded-[8px] shadow-[#1E293B_2px_2px_0px_0px] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                      <th className="px-4 py-3 text-left font-semibold text-[#0F172A]">Warehouse</th>
                      <th className="px-4 py-3 text-right font-semibold text-[#0F172A]">SKU Count</th>
                      <th className="px-4 py-3 text-right font-semibold text-[#0F172A]">Total Qty</th>
                      <th className="px-4 py-3 text-right font-semibold text-[#0F172A]">Total Value (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {whSummaryRows.length === 0 ? (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-[#94A3B8]">No warehouses</td></tr>
                    ) : whSummaryRows.map((row, idx) => (
                      <tr key={idx} className="border-b border-[#F1F5F9] hover:bg-[#F8FAFC]">
                        <td className="px-4 py-3 font-medium text-[#0F172A]">{row.warehouse}</td>
                        <td className="px-4 py-3 text-right text-[#64748B]">{row.skuCount}</td>
                        <td className="px-4 py-3 text-right text-[#64748B]">{row.totalQty}</td>
                        <td className="px-4 py-3 text-right font-medium text-[#0F172A]">₹{row.totalValue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default InventoryReports;
