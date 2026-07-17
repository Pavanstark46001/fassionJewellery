const PLACEHOLDER_HOSTS = /dummyimage\.com|placehold\.co|via\.placeholder|picsum\.photos/i

export function resolveImage(url: string | null | undefined, fallback: string): string {
  if (!url || PLACEHOLDER_HOSTS.test(url)) return fallback
  return url
}
