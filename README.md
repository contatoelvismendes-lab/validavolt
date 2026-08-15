# ValidaVolt

Micro SaaS para auditoria, diagnóstico de saúde química (SoH) e emissão de laudos cautelares para baterias de veículos elétricos (EV) e híbridos (PHEV/HEV).

## 🚀 Stack Tecnológico

- **Frontend**: React 18 + Vite + React Router
- **Styling**: TailwindCSS + Lucide Icons
- **Backend & Banco**: Supabase (Auth, Postgres, Storage, Edge Functions)
- **Pagamentos**: InfinitePay (PIX + Cartão de Crédito)
- **Hardware**: Web Bluetooth API (OBD2 Scanners)
- **PWA**: Manifest.json + Service Workers

## 📦 Setup Inicial

### 1. Clonar e instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha com seus dados:

```bash
cp .env.example .env.local
```

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
VITE_INFINITEPAY_PUBLIC_KEY=sua-chave-publica
VITE_INFINITEPAY_WEBHOOK_SECRET=seu-webhook-secret
```

### 3. Rodar localmente

```bash
npm run dev
```

Acesse `http://localhost:3000`

## 📂 Estrutura do Projeto

```
src/
├── components/        # Componentes reutilizáveis
├── context/          # Contexts (Auth, Credit)
├── hooks/            # Custom hooks
├── lib/              # Utilitários (Supabase, APIs)
├── pages/            # Páginas da aplicação
│   ├── auth/         # Login/Signup
│   ├── dashboard/    # Painel principal
│   ├── diagnostic/   # Wizard de diagnóstico
│   ├── report/       # Relatório A4
│   ├── plans/        # Planos e preços
│   ├── shopowner/    # Dashboard de lojista
│   ├── admin/        # Painel administrativo
│   └── public/       # Validação via QR Code
├── styles/           # CSS global + Tailwind
├── App.jsx           # Routing principal
└── main.jsx          # Entrada da aplicação
```

## 🎨 Tema & Design

### Cores Principais
- **Dark Background**: `#0A192F`
- **Accent (Verde Neon)**: `#00E676`
- **Dark Card**: `#0F2346`
- **Border**: `#1A2844`

### Mobile First
Todas as telas são mobile-first com breakpoints responsivos:
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px

## 🔐 Autenticação & RLS

Usar Supabase Auth + Row Level Security (RLS):

```sql
-- Exemplo: Apenas usuários podem ver seus próprios dados
create policy "Users can view own profile" on user_profiles
  for select using (auth.uid() = id);
```

## 💳 Integração InfinitePay

### Fluxo de Pagamento
1. Usuário clica em "Comprar Créditos"
2. Redireciona para formulário InfinitePay
3. Webhook atualiza `user_credits` após confirmação
4. Usuário retorna ao app com créditos adicionados

### Webhook
```javascript
POST /api/webhooks/infinitepay
- Body: { transaction_id, user_id, credits, status }
```

## 📱 PWA & Offline

- Manifest registrado em `public/manifest.json`
- Service Worker pode ser implementado depois
- App funciona offline após primeira visita

## 🧪 Desenvolvimento

### Criar nova página
1. Criar arquivo em `src/pages/[seção]/[PaginaNome].jsx`
2. Registrar rota em `App.jsx`
3. Usar `useAuth()` para autenticação
4. Usar `useCredits()` para gestão de créditos

### Exemplo de componente com Auth

```jsx
import { useAuth } from '../context/AuthContext'

export default function Exemplo() {
  const { user, profile, logout } = useAuth()

  return (
    <div>
      Bem-vindo, {profile?.full_name}!
    </div>
  )
}
```

## 📚 Recursos Importantes

### Documentação Supabase
- [Auth](https://supabase.com/docs/guides/auth)
- [Postgres](https://supabase.com/docs/guides/database)
- [Storage](https://supabase.com/docs/guides/storage)
- [RLS](https://supabase.com/docs/guides/auth/row-level-security)

### API Web
- [Web Bluetooth API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Bluetooth_API)
- [Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)

## 🚀 Deploy

### Build
```bash
npm run build
```

### Deploy no Railway (Procfile pronto)
```bash
git push railway main
```

Ou deploy em Vercel/Netlify apontando para `dist/` como build output.

## 📝 TODO

- [ ] Implementar integração Bluetooth OBD2
- [ ] Criar lógica de análise de células
- [ ] Implementar webhooks InfinitePay
- [ ] Sistema de relatórios PDF
- [ ] Dashboard de analytics para lojistas
- [ ] API para integrações de montadoras (Tesla, Volvo, BYD)
- [ ] Testes automatizados (Vitest + React Testing Library)
- [ ] CI/CD com GitHub Actions

## 🤝 Contribuindo

1. Criar branch feature: `git checkout -b feature/meu-recurso`
2. Commit mudanças: `git commit -m "Add meu recurso"`
3. Push: `git push origin feature/meu-recurso`
4. Abrir Pull Request

## 📄 Licença

Copyright © 2024 ValidaVolt. Todos os direitos reservados.
