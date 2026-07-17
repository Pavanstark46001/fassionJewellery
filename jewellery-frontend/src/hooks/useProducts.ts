import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { PaginatedResponse, Product, ProductQueryParams } from '@/types/api'

async function fetchProducts(params: ProductQueryParams): Promise<PaginatedResponse<Product>> {
  const { data } = await api.get<PaginatedResponse<Product>>('/products', { params })
  return data
}

/** General product listing query, driven by whatever filters the page has parsed from the URL. */
export function useProducts(params: ProductQueryParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    placeholderData: keepPreviousData,
  })
}
