import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { Occasion } from '@/types/api'

async function fetchOccasions(): Promise<Occasion[]> {
  const { data } = await api.get<Occasion[]>('/occasions')
  return data
}

export function useOccasions() {
  return useQuery({
    queryKey: ['occasions'],
    queryFn: fetchOccasions,
  })
}
