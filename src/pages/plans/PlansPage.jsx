import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Check, Zap } from 'lucide-react'

export default function PlansPage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [selectedPlan, setSelectedPlan] = useState(null)

  const plans = [
    {
      id: 'car_hunter',
      name: 'Car Hunter',
      price: 199,
      period: 'mês',
      description: 'Para compradores individuais',
      features: [
        '8 Laudos mensais',
        'App offline de campo',
        'Suporte WhatsApp',
        'Histórico ilimitado'
      ],
      popular: false
    },
    {
      id: 'revenda',
      name: 'Revenda',
      price: 499,
      period: 'mês',
      description: 'Para revendas e concessionárias',
      features: [
        '20 Laudos mensais',
        'Selo ValidaVolt no anúncio',
        'Kit de Vitrine',
        '3 Usuários por loja',
        'Suporte prioritário'
      ],
      popular: true
    },
    {
      id: 'vistoriadora',
      name: 'Vistoriadora',
      price: 999,
      period: 'mês',
      description: 'Para empresas de vistoria',
      features: [
        'Laudos ilimitados',
        'Integração via API',
        'Usuários ilimitados',
        'Suporte Dedicado 24/7',
        'Relatórios customizados'
      ],
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="border-b border-dark-border bg-dark-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-white">Planos e Preços</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">
            Escolha o Plano Ideal para Você
          </h2>
          <p className="text-xl text-neutral-400">
            Faturamento mensal com cancelamento a qualquer hora
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`card-base transition-all transform ${
                plan.popular
                  ? 'ring-2 ring-accent scale-105'
                  : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <span className="inline-block px-4 py-1 rounded-full bg-accent text-dark-bg text-xs font-bold">
                    MAIS POPULAR
                  </span>
                </div>
              )}

              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-neutral-400 text-sm mb-6">{plan.description}</p>

              <div className="mb-6">
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-white">R$ {plan.price}</span>
                  <span className="text-neutral-400">/ {plan.period}</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedPlan(plan.id)}
                className={`w-full mb-6 py-3 rounded-lg font-semibold transition-colors ${
                  plan.popular
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                Escolher Plano
              </button>

              <div className="space-y-3">
                {plan.features.map((feature, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                    <span className="text-neutral-300 text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Credit Packs */}
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-white mb-6">Comprar Créditos Avulsos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { credits: 1, price: 99 },
              { credits: 5, price: 449 },
              { credits: 10, price: 799 },
              { credits: 20, price: 1499 }
            ].map((pack) => (
              <button
                key={pack.credits}
                className="card-base hover:border-accent hover:bg-accent/5 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-bold text-accent">{pack.credits}</span>
                  <Zap className="w-6 h-6 text-accent" />
                </div>
                <p className="text-2xl font-bold text-white mb-1">R$ {pack.price}</p>
                <p className="text-xs text-neutral-400">
                  R$ {(pack.price / pack.credits).toFixed(2)}/laudo
                </p>
                <button className="btn-secondary w-full mt-4">Comprar</button>
              </button>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="card-base">
          <h3 className="text-2xl font-bold text-white mb-6">Perguntas Frequentes</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-white mb-2">Posso mudar de plano?</h4>
              <p className="text-neutral-400 text-sm">
                Sim, você pode fazer upgrade ou downgrade a qualquer momento. A cobrança será ajustada proporcionalmente.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Créditos expiram?</h4>
              <p className="text-neutral-400 text-sm">
                Créditos de assinatura são renovados a cada mês. Créditos avulsos não expiram.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-2">Há contrato de longo prazo?</h4>
              <p className="text-neutral-400 text-sm">
                Não, tudo é mês a mês com cancelamento a qualquer hora, sem multa.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
