import { Shield, Zap, CheckCircle2 } from 'lucide-react'

export default function OrderSummary({ plan }) {
  const formatPrice = (cents) => (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })

  return (
    <div className="space-y-6">
      {/* Card Resumo */}
      <div className="card-base sticky top-24">
        <h2 className="text-2xl font-bold text-white mb-6">Resumo do Pedido</h2>

        {/* Plano */}
        <div className="pb-6 border-b border-dark-border">
          <p className="text-neutral-400 text-sm mb-2">Plano Selecionado</p>
          <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
          <p className="text-neutral-300 text-sm mb-4">{plan.description || 'Acesso completo ao plano'}</p>

          {/* Créditos/Laudos */}
          <div className="flex items-center gap-2 text-accent mb-4">
            <Zap className="w-5 h-5" />
            <span className="font-semibold">{plan.credits} créditos/laudos inclusos</span>
          </div>

          {/* Benefícios */}
          <div className="space-y-2">
            {(plan.features || []).map((feature, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                <span className="text-sm text-neutral-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Preço */}
        <div className="py-6 border-b border-dark-border">
          <div className="flex items-baseline justify-between">
            <p className="text-neutral-400">Valor Total</p>
            <div className="text-right">
              <p className="text-4xl font-bold text-accent">
                R$ {formatPrice(plan.price_cents)}
              </p>
              <p className="text-sm text-neutral-400 mt-1">
                {plan.billing_cycle === 'monthly' ? 'por mês' : 'à vista'}
              </p>
            </div>
          </div>
        </div>

        {/* Informações de Segurança */}
        <div className="pt-6 space-y-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-white">Pagamento Seguro</p>
              <p className="text-sm text-neutral-400">
                Processado via InfinitePay com criptografia SSL 256-bit
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Zap className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-white">Ativação Instantânea</p>
              <p className="text-sm text-neutral-400">
                Seus créditos serão adicionados imediatamente após a confirmação
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-white">Suporte Dedicado</p>
              <p className="text-sm text-neutral-400">
                Nosso time está pronto para ajudar em qualquer dúvida
              </p>
            </div>
          </div>
        </div>

        {/* Badge de Garantia */}
        <div className="mt-6 p-4 bg-accent/10 border border-accent/30 rounded-lg">
          <p className="text-xs text-accent font-medium text-center">
            ✓ Garantia de satisfação 100% | Cancelamento a qualquer momento
          </p>
        </div>
      </div>

      {/* Perguntas Frequentes */}
      <div className="card-base">
        <h3 className="font-semibold text-white mb-4">Dúvidas Frequentes</h3>
        <div className="space-y-3 text-sm">
          <details className="group">
            <summary className="cursor-pointer font-medium text-neutral-300 hover:text-white transition-colors">
              ¿ Posso cancelar quando quiser?
            </summary>
            <p className="mt-2 text-neutral-400 ml-4">
              Sim! Você pode cancelar sua assinatura a qualquer momento sem multas ou taxas adicionais.
            </p>
          </details>

          <details className="group">
            <summary className="cursor-pointer font-medium text-neutral-300 hover:text-white transition-colors">
              ¿ Quanto tempo leva para ativar?
            </summary>
            <p className="mt-2 text-neutral-400 ml-4">
              Seus créditos são ativados instantaneamente após a confirmação do pagamento.
            </p>
          </details>

          <details className="group">
            <summary className="cursor-pointer font-medium text-neutral-300 hover:text-white transition-colors">
              ¿ Quais formas de pagamento vocês aceitam?
            </summary>
            <p className="mt-2 text-neutral-400 ml-4">
              Aceitamos PIX instantâneo e Cartão de Crédito em até 12x sem juros.
            </p>
          </details>
        </div>
      </div>
    </div>
  )
}
