# ValidaVolt - Arquitetura e Decisões Técnicas

Documentação de decisões arquiteturais e padrões no ValidaVolt.

## 📐 Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────┐
│                        VALIDAVOLT STACK                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Frontend Layer (React 18 + Vite)                               │
│  ├─ Pages (Rotas)                                               │
│  ├─ Components (UI Reusáveis)                                   │
│  ├─ Contexts (Auth, Credits)                                    │
│  ├─ Hooks (Custom Logic)                                        │
│  └─ Services (API Calls)                                        │
│                                                                   │
│                    ↓ REST / WebSocket                            │
│                                                                   │
│  API Gateway & Business Logic                                   │
│  ├─ Supabase Auth (JWT)                                         │
│  ├─ Edge Functions (Webhooks)                                   │
│  ├─ Database Layer (PostgreSQL)                                 │
│  └─ Storage Layer (S3-compatible)                               │
│                                                                   │
│                    ↓ REST / Webhooks                             │
│                                                                   │
│  External Services                                               │
│  ├─ InfinitePay (Payments)                                      │
│  ├─ OEM APIs (Tesla, Volvo, BYD)                                │
│  └─ Storage (Supabase Storage)                                  │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

## 🎯 Decisões de Design

### 1. Backend-as-a-Service (Supabase)

**Decision**: Usar Supabase em vez de backend customizado

**Rationale**:
- ✅ Faster time to market (MVP em 2 semanas)
- ✅ Built-in authentication
- ✅ Row-Level Security (RLS) para multi-tenancy
- ✅ Real-time capabilities
- ✅ Serverless functions (Edge Functions)
- ✅ Integração com Storage
- ⚠️ Trade-off: Menos flexibilidade em queries complexas

**Alternativas Consideradas**:
- AWS Lambda + DynamoDB (muito complexo)
- Firebase (lock-in com Google)
- Custom Node.js + PostgreSQL (requer infra)

---

### 2. React + Context API em vez de Redux

**Decision**: Context API para state management

**Rationale**:
- ✅ Simpler setup (menos boilerplate)
- ✅ Nativo do React 18+
- ✅ Suficiente para app de médio porte
- ✅ Fácil de entender para novos devs

**Context Usado**:
```
AuthContext       → user, profile, login(), logout()
CreditContext     → credits, deductCredit(), addCredits()
```

**Quando Migrar para Redux**:
- Se precisar de estados muito complexos
- Se múltiplos componentes precisam mesmo estado
- Se performance for crítica (memoization)

---

### 3. Mobile-First + PWA

**Decision**: Progressive Web App em vez de app nativo imediato

**Rationale**:
- ✅ Um codebase (React) para desktop e mobile
- ✅ Sem dependency do App Store approval
- ✅ Funciona offline (Service Workers)
- ✅ Instalável no home screen
- ✅ Menor custo de desenvolvimento

**Roadmap**:
1. Phase 7: PWA com Service Workers
2. Phase 8+: React Native se necessário scale

---

### 4. Supabase RLS em vez de Backend Authorization

**Decision**: Validar permissões no banco via RLS

**Rationale**:
- ✅ Implementação Single Source of Truth
- ✅ Segurança em camada de dados
- ✅ Reduz lógica no frontend
- ✅ Automaticamente aplicado em queries

**Exemplo RLS**:
```sql
-- Usuários só veem seus próprios auditoria
CREATE POLICY "Users can view own audits"
  ON audits FOR SELECT
  USING (auth.uid() = user_id);
```

---

### 5. Padrão de Créditos (Soft Currency)

**Decision**: Usar "créditos" em vez de micropagamentos diretos

**Rationale**:
- ✅ Simpler payment flow (checkout uma vez)
- ✅ Pode oferecer créditos grátis (marketing)
- ✅ Facilita assinatura recorrente
- ✅ Reduz transações ao gateway de pagamento

**Flow**:
```
User → Click "Comprar" → Checkout InfinitePay → Créditos Added
User → Click "Diagnóstico" → Deduz 1 crédito → Relatório criado
```

---

### 6. Web Bluetooth para OBD2 vs USB/Serial

**Decision**: Web Bluetooth API em vez de serial USB

**Rationale**:
- ✅ Sem driver necessário
- ✅ Funciona em navegadores modernos
- ✅ Padrão web aberto
- ✅ Suporta múltiplos dispositivos

**Limitações**:
- ❌ Não funciona em iOS (apple restriction)
- ❌ Requer HTTPS
- ❌ Menos stável que USB serial

