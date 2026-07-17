import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Collection } from '@/types/api'

async function fetchFeaturedCollections(): Promise<Collection[]> {
  const { data } = await api.get<Collection[]>('/collections', {
    params: { featured: true },
  })
  return data
}

export function useFeaturedCollections() {
  return useQuery({
    queryKey: ['collections', { featured: true }],
    queryFn: fetchFeaturedCollections,
  })
}
