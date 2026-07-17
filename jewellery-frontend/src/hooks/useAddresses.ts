import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiErrorShape } from '@/lib/axios'
import { useAuth } from './useAuth'
import type { Address, CreateAddressPayload } from '@/types/api'

async function fetchAddresses(): Promise<Address[]> {
  const { data } = await api.get<Address[]>('/addresses')
  return data
}

/** Saved shipping addresses require auth — the query stays disabled for guests. */
export function useAddresses() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['addresses'],
    queryFn: fetchAddresses,
    enabled: isAuthenticated,
  })
}

export function useCreateAddress() {
  const queryClient = useQueryClient()
  return useMutation<Address, ApiErrorShape, CreateAddressPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<Address>('/addresses', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] })
    },
  })
}
