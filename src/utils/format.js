/**
 * Formata valor em Real Brasileiro
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value)
}

/**
 * Formata data em formato brasileiro
 */
export const formatDate = (date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(new Date(date))
}

/**
 * Formata placa de veículo (ABC-1234 ou ABCD123)
 */
export const formatPlate = (plate) => {
  const clean = plate?.toUpperCase().replace(/[^A-Z0-9]/g, '') || ''

  if (clean.length === 8) {
    // Formato antigo: ABCD-1234
    return `${clean.slice(0, 4)}-${clean.slice(4)}`
  } else if (clean.length === 7) {
    // Formato Mercosul: ABC-1D23
    return `${clean.slice(0, 3)}-${clean.slice(3)}`
  }

  return plate
}

/**
 * Formata percentual
 */
export const formatPercent = (value, decimals = 1) => {
  return `${Number(value).toFixed(decimals)}%`
}

/**
 * Formata bytes em formato legível
 */
export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Trunca texto com elipsis
 */
export const truncate = (text, length = 50) => {
  if (!text) return ''
  return text.length > length ? text.slice(0, length) + '...' : text
}

/**
 * Capitaliza primeira letra
 */
export const capitalize = (text) => {
  if (!text) return ''
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}
