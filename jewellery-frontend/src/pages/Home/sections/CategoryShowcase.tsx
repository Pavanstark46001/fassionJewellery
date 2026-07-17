import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCategories } from '@/hooks/useCategories'
import { resolveImage } from '@/lib/resolveImage'
import { Skeleton } from '@/components/ui/skeleton'
import { RevealText } from '@/components/common/RevealText'
import type { Category } from '@/types/api'

const FALLBACK_CATEGORIES: Category[] = [
  {
    id: 'fallback-1',
    name: 'Necklaces',
    slug: 'necklaces',
    description: 'Statement pieces for every neckline',
    imageUrl: '/images/categories/necklaces.jpg',
    displayOrder: 1,
  },
  {
    id: 'fallback-2',
    name: 'Earrings',
    slug: 'earrings',
    description: 'From subtle studs to sculptural drops',
    imageUrl: '/images/categories/earrings.jpg',
    displayOrder: 2,
  },
  {
    id: 'fallback-3',
    name: 'Bangles',
    slug: 'bangles',
    description: 'Stacked or solo, always brilliant',
    imageUrl: '/images/categories/bangles.jpg',
    displayOrder: 3,
  },
  {
    id: 'fallback-4',
    name: 'Rings',
    slug: 'rings',
    description: 'Everyday glamour, hand-finished',
    imageUrl: '/images/categories/rings.jpg',
    displayOrder: 4,
  },
]

export function CategoryShowcase() {
  const { data, isLoading, isError } = useCategories()
  const categories = !data || data.length === 0 || isError ? FALLBACK_CATEGORIES : data

  return (
    <section className="section-padding bg-ivory">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-14 flex flex-col items-center text-center">
          <RevealText as="span" className="eyebrow">
            Shop by Category
          </RevealText>
          <RevealText as="h2" delay={0.1} className="mt-4 text-4xl text-ink md:text-5xl">
            Curated for Every Story
          </RevealText>
          <div className="gold-divider mt-6" />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/5] w-full rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5 md:gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  to={`/collections/${category.slug}`}
                  data-cursor="hover"
                  className="group relative block aspect-[4/5] w-full overflow-hidden rounded-2xl bg-ink"
                >
                  <img
                    src={resolveImage(category.imageUrl, `/images/categories/${category.slug}.jpg`)}
                    alt={category.name}
                    loading="lazy"
                    className="h-full w-full scale-105 object-cover opacity-90 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-110 group-hover:opacity-100"
                    onError={(e) => {
                      e.currentTarget.onerror = null
                      e.currentTarget.src = '/images/categories/necklaces.jpg'
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent transition-opacity duration-500 group-hover:from-ink/90" />
                  <div className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-1 p-6">
                    <h3 className="font-serif text-2xl text-ivory">{category.name}</h3>
                    <span className="h-px w-0 bg-gold transition-all duration-500 group-hover:w-12" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
