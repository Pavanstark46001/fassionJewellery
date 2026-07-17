import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react'
import { useProducts } from '@/hooks/useProducts'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductFilters, type ActiveFilters } from './ProductFilters'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { RevealText } from '@/components/common/RevealText'
import type { ProductQueryParams } from '@/types/api'

const SORT_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Recommended' },
  { value: 'createdAt,desc', label: 'Newest' },
  { value: 'basePrice,asc', label: 'Price: Low to High' },
  { value: 'basePrice,desc', label: 'Price: High to Low' },
]

const PAGE_SIZE = 12

export default function ProductListingPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { categorySlug: routeCategorySlug } = useParams<{ categorySlug?: string }>()
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const navigate = useNavigate()

  const page = Number(searchParams.get('page') ?? 0)
  const sort = searchParams.get('sort') ?? ''
  const q = searchParams.get('q') ?? undefined
  const categorySlug = routeCategorySlug ?? searchParams.get('categorySlug') ?? undefined
  const collectionSlug = searchParams.get('collectionSlug') ?? undefined
  const occasionSlug = searchParams.get('occasionSlug') ?? undefined
  const minPrice = searchParams.get('minPrice') ?? undefined
  const maxPrice = searchParams.get('maxPrice') ?? undefined
  const metalType = searchParams.get('metalType') ?? undefined

  const queryParams: ProductQueryParams = useMemo(
    () => ({
      page,
      size: PAGE_SIZE,
      sort: sort || undefined,
      q,
      categorySlug,
      collectionSlug,
      occasionSlug,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      metalType,
    }),
    [page, sort, q, categorySlug, collectionSlug, occasionSlug, minPrice, maxPrice, metalType],
  )

  const { data, isLoading, isError, isFetching } = useProducts(queryParams)

  function patchParams(patch: Record<string, string | number | undefined>, resetPage = true) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === '') next.delete(key)
        else next.set(key, String(value))
      }
      if (resetPage) next.delete('page')
      return next
    })
  }

  function handleFilterChange(patch: Partial<ActiveFilters>) {
    // If we're on the /collections/:categorySlug route, category is fixed by
    // the URL path — navigate to the plain /products URL instead so the
    // filter can actually change.
    if (routeCategorySlug && 'categorySlug' in patch) {
      const next = new URLSearchParams(searchParams)
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === '') next.delete(key)
        else next.set(key, String(value))
      }
      next.delete('page')
      navigate(`/products?${next.toString()}`)
      return
    }
    patchParams(patch)
  }

  function handleClearFilters() {
    if (routeCategorySlug) {
      navigate(q ? `/products?q=${encodeURIComponent(q)}` : '/products')
      return
    }
    setSearchParams(new URLSearchParams(q ? { q } : {}))
  }

  const activeFilters: ActiveFilters = { categorySlug, collectionSlug, occasionSlug, minPrice, maxPrice, metalType }
  const products = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  return (
    <div className="section-padding mx-auto max-w-[1700px]">
      <div className="mb-12 flex flex-col items-center text-center">
        <RevealText as="span" className="eyebrow">
          {q ? `Results for "${q}"` : 'The Full Collection'}
        </RevealText>
        <RevealText as="h1" delay={0.1} className="mt-4 text-4xl text-ink md:text-5xl">
          Every Piece, Handpicked
        </RevealText>
        <div className="gold-divider mt-6" />
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <ProductFilters filters={activeFilters} onChange={handleFilterChange} onClear={handleClearFilters} />
        </aside>

        <div>
          <div className="mb-8 flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-xs uppercase tracking-wider text-ink/70 lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} /> Filters
            </button>

            <p className="hidden text-sm text-ink/50 sm:block">
              {isLoading ? 'Loading…' : `${data?.totalElements ?? 0} pieces`}
            </p>

            <select
              value={sort}
              onChange={(e) => patchParams({ sort: e.target.value || undefined })}
              className="ml-auto h-10 rounded-full border border-black/10 bg-white px-4 text-xs uppercase tracking-wider text-ink/70 outline-none focus-visible:border-gold"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="flex flex-col gap-4">
                  <Skeleton className="aspect-[4/5] w-full rounded-2xl" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <p className="text-ink/60">We couldn't load products right now. Please try again shortly.</p>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-24 text-center">
              <p className="text-lg text-ink/70">No pieces match these filters.</p>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div
              className={`grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 xl:grid-cols-4 transition-opacity duration-300 ${isFetching ? 'opacity-60' : 'opacity-100'}`}
            >
              {products.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={page <= 0}
                onClick={() => patchParams({ page: page - 1 }, false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-ink/70 transition-colors hover:border-gold disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <span className="text-sm text-ink/60">
                Page {page + 1} of {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() => patchParams({ page: page + 1 }, false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-ink/70 transition-colors hover:border-gold disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {isMobileFiltersOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 z-[60] bg-ink/40 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-y-0 left-0 z-[70] w-[85%] max-w-sm overflow-y-auto bg-ivory p-6 shadow-2xl lg:hidden"
            >
              <ProductFilters
                filters={activeFilters}
                onChange={(patch) => {
                  handleFilterChange(patch)
                }}
                onClear={handleClearFilters}
                onRequestClose={() => setIsMobileFiltersOpen(false)}
              />
              <Button className="mt-6 w-full" onClick={() => setIsMobileFiltersOpen(false)}>
                Show Results
              </Button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
