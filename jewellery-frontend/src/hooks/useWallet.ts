import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { useAuth } from './useAuth'
import type { WalletResponse } from '@/types/api'

async function fetchWallet(page: number, size: number): Promise<WalletResponse> {
  const { data } = await api.get<WalletResponse>('/wallet', { params: { page, size } })
  return data
}

/** The authenticated user's own wallet balance + paginated transaction history — requires auth, disabled (and empty) for guests. */
export function useWallet(page = 0, size = 20) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['wallet', page, size],
    queryFn: () => fetchWallet(page, size),
    enabled: isAuthenticated,
  })
}
