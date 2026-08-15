import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Share2, Printer } from 'lucide-react'

export default function ReportPage() {
  const { reportId } = useParams()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="border-b border-dark-border bg-dark-card sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/painel')}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-dark-border rounded-lg transition-colors" title="Imprimir">
              <Printer className="w-5 h-5 text-neutral-400" />
            </button>
            <button className="p-2 hover:bg-dark-border rounded-lg transition-colors" title="Compartilhar">
              <Share2 className="w-5 h-5 text-neutral-400" />
            </button>
            <button className="p-2 hover:bg-dark-border rounded-lg transition-colors" title="Baixar PDF">
              <Download className="w-5 h-5 text-neutral-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white text-black rounded-lg shadow-lg p-8 min-h-screen no-print">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Relatório de Auditoria</h1>
            <p className="text-gray-600">Diagnóstico de Saúde da Bateria</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div>
              <p className="text-sm text-gray-600">Placa do Veículo</p>
              <p className="text-lg font-semibold">ABC-1234</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Data da Vistoria</p>
              <p className="text-lg font-semibold">13/08/2024</p>
            </div>
          </div>

          {/* Health Score Card */}
          <div className="bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300 rounded-lg p-8 mb-8 text-center">
            <p className="text-sm text-gray-600 mb-2">Estado de Saúde da Bateria</p>
            <div className="text-5xl font-bold text-green-600 mb-2">94.8%</div>
            <div className="inline-block px-4 py-2 rounded-full bg-green-600 text-white font-semibold text-sm">
              Grau A+
            </div>
          </div>

          <div className="space-y-6 mb-8">
            <div>
              <h3 className="font-semibold mb-2">Capacidade Útil</h3>
              <p className="text-gray-700">Aproximadamente 78.5 kWh de um total de 82 kWh nominais</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Autonomia Estimada</h3>
              <p className="text-gray-700">Aproximadamente 365 km em uso real</p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Parecer Técnico</h3>
              <p className="text-gray-700">
                A bateria encontra-se em excelente estado de conservação com balanceamento celular adequado
                e sem sinais de degradação acelerada. Recomenda-se manutenção preventiva periódica.
              </p>
            </div>
          </div>

          <div className="text-center text-gray-500 text-xs pt-4 border-t">
            <p>Relatório ID: {reportId}</p>
            <p>ValidaVolt © 2024</p>
          </div>
        </div>
      </main>
    </div>
  )
}
