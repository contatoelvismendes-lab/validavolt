-- ============================================
-- VALIDAVOLT - SUPABASE SCHEMA SQL
-- ============================================
-- Execute este arquivo no Supabase SQL Editor

-- ============================================
-- 1. EXTENSÕES NECESSÁRIAS
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 2. TABELAS DE USUÁRIOS
-- ============================================

-- Perfis de Usuário (Extensão da tabela auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT DEFAULT 'car_hunter', -- admin, lojista, car_hunter, vistoriadora
  company_name TEXT,
  company_cnpj TEXT UNIQUE,
  company_logo_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- RLS Policy
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================
-- 3. CRÉDITOS E FATURAMENTO
-- ============================================

-- Saldo de Créditos
CREATE TABLE IF NOT EXISTS user_credits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES user_profiles(id) ON DELETE CASCADE,
  balance BIGINT DEFAULT 0, -- Número de créditos
  plan_id TEXT DEFAULT 'car_hunter', -- Plano atual
  plan_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_user_credits_user ON user_credits(user_id);

-- RLS Policy
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own credits"
  ON user_credits FOR SELECT
  USING (auth.uid() = user_id);

-- Transações de Crédito
CREATE TABLE IF NOT EXISTS credit_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- add, deduct, refund
  amount BIGINT NOT NULL,
  balance_after BIGINT NOT NULL,
  reason TEXT,
  report_id UUID,
  transaction_id TEXT, -- Para referência ao InfinitePay
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_credit_transactions_user ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_date ON credit_transactions(created_at DESC);

-- RLS Policy
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions"
  ON credit_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 4. VEÍCULOS E DIAGNOSTICOS
-- ============================================

-- Veículos Auditados
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plate TEXT NOT NULL,
  vin TEXT,
  brand TEXT, -- BYD, Tesla, Volvo, etc.
  model TEXT,
  year INT,
  km_traveled BIGINT,
  battery_capacity_kwh DECIMAL(10, 2),
  battery_chemistry TEXT, -- LFP, NMC, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_vehicles_plate ON vehicles(plate);
CREATE INDEX idx_vehicles_vin ON vehicles(vin);
CREATE UNIQUE INDEX idx_vehicles_vin_unique ON vehicles(vin) WHERE vin IS NOT NULL;

-- Auditorias / Diagnósticos
CREATE TABLE IF NOT EXISTS audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft', -- draft, completed, archived

  -- Saúde da Bateria (SoH)
  soh_percentage DECIMAL(5, 2),
  soh_grade TEXT, -- A+, A, B, C, D, E
  available_capacity_kwh DECIMAL(10, 2),
  useful_capacity_kwh DECIMAL(10, 2),
  nominal_capacity_kwh DECIMAL(10, 2),
  estimated_range_km INT,

  -- Telemetria
  total_voltage_v DECIMAL(10, 2),
  cell_max_voltage_mv DECIMAL(10, 2),
  cell_min_voltage_mv DECIMAL(10, 2),
  cell_delta_mv DECIMAL(10, 2), -- Diferença entre maior e menor
  cell_max_id INT,
  cell_min_id INT,
  internal_resistance_mohm DECIMAL(10, 2),

  -- Térmica
  temp_avg_celsius DECIMAL(5, 2),
  temp_max_celsius DECIMAL(5, 2),
  temp_min_celsius DECIMAL(5, 2),
  hours_at_100_soc INT,
  hours_at_low_soc INT,
  ac_charge_percent DECIMAL(5, 2),
  dc_charge_percent DECIMAL(5, 2),

  -- Segurança
  dtc_codes TEXT[], -- Códigos de falha (OBD2)
  high_voltage_contactor_status TEXT,
  pyrofuse_status TEXT,

  -- Parecer Técnico
  technical_opinion TEXT,
  usage_recommendation TEXT,

  -- Dados de Leitura
  reading_method TEXT, -- bluetooth_obd2, api_oem, simulation
  reader_device TEXT,

  -- PDF/Relatório
  pdf_url TEXT,
  pdf_hash TEXT, -- SHA256 para verificação
  qr_code_data TEXT,

  -- Timestamps
  audit_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE -- 90 dias após criação
);

-- Índices
CREATE INDEX idx_audits_user ON audits(user_id);
CREATE INDEX idx_audits_vehicle ON audits(vehicle_id);
CREATE INDEX idx_audits_status ON audits(status);
CREATE INDEX idx_audits_created ON audits(created_at DESC);
CREATE INDEX idx_audits_grade ON audits(soh_grade);

