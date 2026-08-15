# ValidaVolt - Product Roadmap

Roadmap de desenvolvimento do ValidaVolt com fases de implementação.

## 📌 Fase 1: MVP (Sprint 1-2)

### Core Features
- [x] Autenticação (Email/Password)
- [x] Perfil de usuário (3 tipos: Car Hunter, Revenda, Vistoriadora)
- [x] Sistema de créditos básico
- [x] Telas mockadas de dashboard
- [ ] Integração Supabase completa
- [ ] Fluxo de checkout InfinitePay

### UX/UI
- [x] Design system com Tailwind + Dark theme
- [x] Componentes base (Button, Input, Card)
- [ ] Páginas de autenticação finalizadas
- [ ] Animações de transição

### Infraestrutura
- [x] Vite setup
- [x] React Router
- [x] Supabase SDK
- [x] Schema SQL e RLS policies
- [ ] Environment variables configuradas
- [ ] Deploy em staging

---

## 📌 Fase 2: Diagnóstico (Sprint 3-4)

### Leitura de Dados
- [ ] Integração Bluetooth OBD2 (Web Bluetooth API)
- [ ] Parser de respostas OBD2 (ISO-TP protocol)
- [ ] Modo simulação/demo
- [ ] Suporte a múltiplos scanners (Vgate, Veepeak, etc)

### Análise de Bateria
- [ ] Cálculo de SoH (State of Health)
- [ ] Classificação de grade (A+, A, B, C, D, E)
- [ ] Algoritmo de detecção de anomalias
- [ ] Estimativa de autonomia
- [ ] Análise de balanceamento celular

### Wizard Diagnóstico
- [ ] Step 1: Identificação do veículo (Placa + Dropdown)
- [ ] Step 2: Método de leitura (Bluetooth/API/Simulação)
- [ ] Step 3: Processamento e resultado
- [ ] Salvamento em BD com história

---

## 📌 Fase 3: Relatório & PDF (Sprint 5-6)

### Geração de Relatório
- [ ] Template A4 com design profissional
- [ ] Renderização HTML2PDF (jsPDF)
- [ ] QR Code criptográfico de validação
- [ ] Assinatura digital (SHA-256)
- [ ] Dados do lojista (white-label)

### Publicação
- [ ] Upload PDF para Storage (Supabase)
- [ ] Geração de link público
- [ ] Página de validação pública (`/v/:id`)
- [ ] Verificação de autenticidade
- [ ] Sistema de expiração (90 dias)

### Impressão
- [ ] Otimização de CSS para print
- [ ] Layout A4 sem margens
- [ ] Suporte para impressoras portáteis

---

## 📌 Fase 4: Pagamentos (Sprint 7)

### InfinitePay Integration
- [ ] Checkout page com planos
- [ ] PIX instantâneo
- [ ] Cartão de crédito
- [ ] Retry de falhas
- [ ] Recibos e comprovantes

### Webhooks
- [ ] Endpoint seguro para webhooks
- [ ] Validação de assinatura
- [ ] Atualizar créditos automaticamente
- [ ] Registrar transações
- [ ] Enviar email de confirmação

### Assinatura Recorrente
- [ ] Cadastro de cartão
- [ ] Renovação automática
- [ ] Cancelamento de plano
- [ ] Downgrade/upgrade

---

## 📌 Fase 5: Lojista (Sprint 8-9)

### White-Label
- [ ] Upload de logo
- [ ] Cores customizáveis
- [ ] Domínio customizado (opcional)
- [ ] Rodapé/assinatura personalizado

### Gestão de Funcionários
- [ ] Criar/editar/deletar funcionários
- [ ] Permissões de acesso
- [ ] Histórico de auditorias por funcionário
- [ ] Comissões/bônus (futuro)

### Dashboard de Lojista
- [ ] Uso de créditos mensais
- [ ] Faturamento total
- [ ] Top clientes
- [ ] Relatórios exportáveis

### Integração API
- [ ] API key gerada automaticamente
- [ ] Endpoint para criar auditorias
- [ ] Webhook para notificações
- [ ] Rate limiting

---

## 📌 Fase 6: Admin & Analytics (Sprint 10)

