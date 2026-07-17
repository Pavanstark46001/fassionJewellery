import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Category } from '@/types/api'

async function fetchCategories(activeOnly = true): Promise<Category[]> {
  const { data } = await api.get<Category[]>('/categories', {
    params: { activeOnly },
  })
  return data
}

export function useCategories(activeOnly = true) {
  return useQuery({
    queryKey: ['categories', { activeOnly }],
    queryFn: () => fetchCategories(activeOnly),
  })
}
