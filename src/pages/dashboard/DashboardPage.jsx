import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCredits } from '../../context/CreditContext'
import { LogOut, Zap, TrendingUp, Clock, CheckCircle } from 'lucide-react'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { profile, logout } = useAuth()
  const { credits, loading: creditsLoading } = useCredits()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="border-b border-dark-border bg-dark-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-accent" />
            <h1 className="text-xl font-bold text-white">ValidaVolt</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-neutral-400 hover:bg-dark-border transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline text-sm">Sair</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Bem-vindo, {profile?.full_name?.split(' ')[0] || 'Usuário'}!
          </h2>
          <p className="text-neutral-400">
            Gerencie suas vistorias e diagnósticos de bateria aqui
          </p>
        </div>

        {/* Credits Card */}
        <div className="card-base mb-8 bg-gradient-to-br from-accent/10 to-transparent border-accent/30">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-neutral-400 text-sm mb-1">Saldo de Créditos</p>
              <div className="flex items-baseline gap-2">
                {creditsLoading ? (
                  <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="text-4xl font-bold text-accent">{credits}</span>
                )}
                <span className="text-neutral-400">créditos</span>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                1 crédito = 1 auditoria completa de bateria
              </p>
            </div>
            <button
              onClick={() => navigate('/planos')}
              className="btn-primary"
            >
              Comprar Créditos
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => credits > 0 ? navigate('/diagnostico') : navigate('/planos')}
            className="card-base hover:border-accent transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Zap className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white mb-1">Nova Auditoria</h3>
                <p className="text-sm text-neutral-400">Iniciar diagnóstico de bateria</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => navigate('/planos')}
            className="card-base hover:border-accent transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-white mb-1">Planos & Preços</h3>
                <p className="text-sm text-neutral-400">Ver opções de assinatura</p>
              </div>
            </div>
          </button>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="card-base">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-accent" />
            Atividade Recente
          </h3>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-lg bg-dark-card/50 border border-dark-border">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-accent" />
                <div>
                  <p className="font-medium text-white text-sm">Auditoria concluída</p>
                  <p className="text-xs text-neutral-500">Placa: ABC-1234 • Há 2 dias</p>
                </div>
              </div>
              <button className="text-accent text-sm hover:underline">Ver Laudo</button>
            </div>

            <p className="text-center text-neutral-500 text-sm py-8">
              Nenhuma auditoria realizada ainda
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
