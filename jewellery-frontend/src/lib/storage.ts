/**
 * Small localStorage JSON helpers used to persist Redux slices (auth, cart)
 * across reloads without pulling in a full redux-persist dependency.
 */

export function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

export function saveJSON(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Ignore quota-exceeded / private-mode errors — persistence is best-effort.
  }
}
