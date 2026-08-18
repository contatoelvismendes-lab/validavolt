import { useEffect, useState } from 'react'
import { Receipt, Download, Filter, Calendar } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })
  const itemsPerPage = 15

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [transactions, statusFilter, dateRange])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('payments')
        .select(`
          id,
          user_id,
          amount,
          method,
          status,
          created_at,
          user_profiles(full_name, email)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setTransactions(data || [])
    } catch (error) {
      console.error('Transactions fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = transactions

    if (statusFilter !== 'all') {
      filtered = filtered.filter(t => t.status === statusFilter)
    }

    if (dateRange.start) {
      const startDate = new Date(dateRange.start)
      filtered = filtered.filter(t => new Date(t.created_at) >= startDate)
    }

    if (dateRange.end) {
      const endDate = new Date(dateRange.end)
      endDate.setHours(23, 59, 59)
      filtered = filtered.filter(t => new Date(t.created_at) <= endDate)
    }

    setFilteredTransactions(filtered)
    setCurrentPage(1)
  }

  const exportToCSV = () => {
    const headers = ['ID', 'Cliente', 'Email', 'Valor (R$)', 'Método', 'Status', 'Data']
    const rows = filteredTransactions.map(t => [
      t.id.slice(0, 8),
      t.user_profiles?.full_name || 'Anônimo',
      t.user_profiles?.email || '-',
      (t.amount / 100).toLocaleString('pt-BR'),
      t.method || '-',
      t.status,
      new Date(t.created_at).toLocaleString('pt-BR')
    ])

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `transacoes_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)

  const getStatusBadge = (status) => {
    const statusMap = {
      'approved': { bg: 'bg-green-900/30', text: 'text-green-400', label: '✓ Aprovado' },
      'pending': { bg: 'bg-yellow-900/30', text: 'text-yellow-400', label: '⏳ Pendente' },
      'rejected': { bg: 'bg-red-900/30', text: 'text-red-400', label: '✗ Rejeitado' },
      'refunded': { bg: 'bg-blue-900/30', text: 'text-blue-400', label: '↩️ Estornado' }
    }
    const config = statusMap[status] || statusMap['pending']
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-dark-border border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-400">Carregando transações...</p>
        </div>
      </div>
    )
  }

  const totalRevenue = filteredTransactions
    .filter(t => t.status === 'approved')
    .reduce((sum, t) => sum + (t.amount || 0), 0)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Receipt className="w-8 h-8 text-accent" />
          Transações & Pagamentos
        </h1>
        <p className="text-neutral-400">Histórico de transações e conciliação de vendas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-base">
          <p className="text-neutral-400 text-sm mb-2">Receita Total (Aprovadas)</p>
          <p className="text-3xl font-bold text-accent">R$ {(totalRevenue / 100).toLocaleString('pt-BR')}</p>
          <p className="text-xs text-neutral-500 mt-2">{filteredTransactions.filter(t => t.status === 'approved').length} transações</p>
        </div>
        <div className="card-base">
          <p className="text-neutral-400 text-sm mb-2">Pendentes</p>
          <p className="text-3xl font-bold text-yellow-400">{filteredTransactions.filter(t => t.status === 'pending').length}</p>
          <p className="text-xs text-neutral-500 mt-2">Aguardando processamento</p>
        </div>
        <div className="card-base">
          <p className="text-neutral-400 text-sm mb-2">Total de Transações</p>
          <p className="text-3xl font-bold text-white">{filteredTransactions.length}</p>
          <p className="text-xs text-neutral-500 mt-2">No período selecionado</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card-base mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-white">Filtros</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-base"
            >
              <option value="all">Todos</option>
              <option value="approved">✓ Aprovado</option>
              <option value="pending">⏳ Pendente</option>
              <option value="rejected">✗ Rejeitado</option>
              <option value="refunded">↩️ Estornado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Data Início</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Data Fim</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="input-base"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={exportToCSV}
              className="btn-secondary w-full flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border bg-dark-bg">
                <th className="px-6 py-3 text-left text-neutral-400 font-medium">ID</th>
                <th className="px-6 py-3 text-left text-neutral-400 font-medium">Cliente</th>
                <th className="px-6 py-3 text-left text-neutral-400 font-medium">Email</th>
                <th className="px-6 py-3 text-right text-neutral-400 font-medium">Valor</th>
                <th className="px-6 py-3 text-left text-neutral-400 font-medium">Método</th>
                <th className="px-6 py-3 text-left text-neutral-400 font-medium">Status</th>
                <th className="px-6 py-3 text-left text-neutral-400 font-medium">Data/Hora</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-b border-dark-border/50 hover:bg-dark-bg/50 transition-colors">
                  <td className="px-6 py-4 text-neutral-300 font-mono text-xs">{transaction.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-white font-medium">
                    {transaction.user_profiles?.full_name || 'Anônimo'}
                  </td>
                  <td className="px-6 py-4 text-neutral-300">{transaction.user_profiles?.email || '-'}</td>
                  <td className="px-6 py-4 text-right font-bold text-accent">
                    R$ {(transaction.amount / 100).toLocaleString('pt-BR')}
                  </td>
                  <td className="px-6 py-4 text-neutral-300">
                    {transaction.method === 'pix' ? '💳 PIX' :
                     transaction.method === 'credit_card' ? '💰 Cartão Crédito' :
                     transaction.method || '-'}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(transaction.status)}
                  </td>
                  <td className="px-6 py-4 text-neutral-400">
                    {new Date(transaction.created_at).toLocaleString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-dark-border flex items-center justify-between">
          <p className="text-sm text-neutral-400">
            Mostrando {paginatedTransactions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} de {filteredTransactions.length}
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
    </div>
  )
}
