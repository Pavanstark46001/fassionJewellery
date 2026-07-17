import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface ComingSoonProps {
  title: string
  description?: string
}

/**
 * Thin placeholder used by every route stub that is out of scope for
 * Phase 1 (product listing/detail, auth, cart, checkout). Keeps the route
 * tree wired up end-to-end without building the actual page yet.
 */
export function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 py-32 text-center">
      <span className="eyebrow">Phase 2</span>
      <h1 className="max-w-xl text-4xl font-medium text-ink md:text-5xl">{title}</h1>
      <p className="max-w-md text-ink/60">
        {description ?? 'This page is being hand-finished. Please check back soon.'}
      </p>
      <div className="gold-divider my-2" />
      <Button asChild size="lg">
        <Link to="/">Return Home</Link>
      </Button>
    </div>
  )
}
