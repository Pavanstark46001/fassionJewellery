import { useState } from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  outOf?: number
  size?: number
  className?: string
  /** When provided, the stars become clickable and this is called with the new value. */
  onChange?: (value: number) => void
}

/**
 * Read-only by default (used for the average-rating summary). Pass
 * `onChange` to turn it into an interactive picker for the review form.
 */
export function StarRating({ value, outOf = 5, size = 16, className, onChange }: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null)
  const interactive = typeof onChange === 'function'
  const displayValue = hovered ?? value

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)} role={interactive ? 'radiogroup' : undefined}>
      {Array.from({ length: outOf }, (_, i) => i + 1).map((star) => {
        const filled = star <= Math.round(displayValue)
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            onClick={interactive ? () => onChange(star) : undefined}
            onMouseEnter={interactive ? () => setHovered(star) : undefined}
            onMouseLeave={interactive ? () => setHovered(null) : undefined}
            className={cn(!interactive && 'cursor-default', interactive && 'cursor-pointer')}
          >
            <Star
              width={size}
              height={size}
              className={cn(filled ? 'fill-gold text-gold' : 'fill-transparent text-ink/25')}
              strokeWidth={1.5}
            />
          </button>
        )
      })}
    </div>
  )
}
