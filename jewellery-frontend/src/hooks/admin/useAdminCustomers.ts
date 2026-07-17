import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'
import type { AdminCustomerDetail, AdminCustomerSummary, AdminPageResponse } from '@/types/admin'

export interface AdminCustomerListParams {
  q?: string
  page?: number
  size?: number
  sort?: string
}

async function fetchAdminCustomers(params: AdminCustomerListParams): Promise<AdminPageResponse<AdminCustomerSummary>> {
  const { data } = await api.get<AdminPageResponse<AdminCustomerSummary>>('/admin/customers', { params })
  return data
}

export function useAdminCustomers(params: AdminCustomerListParams) {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: ['admin', 'customers', params],
    queryFn: () => fetchAdminCustomers(params),
    enabled: isAdmin,
    placeholderData: keepPreviousData,
  })
}

async function fetchAdminCustomer(userId: string): Promise<AdminCustomerDetail> {
  const { data } = await api.get<AdminCustomerDetail>(`/admin/customers/${userId}`)
  return data
}

export function useAdminCustomer(userId: string | undefined) {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: ['admin', 'customer', userId],
    queryFn: () => fetchAdminCustomer(userId as string),
    enabled: Boolean(userId) && isAdmin,
  })
}
