import { useState, useEffect } from 'react'
import { Copy, Check, Clock, AlertCircle, ArrowLeft, Zap } from 'lucide-react'
import { supabase } from '../../lib/supabase'

function PIXDisplay({ transactionData, plan, onBack }) {
  const [copied, setCopied] = useState(false)
  const [timeLeft, setTimeLeft] = useState(900) // 15 minutos
  const [status, setStatus] = useState('pending')
  const [pollingActive, setPollingActive] = useState(true)

  // Timer de expiração
  useEffect(() => {
    if (!transactionData.pix_expires_at) return

    const interval = setInterval(() => {
      const expireTime = new Date(transactionData.pix_expires_at).getTime()
      const nowTime = new Date().getTime()
      const remaining = Math.max(0, Math.floor((expireTime - nowTime) / 1000))

      setTimeLeft(remaining)

      if (remaining === 0) {
        clearInterval(interval)
        setPollingActive(false)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [transactionData.pix_expires_at])

  // Polling para status de pagamento
  useEffect(() => {
    if (!pollingActive) return

    const checkStatus = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('status')
        .eq('id', transactionData.transaction_id)
        .single()

      if (data?.status === 'PAID') {
        setStatus('paid')
        setPollingActive(false)
      }
    }

    const interval = setInterval(checkStatus, 5000) // Verificar a cada 5 segundos

    return () => clearInterval(interval)
  }, [transactionData.transaction_id, pollingActive])

  const handleCopy = () => {
    navigator.clipboard.writeText(transactionData.pix_copy_paste)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  if (status === 'paid') {
    return (
      <div className="text-center py-8">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-900/30 border-2 border-green-400 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Check className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">🎉 Pagamento Confirmado!</h2>
        <p className="text-neutral-400 mb-6">Seus créditos foram adicionados à sua conta</p>
        <button
          onClick={() => window.location.href = '/diagnostico'}
          className="btn-primary mb-4 w-full"
        >
          🚀 Iniciar Meu Diagnóstico
        </button>
        <button
          onClick={() => window.location.href = '/painel'}
          className="btn-secondary w-full"
        >
          Ir para o Painel
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="card-base">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">💳 PIX - Copia e Cola</h2>
          <div className="text-right">
            <p className="text-neutral-400 text-sm">Expira em</p>
            <p className={`text-2xl font-bold ${timeLeft > 300 ? 'text-accent' : 'text-yellow-400'}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
        </div>

        {timeLeft === 0 ? (
          <div className="p-4 bg-red-900/20 border border-red-600/30 rounded-lg flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">Este QR Code expirou. Gere um novo para continuar.</p>
          </div>
        ) : (
          <>
            {/* QR Code */}
            {transactionData.pix_qr_code && (
              <div className="bg-white p-4 rounded-lg mx-auto w-64 h-64 mb-6 flex items-center justify-center">
                <img
                  src={transactionData.pix_qr_code}
                  alt="QR Code PIX"
                  className="w-full h-full object-contain"
                />
              </div>
            )}

            {/* Chave Copia e Cola */}
            <div className="mb-6">
              <p className="text-neutral-400 text-sm mb-3">Ou copie a chave PIX:</p>
              <div className="flex gap-2">
                <div className="flex-1 bg-dark-bg p-4 rounded-lg border border-dark-border">
                  <p className="text-white font-mono text-xs break-all">
                    {transactionData.pix_copy_paste}
                  </p>
                </div>
                <button
                  onClick={handleCopy}
                  className="btn-secondary px-6 flex items-center gap-2 whitespace-nowrap"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copiado
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Status */}
            <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg flex items-center gap-3">
              <Clock className="w-5 h-5 text-accent flex-shrink-0 animate-spin" />
              <p className="text-neutral-300">
                Aguardando confirmação do banco...
                <br />
                <span className="text-xs text-neutral-400">
                  Pode levar alguns segundos
                </span>
              </p>
            </div>
          </>
        )}
      </div>

      <div className="card-base">
        <h3 className="font-semibold text-white mb-4">Como funciona:</h3>
        <ol className="space-y-3 text-sm">
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-accent/20 text-accent rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <span className="text-neutral-300">Abra seu app do banco ou use o PIX Copia e Cola</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-accent/20 text-accent rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <span className="text-neutral-300">Escanear o QR Code ou colar a chave no seu banco</span>
          </li>
          <li className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-accent/20 text-accent rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <span className="text-neutral-300">Confirme a transação e aproveite seus créditos!</span>
          </li>
        </ol>
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

function TriggerButton({ plan, customerData, isValid, onCheckoutStarted, setLoading, loading }) {
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
            tipoPagamento: 'pix',
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
            Gerando QR Code...
          </>
        ) : (
          <>
            <Zap className="w-5 h-5" />
            Gerar QR Code PIX
          </>
        )}
      </button>
    </>
  )
}

PIXDisplay.TriggerButton = TriggerButton

export default PIXDisplay
