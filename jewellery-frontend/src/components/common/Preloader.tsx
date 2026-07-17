import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'

interface PreloaderProps {
  onComplete?: () => void
}

/**
 * One-time full-screen preloader shown before the homepage reveals itself.
 * Animates a shimmering wordmark + progress hairline with GSAP, then wipes
 * away. Skips instantly for prefers-reduced-motion users.
 */
export function Preloader({ onComplete }: PreloaderProps) {
  const [isDone, setIsDone] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const wordmarkRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (prefersReducedMotion) {
      setIsDone(true)
      onComplete?.()
      return
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          setIsDone(true)
          onComplete?.()
        },
      })

      tl.fromTo(
        wordmarkRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
      )
        .to(barRef.current, { width: '100%', duration: 1.1, ease: 'power2.inOut' }, '-=0.2')
        .to(wordmarkRef.current, { opacity: 0, y: -16, duration: 0.5, ease: 'power2.in' }, '+=0.15')
        .to(
          containerRef.current,
          { yPercent: -100, duration: 0.9, ease: 'power4.inOut' },
          '-=0.2',
        )
    }, containerRef)

    return () => ctx.revert()
  }, [onComplete])

  if (isDone) return null

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[10000] flex flex-col items-center justify-center gap-6 bg-ink"
    >
      <div ref={wordmarkRef} className="flex flex-col items-center gap-3 opacity-0">
        <span className="font-serif text-4xl tracking-[0.12em] text-ivory md:text-5xl">
          SRI SAI
        </span>
        <span className="eyebrow text-gold">Fashion Jewellery</span>
      </div>
      <div className="h-px w-48 overflow-hidden bg-white/10">
        <div ref={barRef} className="h-full w-0 bg-gradient-to-r from-gold-dark via-gold to-gold-light" />
      </div>
    </div>
  )
}