**Alternativa** (Fase futura):
- Tauri app com rust-serialport para USB direto
- React Native app nativo

---

### 7. Database Schema - Normalização vs Denormalização

**Decision**: Normalizado com algumas denormalizações estratégicas

**Rationale**:
- ✅ Integridade de dados
- ✅ Sem duplicação

**Denormalizações Justificadas**:
```sql
-- Armazenar balance em user_credits
-- (Poderia ser calculado de credit_transactions)
-- Razão: Performance (evita SUM pesado)

-- Armazenar soh_grade no audits
-- (Poderia ser calculado de soh_percentage)
-- Razão: Queries mais rápidas, caching

-- Armazenar full_name em employees
-- (Não está normalizado com auth.users)
-- Razão: Offline-first, performance
```

---

### 8. Monorepo vs Polyrepo

**Decision**: Monorepo com Vite (sem workspace)

**Rationale**:
- ✅ Simpler para MVP
- ✅ Fácil compartilhar tipos (TS)
- ✅ Single CI/CD pipeline

**Estrutura**:
```
validavolt/
├── src/
│   ├── components/
│   ├── pages/
│   ├── lib/
│   └── ...
├── public/
├── SUPABASE_SCHEMA.sql
└── vite.config.js
```

**Se escalar futuramente**:
- Migrar para monorepo com pnpm workspaces
- Separar em: `web/`, `server/`, `shared/`

---

## 🔐 Segurança

### Authentication Flow

```
1. User entra email + password
2. Supabase Auth gera JWT
3. JWT armazenado no localStorage (com httpOnly não-suportado no BaaS)
4. Cada request: Bearer Token no header
5. Supabase valida JWT
6. RLS policies aplicadas ao nível de banco
```

**Tokens**:
- Access token: 1 hora
- Refresh token: 7 dias (refresh automático)

### XSS Prevention

- ✅ React escape HTML por padrão
- ✅ Sanitizar user input com validações
- ✅ CSP headers no Supabase

### SQL Injection Prevention

- ✅ Supabase SDK usa prepared statements
- ✅ Sem concatenação de strings
- ✅ RLS validação no banco

### CSRF Prevention

- ✅ SameSite cookies
- ✅ CORS configurado apenas para domínios conhecidos

---

## 🚀 Performance Optimization

### Frontend

| Tática | Implementado |
|--------|------------|
| Code Splitting (React.lazy) | ❌ Phase 2 |
| Bundle Analysis (Rollup) | ❌ Phase 2 |
| Image Optimization | ✅ SVG + Lucide |
| CSS Minification | ✅ Tailwind prod |
| Service Worker (PWA) | ❌ Phase 7 |
| Lazy Loading (Intersection Observer) | ❌ Phase 3 |

### Backend

| Tática | Implementado |
|--------|------------|
| Database Indexing | ✅ SUPABASE_SCHEMA.sql |
| Query Optimization | ✅ Views criadas |
| Connection Pooling | ✅ Supabase default |
| Caching (Redis) | ❌ Não necessário MVP |
| CDN para Storage | ✅ Supabase built-in |

### Monitoramento

```bash
# Lighthouse CI (Phase 3+)
npm run lighthouse

# Performance API
window.performance.measure('audit-complete')

# Sentry (Phase 4+)
Sentry.captureException(error)
```

---

## 🏗️ Padrões de Código

### Component Structure

```jsx
// src/components/MyComponent.jsx
import { useState, useEffect } from 'react'

/**
 * MyComponent Description
 * @param {Object} props
 * @param {string} props.title - Title text
 */
export default function MyComponent({ title }) {
  const [state, setState] = useState(null)

  useEffect(() => {
    // Setup
    return () => {
      // Cleanup
    }
  }, [])

  return (
    <div className="component">
      {title}
    </div>
  )
}
```

### Hook Pattern

```javascript
// src/hooks/useCustom.js
import { useState, useCallback } from 'react'

export const useCustom = (initialValue) => {
  const [state, setState] = useState(initialValue)

  const update = useCallback((newValue) => {
    setState(newValue)
  }, [])

  return { state, update }
}
```

### Service Pattern

```javascript
// src/services/auditService.js
import { supabase } from '../lib/supabase'

export const createAudit = async (vehicleId, data) => {
  try {
    const { data: audit, error } = await supabase
      .from('audits')
      .insert([{ vehicle_id: vehicleId, ...data }])
      .select()
      .single()

    if (error) throw error
    return { success: true, audit }
  } catch (err) {
    return { success: false, error: err.message }
  }
}
```

