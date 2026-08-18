import { useState } from 'react'
import { Wallet, AlertCircle, ArrowLeft, Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase'

function CardDisplay({ transactionData, plan, onBack }) {
  const [loading, setLoading] = useState(false)

  const handleCardPayment = async () => {
    try {
      setLoading(true)
      // Redirecionar para URL de autorização da InfinitePay
      if (transactionData.card?.authorization_url) {
        window.location.href = transactionData.card.authorization_url
      }
    } catch (error) {
      console.error('Card payment error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card-base">
        <h2 className="text-2xl font-bold text-white mb-6">💳 Cartão de Crédito</h2>

        {/* Informação importante */}
        <div className="p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg mb-6 flex items-start gap-3">
          <Lock className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium text-blue-400 text-sm">Checkout Seguro</p>
            <p className="text-xs text-blue-300 mt-1">
              Você será redirecionado para o ambiente seguro da InfinitePay para completar o pagamento.
              Seus dados de cartão não passam pelos nossos servidores.
            </p>
          </div>
        </div>

        {/* Resumo */}
        <div className="space-y-3 mb-6 p-4 bg-dark-bg rounded-lg">
          <div className="flex justify-between">
            <span className="text-neutral-400">Plano</span>
            <span className="text-white font-semibold">{plan.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-400">Valor Total</span>
            <span className="text-white font-semibold">
              R$ {(plan.price_cents / 100).toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="flex justify-between border-t border-dark-border pt-3">
            <span className="text-neutral-400 font-medium">Status</span>
            <span className="text-yellow-400 font-medium">⏳ Aguardando Processamento</span>
          </div>
        </div>

        {/* Botão de ação */}
        <button
          onClick={handleCardPayment}
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 mb-4"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-spin"></div>
              Redirecionando...
            </>
          ) : (
            <>
              <Lock className="w-5 h-5" />
              🔒 Pagar R$ {(plan.price_cents / 100).toLocaleString('pt-BR')} no Cartão
            </>
          )}
        </button>

        {/* Informações adicionais */}
        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium text-white mb-2">✓ Segurança Garantida</p>
            <ul className="space-y-1 text-neutral-400 text-xs">
              <li>• Criptografia SSL 256-bit</li>
              <li>• Certificação PCI DSS</li>
              <li>• Processamento seguro via InfinitePay</li>
            </ul>
          </div>

          <div>
            <p className="font-medium text-white mb-2">💳 Pagamento à Vista</p>
            <p className="text-neutral-400 text-xs">
              Pagamento único de{' '}
              <span className="text-accent font-semibold">
                R$ {(plan.price_cents / 100).toLocaleString('pt-BR')}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="card-base">
        <h3 className="font-semibold text-white mb-4">Dúvidas sobre Cartão?</h3>
        <div className="space-y-3 text-sm">
          <details className="group">
            <summary className="cursor-pointer font-medium text-neutral-300 hover:text-white">
              Meus dados de cartão são seguros?
            </summary>
            <p className="mt-2 text-neutral-400 ml-4">
              Sim! Seus dados de cartão são processados diretamente pela InfinitePay com criptografia SSL.
              Nós nunca armazenamos informações do cartão.
            </p>
          </details>

          <details className="group">
            <summary className="cursor-pointer font-medium text-neutral-300 hover:text-white">
              Posso parcelar em quantas vezes?
            </summary>
            <p className="mt-2 text-neutral-400 ml-4">
              Você pode parcelar em até 12x sem juros adicionais. As parcelas são cobradas no débito,
              com intervalo de 30 dias cada.
            </p>
          </details>

          <details className="group">
            <summary className="cursor-pointer font-medium text-neutral-300 hover:text-white">
              Quanto tempo leva para ativar os créditos?
            </summary>
            <p className="mt-2 text-neutral-400 ml-4">
              Após a aprovação do banco (geralmente instantâneo), seus créditos são ativados imediatamente.
            </p>
          </details>
        </div>
      </div>

      <button
        onClick={onBack}
        className="btn-secondary w-full flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Voltar para Pagamento
      </button>
    </div>
  )
}

function TriggerButton({ plan, customerData, installments, isValid, onCheckoutStarted, setLoading, loading }) {
  const [error, setError] = useState(null)

  const handleCreateCheckout = async () => {
    if (!isValid) return

    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/infinitepay-checkout`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
          body: JSON.stringify({
            planoId: plan.id,
            tipoPagamento: 'card',
            parcelas: installments,
            customerData: {
              name: customerData.name,
              email: customerData.email,
              document: customerData.document.replace(/\D/g, ''),
              phone: customerData.phone.replace(/\D/g, ''),
            },
          }),
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erro ao criar cobrança')
      }

      const data = await response.json()
      onCheckoutStarted(data)
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {error && (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-600/30 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      <button
        onClick={handleCreateCheckout}
        disabled={!isValid || loading}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-spin"></div>
            Processando...
          </>
        ) : (
          <>
            <Lock className="w-5 h-5" />
            🔒 Pagar R$ {(plan.price_cents / 100).toLocaleString('pt-BR')} no Cartão
          </>
        )}
      </button>
    </>
  )
}

CardDisplay.TriggerButton = TriggerButton

export default CardDisplay
