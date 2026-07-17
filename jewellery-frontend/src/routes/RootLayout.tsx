import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { LuxuryCursor } from '@/components/common/LuxuryCursor'
import { ScrollToTop } from '@/components/common/ScrollToTop'
import { SmoothScrollProvider } from '@/components/common/SmoothScrollProvider'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useAppDispatch } from '@/store/hooks'
import { setUser } from '@/store/authSlice'

export function RootLayout() {
  const { data: currentUser } = useCurrentUser()
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (currentUser) dispatch(setUser(currentUser))
  }, [currentUser, dispatch])

  return (
    <SmoothScrollProvider>
      <ScrollToTop />
      <LuxuryCursor />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </SmoothScrollProvider>
  )
}
