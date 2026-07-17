import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full text-[10px] font-semibold uppercase tracking-wider',
  {
    variants: {
      variant: {
        gold: 'bg-gold text-ink',
        dark: 'bg-ink text-ivory',
        outline: 'border border-gold/50 text-gold-dark bg-transparent',
        success: 'bg-emerald-600/90 text-white',
        danger: 'bg-red-600/90 text-white',
        muted: 'bg-black/5 text-ink/60',
      },
      size: {
        default: 'h-5 min-w-5 px-1.5',
        sm: 'h-4 min-w-4 px-1 text-[9px]',
        pill: 'px-3 py-1',
      },
    },
    defaultVariants: {
      variant: 'gold',
      size: 'default',
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size, className }))} {...props} />
}

export { Badge, badgeVariants }
