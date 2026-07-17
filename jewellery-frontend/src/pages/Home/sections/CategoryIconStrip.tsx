import { Link } from 'react-router-dom'
import { useCategories } from '@/hooks/useCategories'
import { resolveImage } from '@/lib/resolveImage'
import { Skeleton } from '@/components/ui/skeleton'

export function CategoryIconStrip() {
  const { data, isLoading, isError } = useCategories()

  if (isError || (!isLoading && (!data || data.length === 0))) return null

  return (
    <section className="border-b border-ink/10 bg-ivory py-10">
      <div className="mx-auto max-w-[1600px] px-6">
        <div
          className="flex gap-8 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:justify-center [&::-webkit-scrollbar]:hidden"
        >
          {isLoading
            ? Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex shrink-0 flex-col items-center gap-3">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <Skeleton className="h-3 w-14 rounded" />
                </div>
              ))
            : data!.map((category) => (
                <Link
                  key={category.id}
                  to={`/collections/${category.slug}`}
                  data-cursor="hover"
                  className="group flex shrink-0 flex-col items-center gap-3"
                >
                  <span className="block h-16 w-16 overflow-hidden rounded-full ring-1 ring-ink/10 transition-all duration-300 group-hover:ring-gold">
                    <img
                      src={resolveImage(category.imageUrl, `/images/categories/${category.slug}.jpg`)}
                      alt={category.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.onerror = null
                        e.currentTarget.src = '/images/categories/necklaces.jpg'
                      }}
                    />
                  </span>
                  <span className="whitespace-nowrap text-sm text-ink/80 transition-colors group-hover:text-ink">
                    {category.name}
                  </span>
                </Link>
              ))}
        </div>
      </div>
    </section>
  )
}
