import { useParams } from 'react-router-dom'
import { useStaticPage } from '@/hooks/useStaticPage'
import { useDocumentHead } from '@/hooks/useDocumentHead'
import { Skeleton } from '@/components/ui/skeleton'
import NotFoundPage from '@/pages/NotFound/NotFoundPage'
import { formatPageTitle } from '@/lib/utils'

/**
 * Single reusable component for every public static/legal page (privacy policy,
 * terms of service, shipping policy, return policy, ...) — `GET /pages/:slug`.
 */
export default function StaticPageView() {
  const { slug } = useParams<{ slug: string }>()
  const { data: page, isLoading, isError } = useStaticPage(slug)

  useDocumentHead({
    title: page ? formatPageTitle(page.metaTitle, page.title) : 'Sri Sai Fashion Jewellery',
    description: page?.metaDescription ?? undefined,
    canonicalPath: slug ? `/pages/${slug}` : undefined,
  })

  if (isLoading) {
    return (
      <div className="section-padding mx-auto max-w-[800px]">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-10 w-2/3" />
        <Skeleton className="mt-8 h-64 w-full" />
      </div>
    )
  }

  if (isError || !page) {
    return <NotFoundPage />
  }

  return (
    <article className="section-padding mx-auto max-w-[800px]">
      <span className="eyebrow">Sri Sai Fashion Jewellery</span>
      <h1 className="mt-4 font-serif text-3xl text-ink md:text-4xl">{page.title}</h1>
      <div className="gold-divider mt-6" />

      {/* The backend serves plain text (verified via a live sample: no HTML tags, no
          markdown syntax) — `whitespace-pre-wrap` preserves the author's paragraph
          breaks (blank lines) and line breaks without dangerouslySetInnerHTML. */}
      <div className="mt-10 whitespace-pre-wrap text-base leading-relaxed text-ink/75">{page.content}</div>
    </article>
  )
}