### Painel Admin
- [ ] Controle de preços dinâmicos
- [ ] Injeção manual de créditos
- [ ] Auditoria de transações
- [ ] Logs de segurança
- [ ] Manutenção de banco

### Relatórios
- [ ] Dashboard com KPIs
- [ ] Gráficos de crescimento
- [ ] Análise de churn
- [ ] Previsão de receita

### Suporte
- [ ] Chat com clientes
- [ ] Ticket system
- [ ] FAQ/Help Center
- [ ] Tutorial videos

---

## 📌 Fase 7: Mobile & PWA (Sprint 11-12)

### Progressive Web App
- [ ] Service Worker para offline
- [ ] Cache strategy
- [ ] Push notifications
- [ ] Install prompt

### Aplicativo Nativo (opcional)
- [ ] React Native ou Expo
- [ ] Integração Bluetooth nativa
- [ ] Acesso a câmera (fotos do veículo)
- [ ] Upload de arquivos
- [ ] App Store & Play Store

### Mobile Optimization
- [ ] Touch targets (48px min)
- [ ] Viewport meta tags
- [ ] Mobile-first scrolling
- [ ] Battery optimization

---

## 📌 Fase 8: Integrações Montadoras (Sprint 13+)

### APIs OEM
- [ ] Tesla API (telematics)
- [ ] Volvo Connected Services
- [ ] BYD Open Platform
- [ ] GWM Smart Car Platform

### Dados de Telemetria
- [ ] Histórico de cargas
- [ ] Padrões de uso
- [ ] Temperatura média
- [ ] Ciclos de bateria

### Prognóstico Avançado
- [ ] ML para prever degradação
- [ ] Alertas de manutenção
- [ ] Estimativas mais precisas

---

## 🎯 Future Roadmap

- [ ] Marketplace de serviços (oficinas parceiras)
- [ ] Programa de lealdade (pontos/cashback)
- [ ] Integração com seguradoras
- [ ] Análise de frota (B2B)
- [ ] Histórico de proprietários
- [ ] Blockchain para certificação

---

## 📊 KPIs por Fase

### Fase 1 (MVP)
- ✅ 100 usuários cadastrados
- ✅ 50% retention após 7 dias
- ✅ 0 P1 bugs em produção

### Fase 2 (Diagnóstico)
- 🎯 500 auditorias/mês
- 🎯 4.5/5.0 satisfação do usuário
- 🎯 < 5s tempo de análise

### Fase 3 (PDF)
- 🎯 95% de PDFs gerados com sucesso
- 🎯 < 200ms tempo de geração
- 🎯 100% de links públicos acessíveis

### Fase 4 (Pagamentos)
- 🎯 70% checkout completion rate
- 🎯 < 2% taxa de fraude
- 🎯 < 24h tempo de confirmação PIX

### Fase 5+ (Growth)
- 🎯 10k usuários ativos
- 🎯 R$ 50k MRR
- 🎯 NPS > 50

---

## 🐛 Tech Debt Management

- [ ] Adicionar testes unitários (Vitest)
- [ ] Testes E2E (Playwright/Cypress)
- [ ] Monitoramento com Sentry
- [ ] Analytics com Mixpanel
- [ ] Performance monitoring (Lighthouse)
- [ ] Refactor de componentes grandes
- [ ] Melhorar type safety (TS strict mode)

---

## 📚 Documentação por Fase

| Fase | Docs |
|------|------|
| 1 | Setup, Contributing, API Docs |
| 2 | Bluetooth Protocol, OBD2 Parser |
| 3 | PDF Generation, QR Code |
| 4 | InfinitePay Integration |
| 5 | API Reference, Webhooks |
| 6 | Admin Guide |
| 7+ | Architecture Decision Records |

---

## 🚀 Go-to-Market

- **Soft Launch**: Fase 2 (Versão beta)
- **Official Launch**: Fase 4 (Com pagamentos)
- **Scale Phase**: Fase 5+ (Após 1k usuários)

**Targets**:
1. Car hunters no LinkedIn
2. Revendas por cold email
3. Vistorias por partnership
4. Growth via referral program

---

## 📝 Notas

- Cada sprint = 2 semanas
- Priorizar feedback de usuários reais
- Manter score de performance
- Revisar roadmap todo final de sprint
