import { Navigate, Outlet } from 'react-router'
import { SocketProvider } from '@/components/socket/SocketProvider'
import { useAuthStore } from '@/stores/authStore'

/**
 * Full-width layout for apps like Playground that need maximum screen space.
 * No container constraints, minimal chrome.
 */
export function FullWidthLayout() {
  const { isAuthenticated, user } = useAuthStore()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (!user?.broker) {
    return <Navigate to="/broker" replace />
  }

  return (
    <SocketProvider>
      <div className="relative h-screen bg-background flex flex-col overflow-hidden">
        <div className="ambient-mesh-container" aria-hidden="true">
          <div className="ambient-orb ambient-orb-1" />
          <div className="ambient-orb ambient-orb-2" />
          <div className="ambient-orb ambient-orb-3" />
        </div>
        <div className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
          <Outlet />
        </div>
      </div>
    </SocketProvider>
  )
}
