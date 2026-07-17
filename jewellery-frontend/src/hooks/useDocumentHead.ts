import { useEffect } from 'react'

export interface DocumentHeadOptions {
  title: string
  description?: string
  ogImage?: string | null
  ogType?: string
  /** Path (no origin) used to build the canonical URL, e.g. `/blog/my-post`. Defaults to the current path. */
  canonicalPath?: string
  /** A plain JS object serialized as `application/ld+json` (schema.org structured data). */
  structuredData?: Record<string, unknown> | null
}

const MANAGED_META_IDS: Record<string, { attr: 'name' | 'property'; key: string }> = {
  'seo-description': { attr: 'name', key: 'description' },
  'seo-og-title': { attr: 'property', key: 'og:title' },
  'seo-og-description': { attr: 'property', key: 'og:description' },
  'seo-og-image': { attr: 'property', key: 'og:image' },
  'seo-og-type': { attr: 'property', key: 'og:type' },
  'seo-twitter-card': { attr: 'name', key: 'twitter:card' },
}

function setMeta(id: string, content: string) {
  const { attr, key } = MANAGED_META_IDS[id]
  let tag = document.getElementById(id) as HTMLMetaElement | null
  if (!tag) {
    tag = document.createElement('meta')
    tag.id = id
    tag.setAttribute(attr, key)
    document.head.appendChild(tag)
  }
  tag.setAttribute('content', content)
}

function setCanonical(href: string) {
  let link = document.getElementById('seo-canonical') as HTMLLinkElement | null
  if (!link) {
    link = document.createElement('link')
    link.id = 'seo-canonical'
    link.setAttribute('rel', 'canonical')
    document.head.appendChild(link)
  }
  link.setAttribute('href', href)
}

function setStructuredData(json: string) {
  let script = document.getElementById('seo-structured-data') as HTMLScriptElement | null
  if (!script) {
    script = document.createElement('script')
    script.id = 'seo-structured-data'
    script.setAttribute('type', 'application/ld+json')
    document.head.appendChild(script)
  }
  script.textContent = json
}

const DEFAULT_TITLE = 'Sri Sai Fashion Jewellery | Fine Artificial Jewellery'

/**
 * Lightweight, dependency-free document `<head>` manager for this client-side-rendered
 * SPA. Sets `document.title` and creates/updates a fixed set of meta tags (by stable
 * `id`) on every mount/update so re-renders patch tags in place instead of duplicating
 * them.
 *
 * Important honesty note: this genuinely helps clients that execute JS before reading
 * `<head>` (most modern crawlers, and link-unfurlers that fetch dynamically), but it is
 * NOT a substitute for server-side rendering or prerendering — a crawler that only reads
 * the initial HTML response will still see the static `index.html` tags. That gap is out
 * of scope for this sprint; this hook is "the best a CSR app can do" without an SSR layer.
 */
export function useDocumentHead(options: DocumentHeadOptions) {
  const { title, description, ogImage, ogType = 'website', canonicalPath, structuredData } = options

  useEffect(() => {
    document.title = title

    if (description) setMeta('seo-description', description)
    setMeta('seo-og-title', title)
    if (description) setMeta('seo-og-description', description)
    if (ogImage) setMeta('seo-og-image', ogImage)
    setMeta('seo-og-type', ogType)
    setMeta('seo-twitter-card', 'summary_large_image')

    const canonicalHref = `${window.location.origin}${canonicalPath ?? window.location.pathname}`
    setCanonical(canonicalHref)

    if (structuredData) {
      setStructuredData(JSON.stringify(structuredData))
    }

    return () => {
      // Reset to a sensible site-wide default so a page that unmounts without another
      // useDocumentHead call (e.g. navigating to a route that doesn't set its own head)
      // doesn't leave a stale title/description behind.
      document.title = DEFAULT_TITLE
      if (structuredData) document.getElementById('seo-structured-data')?.remove()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, description, ogImage, ogType, canonicalPath, structuredData])
}
