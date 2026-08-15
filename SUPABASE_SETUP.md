# Configuração Supabase - ValidaVolt

Guia passo a passo para configurar o banco de dados Supabase para o ValidaVolt.

## 1. Criar Projeto Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "New Project"
3. Preencha:
   - **Name**: ValidaVolt
   - **Database Password**: Gere uma senha forte
   - **Region**: Escolha mais próximo de você (ex: `us-east-1`)
4. Clique em "Create new project"
5. Aguarde 2-3 minutos até o projeto estar pronto

## 2. Configurar Variáveis de Ambiente

Após criar o projeto:

1. Na dashboard do Supabase, vá para **Settings > API**
2. Copie:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` → `VITE_SUPABASE_ANON_KEY`

3. Crie arquivo `.env.local` na raiz:

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon-aqui
VITE_INFINITEPAY_PUBLIC_KEY=seu-chave-infinitepay
VITE_INFINITEPAY_WEBHOOK_SECRET=seu-webhook-secret
```

## 3. Executar Schema SQL

1. Na dashboard Supabase, vá para **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `SUPABASE_SCHEMA.sql`
4. Cole no editor
5. Clique em **Run**
6. Aguarde completar (vai criar todas as tabelas, índices, RLS policies e funções)

## 4. Configurar Autenticação

### Habilitar Email/Password

1. Vá para **Authentication > Providers**
2. Verifique se **Email** está habilitado
3. Em **Email Auth > Confirm email**, escolha:
   - `Disable` (para teste rápido) ou
   - `Double confirm change email only` (produção)

### Configurar OAuth (opcional)

Para permitir login com Google/GitHub:

1. Vá para **Authentication > Providers**
2. Clique em **Google** ou **GitHub**
3. Siga as instruções para vincular sua app OAuth
4. Copie `Client ID` e `Client Secret`
5. Configure no Supabase

## 5. Configurar Storage (Buckets)

Para armazenar PDFs e logos:

1. Vá para **Storage**
2. Clique em **New Bucket**
3. Crie buckets:
   - `pdfs` (público)
   - `logos` (público)
   - `files` (privado)

### Configurar Permissões (RLS)

Clique em cada bucket → **Policies** → Configure:

**PDFs (público para leitura, privado para escrita):**
```sql
-- SELECT: Qualquer um
-- INSERT: Apenas usuário proprietário
-- UPDATE: Apenas usuário proprietário
-- DELETE: Apenas usuário proprietário
```

**Logos (público para leitura):**
```sql
-- SELECT: Qualquer um
-- INSERT: Apenas usuário proprietário (lojista)
```

## 6. Configurar RLS (Row Level Security)

As policies já foram criadas no schema SQL. Elas garantem que:

- ✅ Usuários só veem seus próprios dados de perfil
- ✅ Usuários só veem seus próprios créditos e transações
- ✅ Usuários só veem suas próprias auditorias
- ✅ Funcionários só acessam dados da loja ao qual pertencem

Para verificar/editar policies:

1. Vá para **Authentication > Policies**
2. Ou clique na tabela → **Policies**

## 7. Configurar Webhooks (InfinitePay)

1. No Supabase, vá para **Database > Functions**
2. Clique em **Create Function**
3. Crie uma função para processar webhooks:

```sql
CREATE OR REPLACE FUNCTION handle_infinitepay_webhook()
RETURNS void AS $$
BEGIN
  -- Lógica de processamento
  -- Validar assinatura do webhook
  -- Atualizar user_credits
  -- Registrar transaction
END;
$$ LANGUAGE plpgsql;
```

Ou crie uma **Edge Function** (serverless):

```bash
supabase functions new handle-infinitepay-webhook
```

## 8. Testar Conexão

No terminal do projeto:

```bash
npm run dev
```

1. Acesse `http://localhost:3000`
2. Vá para `/cadastro`
3. Crie uma conta
4. Verifique se aparece no Supabase → **Authentication > Users**

## 9. Verificar Dados no Supabase

Para consultar dados criados:

1. Vá para **Database > Browser**
2. Clique nas tabelas para ver os dados:
   - `user_profiles` (seus usuários)
   - `user_credits` (saldos)
   - `audits` (auditorias)
   - Etc.

## 10. Backup e Segurança

### Habilitar Backups

1. Vá para **Database > Backups**
2. Escolha frequência (Daily é recomendado)

### Configurar Políticas de Senha

1. Vá para **Authentication > Policies**
2. Configure mínimo de caracteres e complexidade

### Auditar Logs

1. Vá para **Logs Explorer**
2. Monitore acessos e erros

## 11. Performance

### Criar Índices Adicionais

Se notar queries lentas, adicione no **SQL Editor**:

```sql
-- Índice para buscas de auditorias por data
CREATE INDEX IF NOT EXISTS idx_audits_date_range 
ON audits(created_at DESC, user_id);

-- Índice para buscas de créditos
CREATE INDEX IF NOT EXISTS idx_user_credits_plan
ON user_credits(plan_id);
```

### Monitoring

1. Vá para **Database > Realtime**
2. Ou use **Logs Explorer** para ver queries lentas

## 🚀 Próximos Passos

1. ✅ Configurar OAuth para login social
2. ✅ Testar fluxo de pagamento InfinitePay
3. ✅ Implementar Edge Functions para webhooks
4. ✅ Configurar replicação de geo-backup
5. ✅ Documentar runbook de disaster recovery

## 📚 Documentação Oficial

- [Supabase Docs](https://supabase.com/docs)
- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

## ⚠️ Troubleshooting

### Erro: "Não consegue conectar"
- Verifique `.env.local` com URLs corretas
- Verifique firewall/proxy

### Erro: "RLS policy denied"
- Verifique se autenticado no Supabase
- Verifique permissões da policy

### Erro: "Bucket not found"
- Verificar se bucket existe e está público (se necessário)

### Erro de CORS
- Vá para **Authentication > URL Configuration**
- Adicione seu domínio local (`http://localhost:3000`)
