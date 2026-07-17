import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'
import { RevealText } from '@/components/common/RevealText'
import type { Testimonial } from '@/types/domain'

const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Ananya Rao',
    location: 'Bengaluru',
    quote:
      'The finish rivals pieces ten times the price. Six months in and my Celestine necklace still looks brand new.',
    rating: 5,
  },
  {
    id: 't2',
    name: 'Priya Nair',
    location: 'Mumbai',
    quote:
      'Wore the Bridal Edit set for my reception and got asked all night where it was from. Nobody believed it was artificial.',
    rating: 5,
  },
  {
    id: 't3',
    name: 'Meera Iyer',
    location: 'Chennai',
    quote:
      'Lightweight, hypoallergenic, and genuinely beautiful. Sri Sai Fashion Jewellery has my whole jewellery box now.',
    rating: 5,
  },
  {
    id: 't4',
    name: 'Kavya Menon',
    location: 'Hyderabad',
    quote:
      'The packaging alone felt like a gift. The Meridian bangles have become an everyday staple for me.',
    rating: 4,
  },
  {
    id: 't5',
    name: 'Diya Sharma',
    location: 'Delhi',
    quote: 'Customer care helped me pick the perfect earrings for my skin tone. Small touches like that matter.',
    rating: 5,
  },
]

export function TestimonialsSection() {
  const [index, setIndex] = useState(0)
  const testimonial = TESTIMONIALS[index]

  function goTo(direction: 1 | -1) {
    setIndex((current) => (current + direction + TESTIMONIALS.length) % TESTIMONIALS.length)
  }

  return (
    <section className="section-padding bg-ivory">
      <div className="mx-auto max-w-3xl text-center">
        <RevealText as="span" className="eyebrow">
          Loved By Many
        </RevealText>
        <RevealText as="h2" delay={0.1} className="mt-4 text-4xl text-ink md:text-5xl">
          Words From Our Clientele
        </RevealText>

        <div className="relative mt-16 flex min-h-[16rem] flex-col items-center justify-center gap-6">
          <Quote className="h-10 w-10 text-gold/50" strokeWidth={1} />

          <AnimatePresence mode="wait">
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center gap-5"
            >
              <p className="max-w-xl text-balance font-serif text-2xl italic leading-relaxed text-ink md:text-3xl">
                &ldquo;{testimonial.quote}&rdquo;
              </p>
              <div className="flex items-center gap-1" aria-label={`${testimonial.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < testimonial.rating ? 'fill-gold text-gold' : 'text-ink/15'
                    }`}
                  />
                ))}
              </div>
              <div className="flex flex-col items-center gap-1">
                <span className="font-medium text-ink">{testimonial.name}</span>
                <span className="text-xs uppercase tracking-[0.2em] text-ink/40">
                  {testimonial.location}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center gap-6">
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={() => goTo(-1)}
              data-cursor="hover"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-ink/60 transition-colors duration-300 hover:border-gold hover:text-gold-dark"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {TESTIMONIALS.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`Go to testimonial ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? 'w-6 bg-gold' : 'w-1.5 bg-ink/15'
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={() => goTo(1)}
              data-cursor="hover"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/30 text-ink/60 transition-colors duration-300 hover:border-gold hover:text-gold-dark"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
