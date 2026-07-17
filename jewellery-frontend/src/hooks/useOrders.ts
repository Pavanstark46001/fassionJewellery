import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, API_BASE_URL, AUTH_STORAGE_KEY, type ApiErrorShape } from '@/lib/axios'
import { loadJSON } from '@/lib/storage'
import { useAuth } from './useAuth'
import type { CreateOrderPayload, OrderDetail, OrderSummary, PaginatedResponse } from '@/types/api'

async function fetchOrders(page: number, size: number): Promise<PaginatedResponse<OrderSummary>> {
  const { data } = await api.get<PaginatedResponse<OrderSummary>>('/orders', { params: { page, size } })
  return data
}

/** Paginated order history — requires auth, disabled (and empty) for guests. */
export function useOrders(page = 0, size = 10) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['orders', page, size],
    queryFn: () => fetchOrders(page, size),
    enabled: isAuthenticated,
  })
}

async function fetchOrderDetail(orderNumber: string): Promise<OrderDetail> {
  const { data } = await api.get<OrderDetail>(`/orders/${orderNumber}`)
  return data
}

export function useOrderDetail(orderNumber: string | undefined) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['order', orderNumber],
    queryFn: () => fetchOrderDetail(orderNumber as string),
    enabled: Boolean(orderNumber) && isAuthenticated,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation<OrderDetail, ApiErrorShape, CreateOrderPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<OrderDetail>('/orders', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()
  return useMutation<OrderDetail, ApiErrorShape, string>({
    mutationFn: async (orderNumber) => {
      const { data } = await api.patch<OrderDetail>(`/orders/${orderNumber}/cancel`)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.setQueryData(['order', data.orderNumber], data)
    },
  })
}

/** POST /orders/{orderNumber}/pay — completes payment on a mock gateway for an ONLINE order. */
export function usePayOrder() {
  const queryClient = useQueryClient()
  return useMutation<OrderDetail, ApiErrorShape, string>({
    mutationFn: async (orderNumber) => {
      const { data } = await api.post<OrderDetail>(`/orders/${orderNumber}/pay`)
      return data
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      queryClient.setQueryData(['order', data.orderNumber], data)
    },
  })
}

/**
 * GET /orders/{orderNumber}/invoice returns raw PDF bytes (not the
 * {success,data} JSON envelope), so this bypasses the shared `api` instance's
 * normal JSON assumption by requesting a blob directly and opening it.
 */
export function useDownloadInvoice() {
  return useMutation<void, ApiErrorShape, string>({
    mutationFn: async (orderNumber) => {
      const persisted = loadJSON<{ token: string | null }>(AUTH_STORAGE_KEY, { token: null })
      const response = await fetch(`${API_BASE_URL}/orders/${orderNumber}/invoice`, {
        headers: persisted.token ? { Authorization: `Bearer ${persisted.token}` } : undefined,
      })
      if (!response.ok) {
        throw { status: response.status, message: 'Could not download the invoice.' } satisfies ApiErrorShape
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${orderNumber}-invoice.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
  })
}
