import { Link } from 'react-router-dom'
import { STORE_NAME } from '@/lib/utils'
import type { FooterLinkColumn } from '@/types/domain'

const COLUMNS: FooterLinkColumn[] = [
  {
    title: 'Shop',
    links: [
      { label: 'Necklaces', href: '/products?categorySlug=necklaces' },
      { label: 'Earrings', href: '/products?categorySlug=earrings' },
      { label: 'Bangles', href: '/products?categorySlug=bangles' },
      { label: 'Rings', href: '/products?categorySlug=rings' },
      { label: 'Bridal Edit', href: '/products?categorySlug=bridal-sets' },
    ],
  },
  {
    title: 'Company',
    links: [
      // No standalone About page exists yet this sprint — the Journal is the closest
      // real destination for brand-story content, so these two point there instead
      // of a dead "/" placeholder.
      { label: 'Our Story', href: '/blog' },
      { label: 'Craftsmanship', href: '/blog' },
      { label: 'Sustainability', href: '/' },
      { label: 'Careers', href: '/' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Contact Us', href: '/' },
      { label: 'Shipping & Returns', href: '/pages/shipping-policy' },
      { label: 'Returns & Refunds', href: '/pages/return-policy' },
      { label: 'Jewellery Care', href: '/' },
      { label: 'FAQs', href: '/' },
    ],
  },
]

const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '/pages/privacy-policy' },
  { label: 'Terms of Service', href: '/pages/terms-of-service' },
]

const SOCIALS = [
  { label: 'Instagram', initials: 'IG', href: 'https://instagram.com' },
  { label: 'Facebook', initials: 'FB', href: 'https://facebook.com' },
  { label: 'Pinterest', initials: 'PN', href: 'https://pinterest.com' },
  { label: 'Twitter', initials: 'X', href: 'https://twitter.com' },
]

export function Footer() {
  return (
    <footer className="border-t border-gold/25 bg-ink text-ivory">
      <div className="mx-auto max-w-[1600px] px-6 py-20 md:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <Link to="/" className="flex flex-col leading-none text-ivory">
              <span className="font-serif text-2xl tracking-[0.1em]">SRI SAI</span>
              <span className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.28em] text-gold">
                Fashion Jewellery
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ivory/60">
              Fine artificial jewellery, hand-finished for those who believe brilliance
              shouldn&apos;t come with compromise.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {SOCIALS.map(({ label, initials, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/15 text-[10px] font-medium tracking-wide text-ivory/70 transition-colors duration-300 hover:border-gold hover:text-gold"
                >
                  {initials}
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h4 className="eyebrow text-gold">{column.title}</h4>
              <ul className="mt-5 flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-ivory/60 transition-colors duration-300 hover:text-ivory"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-ivory/10 pt-8 text-xs text-ivory/40 md:flex-row">
          <p>&copy; {new Date().getFullYear()} {STORE_NAME}. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {LEGAL_LINKS.map((link) => (
              <Link key={link.label} to={link.href} className="text-ivory/40 transition-colors duration-300 hover:text-ivory">
                {link.label}
              </Link>
            ))}
          </div>
          <p>Crafted with intention &mdash; artificial jewellery, real artistry.</p>
        </div>
      </div>
    </footer>
  )
}
