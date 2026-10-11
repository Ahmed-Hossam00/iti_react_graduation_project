import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ArrowLeft } from 'lucide-react';

export function PageHeader({
  title,
  description,
  badge = null,
  breadcrumbs = [],
  backTo = null,
  backLabel = 'Back',
  actions = null,
  className = '',
}) {
  return (
    <div className={`mb-6 pb-5 border-b border-slate-200 ${className}`}>
      {/* Breadcrumbs or back link */}
      {backTo && (
        <Link
          to={backTo}
          className="inline-flex items-center text-xs font-medium text-slate-500 hover:text-[#0F766E] mb-2 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5 mr-1" />
          {backLabel}
        </Link>
      )}

      {breadcrumbs.length > 0 && !backTo && (
        <nav className="flex items-center space-x-1.5 text-xs text-slate-500 mb-2">
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
              {crumb.href ? (
                <Link
                  to={crumb.href}
                  className="hover:text-[#0F766E] transition-colors"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-900 font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Title and Action block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            {badge}
          </div>
          {description && (
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">{description}</p>
          )}
        </div>

        {actions && (
          <div className="flex items-center flex-wrap gap-2.5 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export default PageHeader;
