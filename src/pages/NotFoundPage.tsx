import { Link } from 'react-router-dom'
import { Home, Wrench, ArrowLeft } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-8 px-4 text-center">
      {/* Large 404 number */}
      <div className="select-none">
        <p
          className="text-[120px] font-extrabold leading-none text-[#2563EB] sm:text-[160px]"
          aria-hidden="true"
          style={{ textShadow: '4px 4px 0px #BFDBFE' }}
        >
          404
        </p>
      </div>

      {/* Message */}
      <div className="flex max-w-md flex-col gap-3">
        <h1 className="text-2xl font-bold text-[#0F172A] sm:text-3xl">
          Page Not Found
        </h1>
        <p className="text-base text-[#64748B]">
          The page you're looking for doesn't exist or has been moved. Check the URL
          or head back to a familiar place.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-[6px] bg-[#2563EB] px-5 py-2.5 text-sm font-semibold text-white shadow-[#1E293B_2px_2px_0px_0px] transition-colors hover:bg-[#1D4ED8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40"
        >
          <Home size={16} />
          Go Home
        </Link>
        <Link
          to="/tools"
          className="inline-flex items-center gap-2 rounded-[6px] border border-[#E2E8F0] bg-white px-5 py-2.5 text-sm font-semibold text-[#0F172A] shadow-[#1E293B_1px_1px_0px_0px] transition-colors hover:border-[#2563EB]/40 hover:text-[#2563EB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/40"
        >
          <Wrench size={16} />
          Explore Tools
        </Link>
      </div>

      {/* Back link */}
      <button
        type="button"
        onClick={() => window.history.back()}
        className="flex items-center gap-1.5 text-sm text-[#94A3B8] transition-colors hover:text-[#64748B]"
      >
        <ArrowLeft size={14} />
        Go back to previous page
      </button>
    </div>
  )
}
