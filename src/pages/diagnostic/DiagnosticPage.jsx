import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCredits } from '../../context/CreditContext'
import { ArrowLeft, AlertCircle, Zap } from 'lucide-react'

export default function DiagnosticPage() {
  const navigate = useNavigate()
  const { credits, hasEnoughCredits } = useCredits()
  const [step, setStep] = useState(1)

  if (!hasEnoughCredits()) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-red-900/20 border border-red-600/30 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Saldo Insuficiente</h2>
          <p className="text-neutral-400 mb-6">
            Você não tem créditos disponíveis. Compre créditos para realizar uma auditoria.
          </p>
          <button
            onClick={() => navigate('/planos')}
            className="btn-primary w-full mb-3"
          >
            Comprar Créditos
          </button>
          <button
            onClick={() => navigate('/painel')}
            className="btn-secondary w-full"
          >
            Voltar ao Painel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Header */}
      <header className="border-b border-dark-border bg-dark-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/painel')}
            className="p-2 hover:bg-dark-border rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-400" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white">Nova Auditoria</h1>
            <p className="text-sm text-neutral-400">Passo {step} de 3</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full transition-colors ${
                s <= step ? 'bg-accent' : 'bg-dark-border'
              }`}
            ></div>
          ))}
        </div>

        {/* Step Content */}
        <div className="card-base mb-8">
          {step === 1 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Identificação do Veículo</h2>
              <p className="text-neutral-400 mb-6">
                Insira a placa ou dados do veículo para iniciar a auditoria
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Placa do Veículo
                  </label>
                  <input
                    type="text"
                    placeholder="ABC-1234 ou ABCD123"
                    className="input-base uppercase"
                  />
                  <p className="text-xs text-neutral-500 mt-2">
                    Vamos buscar os dados automaticamente
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    ou
                  </label>
                  <select className="input-base">
                    <option>Selecione a marca...</option>
                    <option>BYD</option>
                    <option>Volvo</option>
                    <option>GWM</option>
                    <option>Tesla</option>
                  </select>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="btn-primary w-full"
              >
                Próximo
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Leitura de Dados</h2>
              <p className="text-neutral-400 mb-6">
                Escolha como deseja capturar os dados da bateria
              </p>

              <div className="space-y-3 mb-6">
                <button className="w-full card-base border-2 border-accent text-left hover:bg-accent/5">
                  <div className="flex items-center gap-4">
                    <Zap className="w-6 h-6 text-accent" />
                    <div>
                      <p className="font-medium text-white">Bluetooth OBD2</p>
                      <p className="text-sm text-neutral-400">
                        Conectar scanner via Bluetooth
                      </p>
                    </div>
                  </div>
                </button>

                <button className="w-full card-base border-2 border-dark-border hover:border-accent transition-colors text-left">
                  <div className="flex items-center gap-4">
                    <Zap className="w-6 h-6 text-neutral-500" />
                    <div>
                      <p className="font-medium text-white">Simular Leitura</p>
                      <p className="text-sm text-neutral-400">
                        Demonstração com dados fictícios
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  Voltar
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="btn-primary flex-1"
                >
                  Próximo
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Análise e Laudo</h2>
              <p className="text-neutral-400 mb-6">
                Processando dados da bateria...
              </p>

              <div className="space-y-4 mb-6">
                <div className="p-4 rounded-lg bg-dark-border/50 animate-pulse">
                  <div className="h-4 bg-dark-border rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-dark-border rounded w-1/2"></div>
                </div>
                <div className="p-4 rounded-lg bg-dark-border/50 animate-pulse">
                  <div className="h-4 bg-dark-border rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-dark-border rounded w-1/2"></div>
                </div>
              </div>

              <button className="btn-primary w-full">Gerar Laudo</button>
            </div>
          )}
        </div>

        {/* Credits Info */}
        <div className="p-4 rounded-lg bg-accent/10 border border-accent/30">
          <p className="text-sm text-accent">
            Créditos disponíveis: <span className="font-bold">{credits}</span>
          </p>
        </div>
      </main>
    </div>
  )
}
