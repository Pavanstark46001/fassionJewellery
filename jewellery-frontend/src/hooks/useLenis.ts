import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

/**
 * Instantiates a Lenis smooth-scroll instance and drives it via rAF.
 * Prefer using <SmoothScrollProvider> at the app root; this hook is exposed
 * for any component that needs direct access to the shared Lenis instance
 * (e.g. to sync with GSAP ScrollTrigger's own ticker).
 */
export function useLenis(enabled = true) {
  const lenisRef = useRef<Lenis | null>(null)

  useEffect(() => {
    if (!enabled) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) return

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    })
    lenisRef.current = lenis

    let rafId: number
    function raf(time: number) {
      lenis.raf(time)
      rafId = requestAnimationFrame(raf)
    }
    rafId = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(rafId)
      lenis.destroy()
      lenisRef.current = null
    }
  }, [enabled])

  return lenisRef
}
