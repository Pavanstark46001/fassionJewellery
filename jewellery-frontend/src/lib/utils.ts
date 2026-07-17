import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind class lists safely (shadcn-style helper). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const BRAND_SUFFIX = 'Sri Sai Fashion Jewellery'

/**
 * Builds a <title> string for a detail page. CMS-authored `metaTitle` values
 * (products, blog posts, static pages) are already fully formatted with the
 * brand suffix baked in — use them as-is. Only the plain fallback name needs
 * the suffix appended.
 */
export function formatPageTitle(metaTitle: string | null | undefined, fallbackName: string): string {
  if (metaTitle && metaTitle.trim().length > 0) return metaTitle
  return `${fallbackName} | ${BRAND_SUFFIX}`
}

/** Format a numeric price (assumed INR) as a luxury-friendly currency string. */
export function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) return ''
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value)
}

/** Simple email validation for client-side-only forms (newsletter). */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  COD: 'Cash on Delivery',
  ONLINE: 'Pay Online',
  CASH: 'Cash',
  CARD: 'Card',
}

/** Human-readable label for an order's payment method (covers WEB and POS channels). */
export function formatPaymentMethod(method: string | null | undefined): string {
  if (!method) return ''
  return PAYMENT_METHOD_LABELS[method] ?? method
}

/** Format an ISO timestamp (e.g. order.placedAt) as a readable date. */
export function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}
