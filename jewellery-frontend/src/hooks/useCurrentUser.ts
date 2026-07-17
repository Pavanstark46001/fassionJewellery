import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { useAppSelector } from '@/store/hooks'
import type { AuthUser } from '@/types/api'

async function fetchCurrentUser(): Promise<AuthUser> {
  const { data } = await api.get<AuthUser>('/auth/me')
  return data
}

/**
 * Refreshes the current user from the server when a token is present.
 * Failures (e.g. expired token) are handled globally by the axios 401
 * interceptor, which clears the stored session — nothing to do here.
 */
export function useCurrentUser() {
  const token = useAppSelector((state) => state.auth.token)
  return useQuery({
    queryKey: ['auth-me'],
    queryFn: fetchCurrentUser,
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60_000,
  })
}
