import type Lenis from 'lenis'

/**
 * The app's single Lenis smooth-scroll instance lives inside
 * SmoothScrollProvider and persists across every route change (it's mounted
 * once, above <Outlet />). Anything outside that component that needs to
 * change scroll position — e.g. resetting to the top on navigation — has to
 * go through Lenis' own API rather than the native `window.scrollTo`, or
 * Lenis will just snap back to whatever position it's still internally
 * tracking on its next animation frame.
 */
let activeLenis: Lenis | null = null

export function registerLenis(instance: Lenis | null) {
  activeLenis = instance
}

/**
 * Jumps to the top of the page instantly, accounting for Lenis if it's
 * active. Belt-and-suspenders: also calls the native `window.scrollTo`
 * directly, and re-clamps for a few animation frames afterward — Lenis's own
 * raf loop can otherwise reassert a stale scroll position for a frame or two
 * right after a fast route change.
 */
export function scrollToTop() {
  if (activeLenis) {
    activeLenis.scrollTo(0, { immediate: true, force: true })
  }
  window.scrollTo(0, 0)

  let frames = 0
  function reassert() {
    if (window.scrollY !== 0) window.scrollTo(0, 0)
    frames += 1
    if (frames < 6) requestAnimationFrame(reassert)
  }
  requestAnimationFrame(reassert)
}