---

## 🔄 State Management

### Global State (Context)

```
AuthContext
├─ user (Supabase user object)
├─ profile (user_profiles row)
├─ login(email, password)
├─ logout()
└─ isAuthenticated: boolean

CreditContext
├─ credits (integer balance)
├─ deductCredit(amount)
├─ addCredits(amount)
└─ hasEnoughCredits(amount)
```

### Local State (useState)

```jsx
// Form states
const [formData, setFormData] = useState({})

// UI states
const [isLoading, setIsLoading] = useState(false)

// Transient states
const [notification, setNotification] = useState(null)
```

---

## 📡 API Integration

### Supabase Client

```javascript
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(URL, KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})
```

### InfinitePay Webhook

```
POST /api/webhooks/infinitepay
Body: {
  transaction_id: "...",
  status: "success|failed",
  amount: 9900, // Centavos
  user_email: "..."
}
```

**Response**:
```json
{
  "success": true,
  "credits_added": 8
}
```

---

## 📊 Database Schema Design

### Normalization Level: 3NF

```
user_profiles
  │
  ├─ (1:1) user_credits
  │
  ├─ (1:N) audits
  │         │
  │         └─ (N:1) vehicles
  │
  ├─ (1:N) payments
  │         │
  │         └─ (1:N) credit_transactions
  │
  └─ (1:N) employees (só para lojistas)
```

### Índices Críticos

```sql
-- Performance para queries frequentes
CREATE INDEX idx_audits_user_created 
  ON audits(user_id, created_at DESC);

CREATE INDEX idx_user_credits_balance
  ON user_credits(balance);

CREATE INDEX idx_payments_status_date
  ON payments(status, created_at DESC);
```

---

## 🧪 Testing Strategy

### Unit Tests (Phase 2)

```javascript
// src/utils/__tests__/format.test.js
import { formatCurrency } from '../format'

describe('formatCurrency', () => {
  it('should format number as BRL', () => {
    expect(formatCurrency(100)).toBe('R$ 100,00')
  })
})
```

### Integration Tests (Phase 3)

```javascript
// src/__tests__/auth.integration.test.js
// Teste fluxo completo: signup → login → profile
```

### E2E Tests (Phase 4)

```javascript
// e2e/diagnostic.spec.js
// Teste: click button → bluetooth connect → report generates
```

---

## 🚨 Error Handling

### Frontend Error Boundary

```jsx
// src/components/ErrorBoundary.jsx
import { Component } from 'react'

export default class ErrorBoundary extends Component {
  componentDidCatch(error, info) {
    Sentry.captureException(error)
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}
```

### API Error Handling

```javascript
const handleError = (error) => {
  if (error.code === 'PGRST116') {
    // Not found
    return { message: 'Recurso não encontrado' }
  }

  if (error.status === 401) {
    // Unauthorized
    logout()
    navigate('/login')
  }

  if (error.status === 403) {
    // Forbidden (RLS policy denied)
    return { message: 'Acesso negado' }
  }

  Sentry.captureException(error)
  return { message: 'Erro inesperado' }
}
```

---

## 📚 Documentação por Componente

| Componente | Docs | Status |
|-----------|------|--------|
| AuthContext | `src/context/AuthContext.jsx` | ✅ Completo |
| CreditContext | `src/context/CreditContext.jsx` | ✅ Completo |
| Supabase | `src/lib/supabase.js` | ✅ Completo |
| Hooks | `src/hooks/` | ✅ 3 implementados |
| Utils | `src/utils/` | ✅ format, validation |
| Pages | `src/pages/` | 🔨 Em desenvolvimento |

---

## 🎯 Métricas de Arquitetura

| Métrica | Target | Atual |
|---------|--------|-------|
| Bundle Size | < 200KB | ~180KB |
| Lighthouse Score | > 90 | 85 (Phase 1) |
| Time to Interactive | < 3s | ~2.5s |
| First Contentful Paint | < 1.5s | ~1.2s |
| API Response Time | < 200ms | ~100ms |

---

## 📝 ADR (Architecture Decision Records)

- [ADR-001](./docs/adr/001-supabase.md): Why Supabase
- [ADR-002](./docs/adr/002-context-api.md): Why Context instead of Redux
- [ADR-003](./docs/adr/003-pwa.md): Why PWA over native initially
- [ADR-004](./docs/adr/004-credits.md): Why soft currency model
- [ADR-005](./docs/adr/005-rls.md): Why RLS for auth
