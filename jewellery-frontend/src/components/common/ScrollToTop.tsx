import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { scrollToTop } from '@/lib/lenis'

/**
 * React Router doesn't reset scroll position on navigation by default, and
 * this app's Lenis smooth-scroll instance persists across routes (it's
 * mounted once, above <Outlet />) — so without this, navigating to a new
 * page silently opens at whatever scroll depth the previous page was left
 * at, rather than at the top.
 *
 * Keyed on both `pathname` and `search`: the category nav links (e.g. Rings
 * -> Earrings) only change the `categorySlug` query param, not the path
 * itself, and still need to reset scroll.
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation()

  useEffect(() => {
    scrollToTop()
  }, [pathname, search])

  return null
}
