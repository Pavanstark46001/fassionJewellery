import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRemoveFromWishlist, useWishlistQuery } from '@/hooks/useWishlist'
import { useAppDispatch } from '@/store/hooks'
import { addToCart } from '@/store/cartSlice'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ProductCard } from '@/components/product/ProductCard'
import { RevealText } from '@/components/common/RevealText'
import type { Product } from '@/types/api'

function WishlistCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch()
  const removeFromWishlist = useRemoveFromWishlist()

  function handleMoveToCart() {
    dispatch(addToCart(product, 1))
    removeFromWishlist.mutate(product.id, {
      onSuccess: () => toast.success(`${product.name} moved to your bag.`),
    })
  }

  function handleRemove() {
    removeFromWishlist.mutate(product.id, {
      onError: () => toast.error('Could not remove item.'),
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <ProductCard product={product} showWishlist={false} />
      <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full gap-1.5 sm:w-auto sm:flex-1"
          onClick={handleMoveToCart}
          disabled={removeFromWishlist.isPending}
        >
          <ShoppingBag className="h-3.5 w-3.5" strokeWidth={1.5} /> Move to Cart
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          aria-label="Remove from wishlist"
          onClick={handleRemove}
          disabled={removeFromWishlist.isPending}
          className="self-center shrink-0 text-ink/50 hover:text-red-600 sm:self-auto"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </Button>
      </div>
    </div>
  )
}

export default function WishlistPage() {
  const { isAuthenticated } = useAuth()
  const { data, isLoading, isError } = useWishlistQuery()

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-6 py-32 text-center">
        <Heart className="h-12 w-12 text-gold" strokeWidth={1} />
        <h1 className="max-w-xl text-4xl font-medium text-ink md:text-5xl">Your Wishlist</h1>
        <p className="max-w-md text-ink/60">Sign in to save your favourite pieces and revisit them anytime.</p>
        <div className="gold-divider my-2" />
        <Button asChild size="lg">
          <Link to="/login" state={{ from: '/wishlist' }}>
            Sign In
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="section-padding mx-auto max-w-[1600px]">
      <div className="mb-14 flex flex-col items-center text-center">
        <RevealText as="span" className="eyebrow">
          Saved For Later
        </RevealText>
        <RevealText as="h1" delay={0.1} className="mt-4 text-4xl text-ink md:text-5xl">
          Your Wishlist
        </RevealText>
        <div className="gold-divider mt-6" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="text-center text-ink/60">
          Could not load your wishlist right now. Please try again in a moment.
        </p>
      ) : !data || data.length === 0 ? (
        <div className="flex flex-col items-center gap-6 py-16 text-center">
          <p className="text-ink/60">You haven't saved anything yet.</p>
          <Button asChild size="lg">
            <Link to="/products">Browse Collection</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
          {data.map((product) => (
            <WishlistCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
