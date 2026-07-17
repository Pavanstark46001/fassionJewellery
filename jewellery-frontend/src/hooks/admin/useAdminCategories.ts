import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiErrorShape } from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'
import type { AdminCategory, AdminCategoryPayload, AdminSubCategory, AdminSubCategoryPayload } from '@/types/admin'

async function fetchAdminCategories(): Promise<AdminCategory[]> {
  const { data } = await api.get<AdminCategory[]>('/admin/categories')
  return data
}

export function useAdminCategories() {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: ['admin', 'categories'],
    queryFn: fetchAdminCategories,
    enabled: isAdmin,
  })
}

export function useCreateAdminCategory() {
  const queryClient = useQueryClient()
  return useMutation<AdminCategory, ApiErrorShape, AdminCategoryPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<AdminCategory>('/admin/categories', payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  })
}

export function useUpdateAdminCategory() {
  const queryClient = useQueryClient()
  return useMutation<AdminCategory, ApiErrorShape, { id: string; payload: AdminCategoryPayload }>({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put<AdminCategory>(`/admin/categories/${id}`, payload)
      return data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  })
}

export function useDeleteAdminCategory() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiErrorShape, string>({
    mutationFn: async (id) => {
      await api.delete(`/admin/categories/${id}`)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }),
  })
}

async function fetchAdminSubCategories(categoryId: string): Promise<AdminSubCategory[]> {
  const { data } = await api.get<AdminSubCategory[]>(`/admin/categories/${categoryId}/subcategories`)
  return data
}

export function useAdminSubCategories(categoryId: string | undefined) {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: ['admin', 'categories', categoryId, 'subcategories'],
    queryFn: () => fetchAdminSubCategories(categoryId as string),
    enabled: Boolean(categoryId) && isAdmin,
  })
}

export function useCreateAdminSubCategory() {
  const queryClient = useQueryClient()
  return useMutation<AdminSubCategory, ApiErrorShape, { categoryId: string; payload: AdminSubCategoryPayload }>({
    mutationFn: async ({ categoryId, payload }) => {
      const { data } = await api.post<AdminSubCategory>(`/admin/categories/${categoryId}/subcategories`, payload)
      return data
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories', variables.categoryId, 'subcategories'] }),
  })
}

export function useUpdateAdminSubCategory() {
  const queryClient = useQueryClient()
  return useMutation<
    AdminSubCategory,
    ApiErrorShape,
    { categoryId: string; id: string; payload: AdminSubCategoryPayload }
  >({
    mutationFn: async ({ categoryId, id, payload }) => {
      const { data } = await api.put<AdminSubCategory>(`/admin/categories/${categoryId}/subcategories/${id}`, payload)
      return data
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories', variables.categoryId, 'subcategories'] }),
  })
}

export function useDeleteAdminSubCategory() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiErrorShape, { categoryId: string; id: string }>({
    mutationFn: async ({ categoryId, id }) => {
      await api.delete(`/admin/categories/${categoryId}/subcategories/${id}`)
    },
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories', variables.categoryId, 'subcategories'] }),
  })
}
