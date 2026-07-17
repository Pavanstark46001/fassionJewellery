import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, Heart } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/hooks/useAuth'
import { useAddToWishlist, useIsWishlisted, useRemoveFromWishlist } from '@/hooks/useWishlist'
import { cn, formatPrice } from '@/lib/utils'
import type { Product } from '@/types/api'

interface ProductCardProps {
  product: Product
  index?: number
  /** Hide the wishlist heart overlay (e.g. inside the wishlist page itself). */
  showWishlist?: boolean
}

/**
 * The canonical product tile used across the site — extracted from the
 * Phase 1 FeaturedProducts section so listing, related-products, and
 * wishlist grids all share the exact same visual treatment.
 */
export function ProductCard({ product, index = 0, showWishlist = true }: ProductCardProps) {
  const hasDiscount = product.discountedPrice != null && product.discountedPrice < product.basePrice
  const { isAuthenticated } = useAuth()
  const wishlisted = useIsWishlisted(product.id)
  const addToWishlist = useAddToWishlist()
  const removeFromWishlist = useRemoveFromWishlist()
  const navigate = useNavigate()
  const location = useLocation()

  function handleWishlistToggle(event: React.MouseEvent) {
    event.preventDefault()
    event.stopPropagation()

    if (!isAuthenticated) {
      toast.error('Please log in to save items to your wishlist.')
      navigate('/login', { state: { from: location.pathname + location.search } })
      return
    }

    if (wishlisted) {
      removeFromWishlist.mutate(product.id, {
        onError: () => toast.error('Could not remove from wishlist.'),
      })
    } else {
      addToWishlist.mutate(product.id, {
        onSuccess: () => toast.success('Added to wishlist.'),
        onError: () => toast.error('Could not add to wishlist.'),
      })
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/products/${product.slug}`} data-cursor="hover" className="group block">
        <div className="relative aspect-[4/5] w-full overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(10,10,10,0.04),0_12px_32px_-12px_rgba(10,10,10,0.12)]">
          <img
            src={product.primaryImageUrl ?? '/images/products/product-necklaces.jpg'}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          />
          {hasDiscount && (
            <span className="absolute left-4 top-4 rounded-full bg-gold px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-ink">
              Sale
            </span>
          )}
          {showWishlist && (
            <button
              type="button"
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={handleWishlistToggle}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-ivory/90 text-ink shadow-md backdrop-blur-sm transition-transform duration-300 hover:scale-110"
            >
              <Heart
                className={cn('h-4 w-4', wishlisted && 'fill-gold-dark text-gold-dark')}
                strokeWidth={1.5}
              />
            </button>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all duration-500 group-hover:bg-ink/20 group-hover:opacity-100">
            <span className="flex items-center gap-2 rounded-full bg-ivory/95 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.15em] text-ink shadow-lg">
              <Eye className="h-3.5 w-3.5" /> View
            </span>
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1">
          <span className="text-[11px] uppercase tracking-[0.15em] text-ink/40">{product.ornamentId}</span>
          <h3 className="font-serif text-lg text-ink">{product.name}</h3>
          <div className="mt-1 flex items-center gap-2">
            {hasDiscount ? (
              <>
                <span className="font-medium text-gold-dark">{formatPrice(product.discountedPrice)}</span>
                <span className="text-sm text-ink/40 line-through">{formatPrice(product.basePrice)}</span>
              </>
            ) : (
              <span className="font-medium text-ink/80">{formatPrice(product.basePrice)}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
