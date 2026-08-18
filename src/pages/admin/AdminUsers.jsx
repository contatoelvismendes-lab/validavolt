import { useEffect, useState } from 'react'
import { Users, Search, Plus, Zap, Eye, Ban, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [creditsModal, setCreditsModal] = useState(null)
  const [creditsForm, setCreditsForm] = useState({ amount: 0, reason: '' })
  const itemsPerPage = 10

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    const filtered = users.filter(user =>
      (user.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.cnpj_cpf || '').includes(searchTerm)
    )
    setFilteredUsers(filtered)
    setCurrentPage(1)
  }, [searchTerm, users])

  const fetchUsers = async () => {
    try {
      setLoading(true)

      // Buscar profiles
      const { data: profilesData, error: profileError } = await supabase
        .from('user_profiles')
        .select('id, full_name, email, role, cnpj_cpf, created_at')
        .order('created_at', { ascending: false })

      if (profileError) {
        console.error('Profile fetch detailed error:', profileError)
        throw profileError
      }

      console.log('Profiles fetched:', profilesData)

      // Buscar créditos
      const { data: creditsData } = await supabase
        .from('user_credits')
        .select('user_id, balance')

      // Mapear créditos aos profiles
      const creditsMap = {}
      creditsData?.forEach(c => {
        creditsMap[c.user_id] = c.balance
      })

      const userData = profilesData.map(profile => ({
        ...profile,
        credits: creditsMap[profile.id] || 0
      }))

      setUsers(userData)
      setFilteredUsers(userData)
    } catch (error) {
      console.error('Users fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdjustCredits = async () => {
    try {
      if (!creditsModal) return

      const { error: updateError } = await supabase
        .from('user_credits')
        .update({ balance: creditsModal.credits + creditsForm.amount })
        .eq('user_id', creditsModal.id)

      if (updateError) throw updateError

      // Log transaction
      await supabase.from('credit_transactions').insert([{
        user_id: creditsModal.id,
        type: creditsForm.amount > 0 ? 'add' : 'deduct',
        amount: Math.abs(creditsForm.amount),
        balance_after: creditsModal.credits + creditsForm.amount,
        reason: creditsForm.reason,
        created_at: new Date().toISOString()
      }])

      // Update local state
      setUsers(users.map(u =>
        u.id === creditsModal.id
          ? { ...u, credits: u.credits + creditsForm.amount }
          : u
      ))

      setCreditsModal(null)
      setCreditsForm({ amount: 0, reason: '' })
    } catch (error) {
      console.error('Adjust credits error:', error)
    }
  }

  const handleBlockUser = async (userId) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ status: 'blocked' })
        .eq('id', userId)

      if (error) throw error

      setUsers(users.map(u =>
        u.id === userId ? { ...u, status: 'blocked' } : u
      ))
    } catch (error) {
      console.error('Block user error:', error)
    }
  }

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  const getRoleLabel = (role) => {
    const roleMap = {
      'lojista': 'Lojista B2B',
      'car_hunter': 'Car Hunter',
      'revenda': 'Revenda',
      'vistoriadora': 'Vistoriadora',
      'admin': 'Admin'
    }
    return roleMap[role] || role
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-dark-border border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-400">Carregando usuários...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Users className="w-8 h-8 text-accent" />
          Gestão de Usuários
        </h1>
        <p className="text-neutral-400">Controle de clientes e injeção de créditos</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou CPF/CNPJ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-base pl-10"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border bg-dark-bg">
                <th className="px-6 py-3 text-left text-neutral-400 font-medium">Nome/Razão Social</th>
                <th className="px-6 py-3 text-left text-neutral-400 font-medium">Email</th>
                <th className="px-6 py-3 text-left text-neutral-400 font-medium">Tipo</th>
                <th className="px-6 py-3 text-left text-neutral-400 font-medium">Créditos</th>
                <th className="px-6 py-3 text-left text-neutral-400 font-medium">Cadastro</th>
                <th className="px-6 py-3 text-left text-neutral-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedUsers.map((user) => (
                <tr key={user.id} className="border-b border-dark-border/50 hover:bg-dark-bg/50 transition-colors">
                  <td className="px-6 py-4 text-white font-medium">{user.full_name || 'Sem nome'}</td>
                  <td className="px-6 py-4 text-neutral-300">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-accent/20 text-accent text-xs font-medium rounded">
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="badge-success">{user.credits} 🔋</span>
                  </td>
                  <td className="px-6 py-4 text-neutral-400">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCreditsModal(user)}
                        className="p-2 hover:bg-accent/20 rounded-lg transition-colors"
                        title="Ajustar Créditos"
                      >
                        <Zap className="w-4 h-4 text-accent" />
                      </button>
                      <button
                        onClick={() => handleBlockUser(user.id)}
                        className="p-2 hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Bloquear"
                      >
                        <Ban className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-dark-border flex items-center justify-between">
          <p className="text-sm text-neutral-400">
            Mostrando {paginatedUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a {Math.min(currentPage * itemsPerPage, filteredUsers.length)} de {filteredUsers.length}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg border border-dark-border hover:border-accent disabled:opacity-50 text-sm"
            >
              Anterior
            </button>
            <span className="px-4 py-2 text-sm text-neutral-400">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg border border-dark-border hover:border-accent disabled:opacity-50 text-sm"
            >
              Próximo
            </button>
          </div>
        </div>
      </div>

      {/* Credits Modal */}
      {creditsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-dark-card border border-dark-border rounded-xl max-w-md w-full">
            <div className="p-6 border-b border-dark-border flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Ajustar Créditos</h2>
              <button
                onClick={() => setCreditsModal(null)}
                className="p-1 hover:bg-dark-bg rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-neutral-400 mb-2">Usuário</p>
                <p className="text-white font-medium">{creditsModal.full_name}</p>
                <p className="text-sm text-neutral-500">{creditsModal.email}</p>
              </div>

              <div className="p-4 bg-dark-bg rounded-lg">
                <p className="text-sm text-neutral-400">Saldo Atual</p>
                <p className="text-3xl font-bold text-accent">{creditsModal.credits}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Quantidade (positivo = adicionar, negativo = remover)
                </label>
                <input
                  type="number"
                  value={creditsForm.amount}
                  onChange={(e) => setCreditsForm({ ...creditsForm, amount: parseInt(e.target.value) })}
                  className="input-base"
                  placeholder="Ex: 10 ou -5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">Observação</label>
                <textarea
                  value={creditsForm.reason}
                  onChange={(e) => setCreditsForm({ ...creditsForm, reason: e.target.value })}
                  className="input-base min-h-20"
                  placeholder="Ex: Bônus de negociação comercial"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleAdjustCredits}
                  className="btn-primary flex-1"
                >
                  Confirmar Ajuste
                </button>
                <button
                  onClick={() => setCreditsModal(null)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
