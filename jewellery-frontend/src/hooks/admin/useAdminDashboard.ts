import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'
import type { AdminDashboardSummary } from '@/types/admin'

async function fetchDashboardSummary(): Promise<AdminDashboardSummary> {
  const { data } = await api.get<AdminDashboardSummary>('/admin/dashboard/summary')
  return data
}

export function useAdminDashboard() {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: ['admin', 'dashboard', 'summary'],
    queryFn: fetchDashboardSummary,
    enabled: isAdmin,
  })
}
