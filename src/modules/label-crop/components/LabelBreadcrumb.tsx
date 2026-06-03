import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

interface Crumb {
  label: string;
  to?: string;
}

interface LabelBreadcrumbProps {
  crumbs: Crumb[];
}

export const LabelBreadcrumb: React.FC<LabelBreadcrumbProps> = ({ crumbs }) => (
  <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1 text-sm text-[#64748B]">
    <Link to="/" className="hover:text-[#0F172A] transition-colors">
      Home
    </Link>
    {crumbs.map((crumb, i) => (
      <React.Fragment key={i}>
        <ChevronRight size={13} className="shrink-0 text-[#CBD5E1]" />
        {crumb.to ? (
          <Link to={crumb.to} className="hover:text-[#0F172A] transition-colors truncate max-w-[160px]">
            {crumb.label}
          </Link>
        ) : (
          <span className="font-medium text-[#0F172A] truncate max-w-[200px]">{crumb.label}</span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

export default LabelBreadcrumb;
