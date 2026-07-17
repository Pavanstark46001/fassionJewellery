import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type ApiErrorShape } from '@/lib/axios'
import { useAuth } from '@/hooks/useAuth'
import type {
  AdminBanner,
  AdminBannerPayload,
  AdminHomeSection,
  AdminHomeSectionItem,
  AdminHomeSectionItemPayload,
  AdminHomeSectionPayload,
  AdminReorderPayload,
} from '@/types/admin'

/* ---------------------------------------------------------------------- */
/* Banners                                                                 */
/* ---------------------------------------------------------------------- */

async function fetchAdminBanners(): Promise<AdminBanner[]> {
  const { data } = await api.get<AdminBanner[]>('/admin/cms/banners')
  return data
}

export function useAdminBanners() {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: ['admin', 'cms', 'banners'],
    queryFn: fetchAdminBanners,
    enabled: isAdmin,
  })
}

export function useCreateAdminBanner() {
  const queryClient = useQueryClient()
  return useMutation<AdminBanner, ApiErrorShape, AdminBannerPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<AdminBanner>('/admin/cms/banners', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'banners'] })
      queryClient.invalidateQueries({ queryKey: ['home-banners'] })
    },
  })
}

export function useUpdateAdminBanner() {
  const queryClient = useQueryClient()
  return useMutation<AdminBanner, ApiErrorShape, { id: string; payload: AdminBannerPayload }>({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put<AdminBanner>(`/admin/cms/banners/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'banners'] })
      queryClient.invalidateQueries({ queryKey: ['home-banners'] })
    },
  })
}

export function useDeleteAdminBanner() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiErrorShape, string>({
    mutationFn: async (id) => {
      await api.delete(`/admin/cms/banners/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'banners'] })
      queryClient.invalidateQueries({ queryKey: ['home-banners'] })
    },
  })
}

/* ---------------------------------------------------------------------- */
/* Home sections                                                           */
/* ---------------------------------------------------------------------- */

async function fetchAdminHomeSections(): Promise<AdminHomeSection[]> {
  const { data } = await api.get<AdminHomeSection[]>('/admin/cms/home-sections')
  return data
}

export function useAdminHomeSections() {
  const { isAdmin } = useAuth()
  return useQuery({
    queryKey: ['admin', 'cms', 'home-sections'],
    queryFn: fetchAdminHomeSections,
    enabled: isAdmin,
  })
}

export function useCreateAdminHomeSection() {
  const queryClient = useQueryClient()
  return useMutation<AdminHomeSection, ApiErrorShape, AdminHomeSectionPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<AdminHomeSection>('/admin/cms/home-sections', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'home-sections'] })
      queryClient.invalidateQueries({ queryKey: ['home-sections'] })
    },
  })
}

export function useUpdateAdminHomeSection() {
  const queryClient = useQueryClient()
  return useMutation<AdminHomeSection, ApiErrorShape, { id: string; payload: AdminHomeSectionPayload }>({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.put<AdminHomeSection>(`/admin/cms/home-sections/${id}`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'home-sections'] })
      queryClient.invalidateQueries({ queryKey: ['home-sections'] })
    },
  })
}

export function useReorderAdminHomeSection() {
  const queryClient = useQueryClient()
  return useMutation<AdminHomeSection, ApiErrorShape, { id: string; payload: AdminReorderPayload }>({
    mutationFn: async ({ id, payload }) => {
      const { data } = await api.patch<AdminHomeSection>(`/admin/cms/home-sections/${id}/reorder`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'home-sections'] })
      queryClient.invalidateQueries({ queryKey: ['home-sections'] })
    },
  })
}

export function useDeleteAdminHomeSection() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiErrorShape, string>({
    mutationFn: async (id) => {
      await api.delete(`/admin/cms/home-sections/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'home-sections'] })
      queryClient.invalidateQueries({ queryKey: ['home-sections'] })
    },
  })
}

/* ---------------------------------------------------------------------- */
/* Home section items                                                      */
/* ---------------------------------------------------------------------- */

export function useAddAdminHomeSectionItem() {
  const queryClient = useQueryClient()
  return useMutation<
    AdminHomeSectionItem,
    ApiErrorShape,
    { sectionId: string; payload: AdminHomeSectionItemPayload }
  >({
    mutationFn: async ({ sectionId, payload }) => {
      const { data } = await api.post<AdminHomeSectionItem>(`/admin/cms/home-sections/${sectionId}/items`, payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'home-sections'] })
      queryClient.invalidateQueries({ queryKey: ['home-sections'] })
    },
  })
}

export function useUpdateAdminHomeSectionItem() {
  const queryClient = useQueryClient()
  return useMutation<
    AdminHomeSectionItem,
    ApiErrorShape,
    { sectionId: string; itemId: string; payload: AdminHomeSectionItemPayload }
  >({
    mutationFn: async ({ sectionId, itemId, payload }) => {
      const { data } = await api.put<AdminHomeSectionItem>(
        `/admin/cms/home-sections/${sectionId}/items/${itemId}`,
        payload,
      )
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'home-sections'] })
      queryClient.invalidateQueries({ queryKey: ['home-sections'] })
    },
  })
}

export function useDeleteAdminHomeSectionItem() {
  const queryClient = useQueryClient()
  return useMutation<void, ApiErrorShape, { sectionId: string; itemId: string }>({
    mutationFn: async ({ sectionId, itemId }) => {
      await api.delete(`/admin/cms/home-sections/${sectionId}/items/${itemId}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'cms', 'home-sections'] })
      queryClient.invalidateQueries({ queryKey: ['home-sections'] })
    },
  })
}
