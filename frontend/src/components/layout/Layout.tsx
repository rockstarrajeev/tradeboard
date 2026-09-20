import { Navigate, Outlet } from 'react-router'
import { SocketProvider } from '@/components/socket/SocketProvider'
import { useAuthStore } from '@/stores/authStore'
import { Footer } from './Footer'
import { MobileBottomNav } from './MobileBottomNav'
import { Navbar } from './Navbar'

export function Layout() {
  const { isAuthenticated, user } = useAuthStore()

  // AuthSync has already synced Flask session with Zustand store
  // So we just need to check the Zustand store state
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If logged in but no broker selected, redirect to broker selection
  if (!user?.broker) {
    return <Navigate to="/broker" replace />
  }

  return (
    <SocketProvider>
      <div className="relative min-h-screen bg-background flex flex-col overflow-x-hidden">
        {/* Atmospheric Ambient Mesh Glow Orbs for Glassmorphism */}
        <div className="ambient-mesh-container" aria-hidden="true">
          <div className="ambient-orb ambient-orb-1" />
          <div className="ambient-orb ambient-orb-2" />
          <div className="ambient-orb ambient-orb-3" />
        </div>
        <Navbar />
        <main className="relative z-10 container mx-auto px-4 py-6 pb-24 md:pb-6 flex-1">
          <Outlet />
        </main>
        <Footer className="relative z-10 hidden md:block" />
        <MobileBottomNav />
      </div>
    </SocketProvider>
  )
}

export function PublicLayout() {
  return (
    <div className="relative min-h-screen bg-background overflow-x-hidden">
      <div className="ambient-mesh-container" aria-hidden="true">
        <div className="ambient-orb ambient-orb-1" />
        <div className="ambient-orb ambient-orb-2" />
        <div className="ambient-orb ambient-orb-3" />
      </div>
      <div className="relative z-10">
        <Outlet />
      </div>
    </div>
  )
}
