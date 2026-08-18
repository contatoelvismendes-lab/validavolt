import { useState } from 'react'
import { Zap, Wallet } from 'lucide-react'
import PIXTab from './PIXTab'
import CardTab from './CardTab'
import CustomerForm from './CustomerForm'

export default function PaymentForm({ plan, isAuthenticated, currentUser }) {
  const [paymentMethod, setPaymentMethod] = useState('pix')
  const [installments, setInstallments] = useState(1)
  const [customerData, setCustomerData] = useState({
    name: currentUser?.user_metadata?.full_name || '',
    email: currentUser?.email || '',
    document: '',
    phone: '',
  })
  const [formValid, setFormValid] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checkoutStarted, setCheckoutStarted] = useState(false)
  const [transactionData, setTransactionData] = useState(null)

  const handleCustomerDataChange = (data) => {
    setCustomerData(data)
  }

  const handleFormValid = (isValid) => {
    setFormValid(isValid)
  }

  const handleCheckoutComplete = (data) => {
    setTransactionData(data)
    setCheckoutStarted(true)
  }

  if (checkoutStarted && transactionData) {
    if (paymentMethod === 'pix') {
      return (
        <PIXTab
          transactionData={transactionData}
          plan={plan}
          onBack={() => setCheckoutStarted(false)}
        />
      )
    } else {
      return (
        <CardTab
          transactionData={transactionData}
          plan={plan}
          onBack={() => setCheckoutStarted(false)}
        />
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* Card de Pagamento */}
      <div className="card-base">
        <h2 className="text-2xl font-bold text-white mb-6">Dados do Pagamento</h2>

        {/* Formulário de Dados do Cliente */}
        <div className="mb-8 pb-8 border-b border-dark-border">
          <h3 className="font-semibold text-white mb-4">Informações Pessoais</h3>
          <CustomerForm
            initialData={customerData}
            onChange={handleCustomerDataChange}
            onValidChange={handleFormValid}
          />
        </div>

        {/* Seleção de Método de Pagamento */}
        <div className="mb-8">
          <h3 className="font-semibold text-white mb-4">Forma de Pagamento</h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Opção PIX */}
            <button
              onClick={() => setPaymentMethod('pix')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'pix'
                  ? 'border-accent bg-accent/10'
                  : 'border-dark-border hover:border-accent/50'
              }`}
            >
              <Zap className="w-6 h-6 text-accent mb-2" />
              <p className="font-semibold text-white">PIX Instantâneo</p>
              <p className="text-xs text-neutral-400 mt-1">Confirmação imediata</p>
            </button>

            {/* Opção Cartão */}
            <button
              onClick={() => setPaymentMethod('card')}
              className={`p-4 rounded-lg border-2 transition-all ${
                paymentMethod === 'card'
                  ? 'border-accent bg-accent/10'
                  : 'border-dark-border hover:border-accent/50'
              }`}
            >
              <Wallet className="w-6 h-6 text-accent mb-2" />
              <p className="font-semibold text-white">Cartão de Crédito</p>
              <p className="text-xs text-neutral-400 mt-1">Até 12x</p>
            </button>
          </div>
        </div>

        {/* Seletor de Parcelamento (só para cartão) */}
        {paymentMethod === 'card' && (
          <div className="mb-8 pb-8 border-b border-dark-border">
            <label className="block text-sm font-medium text-white mb-3">
              Número de Parcelas
            </label>
            <select
              value={installments}
              onChange={(e) => setInstallments(parseInt(e.target.value))}
              className="input-base"
            >
              {Array.from({ length: 12 }, (_, i) => {
                const parcelas = i + 1
                const valorParcela = ((plan.price_cents / 100) / parcelas).toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                })
                return (
                  <option key={parcelas} value={parcelas}>
                    {parcelas}x de R$ {valorParcela}
                    {parcelas === 1 ? ' (à vista)' : ''}
                  </option>
                )
              })}
            </select>
            <p className="text-xs text-neutral-400 mt-2">
              Primeira parcela no débito, as demais com intervalo de 30 dias
            </p>
          </div>
        )}

        {/* Botão de Ação */}
        {paymentMethod === 'pix' ? (
          <PIXTab.TriggerButton
            plan={plan}
            customerData={customerData}
            isValid={formValid}
            onCheckoutStarted={handleCheckoutComplete}
            setLoading={setLoading}
            loading={loading}
          />
        ) : (
          <CardTab.TriggerButton
            plan={plan}
            customerData={customerData}
            installments={installments}
            isValid={formValid}
            onCheckoutStarted={handleCheckoutComplete}
            setLoading={setLoading}
            loading={loading}
          />
        )}

        {/* Informação de Segurança */}
        <div className="mt-6 pt-6 border-t border-dark-border">
          <p className="text-xs text-neutral-400 text-center">
            Seus dados estão protegidos com criptografia SSL 256-bit.
            <br />
            Nunca compartilhamos informações de pagamento com terceiros.
          </p>
        </div>
      </div>
    </div>
  )
}
