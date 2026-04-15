import { Navigate } from 'react-router'
import { useAuth } from '../../contexts/AuthContext'
import type { UserRole } from '../../lib/supabase'
import { ReactNode } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  role?: UserRole
}

export function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  // User is authenticated but profile hasn't loaded from DB yet — keep showing spinner
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (role && profile?.role !== role) {
    // Redirect to the correct dashboard based on actual role
    if (profile?.role === 'admin') return <Navigate to="/admin/dashboard" replace />
    if (profile?.role === 'technician') return <Navigate to="/technician/dashboard" replace />
    return <Navigate to="/user/dashboard" replace />
  }

  return <>{children}</>
}
