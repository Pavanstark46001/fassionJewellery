import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { useAuth } from './useAuth'
import type { Product } from '@/types/api'

/** GET /wishlist resolves to the wishlisted products directly, not a wrapper. */
async function fetchWishlist(): Promise<Product[]> {
  const { data } = await api.get<Product[]>('/wishlist')
  return data
}

/** Wishlist requires auth — the query simply stays disabled (and empty) for guests. */
export function useWishlistQuery() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['wishlist'],
    queryFn: fetchWishlist,
    enabled: isAuthenticated,
  })
}

export function useIsWishlisted(productId: string | undefined) {
  const { data } = useWishlistQuery()
  if (!productId) return false
  return Boolean(data?.some((product) => product.id === productId))
}

export function useAddToWishlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (productId: string) => api.post('/wishlist/items', { productId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  })
}

export function useRemoveFromWishlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (productId: string) => api.delete(`/wishlist/items/${productId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['wishlist'] }),
  })
}
