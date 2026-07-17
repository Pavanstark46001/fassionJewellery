import { useMutation } from '@tanstack/react-query'
import { api, API_BASE_URL, AUTH_STORAGE_KEY, type ApiErrorShape } from '@/lib/axios'
import { loadJSON } from '@/lib/storage'
import type {
  PosCreateCustomerPayload,
  PosCustomerSearchResult,
  PosProductLookup,
  PosSalePayload,
  PosSaleResult,
} from '@/types/admin'

/**
 * In-store billing (POS) hooks. Every lookup here is staff-triggered
 * on-demand (scan + Enter, or a search button click) rather than a
 * background query keyed off component state, so these are plain mutations
 * rather than `useQuery` — there's nothing to cache or keep fresh between
 * scans.
 */

async function lookupPosProduct(code: string): Promise<PosProductLookup[]> {
  const { data } = await api.get<PosProductLookup[]>('/admin/pos/lookup', { params: { code } })
  return data
}

/** GET /admin/pos/lookup?code=... — scan/search a product by ornament ID or name. */
export function usePosProductLookup() {
  return useMutation<PosProductLookup[], ApiErrorShape, string>({
    mutationFn: lookupPosProduct,
  })
}

async function searchPosCustomers(phone: string): Promise<PosCustomerSearchResult[]> {
  const { data } = await api.get<PosCustomerSearchResult[]>('/admin/pos/customers/search', { params: { phone } })
  return data
}

/** GET /admin/pos/customers/search?phone=... — find a registered customer to link a sale to. */
export function usePosCustomerSearch() {
  return useMutation<PosCustomerSearchResult[], ApiErrorShape, string>({
    mutationFn: searchPosCustomers,
  })
}

/** POST /admin/pos/customers — quick customer creation at the till, usually
 * right after a phone search comes back empty. Returns the same shape as a
 * search result so the caller can immediately treat it as "selected". */
export function useCreatePosCustomer() {
  return useMutation<PosCustomerSearchResult, ApiErrorShape, PosCreateCustomerPayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<PosCustomerSearchResult>('/admin/pos/customers', payload)
      return data
    },
  })
}

/** POST /admin/pos/sales — rings up the current cart. Server is the source of
 * truth on pricing; the client only sends productId/quantity per line. */
export function useCreatePosSale() {
  return useMutation<PosSaleResult, ApiErrorShape, PosSalePayload>({
    mutationFn: async (payload) => {
      const { data } = await api.post<PosSaleResult>('/admin/pos/sales', payload)
      return data
    },
  })
}

export type PosInvoiceFormat = 'A4' | 'THERMAL'

/**
 * GET /admin/pos/sales/{orderNumber}/invoice returns raw PDF bytes (not the
 * {success,data} JSON envelope), so — same as `useDownloadInvoice` in
 * `useOrders.ts` — this bypasses the shared `api` instance's JSON-unwrap
 * assumption by requesting a blob directly via `fetch` and triggering a
 * download.
 */
export function usePosInvoice() {
  return useMutation<void, ApiErrorShape, { orderNumber: string; format: PosInvoiceFormat }>({
    mutationFn: async ({ orderNumber, format }) => {
      const persisted = loadJSON<{ token: string | null }>(AUTH_STORAGE_KEY, { token: null })
      const response = await fetch(
        `${API_BASE_URL}/admin/pos/sales/${orderNumber}/invoice?format=${format}`,
        { headers: persisted.token ? { Authorization: `Bearer ${persisted.token}` } : undefined },
      )
      if (!response.ok) {
        throw { status: response.status, message: 'Could not download the invoice.' } satisfies ApiErrorShape
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${orderNumber}-${format.toLowerCase()}.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    },
  })
}
