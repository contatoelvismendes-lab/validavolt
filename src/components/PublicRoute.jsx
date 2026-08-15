import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const PublicRoute = () => {
  const { isAuthenticated, loading } = useAuth()

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

  // Se já autenticado, redireciona para painel
  if (isAuthenticated) {
    return <Navigate to="/painel" replace />
  }

  return <Outlet />
}

export default PublicRoute
