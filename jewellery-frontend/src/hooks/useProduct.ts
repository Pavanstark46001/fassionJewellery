import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Product, ProductDetail } from '@/types/api'

async function fetchProduct(slug: string): Promise<ProductDetail> {
  const { data } = await api.get<ProductDetail>(`/products/${slug}`)
  return data
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => fetchProduct(slug as string),
    enabled: Boolean(slug),
  })
}

async function fetchRelatedProducts(slug: string): Promise<Product[]> {
  const { data } = await api.get<Product[]>(`/products/${slug}/related`)
  return data
}

export function useRelatedProducts(slug: string | undefined) {
  return useQuery({
    queryKey: ['related-products', slug],
    queryFn: () => fetchRelatedProducts(slug as string),
    enabled: Boolean(slug),
  })
}
