import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'

export function ProtectedRoute({ role }) {
  const { user, accessToken } = useAuthStore()

  if (!accessToken || !user) {
    return <Navigate to="/login" replace />
  }

  if (role && user.role !== role) {
    // If user's role doesn't match the required role, redirect to appropriate home
    return <Navigate to={user.role === 'EMPLOYER' ? '/employer/dashboard' : '/dashboard'} replace />
  }

  return <Outlet />
}
