import { Settings, DollarSign, Users } from 'lucide-react'
import { useState } from 'react'

export default function AdminDashboard() {
  const [activePlan, setActivePlan] = useState('plans')

  return (
    <div className="min-h-screen bg-dark-bg">
      <header className="border-b border-dark-border bg-dark-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-white">Painel Admin</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-dark-border">
          {[
            { id: 'stats', label: 'Estatísticas', icon: Users },
            { id: 'plans', label: 'Planos', icon: DollarSign },
            { id: 'settings', label: 'Configurações', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePlan(tab.id)}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                activePlan === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-neutral-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4 inline mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {activePlan === 'plans' && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Gerenciar Planos</h2>
            <div className="space-y-4">
              {['car_hunter', 'revenda', 'vistoriadora'].map((plan) => (
                <div key={plan} className="card-base">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white capitalize mb-1">{plan}</h3>
                      <p className="text-sm text-neutral-400">Preço: R$ 199/mês</p>
                    </div>
                    <button className="btn-secondary px-4">Editar</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activePlan === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card-base">
              <p className="text-neutral-400 text-sm mb-2">Total de Usuários</p>
              <p className="text-4xl font-bold text-accent">142</p>
            </div>
            <div className="card-base">
              <p className="text-neutral-400 text-sm mb-2">Laudos Emitidos</p>
              <p className="text-4xl font-bold text-accent">1,240</p>
            </div>
            <div className="card-base">
              <p className="text-neutral-400 text-sm mb-2">Faturamento Total</p>
              <p className="text-4xl font-bold text-accent">R$ 45.800</p>
            </div>
          </div>
        )}

        {activePlan === 'settings' && (
          <div className="card-base">
            <h3 className="font-semibold text-white mb-4">Configurações do Sistema</h3>
            <button className="btn-secondary">Injetar Créditos Manual</button>
          </div>
        )}
      </main>
    </div>
  )
}
