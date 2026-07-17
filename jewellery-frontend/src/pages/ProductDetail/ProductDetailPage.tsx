import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Heart, Minus, Plus, ShoppingBag, Star } from 'lucide-react'
import { useProduct, useRelatedProducts } from '@/hooks/useProduct'
import { useAuth } from '@/hooks/useAuth'
import { useAddToWishlist, useIsWishlisted, useRemoveFromWishlist } from '@/hooks/useWishlist'
import { useDocumentHead } from '@/hooks/useDocumentHead'
import { useAppDispatch } from '@/store/hooks'
import { addToCart } from '@/store/cartSlice'
import { ProductGallery } from './ProductGallery'
import { ReviewsSection } from './ReviewsSection'
import { ProductCard } from '@/components/product/ProductCard'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { cn, formatPageTitle, formatPrice } from '@/lib/utils'
import { formatMetalType } from '@/lib/metalType'

/** Maps the storefront's `StockStatus` to the schema.org `Offer.availability` vocabulary. */
const AVAILABILITY_MAP: Record<string, string> = {
  IN_STOCK: 'https://schema.org/InStock',
  LOW_STOCK: 'https://schema.org/LimitedAvailability',
  OUT_OF_STOCK: 'https://schema.org/OutOfStock',
  COMING_SOON: 'https://schema.org/PreOrder',
}

