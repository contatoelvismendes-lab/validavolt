import { useParams } from 'react-router-dom'
import { CheckCircle, AlertCircle, Zap } from 'lucide-react'

export default function ValidatePublicPage() {
  const { reportId } = useParams()

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Logo Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-dark-card border border-dark-border mb-4">
            <Zap className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-white">ValidaVolt</h1>
        </div>

        {/* Content */}
        <div className="card-base mb-6">
          <div className="flex items-start gap-4 mb-6">
            <CheckCircle className="w-8 h-8 text-accent flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Relatório Verificado</h2>
              <p className="text-neutral-400">Este laudo foi assinado digitalmente e é autentico</p>
            </div>
          </div>

          {/* Report Details */}
          <div className="space-y-4 mb-6 p-4 bg-dark-border/50 rounded-lg">
            <div className="flex justify-between">
              <span className="text-neutral-400">ID do Relatório</span>
              <span className="text-white font-mono text-sm">{reportId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Veículo</span>
              <span className="text-white">BYD Qin EV 2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Placa</span>
              <span className="text-white">ABC-1234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Data da Vistoria</span>
              <span className="text-white">13/08/2024</span>
            </div>
          </div>

          {/* Health Score */}
          <div className="card-base bg-gradient-to-br from-accent/10 to-transparent border-accent/30 mb-6">
            <p className="text-neutral-400 text-sm mb-2">Estado de Saúde da Bateria</p>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-4xl font-bold text-accent">94.8%</span>
              <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-xs font-semibold">
                Grau A+
              </span>
            </div>
            <p className="text-sm text-neutral-400">Bateria em excelente estado de conservação</p>
          </div>

          {/* Details */}
          <div className="space-y-4 mb-6">
            <div>
              <h3 className="font-semibold text-white mb-2">Capacidade Útil</h3>
              <p className="text-neutral-400 text-sm">78.5 kWh de 82 kWh nominais</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Autonomia Estimada</h3>
              <p className="text-neutral-400 text-sm">Aproximadamente 365 km em uso real</p>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Parecer Técnico</h3>
              <p className="text-neutral-400 text-sm">
                A bateria encontra-se em excelente estado de conservação com balanceamento celular adequado
                e sem sinais de degradação acelerada.
              </p>
            </div>
          </div>

          {/* Signature */}
          <div className="pt-4 border-t border-dark-border">
            <p className="text-xs text-neutral-500 mb-2">Assinado digitalmente por ValidaVolt</p>
            <p className="text-xs font-mono text-neutral-600 break-all">
              SHA256: a3e9f8c2d1b4e7a9f6c3d8e1b4a7c9f2
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-900/20 border border-blue-600/30">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-300">
            Este laudo é válido por 90 dias a partir da data da vistoria. Após esse período, recomenda-se realizar uma nova auditoria.
          </p>
        </div>
      </div>
    </div>
  )
}
