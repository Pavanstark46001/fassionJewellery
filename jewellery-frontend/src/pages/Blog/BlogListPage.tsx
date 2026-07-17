import { Link, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useBlogList } from '@/hooks/useBlog'
import { useDocumentHead } from '@/hooks/useDocumentHead'
import { RevealText } from '@/components/common/RevealText'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/utils'

const PAGE_SIZE = 9

export default function BlogListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const page = Number(searchParams.get('page') ?? 0)

  const { data, isLoading, isError, isFetching } = useBlogList({ page, size: PAGE_SIZE })

  useDocumentHead({
    title: 'The Journal | Sri Sai Fashion Jewellery',
    description: 'Styling guides, bridal edits, and jewellery care tips from Sri Sai Fashion Jewellery.',
    canonicalPath: '/blog',
  })

  const posts = data?.content ?? []
  const totalPages = data?.totalPages ?? 0

  function goToPage(next: number) {
    setSearchParams((prev) => {
      const params = new URLSearchParams(prev)
      if (next <= 0) params.delete('page')
      else params.set('page', String(next))
      return params
    })
  }

  return (
    <div className="section-padding mx-auto max-w-[1400px]">
      <div className="mb-16 flex flex-col items-center text-center">
        <RevealText as="span" className="eyebrow">
          The Journal
        </RevealText>
        <RevealText as="h1" delay={0.1} className="mt-4 text-4xl text-ink md:text-5xl">
          Stories &amp; Styling
        </RevealText>
        <div className="gold-divider mt-6" />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-4">
              <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-5 w-3/4" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="py-24 text-center text-ink/60">We couldn&apos;t load the journal right now. Please try again shortly.</p>
      ) : posts.length === 0 ? (
        <p className="py-24 text-center text-ink/60">No stories published yet — check back soon.</p>
      ) : (
        <div
          className={`grid grid-cols-1 gap-x-8 gap-y-14 md:grid-cols-2 xl:grid-cols-3 transition-opacity duration-300 ${isFetching ? 'opacity-60' : 'opacity-100'}`}
        >
          {posts.map((post, index) => (
            <RevealText key={post.id} as="article" delay={(index % 3) * 0.08}>
              <Link to={`/blog/${post.slug}`} data-cursor="hover" className="group block">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(10,10,10,0.04),0_12px_32px_-12px_rgba(10,10,10,0.12)]">
                  <img
                    src={post.coverImageUrl ?? '/images/blog/kundan-work-cover.jpg'}
                    alt={post.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                </div>
                <div className="mt-5 flex flex-col gap-2">
                  <span className="text-[11px] uppercase tracking-[0.15em] text-ink/40">
                    {formatDate(post.publishedDate)}
                    {post.authorName ? ` · ${post.authorName}` : ''}
                  </span>
                  <h2 className="font-serif text-xl text-ink transition-colors group-hover:text-gold-dark">
                    {post.title}
                  </h2>
                  {post.excerpt && <p className="text-sm leading-relaxed text-ink/60">{post.excerpt}</p>}
                </div>
              </Link>
            </RevealText>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-16 flex items-center justify-center gap-4">
          <button
            type="button"
            disabled={page <= 0}
            onClick={() => goToPage(page - 1)}
            aria-label="Previous page"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-ink/70 transition-colors hover:border-gold disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
          </button>
          <span className="text-sm text-ink/60">
            Page {page + 1} of {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages - 1}
            onClick={() => goToPage(page + 1)}
            aria-label="Next page"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-ink/70 transition-colors hover:border-gold disabled:pointer-events-none disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  )
}
