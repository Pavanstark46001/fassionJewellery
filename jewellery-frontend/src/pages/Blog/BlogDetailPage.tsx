import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useBlogPost } from '@/hooks/useBlog'
import { useDocumentHead } from '@/hooks/useDocumentHead'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatPageTitle } from '@/lib/utils'

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data: post, isLoading, isError } = useBlogPost(slug)

  useDocumentHead({
    title: post ? formatPageTitle(post.metaTitle, post.title) : 'The Journal | Sri Sai Fashion Jewellery',
    description: post?.metaDescription ?? post?.excerpt ?? undefined,
    ogImage: post?.coverImageUrl,
    ogType: 'article',
    canonicalPath: slug ? `/blog/${slug}` : undefined,
    structuredData: post
      ? {
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          image: post.coverImageUrl ?? undefined,
          author: post.authorName ? { '@type': 'Person', name: post.authorName } : undefined,
          datePublished: post.publishedDate,
          description: post.metaDescription ?? post.excerpt ?? undefined,
        }
      : null,
  })

  if (isLoading) {
    return (
      <div className="section-padding mx-auto max-w-[900px]">
        <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
        <Skeleton className="mt-8 h-4 w-32" />
        <Skeleton className="mt-3 h-10 w-3/4" />
        <Skeleton className="mt-8 h-40 w-full" />
      </div>
    )
  }

  if (isError || !post) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 py-32 text-center">
        <h1 className="text-3xl text-ink">We couldn&apos;t find that story.</h1>
        <p className="max-w-md text-ink/60">It may have been unpublished or moved. Explore the rest of the journal instead.</p>
        <Button asChild size="lg">
          <Link to="/blog">Back to the Journal</Link>
        </Button>
      </div>
    )
  }

  return (
    <article className="section-padding mx-auto max-w-[900px]">
      <Link
        to="/blog"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-ink/50 transition-colors hover:text-gold-dark"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Back to the Journal
      </Link>

      {post.coverImageUrl && (
        <div className="mt-8 aspect-[16/9] w-full overflow-hidden rounded-2xl bg-white shadow-[0_2px_8px_rgba(10,10,10,0.04),0_12px_32px_-12px_rgba(10,10,10,0.12)]">
          <img src={post.coverImageUrl} alt={post.title} className="h-full w-full object-cover" />
        </div>
      )}

      <span className="mt-8 block text-xs uppercase tracking-[0.2em] text-ink/40">
        {formatDate(post.publishedDate)}
        {post.authorName ? ` · By ${post.authorName}` : ''}
      </span>
      <h1 className="mt-3 font-serif text-3xl text-ink md:text-4xl">{post.title}</h1>
      <div className="gold-divider mt-6" />

      {/* The backend serves plain text (verified via a live sample: no HTML tags, no
          markdown syntax) — `whitespace-pre-wrap` preserves the author's paragraph
          breaks (blank lines) and line breaks without dangerouslySetInnerHTML. */}
      <div className="mt-10 whitespace-pre-wrap text-base leading-relaxed text-ink/75">{post.content}</div>

      <div className="mt-16 border-t border-black/5 pt-8">
        <Button asChild variant="outline">
          <Link to="/blog">
            <ArrowLeft className="h-4 w-4" strokeWidth={1.5} /> Back to the Journal
          </Link>
        </Button>
      </div>
    </article>
  )
}
