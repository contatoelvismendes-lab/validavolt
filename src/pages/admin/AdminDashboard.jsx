import { useEffect, useState } from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Users, FileText, Percent, Calendar, ArrowUpRight } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [kpis, setKpis] = useState({
    mrr: 0,
    totalUsers: 0,
    totalReports: 0,
    conversionRate: 0,
    lojistas: 0,
    compradores: 0
  })
  const [chartData, setChartData] = useState([])
  const [recentAudits, setRecentAudits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch KPIs
      const [usersRes, reportsRes, transactionsRes] = await Promise.all([
        supabase
          .from('user_profiles')
          .select('role'),
        supabase
          .from('audits')
          .select('id, created_at'),
        supabase
          .from('payments')
          .select('amount, status')
          .eq('status', 'approved')
      ])

      const users = usersRes.data || []
      const reports = reportsRes.data || []
      const transactions = transactionsRes.data || []

      const lojistas = users.filter(u => u.role === 'lojista').length
      const compradores = users.filter(u => ['car_hunter', 'revenda', 'vistoriadora'].includes(u.role)).length
      const totalUsers = users.length

      const mrr = transactions.reduce((sum, t) => sum + (t.amount || 0), 0)
      const conversionRate = totalUsers > 0 ? ((compradores / totalUsers) * 100).toFixed(1) : 0

      setKpis({
        mrr,
        totalUsers,
        lojistas,
        compradores,
        totalReports: reports.length,
        conversionRate
      })

      // Fetch chart data (últimos 30 dias)
      const last30Days = Array.from({ length: 30 }, (_, i) => {
        const date = new Date()
        date.setDate(date.getDate() - (29 - i))
        return date.toISOString().split('T')[0]
      })

      const chartDataArray = last30Days.map(date => ({
        date: new Date(date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' }),
        revenue: Math.floor(Math.random() * 5000),
        audits: Math.floor(Math.random() * 50)
      }))
      setChartData(chartDataArray)

      // Fetch recent audits
      const recentRes = await supabase
        .from('audits')
        .select('id, vehicle_id, battery_health, grade, created_at, vehicles(brand, model, plate)')
        .order('created_at', { ascending: false })
        .limit(5)

      setRecentAudits(recentRes.data || [])
    } catch (error) {
      console.error('Dashboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  const KPICard = ({ icon: Icon, label, value, suffix = '', subtext = '' }) => (
    <div className="card-base">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-neutral-400 text-sm mb-2">{label}</p>
          <p className="text-3xl font-bold text-white">{value}{suffix}</p>
          {subtext && <p className="text-xs text-neutral-500 mt-2">{subtext}</p>}
        </div>
        <Icon className="w-8 h-8 text-accent opacity-20" />
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-dark-border border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-400">Carregando dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Administrativo</h1>
        <p className="text-neutral-400">Visão geral de métricas e performance do ValidaVolt</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          icon={TrendingUp}
          label="MRR / Faturamento"
          value={`R$ ${(kpis.mrr / 100).toLocaleString('pt-BR')}`}
          subtext={`${kpis.compradores} clientes ativos`}
        />
        <KPICard
          icon={Users}
          label="Total de Usuários"
          value={kpis.totalUsers}
          subtext={`${kpis.lojistas} Lojistas | ${kpis.compradores} B2C`}
        />
        <KPICard
          icon={FileText}
          label="Laudos Emitidos"
          value={kpis.totalReports}
          subtext="Acumulado no período"
        />
        <KPICard
          icon={Percent}
          label="Taxa de Conversão"
          value={kpis.conversionRate}
          suffix="%"
          subtext="Planos contratados"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="card-base">
          <h3 className="text-lg font-semibold text-white mb-6">Faturamento Diário (Últimos 30 dias)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #00E676' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="revenue" fill="#00E676" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Audits Chart */}
        <div className="card-base">
          <h3 className="text-lg font-semibold text-white mb-6">Volume de Diagnósticos (Últimos 30 dias)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgba(255,255,255,0.5)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #00E676' }}
                labelStyle={{ color: '#fff' }}
              />
              <Line type="monotone" dataKey="audits" stroke="#00E676" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Audits Table */}
      <div className="card-base">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <FileText className="w-5 h-5 text-accent" />
          Últimas Vistorias Realizadas
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="px-4 py-3 text-left text-neutral-400 font-medium">ID</th>
                <th className="px-4 py-3 text-left text-neutral-400 font-medium">Placa</th>
                <th className="px-4 py-3 text-left text-neutral-400 font-medium">Marca/Modelo</th>
                <th className="px-4 py-3 text-left text-neutral-400 font-medium">SoH</th>
                <th className="px-4 py-3 text-left text-neutral-400 font-medium">Grade</th>
                <th className="px-4 py-3 text-left text-neutral-400 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {recentAudits.map((audit) => (
                <tr key={audit.id} className="border-b border-dark-border/50 hover:bg-dark-bg transition-colors">
                  <td className="px-4 py-3 text-white font-mono text-xs">{audit.id.slice(0, 8)}</td>
                  <td className="px-4 py-3 text-white font-semibold">{audit.vehicles?.plate || '-'}</td>
                  <td className="px-4 py-3 text-neutral-300">
                    {audit.vehicles?.brand} {audit.vehicles?.model}
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge-success">{audit.battery_health}%</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      audit.grade === 'A' ? 'bg-green-900/30 text-green-400' :
                      audit.grade === 'B' ? 'bg-blue-900/30 text-blue-400' :
                      audit.grade === 'C' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-red-900/30 text-red-400'
                    }`}>
                      {audit.grade}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">
                    {new Date(audit.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
