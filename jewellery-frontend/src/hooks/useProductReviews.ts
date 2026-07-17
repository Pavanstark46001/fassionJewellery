import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { PaginatedResponse, Review, ReviewPayload } from '@/types/api'

async function fetchReviews(slug: string, page: number, size: number): Promise<PaginatedResponse<Review>> {
  const { data } = await api.get<PaginatedResponse<Review>>(`/products/${slug}/reviews`, {
    params: { page, size },
  })
  return data
}

export function useProductReviews(slug: string | undefined, page = 0, size = 5) {
  return useQuery({
    queryKey: ['product-reviews', slug, page, size],
    queryFn: () => fetchReviews(slug as string, page, size),
    enabled: Boolean(slug),
  })
}

export function useAddReview(slug: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: ReviewPayload) => {
      const { data } = await api.post<Review>(`/products/${slug}/reviews`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['product-reviews', slug] })
      queryClient.invalidateQueries({ queryKey: ['product', slug] })
    },
  })
}
