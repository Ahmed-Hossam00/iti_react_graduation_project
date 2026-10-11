import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export function Pagination({
  page = 1,
  totalPages = 1,
  totalItems = null,
  pageSize = 20,
  onPageChange,
  className = '',
}) {
  if (totalPages <= 1 && totalItems === null) return null;

  const startItem = (page - 1) * pageSize + 1;
  const endItem = totalItems ? Math.min(page * pageSize, totalItems) : page * pageSize;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-3 px-2 border-t border-slate-200 text-sm text-slate-600 ${className}`}
    >
      <div>
        {totalItems !== null ? (
          <span>
            Showing <strong className="font-semibold text-slate-900">{startItem}</strong> to{' '}
            <strong className="font-semibold text-slate-900">{endItem}</strong> of{' '}
            <strong className="font-semibold text-slate-900">{totalItems}</strong> entries
          </span>
        ) : (
          <span>
            Page <strong className="font-semibold text-slate-900">{page}</strong> of{' '}
            <strong className="font-semibold text-slate-900">{totalPages || 1}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={ChevronLeft}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Previous
        </Button>

        <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded-none border border-slate-200 text-slate-700">
          {page} / {totalPages || 1}
        </span>

        <Button
          type="button"
          variant="outline"
          size="sm"
          icon={ChevronRight}
          iconPosition="right"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
