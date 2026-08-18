-- Tabela de Transações/Pagamentos
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  infinitepay_id TEXT UNIQUE,
  plan_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('pix', 'card')),
  installments INTEGER DEFAULT 1,
  status TEXT DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'PAID', 'FAILED', 'CANCELLED', 'EXPIRED')),
  pix_qr_code TEXT,
  pix_copy_paste TEXT,
  pix_expires_at TIMESTAMP,
  card_last_four TEXT,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_document TEXT,
  customer_phone TEXT,
  metadata JSONB DEFAULT '{}',
  webhook_data JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  paid_at TIMESTAMP
);

-- Índices para Transações
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_infinitepay_id ON transactions(infinitepay_id);

-- Tabela de Webhook Logs (auditoria)
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  transaction_id UUID REFERENCES transactions(id),
  infinitepay_event_id TEXT UNIQUE,
  payload JSONB NOT NULL,
  signature_valid BOOLEAN DEFAULT FALSE,
  processed_at TIMESTAMP DEFAULT NOW()
);

-- Índices para Webhook Logs
CREATE INDEX IF NOT EXISTS idx_webhook_logs_event_type ON webhook_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_logs_transaction_id ON webhook_logs(transaction_id);

-- Tabela de Planos
CREATE TABLE IF NOT EXISTS planos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  credits INTEGER NOT NULL,
  billing_cycle TEXT DEFAULT 'monthly',
  features JSONB DEFAULT '[]',
  active BOOLEAN DEFAULT TRUE,
  featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Inserts de Planos Padrão
INSERT INTO planos (id, name, price_cents, credits, features, featured)
VALUES
  ('car_hunter', 'Car Hunter', 19900, 10, '["Até 10 laudos/mês", "Histórico completo", "Acesso app mobile"]', false),
  ('revenda', 'Revenda', 49900, 30, '["Até 30 laudos/mês", "Relatórios em PDF", "API integrada", "Suporte prioritário"]', true),
  ('vistoriadora', 'Vistoriadora', 99900, 100, '["Laudos ilimitados", "White-label", "Integração OBD2", "Dashboard completo", "Suporte 24/7"]', false),
  ('laudo_avulso', 'Laudo Avulso', 9900, 1, '["1 laudo por compra", "Válido por 30 dias"]', false)
ON CONFLICT DO NOTHING;

-- Tabela de Sessões de Pagamento
CREATE TABLE IF NOT EXISTS checkout_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  guest_email TEXT,
  plan_id TEXT NOT NULL,
  amount_cents INTEGER NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('pix', 'card')),
  installments INTEGER DEFAULT 1,
  customer_data JSONB NOT NULL,
  status TEXT DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'EXPIRED')),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Índices para Checkout Sessions
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_user_id ON checkout_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_checkout_sessions_guest_email ON checkout_sessions(guest_email);

-- RLS Policies
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can view all transactions"
  ON transactions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

ALTER TABLE webhook_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only backend can insert webhook logs"
  ON webhook_logs FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Admins can view webhook logs"
  ON webhook_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE user_profiles.id = auth.uid()
      AND user_profiles.role = 'admin'
    )
  );

ALTER TABLE checkout_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can create checkout sessions"
  ON checkout_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Users can view own checkout sessions"
  ON checkout_sessions FOR SELECT
  USING (user_id = auth.uid() OR guest_email IS NOT NULL);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_transactions_updated_at ON transactions;
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_planos_updated_at ON planos;
CREATE TRIGGER update_planos_updated_at BEFORE UPDATE ON planos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
