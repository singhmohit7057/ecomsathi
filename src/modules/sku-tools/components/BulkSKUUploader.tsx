// ============================================================
// Bulk SKU Uploader — CSV/XLSX file input with drag-and-drop
// ============================================================

import React, { useRef, useState } from 'react'
import { Upload, FileSpreadsheet, X, AlertCircle, Download } from 'lucide-react'
import { parseCSVText, generateSampleCSV, downloadCSV } from '../services/csvProcessor'
import type { BulkSKURow } from '../types'

interface BulkSKUUploaderProps {
  onParsed: (rows: BulkSKURow[], errors: string[]) => void
}

const BulkSKUUploader: React.FC<BulkSKUUploaderProps> = ({ onParsed }) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const [parseErrors, setParseErrors] = useState<string[]>([])

  const processFile = async (file: File) => {
    setFileName(file.name)
    setParseErrors([])

    const ext = file.name.split('.').pop()?.toLowerCase()

    if (ext === 'csv') {
      const text = await file.text()
      const result = parseCSVText(text)
      setParseErrors(result.errors)
      onParsed(result.rows, result.errors)
    } else if (ext === 'xlsx' || ext === 'xls') {
      try {
        const { read, utils } = await import('xlsx')
        const buffer = await file.arrayBuffer()
        const wb = read(buffer)
        const ws = wb.Sheets[wb.SheetNames[0]]
        const data = utils.sheet_to_csv(ws)
        const result = parseCSVText(data)
        setParseErrors(result.errors)
        onParsed(result.rows, result.errors)
      } catch {
        const err = 'Failed to parse Excel file. Try saving as CSV.'
        setParseErrors([err])
        onParsed([], [err])
      }
    } else {
      const err = 'Unsupported file type. Please upload CSV or XLSX.'
      setParseErrors([err])
      onParsed([], [err])
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleDownloadSample = () => {
    downloadCSV(generateSampleCSV(), 'sample-bulk-sku.csv')
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`border-2 border-dashed rounded-[8px] p-8 flex flex-col items-center gap-3 cursor-pointer transition-colors ${
          dragOver ? 'border-[#2563EB] bg-[#EFF6FF]' : 'border-[#CBD5E1] hover:border-[#93C5FD] hover:bg-[#F8FAFC]'
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={handleFileChange}
        />
        <FileSpreadsheet size={32} className="text-[#2563EB]" />
        <div className="text-center">
          <p className="text-sm font-medium text-[#0F172A]">
            {fileName ? fileName : 'Drop CSV or Excel file here'}
          </p>
          <p className="text-xs text-[#64748B] mt-1">
            or click to browse — CSV, XLS, XLSX
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Upload size={14} className="text-[#2563EB]" />
          <span className="text-xs font-medium text-[#2563EB]">Upload File</span>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-[#64748B]">
          Columns: productName, brand, color, size, category
        </p>
        <button
          type="button"
          onClick={handleDownloadSample}
          className="flex items-center gap-1.5 text-xs text-[#2563EB] hover:underline"
        >
          <Download size={12} />
          Download Sample CSV
        </button>
      </div>

      {parseErrors.length > 0 && (
        <div className="rounded-[6px] border border-[#FECACA] bg-[#FFF1F2] p-3">
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle size={14} className="text-[#DC2626]" />
            <span className="text-xs font-semibold text-[#DC2626]">
              {parseErrors.length} warning(s)
            </span>
          </div>
          <ul className="text-xs text-[#7F1D1D] space-y-0.5">
            {parseErrors.slice(0, 5).map((e, i) => (
              <li key={i}>{e}</li>
            ))}
            {parseErrors.length > 5 && (
              <li className="text-[#94A3B8]">...and {parseErrors.length - 5} more</li>
            )}
          </ul>
        </div>
      )}

      {fileName && (
        <button
          type="button"
          onClick={() => { setFileName(''); setParseErrors([]); onParsed([], []) }}
          className="flex items-center gap-1.5 text-xs text-[#64748B] hover:text-[#DC2626] self-start"
        >
          <X size={12} />
          Clear file
        </button>
      )}
    </div>
  )
}

export default BulkSKUUploader
