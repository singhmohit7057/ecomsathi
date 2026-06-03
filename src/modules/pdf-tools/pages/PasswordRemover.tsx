import React, { useState } from 'react'
import { Unlock, Eye, EyeOff } from 'lucide-react'
import SEO from '@/components/common/SEO'
import PDFToolLayout from '../components/PDFToolLayout'
import PDFUploader from '../components/PDFUploader'
import PDFDownload from '../components/PDFDownload'
import PDFFAQ from '../components/PDFFAQ'
import { usePDFFile } from '../hooks/usePDFFile'
import { usePDFProcessor } from '../hooks/usePDFProcessor'
import { removePassword } from '../services/pdfApiService'
import { canonical } from '../utils/pdfUtils'
import type { FAQItem, RelatedPDFTool } from '../types'

const RELATED: RelatedPDFTool[] = [
  { label: 'Merge PDF',    to: '/pdf/merge',    description: 'Combine PDFs' },
  { label: 'Compress PDF', to: '/pdf/compress', description: 'Reduce file size' },
  { label: 'Split PDF',    to: '/pdf/split',    description: 'Split into parts' },
  { label: 'Rotate PDF',   to: '/pdf/rotate',   description: 'Rotate pages' },
]

const FAQS: FAQItem[] = [
  {
    question: 'Is this tool for removing passwords from PDFs I own?',
    answer: 'Yes. This tool is intended for removing passwords from your own PDF documents. Do not use it on documents you do not have authorisation to access.',
  },
  {
    question: 'Does the tool work if I have forgotten the password?',
    answer: 'No. You must provide the correct owner or user password. The tool cannot crack or bypass unknown passwords.',
  },
  {
    question: 'What types of PDF passwords can be removed?',
    answer: 'The tool removes the open (user) password from encrypted PDFs. After providing the correct password, the output PDF will be unencrypted.',
  },
  {
    question: 'Is my password transmitted securely?',
    answer: 'Yes. Your password is sent over HTTPS and is never stored on our servers. It is only used to decrypt and process your file.',
  },
  {
    question: 'What if the password is incorrect?',
    answer: 'The tool will return an error. Double-check the password and try again.',
  },
]

const PAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Remove PDF Password Online Free',
  url: canonical('/pdf/password-remover'),
  description: 'Remove password from PDF online free. Unlock password-protected PDF files you own. No signup required.',
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
}

export const PasswordRemover: React.FC = () => {
  const { pdfFile, error: fileError, isLoading, onDrop, reset: resetFile } = usePDFFile()
  const { status, error: procError, result, run, reset: resetProc } = usePDFProcessor<{ url: string; filename: string; size: number }>()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const handleRemove = () => {
    if (!pdfFile || !password) return
    run(() => removePassword(pdfFile.file, password))
  }

  const handleReset = () => {
    if (result) URL.revokeObjectURL(result.url)
    resetProc()
    resetFile()
    setPassword('')
  }

  return (
    <>
      <SEO
        title="Remove PDF Password Online Free — Unlock PDF — EcomSathi"
        description="Remove password from PDF files online for free. Unlock password-protected PDFs you own. No signup, no watermark. Fast and secure."
        keywords="remove pdf password online free, unlock pdf, pdf password remover, pdf unlocker, decrypt pdf, remove encryption from pdf"
        canonicalUrl={canonical('/pdf/password-remover')}
        schema={PAGE_SCHEMA}
      />

      <PDFToolLayout
        title="Remove PDF Password"
        description="Unlock a password-protected PDF you own. Enter the password to decrypt and download the unprotected file."
        relatedTools={RELATED}
      >
        <div className="flex flex-col gap-6">
          {/* Legal notice */}
          <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-[8px] p-4 text-xs text-[#92400E]">
            <strong>Important:</strong> Only use this tool on PDF files you own or have permission to decrypt. Removing passwords from unauthorised documents may be illegal.
          </div>

          <PDFUploader
            pdfFile={pdfFile}
            isLoading={isLoading}
            error={fileError}
            onDrop={onDrop}
            onReset={handleReset}
          />

          {status === 'error' && procError && (
            <div className="flex items-center gap-2 px-4 py-3 bg-[#FFF1F2] border border-[#FFE4E6] rounded-[8px] text-sm text-[#DC2626]">
              <span>⚠</span> {procError}
            </div>
          )}

          {pdfFile && status !== 'done' && (
            <div className="bg-white border border-[#E2E8F0] rounded-[8px] p-5 flex flex-col gap-5">
              <h2 className="text-sm font-semibold text-[#0F172A]">PDF Password</h2>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#0F172A]">Enter Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter the PDF password"
                    className="w-full border border-[#E2E8F0] rounded-[4px] px-3 py-2 pr-10 text-sm focus:outline-none focus:border-[#2563EB]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#64748B]"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemove}
                disabled={status === 'processing' || !password.trim()}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 text-sm font-semibold bg-[#2563EB] text-white rounded-[4px] hover:bg-[#1D4ED8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {status === 'processing' ? (
                  <><span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" /> Removing…</>
                ) : (
                  <><Unlock size={15} /> Remove Password</>
                )}
              </button>
            </div>
          )}

          {status === 'done' && result && (
            <PDFDownload url={result.url} filename={result.filename} size={result.size} label="Download Unlocked PDF" onReset={handleReset} />
          )}

          <section className="flex flex-col gap-3 mt-2">
            <h2 className="text-lg font-bold text-[#0F172A]">About PDF Password Remover</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { title: 'Instant Decryption', body: 'Enter the correct password and the tool instantly removes the encryption.' },
                { title: 'Secure Transmission', body: 'Password and file are sent via HTTPS. Nothing is stored on our servers.' },
                { title: 'Output Unencrypted', body: 'The downloaded PDF has no password and can be opened in any PDF viewer.' },
                { title: 'Authorised Use Only', body: 'Only use on documents you own or have legal permission to access.' },
              ].map((f) => (
                <div key={f.title} className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] p-4">
                  <p className="text-sm font-semibold text-[#0F172A]">{f.title}</p>
                  <p className="text-sm text-[#64748B] mt-1">{f.body}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-bold text-[#0F172A]">How to Remove a PDF Password</h2>
            <ol className="flex flex-col gap-3">
              {['Upload the password-protected PDF.', 'Enter the correct PDF password.', 'Click "Remove Password".', 'Download the unlocked PDF.'].map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-[#EFF6FF] text-[#2563EB] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-[#475569]">{step}</p>
                </li>
              ))}
            </ol>
          </section>

          <PDFFAQ items={FAQS} pageUrl={canonical('/pdf/password-remover')} />
        </div>
      </PDFToolLayout>
    </>
  )
}

export default PasswordRemover