export default function ProductDetailPage() {
  const { productSlug } = useParams<{ productSlug: string }>()
  const { data: product, isLoading, isError } = useProduct(productSlug)
  const { data: related } = useRelatedProducts(productSlug)
  const [quantity, setQuantity] = useState(1)

  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAuth()
  const wishlisted = useIsWishlisted(product?.id)
  const addWishlist = useAddToWishlist()
  const removeWishlist = useRemoveFromWishlist()

  useDocumentHead({
    title: product ? formatPageTitle(product.metaTitle, product.name) : 'Sri Sai Fashion Jewellery',
    description: product?.metaDescription ?? product?.shortDescription ?? undefined,
    ogImage: product?.primaryImageUrl ?? product?.images?.find(img => img.isPrimary)?.imageUrl ?? product?.images?.[0]?.imageUrl ?? undefined,
    ogType: 'product',
    canonicalPath: productSlug ? `/products/${productSlug}` : undefined,
    structuredData: product
      ? {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: product.primaryImageUrl ?? product.images?.[0]?.imageUrl ?? undefined,
          description: product.metaDescription ?? product.shortDescription ?? product.description ?? undefined,
          offers: {
            '@type': 'Offer',
            price: product.discountedPrice ?? product.basePrice,
            priceCurrency: 'INR',
            availability: AVAILABILITY_MAP[product.stockStatus] ?? 'https://schema.org/InStock',
          },
        }
      : null,
  })

  if (isLoading) {
    return (
      <div className="section-padding mx-auto max-w-[1400px]">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
          <div className="flex flex-col gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-6 h-32 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 py-32 text-center">
        <h1 className="text-3xl text-ink">We couldn't find that piece.</h1>
        <p className="max-w-md text-ink/60">
          It may have sold out or moved. Explore the rest of the collection instead.
        </p>
        <Button asChild size="lg">
          <Link to="/products">Browse Collection</Link>
        </Button>
      </div>
    )
  }

  const hasDiscount = product.discountedPrice != null && product.discountedPrice < product.basePrice
  const inStock = product.stockStatus === 'IN_STOCK' || product.stockStatus === 'LOW_STOCK'
  const stockLabel =
    product.stockStatus === 'OUT_OF_STOCK'
      ? 'Out of Stock'
      : product.stockStatus === 'COMING_SOON'
        ? 'Coming Soon'
        : product.stockStatus === 'LOW_STOCK'
          ? 'Low Stock'
          : 'In Stock'
  const maxQuantity = 10

  function handleAddToCart() {
    if (!product) return
    const primaryImageUrl =
      product.primaryImageUrl ??
      product.images.find((image) => image.isPrimary)?.imageUrl ??
      product.images[0]?.imageUrl ??
      null
    dispatch(addToCart({ ...product, primaryImageUrl }, quantity))
    toast.success(`${product.name} added to your bag.`)
  }

  function handleWishlistToggle() {
    if (!product) return
    if (!isAuthenticated) {
      toast.error('Please log in to save items to your wishlist.')
      return
    }
    if (wishlisted) {
      removeWishlist.mutate(product.id)
    } else {
      addWishlist.mutate(product.id, { onSuccess: () => toast.success('Added to wishlist.') })
    }
  }

  return (
    <div className="section-padding mx-auto max-w-[1400px]">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        <ProductGallery images={product.images ?? []} primaryImageUrl={product.primaryImageUrl} name={product.name} />

        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.2em] text-ink/40">{product.ornamentId}</span>
          <h1 className="mt-3 font-serif text-3xl text-ink md:text-4xl">{product.name}</h1>

          {product.reviewCount > 0 && (
            <a href="#reviews" className="mt-3 flex items-center gap-2 text-sm text-ink/60 hover:text-gold-dark">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-gold text-gold" strokeWidth={1.5} />
                {product.averageRating?.toFixed(1) ?? '—'}
              </span>
              <span className="underline underline-offset-4">{product.reviewCount} reviews</span>
            </a>
          )}

          <div className="mt-6 flex items-center gap-3">
            {hasDiscount ? (
              <>
                <span className="font-serif text-2xl text-gold-dark">{formatPrice(product.discountedPrice)}</span>
                <span className="text-lg text-ink/40 line-through">{formatPrice(product.basePrice)}</span>
              </>
            ) : (
              <span className="font-serif text-2xl text-ink">{formatPrice(product.basePrice)}</span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <Badge variant={inStock ? 'success' : 'danger'} size="pill">
              {stockLabel}
            </Badge>
            <Badge variant="outline" size="pill">
              {formatMetalType(product.metalType)}
            </Badge>
          </div>

          {product.shortDescription && <p className="mt-6 leading-relaxed text-ink/65">{product.shortDescription}</p>}
          {product.description && <p className="mt-3 leading-relaxed text-ink/65">{product.description}</p>}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full border border-black/10">
              <button
                type="button"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                className="flex h-12 w-12 items-center justify-center text-ink/70 hover:text-gold-dark disabled:opacity-30"
              >
                <Minus className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <span className="w-10 text-center text-sm text-ink">{quantity}</span>
              <button
                type="button"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
                disabled={quantity >= maxQuantity}
                className="flex h-12 w-12 items-center justify-center text-ink/70 hover:text-gold-dark disabled:opacity-30"
              >
                <Plus className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>

            <button
              type="button"
              aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              onClick={handleWishlistToggle}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/10 text-ink/70 transition-colors hover:border-gold hover:text-gold-dark"
            >
              <Heart className={cn('h-5 w-5', wishlisted && 'fill-gold-dark text-gold-dark')} strokeWidth={1.5} />
            </button>

            <Button
              size="lg"
              className="w-full flex-1 gap-2 sm:w-auto"
              disabled={!inStock}
              onClick={handleAddToCart}
            >
              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} /> Add to Cart
            </Button>
          </div>

          <div className="mt-10 border-t border-black/5 pt-8">
            <h3 className="font-serif text-lg text-ink">Specifications</h3>
            <dl className="mt-4 grid grid-cols-2 gap-y-3 text-sm">
              <dt className="text-ink/50">Ornament ID</dt>
              <dd className="text-ink/80">{product.ornamentId}</dd>
              <dt className="text-ink/50">Metal Type</dt>
              <dd className="text-ink/80">{formatMetalType(product.metalType)}</dd>
              {product.weightGrams != null && (
                <>
                  <dt className="text-ink/50">Weight</dt>
                  <dd className="text-ink/80">{product.weightGrams} g</dd>
                </>
              )}
              {product.categoryName && (
                <>
                  <dt className="text-ink/50">Category</dt>
                  <dd className="text-ink/80">{product.categoryName}</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>

      {productSlug && <ReviewsSection key={productSlug} slug={productSlug} />}

      {related && related.length > 0 && (
        <section className="mt-24 border-t border-black/5 pt-16">
          <h2 className="mb-10 font-serif text-3xl text-ink">You May Also Like</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-4">
            {related.map((item, index) => (
              <ProductCard key={item.id} product={item} index={index} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
