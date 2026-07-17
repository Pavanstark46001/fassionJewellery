import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useHomeBanners } from '@/hooks/useHomeBanners'
import { RotatingHeroScene } from '@/components/three/RotatingHeroScene'
import { RevealText } from '@/components/common/RevealText'
import { MagneticButton } from '@/components/common/MagneticButton'
import { Button } from '@/components/ui/button'

const FALLBACK_BANNER = {
  title: 'Brilliance, Redefined',
  subtitle:
    'Hand-finished artificial jewellery crafted to hold its shine for a lifetime of occasions.',
  ctaLabel: 'Explore Collection',
  ctaUrl: '/products',
}

export function HeroSection() {
  const { data: banners } = useHomeBanners()
  const banner = banners?.[0]

  const title = banner?.title || FALLBACK_BANNER.title
  const subtitle = banner?.subtitle || FALLBACK_BANNER.subtitle
  const ctaLabel = banner?.ctaLabel || FALLBACK_BANNER.ctaLabel
  const ctaUrl = banner?.ctaUrl || FALLBACK_BANNER.ctaUrl

  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-ink pt-20">
      {/* Soft ambient gradient wash behind everything */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(201,169,97,0.16),transparent_55%),radial-gradient(circle_at_80%_75%,rgba(201,169,97,0.12),transparent_50%)]" />

      <div className="relative mx-auto grid w-full max-w-[1600px] grid-cols-1 items-center gap-12 px-6 md:px-12 lg:grid-cols-2 lg:gap-8">
        <div className="order-2 flex flex-col items-start gap-6 lg:order-1">
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="eyebrow text-gold"
          >
            The Sri Sai Edit
          </motion.span>

          <h1 className="max-w-xl text-balance font-serif text-5xl leading-[1.08] text-ivory sm:text-6xl md:text-7xl">
            <RevealText as="span" splitWords delay={0.15}>
              {title}
            </RevealText>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-md text-balance text-base leading-relaxed text-ivory/70"
          >
            {subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2"
          >
            <MagneticButton strength={30}>
              <Button asChild size="lg">
                <Link to={ctaUrl}>{ctaLabel}</Link>
              </Button>
            </MagneticButton>
          </motion.div>
        </div>

        <div className="order-1 flex items-center justify-center lg:order-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <RotatingHeroScene />
          </motion.div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.4 }}
        className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2 text-ivory/50"
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <span className="h-10 w-px bg-gradient-to-b from-gold to-transparent" />
      </motion.div>
    </section>
  )
}
