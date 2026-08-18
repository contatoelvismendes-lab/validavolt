import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute = ({ requiredRole = null }) => {
  const { isAuthenticated, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-bg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-dark-border border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-400">Carregando...</p>
        </div>
      </div>
    )
  }

  // Para rotas admin
  if (requiredRole === 'admin') {
    if (!isAuthenticated || profile?.role !== 'admin') {
      return <Navigate to="/admin-login" replace />
    }
    return <Outlet />
  }

  // Para rotas de usuário regular
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/painel" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
