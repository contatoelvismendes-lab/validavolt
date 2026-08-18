import { useEffect, useState } from 'react'
import { FileText, Eye, ExternalLink, Download } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [filteredReports, setFilteredReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [gradeFilter, setGradeFilter] = useState('all')
  const itemsPerPage = 15

  useEffect(() => {
    fetchReports()
  }, [])

  useEffect(() => {
    filterReports()
  }, [reports, searchTerm, gradeFilter])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('audits')
        .select(`
          id,
          battery_health,
          grade,
          created_at,
          vehicles(brand, model, plate),
          user_profiles(full_name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setReports(data || [])
    } catch (error) {
      console.error('Reports fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterReports = () => {
    let filtered = reports

    if (searchTerm) {
      filtered = filtered.filter(r =>
        (r.vehicles?.plate || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.vehicles?.brand || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.vehicles?.model || '').toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (gradeFilter !== 'all') {
      filtered = filtered.filter(r => r.grade === gradeFilter)
    }

    setFilteredReports(filtered)
    setCurrentPage(1)
  }

  const paginatedReports = filteredReports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage)

  const getGradeColor = (grade) => {
    const gradeMap = {
      'A': { bg: 'bg-green-900/30', text: 'text-green-400' },
      'B': { bg: 'bg-blue-900/30', text: 'text-blue-400' },
      'C': { bg: 'bg-yellow-900/30', text: 'text-yellow-400' },
      'D': { bg: 'bg-orange-900/30', text: 'text-orange-400' },
      'E': { bg: 'bg-red-900/30', text: 'text-red-400' }
    }
    return gradeMap[grade] || gradeMap['C']
  }

  const getHealthColor = (health) => {
    if (health >= 80) return 'text-green-400'
    if (health >= 60) return 'text-blue-400'
    if (health >= 40) return 'text-yellow-400'
    if (health >= 20) return 'text-orange-400'
    return 'text-red-400'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-dark-border border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-400">Carregando laudos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <FileText className="w-8 h-8 text-accent" />
          Auditoria Global de Laudos
        </h1>
        <p className="text-neutral-400">Histórico completo de todos os diagnósticos emitidos na plataforma</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card-base">
          <p className="text-neutral-400 text-sm mb-2">Total de Laudos</p>
          <p className="text-3xl font-bold text-accent">{filteredReports.length}</p>
        </div>
        <div className="card-base">
          <p className="text-neutral-400 text-sm mb-2">Grade A</p>
          <p className="text-3xl font-bold text-green-400">{filteredReports.filter(r => r.grade === 'A').length}</p>
        </div>
        <div className="card-base">
          <p className="text-neutral-400 text-sm mb-2">Grade E (Críticos)</p>
          <p className="text-3xl font-bold text-red-400">{filteredReports.filter(r => r.grade === 'E').length}</p>
        </div>
        <div className="card-base">
          <p className="text-neutral-400 text-sm mb-2">SoH Médio</p>
          <p className="text-3xl font-bold text-white">
            {Math.round(filteredReports.reduce((sum, r) => sum + (r.battery_health || 0), 0) / (filteredReports.length || 1))}%
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card-base mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">Buscar por Placa/Marca/Modelo</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ex: ABC-1234, Toyota, Corolla"
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">Filtrar por Grade</label>
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="input-base"
            >
              <option value="all">Todas as Grades</option>
              <option value="A">Grade A (Excelente)</option>
              <option value="B">Grade B (Bom)</option>
              <option value="C">Grade C (Regular)</option>
              <option value="D">Grade D (Ruim)</option>
              <option value="E">Grade E (Crítico)</option>
            </select>
          </div>
          <div className="flex items-end">
            <p className="text-sm text-neutral-400">
              Resultados: {filteredReports.length} laudo{filteredReports.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card-base overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border bg-dark-bg">
                <th className="px-6 py-3 text-left text-neutral-400 font-medium">Código</th>
                <th className="px-6 py-3 text-left text-neutral-400 font-medium">Placa</th>
                <th className="px-6 py-3 text-left text-neutral-400 font-medium">Marca/Modelo</th>
                <th className="px-6 py-3 text-center text-neutral-400 font-medium">SoH</th>
                <th className="px-6 py-3 text-center text-neutral-400 font-medium">Grade</th>
                <th className="px-6 py-3 text-left text-neutral-400 font-medium">Vistoriador</th>
                <th className="px-6 py-3 text-left text-neutral-400 font-medium">Data de Emissão</th>
                <th className="px-6 py-3 text-left text-neutral-400 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReports.map((report) => (
                <tr key={report.id} className="border-b border-dark-border/50 hover:bg-dark-bg/50 transition-colors">
                  <td className="px-6 py-4 text-neutral-300 font-mono text-xs">{report.id.slice(0, 8)}</td>
                  <td className="px-6 py-4 text-white font-semibold">{report.vehicles?.plate || '-'}</td>
                  <td className="px-6 py-4 text-neutral-300">
                    {report.vehicles?.brand && report.vehicles?.model
                      ? `${report.vehicles.brand} ${report.vehicles.model}`
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`font-bold ${getHealthColor(report.battery_health)}`}>
                      {report.battery_health}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-1 rounded font-bold text-sm ${getGradeColor(report.grade).bg} ${getGradeColor(report.grade).text}`}>
                      {report.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-300">
                    {report.user_profiles?.full_name || 'Anônimo'}
                  </td>
                  <td className="px-6 py-4 text-neutral-400">
                    {new Date(report.created_at).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(`/laudo/${report.id}`, '_blank')}
                        className="p-2 hover:bg-accent/20 rounded-lg transition-colors"
                        title="Visualizar Laudo"
                      >
                        <Eye className="w-4 h-4 text-accent" />
                      </button>
                      <button
                        onClick={() => window.open(`/v/${report.id}`, '_blank')}
                        className="p-2 hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="Página de Validação Pública"
                      >
                        <ExternalLink className="w-4 h-4 text-blue-400" />
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
            Mostrando {paginatedReports.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} a {Math.min(currentPage * itemsPerPage, filteredReports.length)} de {filteredReports.length}
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
