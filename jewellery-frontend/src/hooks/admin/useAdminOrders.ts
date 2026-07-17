import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiErrorShape } from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'
import type { AdminOrderDetail, AdminOrderSummary, AdminPageResponse } from '@/types/admin'
import type { OrderStatus } from '@/types/api'

export interface AdminOrderListParams {
  status?: OrderStatus
  page?: number
  size?: number
  sort?: string
}

async function fetchAdminOrders(params: AdminOrderListParams): Promise<AdminPageResponse<AdminOrderSummary>> {
  const { data } = await api.get<AdminPageResponse<AdminOrderSummary>>('/admin/orders', { params })
  return data
}

export function useAdminOrders(params: AdminOrderListParams) {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: () => fetchAdminOrders(params),
    enabled: isAdmin,
    placeholderData: keepPreviousData,
  })
}

async function fetchAdminOrder(orderNumber: string): Promise<AdminOrderDetail> {
  const { data } = await api.get<AdminOrderDetail>(`/admin/orders/${orderNumber}`)
  return data
}

export function useAdminOrder(orderNumber: string | undefined) {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: ['admin', 'order', orderNumber],
    queryFn: () => fetchAdminOrder(orderNumber as string),
    enabled: Boolean(orderNumber) && isAdmin,
  })
}

export function useUpdateAdminOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation<AdminOrderDetail, ApiErrorShape, { orderNumber: string; status: OrderStatus }>({
    mutationFn: async ({ orderNumber, status }) => {
      const { data } = await api.patch<AdminOrderDetail>(`/admin/orders/${orderNumber}/status`, { status })
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      queryClient.setQueryData(['admin', 'order', data.orderNumber], data)
    },
  })
}
