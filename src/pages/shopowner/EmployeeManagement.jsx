import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function EmployeeManagement() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-dark-bg">
      <header className="border-b border-dark-border bg-dark-card">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => navigate('/lojista')} className="p-2 hover:bg-dark-border rounded">
            <ArrowLeft className="w-5 h-5 text-neutral-400" />
          </button>
          <h1 className="text-xl font-bold text-white">Gerenciar Funcionários</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-white">Sua Equipe</h2>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Adicionar Funcionário
          </button>
        </div>

        <div className="card-base">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Nome</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Email</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Laudos</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-white">Ação</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-dark-border hover:bg-dark-border/50">
                <td className="py-3 px-4 text-white">João Silva</td>
                <td className="py-3 px-4 text-neutral-400">joao@email.com</td>
                <td className="py-3 px-4 text-white">45</td>
                <td className="py-3 px-4">
                  <button className="p-2 hover:bg-red-900/20 rounded text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="p-8 text-center text-neutral-400">
            Você tem 1 funcionário de 3 disponíveis no plano
          </div>
        </div>
      </main>
    </div>
  )
}
