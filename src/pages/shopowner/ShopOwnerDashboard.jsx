import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ShopOwnerDashboard() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-dark-bg">
      <header className="border-b border-dark-border bg-dark-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/painel')} className="p-2 hover:bg-dark-border rounded">
            <ArrowLeft className="w-5 h-5 text-neutral-400" />
          </button>
          <h1 className="text-xl font-bold text-white">Painel da Loja</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card-base">
            <p className="text-neutral-400 text-sm mb-2">Laudos Este Mês</p>
            <p className="text-4xl font-bold text-accent">12</p>
            <p className="text-xs text-neutral-500 mt-2">de 20 disponíveis</p>
          </div>
          <div className="card-base">
            <p className="text-neutral-400 text-sm mb-2">Faturamento</p>
            <p className="text-4xl font-bold text-white">R$ 4.500</p>
            <p className="text-xs text-neutral-500 mt-2">este mês</p>
          </div>
          <div className="card-base">
            <p className="text-neutral-400 text-sm mb-2">Funcionários Ativos</p>
            <p className="text-4xl font-bold text-white">3</p>
            <p className="text-xs text-neutral-500 mt-2">do plano</p>
          </div>
        </div>

        <div className="card-base">
          <h2 className="text-xl font-bold text-white mb-4">Personalizações</h2>
          <p className="text-neutral-400 mb-4">Personalize sua marca no ValidaVolt</p>
          <button className="btn-primary">Fazer Upload da Logo</button>
        </div>
      </main>
    </div>
  )
}
