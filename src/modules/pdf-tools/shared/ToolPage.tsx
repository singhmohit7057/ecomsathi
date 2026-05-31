import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, CheckCircle2 } from 'lucide-react';

interface ToolPageProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  category: string;
  children: React.ReactNode;
}

export const ToolPage: React.FC<ToolPageProps> = ({
  icon,
  title,
  description,
  category,
  children,
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[#64748B]">
        <Link to="/" className="hover:text-[#0F172A] transition-colors">
          Home
        </Link>
        <ChevronRight size={14} className="shrink-0" />
        <Link to="/tools" className="hover:text-[#0F172A] transition-colors">
          Tools
        </Link>
        <ChevronRight size={14} className="shrink-0" />
        <Link to="/tools/pdf" className="hover:text-[#0F172A] transition-colors">
          PDF Tools
        </Link>
        <ChevronRight size={14} className="shrink-0" />
        <span className="font-medium text-[#0F172A]">{title}</span>
      </nav>

      {/* Tool Header */}
      <div className="flex flex-col gap-4 rounded-[8px] border border-[#E2E8F0] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start gap-4">
          {/* Icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[8px] bg-[#EFF6FF] text-[#2563EB]">
            {icon}
          </div>

          {/* Title + description */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-[#0F172A] sm:text-2xl">{title}</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#F0FDF4] px-2.5 py-0.5 text-xs font-medium text-[#16A34A] ring-1 ring-inset ring-[#BBF7D0]">
                <CheckCircle2 size={11} />
                No login required
              </span>
              <span className="inline-flex items-center rounded-full bg-[#EFF6FF] px-2.5 py-0.5 text-xs font-medium text-[#2563EB]">
                {category}
              </span>
              <span className="inline-flex items-center rounded-full bg-[#FFFBEB] px-2.5 py-0.5 text-xs font-medium text-[#D97706]">
                Free
              </span>
            </div>
            <p className="mt-1 text-sm text-[#475569] sm:text-base">{description}</p>
          </div>
        </div>
      </div>

      {/* Tool Content */}
      <div className="flex flex-col gap-6">{children}</div>
    </div>
  );
};

export default ToolPage;