-- RLS Policy
ALTER TABLE audits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audits"
  ON audits FOR SELECT
  USING (auth.uid() = user_id);

-- ============================================
-- 5. LOJISTAS E FUNCIONÁRIOS
-- ============================================

-- Funcionários de Lojistas
CREATE TABLE IF NOT EXISTS employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  shop_owner_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'auditor', -- auditor, manager, admin
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES user_profiles(id)
);

-- Índices
CREATE INDEX idx_employees_shop ON employees(shop_owner_id);
CREATE INDEX idx_employees_user ON employees(user_id);

-- RLS Policy
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 6. PAGAMENTOS E FATURAMENTO
-- ============================================

-- Pagamentos e Assinaturas
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  transaction_id TEXT UNIQUE, -- ID do InfinitePay
  amount_cents BIGINT NOT NULL, -- Valor em centavos
  currency TEXT DEFAULT 'BRL',
  status TEXT DEFAULT 'pending', -- pending, success, failed, refunded
  payment_method TEXT, -- pix, credit_card

  -- Detalhes do pedido
  plan_id TEXT,
  credits_amount BIGINT,
  description TEXT,

  -- Metadados
  metadata JSONB,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Índices
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);
CREATE INDEX idx_payments_created ON payments(created_at DESC);

-- RLS Policy
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own payments"
  ON payments FOR SELECT
  USING (auth.uid() = user_id);

-- Webhook Logs (InfinitePay)
CREATE TABLE IF NOT EXISTS webhook_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  provider TEXT DEFAULT 'infinitepay',
  event_type TEXT,
  payload JSONB,
  processed BOOLEAN DEFAULT FALSE,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_webhook_logs_created ON webhook_logs(created_at DESC);
CREATE INDEX idx_webhook_logs_processed ON webhook_logs(processed);

-- ============================================
-- 7. FUNÇÕES E TRIGGERS
-- ============================================

-- Trigger: Atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_user_credits_updated_at
  BEFORE UPDATE ON user_credits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_vehicles_updated_at
  BEFORE UPDATE ON vehicles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_audits_updated_at
  BEFORE UPDATE ON audits
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Função: Criar créditos ao criar perfil
CREATE OR REPLACE FUNCTION create_credits_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, balance, plan_id)
  VALUES (NEW.id, 0, NEW.role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_credits_on_signup
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION create_credits_on_signup();

-- Função: Deduzir crédito ao criar auditoria
CREATE OR REPLACE FUNCTION deduct_credit_on_audit()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE user_credits
    SET balance = balance - 1
    WHERE user_id = NEW.user_id AND balance > 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deduct_credit_on_audit
  AFTER UPDATE ON audits
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION deduct_credit_on_audit();

-- ============================================
-- 8. STORAGE BUCKETS
-- ============================================
-- Executar no Supabase Storage via interface ou CLI:
-- gsutil mb gs://validavolt-pdfs
-- gsutil mb gs://validavolt-logos
-- gsutil mb gs://validavolt-files

-- ============================================
-- 9. VIEWS ÚTEIS
-- ============================================

-- View: Usuários com saldo
CREATE OR REPLACE VIEW v_users_with_balance AS
SELECT
  up.id,
  up.email,
  up.full_name,
  up.role,
  up.company_name,
  uc.balance,
  uc.plan_id,
  uc.plan_expires_at
FROM user_profiles up
LEFT JOIN user_credits uc ON up.id = uc.user_id;

-- View: Últimas auditorias
CREATE OR REPLACE VIEW v_recent_audits AS
SELECT
  a.id,
  a.user_id,
  up.full_name AS auditor_name,
  v.plate,
  v.brand,
  v.model,
  a.soh_percentage,
  a.soh_grade,
  a.created_at
FROM audits a
JOIN user_profiles up ON a.user_id = up.id
LEFT JOIN vehicles v ON a.vehicle_id = v.id
WHERE a.status = 'completed'
ORDER BY a.created_at DESC
LIMIT 100;

-- ============================================
-- 10. SEEDS DE TESTES (opcional)
-- ============================================
-- Uncomment para popular dados de teste

/*
-- Inserir brand de teste
INSERT INTO user_profiles (
  id, email, full_name, role
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'teste@validavolt.com',
  'Usuário Teste',
  'car_hunter'
) ON CONFLICT DO NOTHING;

-- Inserir créditos
INSERT INTO user_credits (user_id, balance, plan_id)
VALUES ('00000000-0000-0000-0000-000000000001', 10, 'car_hunter')
ON CONFLICT DO NOTHING;
*/
