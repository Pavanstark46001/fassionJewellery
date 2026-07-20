import axios, { type AxiosError } from 'axios'
import { loadJSON, saveJSON } from './storage'

export const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? 'http://localhost:8090/api/v1'

export const AUTH_STORAGE_KEY = 'auth'
/** Dispatched on window when a request comes back 401 so the Redux store
 * (which this module intentionally does not import, to avoid a circular
 * dependency with slices that call `api`) can clear its in-memory auth state. */
export const AUTH_UNAUTHORIZED_EVENT = 'auth:unauthorized'

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
  headers: {
    'Content-Type': 'application/json',
    // No-op against any real host; required when API_BASE_URL points at an
    // ngrok free-tier tunnel, which otherwise intercepts requests with an
    // HTML interstitial page that breaks CORS.
    'ngrok-skip-browser-warning': 'true',
  },
})

export interface ApiErrorShape {
  status: number | null
  message: string
}

api.interceptors.request.use((config) => {
  const persisted = loadJSON<{ token: string | null }>(AUTH_STORAGE_KEY, { token: null })
  if (persisted.token) {
    config.headers.set('Authorization', `Bearer ${persisted.token}`)
  }
  return config
})

api.interceptors.response.use(
  (response) => {
    const body = response.data as unknown
    if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
      response.data = (body as { data: unknown }).data
    }
    return response
  },
  (error: AxiosError) => {
    const shaped: ApiErrorShape = {
      status: error.response?.status ?? null,
      message:
        (error.response?.data as { message?: string } | undefined)?.message ??
        error.message ??
        'Something went wrong while reaching the server.',
    }

    if (shaped.status === 401) {
      saveJSON(AUTH_STORAGE_KEY, { token: null, user: null })
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT))
      }
    }

    if (import.meta.env.DEV) {
      console.warn('[api]', shaped.status, shaped.message, error.config?.url)
    }

    return Promise.reject(shaped)
  },
)

export default api
