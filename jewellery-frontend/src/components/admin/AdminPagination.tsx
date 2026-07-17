import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminPaginationProps {
  page: number
  totalPages: number
  first?: boolean
  last?: boolean
  onPageChange: (page: number) => void
}

export function AdminPagination({ page, totalPages, first, last, onPageChange }: AdminPaginationProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-sm text-ink/50">
        Page {page + 1} of {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1 rounded-md"
          onClick={() => onPageChange(Math.max(0, page - 1))}
          disabled={first ?? page === 0}
        >
          <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.75} /> Previous
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1 rounded-md"
          onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
          disabled={last ?? page >= totalPages - 1}
        >
          Next <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Button>
      </div>
    </div>
  )
}
