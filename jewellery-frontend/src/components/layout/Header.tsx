import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Heart, LayoutDashboard, LogOut, Menu, Package, Search, ShoppingBag, User, Wallet, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MagneticButton } from '@/components/common/MagneticButton'
import { useAppSelector } from '@/store/hooks'
import { selectCartItemCount } from '@/store/cartSlice'
import { useAuth } from '@/hooks/useAuth'

const NAV_LINKS = [
  { label: 'Necklaces', href: '/products?categorySlug=necklaces' },
  { label: 'Earrings', href: '/products?categorySlug=earrings' },
  { label: 'Bangles', href: '/products?categorySlug=bangles' },
  { label: 'Rings', href: '/products?categorySlug=rings' },
  { label: 'Bridal', href: '/products?categorySlug=bridal-sets' },
]

/**
 * Fixed luxury navbar. Transparent-over-hero only applies on the homepage,
 * where a full-bleed dark hero actually sits behind it — every other route
 * has a light background from the first frame, so the header renders solid
 * (dark text on an opaque bar) there immediately rather than waiting for a
 * scroll past 80px. Without this, every non-homepage page briefly rendered
 * white-on-white/invisible header text until the user scrolled.
 */
export function Header() {
  const location = useLocation()
  const isHomepage = location.pathname === '/'
  const [scrolled, setScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const searchInputRef = useRef<HTMLInputElement>(null)
  const accountRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const cartCount = useAppSelector(selectCartItemCount)
  const { isAuthenticated, isAdmin, user, logout } = useAuth()

  const isSolid = !isHomepage || scrolled

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 80)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus()
  }, [isSearchOpen])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function handleSearchSubmit(event: React.FormEvent) {
    event.preventDefault()
    const query = searchQuery.trim()
    setIsSearchOpen(false)
    setSearchQuery('')
    navigate(query ? `/products?q=${encodeURIComponent(query)}` : '/products')
  }

  function handleLogout() {
    logout()
    setIsAccountOpen(false)
    navigate('/')
  }

  const iconButtonClass = cn(
    'relative flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300',
    isSolid ? 'text-ink hover:bg-ink/5' : 'text-ivory hover:bg-white/10',
  )

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500',
        isSolid ? 'bg-ivory/95 shadow-[0_2px_24px_rgba(10,10,10,0.08)] backdrop-blur-md' : 'bg-transparent',
      )}
    >
      <div className="mx-auto flex h-20 max-w-[1600px] items-center justify-between px-6 md:px-12">
        <Link
          to="/"
          data-cursor="hover"
          className={cn(
            'flex flex-col leading-none transition-colors duration-500',
            isSolid ? 'text-ink' : 'text-ivory',
          )}
        >
          <span className="font-serif text-lg tracking-[0.1em] sm:text-xl md:text-2xl">SRI SAI</span>
          <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.28em] text-gold">
            Fashion Jewellery
          </span>
        </Link>

        <nav className="hidden items-center gap-10 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.href}
              data-cursor="hover"
              className={cn(
                'text-xs font-medium uppercase tracking-[0.2em] transition-colors duration-300',
                isSolid ? 'text-ink/70 hover:text-gold-dark' : 'text-ivory/85 hover:text-gold-light',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 md:gap-2">
          <MagneticButton strength={20}>
            <button
              type="button"
              aria-label="Search"
              onClick={() => setIsSearchOpen((open) => !open)}
              className={iconButtonClass}
            >
              <Search className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </button>
          </MagneticButton>

          <MagneticButton strength={20} className="hidden sm:inline-block">
            <Link to="/wishlist" aria-label="Wishlist" className={iconButtonClass}>
              <Heart className="h-[18px] w-[18px]" strokeWidth={1.5} />
            </Link>
          </MagneticButton>

          <MagneticButton strength={20}>
            <Link to="/cart" aria-label="Cart" className={iconButtonClass}>
              <ShoppingBag className="h-[18px] w-[18px]" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold px-1 text-[9px] font-semibold text-ink">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </MagneticButton>

          <div className="relative hidden sm:block" ref={accountRef}>
            <MagneticButton strength={20}>
              {isAuthenticated ? (
                <button
                  type="button"
                  aria-label="Account"
                  onClick={() => setIsAccountOpen((open) => !open)}
                  className={iconButtonClass}
                >
                  <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </button>
              ) : (
                <Link to="/login" aria-label="Sign in" className={iconButtonClass}>
                  <User className="h-[18px] w-[18px]" strokeWidth={1.5} />
                </Link>
              )}
            </MagneticButton>

            <AnimatePresence>
              {isAuthenticated && isAccountOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 top-14 w-56 rounded-2xl border border-black/5 bg-ivory p-4 shadow-[0_12px_32px_-8px_rgba(10,10,10,0.2)]"
                >
                  <p className="truncate font-serif text-sm text-ink">{user?.fullName ?? 'Account'}</p>
                  <p className="truncate text-xs text-ink/50">{user?.email}</p>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsAccountOpen(false)}
                      className="mt-3 flex w-full items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-gold-dark transition-colors hover:bg-gold/20"
                    >
                      <LayoutDashboard className="h-3.5 w-3.5" strokeWidth={1.5} /> Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/orders"
                    onClick={() => setIsAccountOpen(false)}
                    className="mt-3 flex w-full items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-ink/80 transition-colors hover:border-gold hover:bg-gold/10"
                  >
                    <Package className="h-3.5 w-3.5" strokeWidth={1.5} /> Order History
                  </Link>
                  <Link
                    to="/wallet"
                    onClick={() => setIsAccountOpen(false)}
                    className="mt-2 flex w-full items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs font-medium uppercase tracking-wider text-ink/80 transition-colors hover:border-gold hover:bg-gold/10"
                  >
                    <Wallet className="h-3.5 w-3.5" strokeWidth={1.5} /> Wallet
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 flex w-full items-center gap-2 rounded-full border border-gold/40 px-4 py-2 text-xs font-medium uppercase tracking-wider text-ink/80 transition-colors hover:border-gold hover:bg-gold/10"
                  >
                    <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} /> Log Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setIsMobileOpen((open) => !open)}
            className={cn(iconButtonClass, 'lg:hidden')}
          >
            {isMobileOpen ? (
              <X className="h-5 w-5" strokeWidth={1.5} />
            ) : (
              <Menu className="h-5 w-5" strokeWidth={1.5} />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-black/5 bg-ivory/98 backdrop-blur-md"
          >
            <form onSubmit={handleSearchSubmit} className="mx-auto flex max-w-[1600px] items-center gap-4 px-6 py-5 md:px-12">
              <Search className="h-5 w-5 shrink-0 text-ink/40" strokeWidth={1.5} />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for necklaces, rings, bangles…"
                className="flex-1 bg-transparent py-2 text-lg text-ink outline-none placeholder:text-ink/35"
              />
              <button
                type="button"
                aria-label="Close search"
                onClick={() => setIsSearchOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-ink/60 hover:bg-ink/5"
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isMobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden bg-ivory lg:hidden"
          >
            <div className="flex flex-col gap-1 px-6 pb-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsMobileOpen(false)}
                  className="border-b border-black/5 py-4 text-sm uppercase tracking-[0.2em] text-ink/80"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/wishlist"
                onClick={() => setIsMobileOpen(false)}
                className="border-b border-black/5 py-4 text-sm uppercase tracking-[0.2em] text-ink/80"
              >
                Wishlist
              </Link>
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileOpen(false)}
                      className="border-b border-black/5 py-4 text-sm uppercase tracking-[0.2em] text-gold-dark"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/orders"
                    onClick={() => setIsMobileOpen(false)}
                    className="border-b border-black/5 py-4 text-sm uppercase tracking-[0.2em] text-ink/80"
                  >
                    Order History
                  </Link>
                  <Link
                    to="/wallet"
                    onClick={() => setIsMobileOpen(false)}
                    className="border-b border-black/5 py-4 text-sm uppercase tracking-[0.2em] text-ink/80"
                  >
                    Wallet
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileOpen(false)
                      handleLogout()
                    }}
                    className="py-4 text-left text-sm uppercase tracking-[0.2em] text-ink/80"
                  >
                    Log Out ({user?.fullName ?? user?.email})
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsMobileOpen(false)}
                  className="py-4 text-sm uppercase tracking-[0.2em] text-ink/80"
                >
                  Sign In
                </Link>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}
