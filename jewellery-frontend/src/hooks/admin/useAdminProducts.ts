import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiErrorShape } from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'
import type { AdminPageResponse, AdminProductDetail, AdminProductListParams, AdminProductPayload, AdminProductSummary } from '@/types/admin'

async function fetchAdminProducts(params: AdminProductListParams): Promise<AdminPageResponse<AdminProductSummary>> {
  const { data } = await api.get<AdminPageResponse<AdminProductSummary>>('/admin/products', { params })
  return data
}

export function useAdminProducts(params: AdminProductListParams) {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: ['admin', 'products', params],
    queryFn: () => fetchAdminProducts(params),
    enabled: isAdmin,
    placeholderData: keepPreviousData,
  })
}

async function fetchAdminProduct(id: string): Promise<AdminProductDetail> {
  const { data } = await api.get<AdminProductDetail>(`/admin/products/${id}`)
  return data
}

export function useAdminProduct(id: string | undefined) {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: ['admin', 'product', id],
    queryFn: () => fetchAdminProduct(id as string),
    enabled: Boolean(id) && isAdmin,
  })
}

export function useCreateAdminProduct() {
  const queryClient = useQueryClient()
  return useMutation<AdminProductDetail, ApiErrorShape, AdminProductPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<AdminProductDetail>('/admin/products', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
  })
}

export function useUpdateAdminProduct() {
  const queryClient = useQueryClient()
  return useMutation<AdminProductDetail, ApiErrorShape, { id: string; payload: AdminProductPayload }>({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put<AdminProductDetail>(`/admin/products/${id}`, payload)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      queryClient.setQueryData(['admin', 'product', data.id], data)
    },
  })
}

export function useDeleteAdminProduct() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiErrorShape, string>({
    mutationFn: async (id) => {
      await api.delete(`/admin/products/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
    },
  })
}
