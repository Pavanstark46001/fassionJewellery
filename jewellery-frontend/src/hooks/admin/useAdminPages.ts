import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiErrorShape } from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'
import type { AdminStaticPage, AdminStaticPagePayload } from '@/types/admin'

async function fetchAdminPages(): Promise<AdminStaticPage[]> {
  const { data } = await api.get<AdminStaticPage[]>('/admin/pages')
  return data
}

export function useAdminPages() {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: ['admin', 'pages'],
    queryFn: fetchAdminPages,
    enabled: isAdmin,
  })
}

async function fetchAdminPage(id: string): Promise<AdminStaticPage> {
  const { data } = await api.get<AdminStaticPage>(`/admin/pages/${id}`)
  return data
}

export function useAdminPage(id: string | undefined) {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: ['admin', 'pages', id],
    queryFn: () => fetchAdminPage(id as string),
    enabled: Boolean(id) && isAdmin,
  })
}

export function useCreateAdminPage() {
  const queryClient = useQueryClient()
  return useMutation<AdminStaticPage, ApiErrorShape, AdminStaticPagePayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<AdminStaticPage>('/admin/pages', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pages'] })
      queryClient.invalidateQueries({ queryKey: ['static-page'] })
    },
  })
}

export function useUpdateAdminPage() {
  const queryClient = useQueryClient()
  return useMutation<AdminStaticPage, ApiErrorShape, { id: string; payload: AdminStaticPagePayload }>({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put<AdminStaticPage>(`/admin/pages/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pages'] })
      queryClient.invalidateQueries({ queryKey: ['static-page'] })
    },
  })
}

export function useDeleteAdminPage() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiErrorShape, string>({
    mutationFn: async (id) => {
      await api.delete(`/admin/pages/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pages'] })
      queryClient.invalidateQueries({ queryKey: ['static-page'] })
    },
  })
}
