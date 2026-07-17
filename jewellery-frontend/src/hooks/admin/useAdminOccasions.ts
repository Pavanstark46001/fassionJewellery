import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiErrorShape } from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'
import type { AdminOccasion, AdminOccasionPayload } from '@/types/admin'

async function fetchAdminOccasions(): Promise<AdminOccasion[]> {
  const { data } = await api.get<AdminOccasion[]>('/admin/occasions')
  return data
}

export function useAdminOccasions() {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: ['admin', 'occasions'],
    queryFn: fetchAdminOccasions,
    enabled: isAdmin,
  })
}

export function useCreateAdminOccasion() {
  const queryClient = useQueryClient()
  return useMutation<AdminOccasion, ApiErrorShape, AdminOccasionPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<AdminOccasion>('/admin/occasions', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'occasions'] }),
  })
}

export function useUpdateAdminOccasion() {
  const queryClient = useQueryClient()
  return useMutation<AdminOccasion, ApiErrorShape, { id: string; payload: AdminOccasionPayload }>({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put<AdminOccasion>(`/admin/occasions/${id}`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'occasions'] }),
  })
}

export function useDeleteAdminOccasion() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiErrorShape, string>({
    mutationFn: async (id) => {
      await api.delete(`/admin/occasions/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'occasions'] }),
  })
}
