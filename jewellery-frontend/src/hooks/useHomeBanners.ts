import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { HomeBanner } from '@/types/api'

async function fetchHomeBanners(activeOnly = true): Promise<HomeBanner[]> {
  const { data } = await api.get<HomeBanner[]>('/home/banners', {
    params: { activeOnly },
  })
  return data
}

export function useHomeBanners(activeOnly = true) {
  return useQuery({
    queryKey: ['home-banners', { activeOnly }],
    queryFn: () => fetchHomeBanners(activeOnly),
  })
}
