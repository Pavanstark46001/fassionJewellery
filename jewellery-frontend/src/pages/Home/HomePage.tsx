import { HeroSection } from './sections/HeroSection'
import { CategoryIconStrip } from './sections/CategoryIconStrip'
import { CategoryShowcase } from './sections/CategoryShowcase'
import { CollectionsShowcase } from './sections/CollectionsShowcase'
import { FeaturedProducts } from './sections/FeaturedProducts'
import { StorySection } from './sections/StorySection'
import { TestimonialsSection } from './sections/TestimonialsSection'
import { InstagramFeed } from './sections/InstagramFeed'
import { NewsletterSection } from './sections/NewsletterSection'
import { FaqSection } from './sections/FaqSection'
import { useDocumentHead } from '@/hooks/useDocumentHead'

const SITE_URL = typeof window !== 'undefined' ? window.location.origin : ''

export default function HomePage() {
  useDocumentHead({
    title: 'Sri Sai Fashion Jewellery | Fine Artificial Jewellery',
    description:
      "Sri Sai Fashion Jewellery — fine artificial jewellery, hand-finished necklaces, earrings, bangles, rings and bridal sets.",
    canonicalPath: '/',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Sri Sai Fashion Jewellery',
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.svg`,
    },
  })

  return (
    <>
      <HeroSection />
      <CategoryIconStrip />
      <CategoryShowcase />
      <CollectionsShowcase />
      <FeaturedProducts />
      <StorySection />
      <TestimonialsSection />
      <InstagramFeed />
      <NewsletterSection />
      <FaqSection />
    </>
  )
}
