import { useRef, useState, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useFeaturedCollections } from '@/hooks/useFeaturedCollections'
import { Skeleton } from '@/components/ui/skeleton'
import { RevealText } from '@/components/common/RevealText'
import type { Collection } from '@/types/api'

const FALLBACK_COLLECTIONS: Collection[] = [
  {
    id: 'fallback-1',
    name: 'The Bridal Edit',
    slug: 'bridal-edit',
    description: 'Heirloom-inspired sets for your most radiant day.',
    imageUrl: '/images/collections/bridal-collection.jpg',
    isFeatured: true,
  },
  {
    id: 'fallback-2',
    name: 'Everyday Radiance',
    slug: 'everyday-radiance',
    description: 'Lightweight pieces designed to be worn daily.',
    imageUrl: '/images/collections/daily-wear.jpg',
    isFeatured: true,
  },
  {
    id: 'fallback-3',
    name: 'Vintage Revival',
    slug: 'vintage-revival',
    description: 'Antique-finish motifs reimagined for today.',
    imageUrl: '/images/collections/temple-jewellery.jpg',
    isFeatured: true,
  },
  {
    id: 'fallback-4',
    name: 'Minimal Line',
    slug: 'minimal-line',
    description: 'Pared-back silhouettes with quiet luxury.',
    imageUrl: '/images/collections/editors-choice.jpg',
    isFeatured: true,
  },
]

function TiltCard({ collection }: { collection: Collection }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const el = cardRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (event.clientX - rect.left) / rect.width - 0.5
    const py = (event.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: py * -8, y: px * 8 })
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 })
  }

  return (
    <Link
      to={`/products?collectionSlug=${collection.slug}`}
      data-cursor="hover"
      className="group relative block h-[28rem] w-[19rem] shrink-0 snap-start overflow-hidden rounded-3xl bg-ink shadow-[0_30px_60px_-25px_rgba(10,10,10,0.5)] sm:h-[32rem] sm:w-[22rem]"
      style={{ perspective: 1000 }}
    >
      <motion.div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="h-full w-full"
      >
        <img
          src={collection.imageUrl ?? '/images/collections/bridal-collection.jpg'}
          alt={collection.name}
          loading="lazy"
          className="h-full w-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/20 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 flex flex-col gap-3 p-8">
          <h3 className="font-serif text-3xl text-ivory">{collection.name}</h3>
          <p className="max-w-[85%] text-sm leading-relaxed text-ivory/65">
            {collection.description}
          </p>
          <span className="mt-2 flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-gold opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            Discover <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </motion.div>
    </Link>
  )
}

export function CollectionsShowcase() {
  const { data, isLoading, isError } = useFeaturedCollections()
  const collections = !data || data.length === 0 || isError ? FALLBACK_COLLECTIONS : data

  return (
    <section className="section-padding bg-ink">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <RevealText as="span" className="eyebrow text-gold">
              Featured Collections
            </RevealText>
            <RevealText as="h2" delay={0.1} className="mt-4 max-w-lg text-4xl text-ivory md:text-5xl">
              Editorial Sets, Endless Occasions
            </RevealText>
          </div>
          <p className="max-w-sm text-sm text-ivory/50">
            Swipe or scroll to explore each capsule &mdash; every set designed as a complete look.
          </p>
        </div>

        {isLoading ? (
          <div className="flex gap-6 overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[28rem] w-[19rem] shrink-0 rounded-3xl sm:h-[32rem] sm:w-[22rem]" />
            ))}
          </div>
        ) : (
          <div className="no-scrollbar flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4">
            {collections.map((collection) => (
              <TiltCard key={collection.id} collection={collection} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
