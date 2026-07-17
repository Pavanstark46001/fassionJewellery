import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { Toaster } from '@/components/ui/sonner'
import { Preloader } from '@/components/common/Preloader'
import { AppRouter } from '@/routes'

/** Wires the PWA service-worker update flow to a simple sonner toast — no
 * custom UI, just the standard `vite-plugin-pwa` `useRegisterSW` hook. */
function usePwaUpdateToast() {
  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegisterError: (error) => console.error('[pwa] service worker registration failed', error),
  })
  const [needsRefresh] = needRefresh

  useEffect(() => {
    if (!needsRefresh) return
    toast('New version available', {
      description: 'Refresh to load the latest version of the site.',
      action: {
        label: 'Refresh',
        onClick: () => updateServiceWorker(true),
      },
      duration: Infinity,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsRefresh])
}

export default function App() {
  const [isPreloading, setIsPreloading] = useState(true)
  usePwaUpdateToast()

  return (
    <>
      {isPreloading && <Preloader onComplete={() => setIsPreloading(false)} />}
      <AppRouter />
      <Toaster />
    </>
  )
}
