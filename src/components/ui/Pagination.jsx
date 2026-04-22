import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { Button } from './Button';

/**
 * Builds a dynamic page range with ellipsis.
 * E.g. for page=4, pageCount=10 → [1, '…', 3, 4, 5, '…', 10]
 */
function getPageRange(current, count) {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i);

  const range = new Set([0, count - 1, current]);
  if (current > 0)     range.add(current - 1);
  if (current < count - 1) range.add(current + 1);

  const sorted = [...range].sort((a, b) => a - b);
  const result = [];

  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('…');
    result.push(sorted[i]);
  }
  return result;
}

export default function Pagination({ page, pageCount, onPageChange }) {
  if (pageCount <= 1) return null;

  const range = getPageRange(page, pageCount);

  return (
    <div className="flex items-center justify-center gap-1 pt-4">
      {/* Prev */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="gap-1 font-semibold px-3"
      >
        <ChevronLeft size={16} />
        <span className="hidden sm:inline">Prev</span>
      </Button>

      {/* Page numbers */}
      {range.map((item, idx) =>
        item === '…' ? (
          <span
            key={`ellipsis-${idx}`}
            className="w-9 h-9 flex items-center justify-center text-md-on-surface-variant"
          >
            <MoreHorizontal size={16} />
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            className={`w-9 h-9 rounded-full text-sm font-bold transition-all ${
              item === page
                ? 'bg-md-primary text-md-on-primary shadow-sm scale-110'
                : 'text-md-on-surface-variant hover:bg-md-surface-container'
            }`}
          >
            {item + 1}
          </button>
        )
      )}

      {/* Next */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onPageChange(Math.min(pageCount - 1, page + 1))}
        disabled={page === pageCount - 1}
        className="gap-1 font-semibold px-3"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight size={16} />
      </Button>
    </div>
  );
}
