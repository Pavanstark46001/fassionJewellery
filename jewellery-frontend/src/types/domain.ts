/**
 * Frontend-only domain types that are not a direct 1:1 mirror of the API,
 * used for view-model shaping, static/demo content, and UI state.
 */

export interface NavLink {
  label: string
  href: string
}

export interface Testimonial {
  id: string
  name: string
  location: string
  quote: string
  rating: number
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface InstagramPost {
  id: string
  imageUrl: string
  link: string
}

export interface FooterLinkColumn {
  title: string
  links: NavLink[]
}

export type CursorVariant = 'default' | 'hover' | 'text' | 'hidden'
