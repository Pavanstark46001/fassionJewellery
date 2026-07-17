import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import { useAddReview, useProductReviews } from '@/hooks/useProductReviews'
import { useAuth } from '@/hooks/useAuth'
import { StarRating } from '@/components/product/StarRating'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { Review } from '@/types/api'

const PAGE_SIZE = 5

function ReviewCard({ review }: { review: Review }) {
  return (
    <div className="border-b border-black/5 py-6 first:pt-0">
      <div className="flex items-center justify-between gap-4">
        <StarRating value={review.rating} size={14} />
        <span className="text-xs text-ink/40">{new Date(review.createdDate).toLocaleDateString()}</span>
      </div>
      <h4 className="mt-3 font-serif text-base text-ink">{review.title}</h4>
      <p className="mt-1 text-sm leading-relaxed text-ink/65">{review.comment}</p>
      {review.reviewerName && (
        <p className="mt-2 text-xs uppercase tracking-wider text-ink/40">{review.reviewerName}</p>
      )}
    </div>
  )
}

function WriteReviewForm({ slug }: { slug: string }) {
  const [rating, setRating] = useState(0)
  const [title, setTitle] = useState('')
  const [comment, setComment] = useState('')
  const addReview = useAddReview(slug)

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (rating === 0) {
      toast.error('Please select a star rating.')
      return
    }
    if (!title.trim() || !comment.trim()) {
      toast.error('Please add a title and comment.')
      return
    }
    addReview.mutate(
      { rating, title: title.trim(), comment: comment.trim() },
      {
        onSuccess: () => {
          toast.success('Thank you — your review has been posted.')
          setRating(0)
          setTitle('')
          setComment('')
        },
        onError: (error) => toast.error(error?.message ?? 'Could not submit your review.'),
      },
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mb-10 flex flex-col gap-4 rounded-2xl border border-black/5 bg-white p-6">
      <h4 className="font-serif text-lg text-ink">Write a Review</h4>
      <StarRating value={rating} onChange={setRating} size={22} />
      <Input placeholder="Review title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea
        placeholder="Share your experience with this piece…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        className="w-full rounded-2xl border border-black/10 bg-white px-6 py-4 text-sm text-ink placeholder:text-ink/40 outline-none transition-colors duration-300 focus-visible:border-gold focus-visible:ring-2 focus-visible:ring-gold/20"
      />
      <Button type="submit" disabled={addReview.isPending} className="self-start">
        {addReview.isPending ? 'Submitting…' : 'Submit Review'}
      </Button>
    </form>
  )
}

export function ReviewsSection({ slug }: { slug: string }) {
  const [page, setPage] = useState(0)
  const [allReviews, setAllReviews] = useState<Review[]>([])
  const { data, isLoading, isFetching } = useProductReviews(slug, page, PAGE_SIZE)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!data) return
    setAllReviews((prev) => (page === 0 ? data.content : [...prev, ...data.content]))
  }, [data, page])

  const hasMore = data ? page + 1 < data.totalPages : false

  return (
    <section id="reviews" className="mt-24 scroll-mt-28 border-t border-black/5 pt-16">
      <h2 className="font-serif text-3xl text-ink">Reviews</h2>

      {isAuthenticated ? (
        <div className="mt-8">
          <WriteReviewForm slug={slug} />
        </div>
      ) : (
        <p className="mt-6 text-sm text-ink/60">
          <Link to="/login" state={{ from: `/products/${slug}` }} className="text-gold-dark underline underline-offset-4">
            Sign in
          </Link>{' '}
          to write a review.
        </p>
      )}

      <div className="mt-8">
        {isLoading && page === 0 ? (
          <div className="flex flex-col gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : allReviews.length === 0 ? (
          <p className="text-sm text-ink/50">No reviews yet — be the first to share your thoughts.</p>
        ) : (
          <div className="flex flex-col">
            {allReviews.map((review) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        )}

        {hasMore && (
          <Button
            type="button"
            variant="outline"
            className="mt-6"
            disabled={isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            {isFetching ? 'Loading…' : 'Load More Reviews'}
          </Button>
        )}
      </div>
    </section>
  )
}
