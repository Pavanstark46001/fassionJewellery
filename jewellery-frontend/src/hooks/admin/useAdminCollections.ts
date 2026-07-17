import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiErrorShape } from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'
import type { AdminCollection, AdminCollectionPayload } from '@/types/admin'

async function fetchAdminCollections(): Promise<AdminCollection[]> {
  const { data } = await api.get<AdminCollection[]>('/admin/collections')
  return data
}

export function useAdminCollections() {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: ['admin', 'collections'],
    queryFn: fetchAdminCollections,
    enabled: isAdmin,
  })
}

export function useCreateAdminCollection() {
  const queryClient = useQueryClient()
  return useMutation<AdminCollection, ApiErrorShape, AdminCollectionPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<AdminCollection>('/admin/collections', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'collections'] }),
  })
}

export function useUpdateAdminCollection() {
  const queryClient = useQueryClient()
  return useMutation<AdminCollection, ApiErrorShape, { id: string; payload: AdminCollectionPayload }>({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put<AdminCollection>(`/admin/collections/${id}`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'collections'] }),
  })
}

export function useDeleteAdminCollection() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiErrorShape, string>({
    mutationFn: async (id) => {
      await api.delete(`/admin/collections/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'collections'] }),
  })
}
