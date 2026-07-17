import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { StaticPage } from '@/types/api'

async function fetchStaticPage(slug: string): Promise<StaticPage> {
  const { data } = await api.get<StaticPage>(`/pages/${slug}`)
  return data
}

/** Public static/legal page — `GET /pages/{slug}` (privacy-policy, terms-of-service, shipping-policy, return-policy, ...). */
export function useStaticPage(slug: string | undefined) {
  return useQuery({
    queryKey: ['static-page', slug],
    queryFn: () => fetchStaticPage(slug as string),
    enabled: Boolean(slug),
    retry: false,
  })
}
