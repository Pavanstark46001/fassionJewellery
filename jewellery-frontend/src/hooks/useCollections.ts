import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Collection } from '@/types/api'

async function fetchCollections(): Promise<Collection[]> {
  const { data } = await api.get<Collection[]>('/collections')
  return data
}

/** All collections (not just featured) — used by the product listing filter sidebar. */
export function useCollections() {
  return useQuery({
    queryKey: ['collections', 'all'],
    queryFn: fetchCollections,
  })
}
