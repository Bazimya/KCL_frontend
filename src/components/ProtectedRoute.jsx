import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { firstAllowedAdminPath } from '../utils/adminAccess'

export function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}

export function RequireStaff({ permission, children }) {
  const { user, isStaff, can } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (!isStaff) return <Navigate to="/" replace />
  if (permission && !can(permission)) {
    const fallback = firstAllowedAdminPath(user)
    if (fallback && fallback !== location.pathname) return <Navigate to={fallback} replace />
    return (
      <div className="p-8 text-center text-espresso-600">
        <p className="font-bold text-espresso-900">No admin pages assigned yet</p>
        <p className="text-sm mt-1">Ask the admin to give your account permissions in Users &amp; Roles.</p>
      </div>
    )
  }
  return children
}

export function RequireAdmin({ children }) {
  const { user, isAdmin } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}
