import { useState } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { BarChart3, Users, CreditCard, Receipt, FileText, LogOut, Menu, X, Settings as SettingsIcon } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { logout } = useAuth()
  const location = useLocation()

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: BarChart3 },
    { path: '/admin/planos', label: 'Planos & Preços', icon: CreditCard },
    { path: '/admin/usuarios', label: 'Usuários', icon: Users },
    { path: '/admin/transacoes', label: 'Transações', icon: Receipt },
    { path: '/admin/laudos', label: 'Auditoria de Laudos', icon: FileText },
    { path: '/admin/configuracoes', label: 'Configurações', icon: SettingsIcon }
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="flex h-screen bg-dark-bg">
      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'w-64' : 'w-20'
      } bg-dark-card border-r border-dark-border transition-all duration-300 flex flex-col overflow-hidden`}>
        {/* Logo */}
        <div className="p-6 border-b border-dark-border">
          <div className="flex items-center gap-3 justify-center">
            <div className="w-10 h-10 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-dark-bg font-bold text-lg">V</span>
            </div>
            {sidebarOpen && <span className="font-bold text-white text-lg">ValidaVolt</span>}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive(path)
                  ? 'bg-accent/20 text-accent border border-accent/50'
                  : 'text-neutral-400 hover:text-white hover:bg-dark-bg'
              }`}
              title={!sidebarOpen ? label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{label}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-dark-border">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-900/10 transition-colors"
            title={!sidebarOpen ? 'Sair' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm font-medium">Sair</span>}
          </button>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute top-4 right-4 p-2 hover:bg-dark-bg rounded-lg transition-colors"
        >
          {sidebarOpen ? (
            <X className="w-5 h-5 text-neutral-400" />
          ) : (
            <Menu className="w-5 h-5 text-neutral-400" />
          )}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="h-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
