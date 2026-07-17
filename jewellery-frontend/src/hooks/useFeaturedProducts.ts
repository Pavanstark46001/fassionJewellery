import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { PaginatedResponse, Product } from '@/types/api'

interface UseFeaturedProductsOptions {
  page?: number
  size?: number
}

async function fetchFeaturedProducts(
  options: UseFeaturedProductsOptions,
): Promise<PaginatedResponse<Product>> {
  const { data } = await api.get<PaginatedResponse<Product>>('/products', {
    params: { featured: true, page: options.page ?? 0, size: options.size ?? 8 },
  })
  return data
}

export function useFeaturedProducts(options: UseFeaturedProductsOptions = {}) {
  const { page = 0, size = 8 } = options
  return useQuery({
    queryKey: ['products', { featured: true, page, size }],
    queryFn: () => fetchFeaturedProducts({ page, size }),
  })
}
