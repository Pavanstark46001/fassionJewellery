import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiErrorShape } from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'
import type { AdminBlogPost, AdminBlogPostPayload } from '@/types/admin'

async function fetchAdminBlogPosts(): Promise<AdminBlogPost[]> {
  const { data } = await api.get<AdminBlogPost[]>('/admin/blog')
  return data
}

export function useAdminBlogPosts() {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: ['admin', 'blog'],
    queryFn: fetchAdminBlogPosts,
    enabled: isAdmin,
  })
}

async function fetchAdminBlogPost(id: string): Promise<AdminBlogPost> {
  const { data } = await api.get<AdminBlogPost>(`/admin/blog/${id}`)
  return data
}

export function useAdminBlogPost(id: string | undefined) {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: ['admin', 'blog', id],
    queryFn: () => fetchAdminBlogPost(id as string),
    enabled: Boolean(id) && isAdmin,
  })
}

export function useCreateAdminBlogPost() {
  const queryClient = useQueryClient()
  return useMutation<AdminBlogPost, ApiErrorShape, AdminBlogPostPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<AdminBlogPost>('/admin/blog', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'blog'] })
      queryClient.invalidateQueries({ queryKey: ['blog'] })
    },
  })
}

export function useUpdateAdminBlogPost() {
  const queryClient = useQueryClient()
  return useMutation<AdminBlogPost, ApiErrorShape, { id: string; payload: AdminBlogPostPayload }>({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put<AdminBlogPost>(`/admin/blog/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'blog'] })
      queryClient.invalidateQueries({ queryKey: ['blog'] })
    },
  })
}

export function useDeleteAdminBlogPost() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiErrorShape, string>({
    mutationFn: async (id) => {
      await api.delete(`/admin/blog/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'blog'] })
      queryClient.invalidateQueries({ queryKey: ['blog'] })
    },
  })
}
