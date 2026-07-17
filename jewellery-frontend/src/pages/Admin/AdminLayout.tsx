import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, Navigate, Outlet, useLocation } from 'react-router-dom'
import {
  CalendarHeart,
  ClipboardList,
  FileText,
  FolderTree,
  Image,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  Newspaper,
  Package,
  PackageSearch,
  Receipt,
  ShoppingBag,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useAppDispatch } from '@/store/hooks'
import { setUser } from '@/store/authSlice'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/pos', label: 'Billing', icon: Receipt },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/inventory', label: 'Inventory', icon: PackageSearch },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/collections', label: 'Collections', icon: Sparkles },
  { to: '/admin/occasions', label: 'Occasions', icon: CalendarHeart },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/customers', label: 'Customers', icon: Users },
]

/** Sprint 7: CMS/blog/pages — grouped separately in the sidebar since they're
 * all "site content" rather than catalog/commerce data. */
const CONTENT_NAV_ITEMS = [
  { to: '/admin/cms/banners', label: 'Banners', icon: Image },
  { to: '/admin/cms/home-sections', label: 'Homepage Sections', icon: LayoutTemplate },
  { to: '/admin/blog', label: 'Blog', icon: Newspaper },
  { to: '/admin/pages', label: 'Pages', icon: FileText },
]

export default function AdminLayout() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const { data: currentUser } = useCurrentUser()
  const dispatch = useAppDispatch()
  const location = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (currentUser) dispatch(setUser(currentUser))
  }, [currentUser, dispatch])

  // <main> is its own scroll container (see the layout below), not the
  // window, so the shared window-based ScrollToTop doesn't apply here -
  // reset this container's own scroll position on every navigation instead.
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [location.pathname, location.search])

  // The sidebar renders as an off-canvas drawer below `lg:` (see the aside
  // below) - close it on every navigation so it doesn't stay open over the
  // next page.
  useEffect(() => {
    setIsSidebarOpen(false)
  }, [location.pathname])

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: '/admin' }} replace />
  }

  if (!isAdmin) {
    return (
      <div className="admin-panel flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center font-sans">
        <h1 className="text-2xl font-semibold text-ink">You don't have access to this area</h1>
        <p className="max-w-md text-sm text-ink/60">
          This section is restricted to store administrators. If you believe this is a mistake, contact the site
          owner.
        </p>
        <Link to="/" className="mt-2 text-sm font-medium text-gold-dark underline underline-offset-4">
          Back to the storefront
        </Link>
      </div>
    )
  }

  return (
    <div className="admin-panel flex h-screen overflow-hidden bg-[#f6f6f5] font-sans text-ink">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-60 shrink-0 flex-col overflow-y-auto bg-ink text-ivory transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:static lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-16 items-center justify-between gap-2 border-b border-white/10 px-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gold" strokeWidth={1.75} />
            <span className="text-sm font-semibold tracking-wide">Sri Sai Admin</span>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setIsSidebarOpen(false)}
            className="text-ivory/60 transition-colors hover:text-ivory lg:hidden"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive ? 'bg-gold text-ink font-medium' : 'text-ivory/70 hover:bg-white/5 hover:text-ivory',
                )
              }
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}

          <div className="mt-4 mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-ivory/40">
            Content
          </div>
          {CONTENT_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                  isActive ? 'bg-gold text-ink font-medium' : 'text-ivory/70 hover:bg-white/5 hover:text-ivory',
                )
              }
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-black/10 bg-white px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setIsSidebarOpen(true)}
              className="shrink-0 text-ink/70 transition-colors hover:text-ink lg:hidden"
            >
              <Menu className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <div className="hidden truncate text-sm text-ink/50 sm:block">Back office</div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-4">
            <span className="hidden max-w-[160px] truncate text-sm text-ink/80 sm:inline">
              {user?.fullName ?? user?.email}
            </span>
            <Link to="/" className="hidden text-sm text-gold-dark underline underline-offset-4 sm:inline">
              Back to Store
            </Link>
            <button
              type="button"
              onClick={logout}
              className="flex items-center gap-1.5 rounded-md border border-black/10 px-2.5 py-1.5 text-sm text-ink/70 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600 sm:px-3"
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>
        <main ref={mainRef} className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
