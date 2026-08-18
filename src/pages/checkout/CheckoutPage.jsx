import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import OrderSummary from '../../components/checkout/OrderSummary'
import PaymentForm from '../../components/checkout/PaymentForm'

export default function CheckoutPage() {
  const { planoId } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPlan()
  }, [planoId])

  const fetchPlan = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('planos')
        .select('*')
        .eq('id', planoId)
        .single()

      if (error) throw error
      if (!data) {
        setError('Plano não encontrado')
        return
      }

      setPlan(data)
    } catch (err) {
      console.error('Plan fetch error:', err)
      setError('Erro ao carregar plano')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-bg">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-dark-border border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-400">Carregando plano...</p>
        </div>
      </div>
    )
  }

  if (error || !plan) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-bg">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || 'Plano não encontrado'}</p>
          <button
            onClick={() => navigate('/planos')}
            className="btn-primary"
          >
            Voltar aos Planos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="border-b border-dark-border sticky top-0 z-40 bg-dark-bg/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/planos')}
            className="flex items-center gap-2 text-accent hover:text-accent-light transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar aos Planos
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Coluna 1: Resumo do Pedido */}
          <div>
            <OrderSummary plan={plan} />
          </div>

          {/* Coluna 2: Formulário de Pagamento */}
          <div>
            <PaymentForm plan={plan} isAuthenticated={isAuthenticated} currentUser={user} />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-border mt-12 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-4 flex-wrap text-sm text-neutral-400">
            <span>🔒 Pagamento seguro via InfinitePay</span>
            <span>•</span>
            <span>🛡️ Certificado SSL</span>
            <span>•</span>
            <span>✓ Dados protegidos</span>
          </div>
          <p className="text-xs text-neutral-500 mt-4">
            © 2026 ValidaVolt. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
