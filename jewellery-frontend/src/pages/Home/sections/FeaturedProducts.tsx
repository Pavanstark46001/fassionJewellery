import { useFeaturedProducts } from '@/hooks/useFeaturedProducts'
import { Skeleton } from '@/components/ui/skeleton'
import { RevealText } from '@/components/common/RevealText'
import { ProductCard } from '@/components/product/ProductCard'
import type { Product } from '@/types/api'

const FALLBACK_PRODUCTS: Product[] = [
  {
    id: '-1',
    ornamentId: 'AUR-NK-1042',
    name: 'Celestine Layered Necklace',
    slug: 'celestine-layered-necklace',
    shortDescription: 'Gold-plated layered necklace with cubic zirconia accents',
    basePrice: 4200,
    discountedPrice: 3360,
    metalType: 'GOLD_PLATED',
    primaryImageUrl: '/images/products/product-necklaces.jpg',
    isFeatured: true,
  },
  {
    id: '-2',
    ornamentId: 'AUR-ER-2087',
    name: 'Ivy Drop Earrings',
    slug: 'ivy-drop-earrings',
    shortDescription: 'Rose gold-plated drop earrings, hypoallergenic',
    basePrice: 2100,
    discountedPrice: null,
    metalType: 'ROSE_GOLD_PLATED',
    primaryImageUrl: '/images/products/product-earrings.jpg',
    isFeatured: true,
  },
  {
    id: '-3',
    ornamentId: 'AUR-BG-3311',
    name: 'Meridian Stacking Bangle',
    slug: 'meridian-stacking-bangle',
    shortDescription: 'Set of 3 gold-plated stacking bangles',
    basePrice: 3600,
    discountedPrice: 2999,
    metalType: 'GOLD_PLATED',
    primaryImageUrl: '/images/products/product-bangles.jpg',
    isFeatured: true,
  },
  {
    id: '-4',
    ornamentId: 'AUR-RG-4456',
    name: 'Solitaire Halo Ring',
    slug: 'solitaire-halo-ring',
    shortDescription: 'Platinum-plated ring with halo-set stone',
    basePrice: 2800,
    discountedPrice: null,
    metalType: 'PLATINUM_PLATED',
    primaryImageUrl: '/images/products/product-rings.jpg',
    isFeatured: true,
  },
]

export function FeaturedProducts() {
  const { data, isLoading, isError } = useFeaturedProducts({ size: 8 })
  const products = !data || data.content.length === 0 || isError ? FALLBACK_PRODUCTS : data.content

  return (
    <section className="section-padding bg-ivory">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-14 flex flex-col items-center text-center">
          <RevealText as="span" className="eyebrow">
            Bestsellers
          </RevealText>
          <RevealText as="h2" delay={0.1} className="mt-4 text-4xl text-ink md:text-5xl">
            Most Coveted Pieces
          </RevealText>
          <div className="gold-divider mt-6" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-4">
                <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4">
            {products.slice(0, 8).map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
