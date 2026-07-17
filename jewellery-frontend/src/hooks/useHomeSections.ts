import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { HomeSection } from '@/types/api'

async function fetchHomeSections(): Promise<HomeSection[]> {
  const { data } = await api.get<HomeSection[]>('/home/sections')
  return data
}

export function useHomeSections() {
  return useQuery({
    queryKey: ['home-sections'],
    queryFn: fetchHomeSections,
  })
}
