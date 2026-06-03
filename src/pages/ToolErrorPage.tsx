import { useState } from 'react'
import { useRouteError, Link } from 'react-router-dom'
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Wrench } from 'lucide-react'

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  if (
    error !== null &&
    typeof error === 'object' &&
    'statusText' in error &&
    typeof (error as { statusText: unknown }).statusText === 'string'
  ) {
    return (error as { statusText: string }).statusText
  }
  return 'An unexpected error occurred.'
}

export default function ToolErrorPage() {
  const error = useRouteError()
  const [showDetails, setShowDetails] = useState(false)
  const errorMessage = getErrorMessage(error)

  const handleReload = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4 py-16">
      <div className="bg-white rounded-2xl shadow-lg border border-[#E2E8F0] max-w-md w-full p-8 flex flex-col items-center text-center gap-6">

        {/* Icon */}
        <div className="w-16 h-16 rounded-full bg-[#FEF3C7] flex items-center justify-center flex-shrink-0">
          <AlertTriangle size={32} className="text-[#D97706]" />
        </div>

        {/* Heading & sub-message */}
        <div className="flex flex-col gap-2">
          <h1 className="text-xl font-bold text-[#0F172A]">
            Something went wrong loading this tool
          </h1>
          <p className="text-sm text-[#64748B]">
            This usually happens when the processing server is temporarily unavailable.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            type="button"
            onClick={handleReload}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#2563EB] text-white text-sm font-medium hover:bg-[#1D4ED8] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
          >
            <RefreshCw size={15} />
            Try Again
          </button>
          <Link
            to="/tools"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-[#E2E8F0] bg-white text-[#0F172A] text-sm font-medium hover:bg-[#F8FAFC] transition-colors focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2"
          >
            <Wrench size={15} />
            Go to Tools
          </Link>
        </div>

        {/* Collapsible technical details */}
        <div className="w-full border border-[#E2E8F0] rounded-lg overflow-hidden">
          <button
            type="button"
            onClick={() => setShowDetails(prev => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 text-xs font-medium text-[#64748B] hover:bg-[#F8FAFC] transition-colors"
          >
            <span>Technical details</span>
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          {showDetails && (
            <div className="px-4 pb-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
              <pre className="mt-3 text-xs text-[#475569] whitespace-pre-wrap break-all font-mono leading-relaxed">
                {errorMessage}
              </pre>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
