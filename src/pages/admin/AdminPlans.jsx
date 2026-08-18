import { useEffect, useState } from 'react'
import { CreditCard, Save, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

const defaultPlans = [
  {
    id: 'car_hunter',
    name: 'Car Hunter',
    price: 19900,
    credits: 10,
    benefits: ['Até 10 laudos/mês', 'Histórico completo', 'Acesso app mobile'],
    active: true,
    featured: false
  },
  {
    id: 'revenda',
    name: 'Revenda',
    price: 49900,
    credits: 30,
    benefits: ['Até 30 laudos/mês', 'Relatórios em PDF', 'API integrada', 'Suporte prioritário'],
    active: true,
    featured: true
  },
  {
    id: 'vistoriadora',
    name: 'Vistoriadora',
    price: 99900,
    credits: 100,
    benefits: ['Laudos ilimitados', 'White-label', 'Integração OBD2', 'Dashboard completo', 'Suporte 24/7'],
    active: true,
    featured: false
  },
  {
    id: 'laudo_avulso',
    name: 'Laudo Avulso',
    price: 9900,
    credits: 1,
    benefits: ['1 laudo por compra', 'Válido por 30 dias'],
    active: true,
    featured: false
  }
]

export default function AdminPlans() {
  const [plans, setPlans] = useState(defaultPlans)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('planos')
        .select('*')

      if (error) throw error
      if (data && data.length > 0) {
        setPlans(data)
      }
    } catch (error) {
      console.error('Plans fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSavePlan = async (plan) => {
    try {
      setSaving(true)

      // Mapear campos do frontend para o banco
      const dbPlan = {
        id: plan.id,
        name: plan.name,
        price_cents: plan.price,
        credits: plan.credits,
        features: plan.benefits,
        active: plan.active,
        featured: plan.featured
      }

      const { error } = await supabase
        .from('planos')
        .upsert(dbPlan)

      if (error) throw error

      setMessage({ type: 'success', text: `Plano "${plan.name}" atualizado com sucesso!` })
      setEditingId(null)
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Save error:', error)
      setMessage({ type: 'error', text: 'Erro ao salvar plano: ' + error.message })
    } finally {
      setSaving(false)
    }
  }

  const updatePlan = (id, field, value) => {
    setPlans(plans.map(p => p.id === id ? { ...p, [field]: value } : p))
  }

  const handleBenefitsChange = (id, value) => {
    const benefits = value.split('\n').map(b => b.trim()).filter(Boolean)
    updatePlan(id, 'benefits', benefits)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-dark-border border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-400">Carregando planos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <CreditCard className="w-8 h-8 text-accent" />
          Gestão de Planos & Preços
        </h1>
        <p className="text-neutral-400">Edite preços, créditos e benefícios dos planos</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-900/20 border-green-600/30'
            : 'bg-red-900/20 border-red-600/30'
        }`}>
          <AlertCircle className={`w-5 h-5 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`} />
          <span className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plans.map((plan) => (
          <div key={plan.id} className="card-base">
            {editingId === plan.id ? (
              // Editing Mode
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Nome do Plano</label>
                  <input
                    type="text"
                    value={plan.name}
                    onChange={(e) => updatePlan(plan.id, 'name', e.target.value)}
                    className="input-base"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Preço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={plan.price / 100}
                      onChange={(e) => updatePlan(plan.id, 'price', Math.round(parseFloat(e.target.value) * 100))}
                      className="input-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Créditos</label>
                    <input
                      type="number"
                      value={plan.credits}
                      onChange={(e) => updatePlan(plan.id, 'credits', parseInt(e.target.value))}
                      className="input-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Benefícios (um por linha)</label>
                  <textarea
                    value={(plan.benefits || []).join('\n')}
                    onChange={(e) => handleBenefitsChange(plan.id, e.target.value)}
                    className="input-base min-h-24"
                  />
                </div>

                <div className="flex gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={plan.active}
                      onChange={(e) => updatePlan(plan.id, 'active', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-white">Ativo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={plan.featured}
                      onChange={(e) => updatePlan(plan.id, 'featured', e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-white">Destaque / Mais Popular</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => handleSavePlan(plan)}
                    disabled={saving}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="btn-secondary flex-1"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    {plan.featured && (
                      <span className="inline-block mt-2 px-2 py-1 bg-accent/20 text-accent text-xs font-medium rounded">
                        ⭐ Mais Popular
                      </span>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-accent">R$ {(plan.price / 100).toLocaleString('pt-BR')}</p>
                    <p className="text-sm text-neutral-400">{plan.credits} créditos</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-medium text-neutral-400 mb-2">Benefícios:</p>
                  <ul className="space-y-1">
                    {(plan.benefits || []).map((benefit, idx) => (
                      <li key={idx} className="text-sm text-neutral-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-accent rounded-full"></span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-dark-border">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    plan.active
                      ? 'bg-green-900/30 text-green-400'
                      : 'bg-red-900/30 text-red-400'
                  }`}>
                    {plan.active ? '✓ Ativo' : '✗ Inativo'}
                  </span>
                </div>

                <button
                  onClick={() => setEditingId(plan.id)}
                  className="btn-secondary w-full"
                >
                  Editar Plano
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
