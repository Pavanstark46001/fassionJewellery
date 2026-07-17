import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiErrorShape } from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'
import type {
  AdminInventoryListParams,
  AdminMovementListParams,
  AdminPageResponse,
  AdminProductInventory,
  AdminStockMovement,
  InventoryLocationPayload,
  StockMovementPayload,
} from '@/types/admin'

async function fetchAdminInventory(
  params: AdminInventoryListParams,
): Promise<AdminPageResponse<AdminProductInventory>> {
  const { data } = await api.get<AdminPageResponse<AdminProductInventory>>('/admin/inventory/products', { params })
  return data
}

export function useAdminInventory(params: AdminInventoryListParams) {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: ['admin', 'inventory', 'products', params],
    queryFn: () => fetchAdminInventory(params),
    enabled: isAdmin,
    placeholderData: keepPreviousData,
  })
}

export function useSetInventoryLocation() {
  const queryClient = useQueryClient()
  return useMutation<
    AdminProductInventory,
    ApiErrorShape,
    { productId: string; payload: InventoryLocationPayload }
  >({
    mutationFn: async ({ productId, payload }) => {
      const { data } = await api.put<AdminProductInventory>(
        `/admin/inventory/products/${productId}/location`,
        payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory', 'products'] })
    },
  })
}

export function useRecordStockMovement() {
  const queryClient = useQueryClient()
  return useMutation<AdminStockMovement, ApiErrorShape, StockMovementPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<AdminStockMovement>('/admin/inventory/movements', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory', 'products'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'inventory', 'movements'] })
    },
  })
}

async function fetchAdminMovements(
  params: AdminMovementListParams,
): Promise<AdminPageResponse<AdminStockMovement>> {
  const { data } = await api.get<AdminPageResponse<AdminStockMovement>>('/admin/inventory/movements', { params })
  return data
}

export function useAdminStockMovements(params: AdminMovementListParams) {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: ['admin', 'inventory', 'movements', params],
    queryFn: () => fetchAdminMovements(params),
    enabled: isAdmin,
    placeholderData: keepPreviousData,
  })
}
