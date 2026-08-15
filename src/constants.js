/**
 * Tipos de usuário
 */
export const USER_ROLES = {
  ADMIN: 'admin',
  LOJISTA: 'lojista',
  CAR_HUNTER: 'car_hunter',
  VISTORIADORA: 'vistoriadora'
}

/**
 * Planos disponíveis
 */
export const PLANS = {
  CAR_HUNTER: {
    id: 'car_hunter',
    name: 'Car Hunter',
    price: 199,
    credits: 8,
    users: 1,
    description: 'Para compradores individuais'
  },
  REVENDA: {
    id: 'revenda',
    name: 'Revenda',
    price: 499,
    credits: 20,
    users: 3,
    description: 'Para revendas e concessionárias'
  },
  VISTORIADORA: {
    id: 'vistoriadora',
    name: 'Vistoriadora',
    price: 999,
    credits: -1, // Ilimitado
    users: -1, // Ilimitado
    description: 'Para empresas de vistoria'
  }
}

/**
 * Grades de saúde da bateria
 */
export const BATTERY_GRADES = {
  'A+': { min: 95, color: '#00E676', label: 'Excelente' },
  'A': { min: 90, color: '#69F0AE', label: 'Muito Bom' },
  'B': { min: 80, color: '#FFD600', label: 'Bom' },
  'C': { min: 70, color: '#FFA500', label: 'Regular' },
  'D': { min: 60, color: '#FF6B6B', label: 'Ruim' },
  'E': { min: 0, color: '#D32F2F', label: 'Crítico' }
}

/**
 * Status de transação
 */
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded'
}

/**
 * Tipos de transação de crédito
 */
export const CREDIT_TRANSACTION_TYPES = {
  ADD: 'add',
  DEDUCT: 'deduct',
  REFUND: 'refund'
}

/**
 * APIs de montadoras (para telemetria)
 */
export const OEM_APIS = {
  TESLA: 'tesla',
  VOLVO: 'volvo',
  BYD: 'byd',
  GWM: 'gwm'
}

/**
 * Marcas de veículos suportadas
 */
export const VEHICLE_BRANDS = [
  'BYD',
  'Tesla',
  'Volvo',
  'GWM',
  'Volkswagen',
  'Audi',
  'BMW',
  'Mercedes-Benz',
  'Hyundai',
  'Kia',
  'Nissan',
  'Renault',
  'Fiat',
  'Chevrolet',
  'Peugeot',
  'Citroën'
]

/**
 * Mensagens de erro comuns
 */
export const ERROR_MESSAGES = {
  INSUFFICIENT_CREDITS: 'Saldo insuficiente de créditos',
  AUTHENTICATION_FAILED: 'Falha na autenticação. Verifique suas credenciais.',
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  DEVICE_NOT_FOUND: 'Dispositivo Bluetooth não encontrado',
  INVALID_EMAIL: 'Email inválido',
  INVALID_PASSWORD: 'Senha deve ter pelo menos 8 caracteres',
  INVALID_PLATE: 'Placa de veículo inválida',
  USER_NOT_FOUND: 'Usuário não encontrado',
  UNAUTHORIZED: 'Você não tem permissão para acessar este recurso'
}

/**
 * Mensagens de sucesso comuns
 */
export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Perfil atualizado com sucesso',
  PLAN_UPGRADED: 'Plano atualizado com sucesso',
  CREDITS_PURCHASED: 'Créditos adicionados com sucesso',
  REPORT_GENERATED: 'Relatório gerado com sucesso',
  LOGOUT_SUCCESS: 'Você foi desconectado'
}

/**
 * Rutas da aplicação
 */
export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/cadastro',
  DASHBOARD: '/painel',
  DIAGNOSTIC: '/diagnostico',
  REPORT: '/laudo',
  PLANS: '/planos',
  SHOP_OWNER: '/lojista',
  ADMIN: '/admin',
  VALIDATE: '/v/:id'
}

/**
 * Tempo de expiração de dados em cache (ms)
 */
export const CACHE_DURATION = {
  CREDITS: 5 * 60 * 1000, // 5 minutos
  PROFILE: 10 * 60 * 1000, // 10 minutos
  REPORTS: 15 * 60 * 1000 // 15 minutos
}
