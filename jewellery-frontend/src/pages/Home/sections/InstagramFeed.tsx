import { motion } from 'framer-motion'
import { Camera } from 'lucide-react'
import { RevealText } from '@/components/common/RevealText'
import type { InstagramPost } from '@/types/domain'

const INSTAGRAM_IMAGE_POOL = [
  '/images/products/product-necklaces.jpg',
  '/images/products/product-earrings.jpg',
  '/images/products/product-bangles.jpg',
  '/images/products/product-rings.jpg',
  '/images/products/product-bridal-sets.jpg',
  '/images/categories/necklaces.jpg',
  '/images/categories/earrings.jpg',
  '/images/categories/bangles.jpg',
]

const INSTAGRAM_POSTS: InstagramPost[] = Array.from({ length: 8 }).map((_, i) => ({
  id: `ig-${i}`,
  imageUrl: INSTAGRAM_IMAGE_POOL[i % INSTAGRAM_IMAGE_POOL.length],
  link: 'https://instagram.com',
}))

export function InstagramFeed() {
  return (
    <section className="section-padding bg-ivory">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-12 flex flex-col items-center text-center">
          <RevealText as="span" className="eyebrow">
            Follow Along
          </RevealText>
          <RevealText
            as="h2"
            delay={0.1}
            className="mt-4 flex items-center gap-3 text-4xl text-ink md:text-5xl"
          >
            <Camera className="h-8 w-8 text-gold" strokeWidth={1.5} />
            @srisaifashionjewellery
          </RevealText>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:gap-3">
          {INSTAGRAM_POSTS.map((post, index) => (
            <motion.a
              key={post.id}
              href={post.link}
              target="_blank"
              rel="noreferrer"
              data-cursor="hover"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: (index % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="group relative aspect-square overflow-hidden rounded-xl"
            >
              <img
                src={post.imageUrl}
                alt="Sri Sai Fashion Jewellery on Instagram"
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition-all duration-300 group-hover:bg-ink/40 group-hover:opacity-100">
                <Camera className="h-6 w-6 text-ivory" strokeWidth={1.5} />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  )
}
