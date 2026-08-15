/**
 * Valida email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Valida senha (mínimo 8 caracteres)
 */
export const isValidPassword = (password) => {
  return password && password.length >= 8
}

/**
 * Valida placa de veículo
 */
export const isValidPlate = (plate) => {
  const clean = plate?.toUpperCase().replace(/[^A-Z0-9]/g, '') || ''
  return clean.length === 7 || clean.length === 8
}

/**
 * Valida telefone brasileiro
 */
export const isValidPhone = (phone) => {
  const clean = phone?.replace(/[^0-9]/g, '') || ''
  return clean.length === 10 || clean.length === 11
}

/**
 * Valida VIN (Vehicle Identification Number)
 */
export const isValidVIN = (vin) => {
  return vin && vin.length === 17
}

/**
 * Valida campo não vazio
 */
export const isNotEmpty = (value) => {
  return value && value.trim().length > 0
}

/**
 * Valida número
 */
export const isValidNumber = (value) => {
  return !isNaN(value) && isFinite(value)
}

/**
 * Validação genérica de formulário
 */
export const validateForm = (formData, schema) => {
  const errors = {}

  for (const [field, rules] of Object.entries(schema)) {
    const value = formData[field]

    for (const rule of rules) {
      const { validator, message } = rule
      if (!validator(value)) {
        errors[field] = message
        break
      }
    }
  }

  return errors
}
