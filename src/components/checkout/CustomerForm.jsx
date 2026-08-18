import { useState, useEffect } from 'react'
import { AlertCircle } from 'lucide-react'

const validateCPF = (cpf) => {
  const cleanCPF = cpf.replace(/\D/g, '')
  if (cleanCPF.length !== 11) return false

  let sum = 0
  let remainder

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i)
  }

  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false

  sum = 0
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i)
  }

  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false

  return true
}

const validateCNPJ = (cnpj) => {
  const cleanCNPJ = cnpj.replace(/\D/g, '')
  if (cleanCNPJ.length !== 14) return false

  let sum = 0
  let remainder

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ[i]) * (5 - (i % 4))
  }

  remainder = 11 - (sum % 11)
  if (remainder > 9) remainder = 0
  if (remainder !== parseInt(cleanCNPJ[12])) return false

  sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cleanCNPJ[i]) * (6 - ((i + 1) % 5))
  }

  remainder = 11 - (sum % 11)
  if (remainder > 9) remainder = 0
  if (remainder !== parseInt(cleanCNPJ[13])) return false

  return true
}

const formatDocument = (value) => {
  const cleanValue = value.replace(/\D/g, '')

  if (cleanValue.length <= 11) {
    return cleanValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  } else {
    return cleanValue
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
  }
}

const formatPhone = (value) => {
  const cleanValue = value.replace(/\D/g, '')
  return cleanValue
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

export default function CustomerForm({ initialData, onChange, onValidChange }) {
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState({})
  const [documentType, setDocumentType] = useState('cpf')

  useEffect(() => {
    setFormData(initialData)
  }, [initialData])

  useEffect(() => {
    validateForm()
  }, [formData])

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name || formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres'
    }

    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }

    if (!formData.document) {
      newErrors.document = 'CPF/CNPJ é obrigatório'
    } else {
      const cleanDoc = formData.document.replace(/\D/g, '')
      if (cleanDoc.length === 11) {
        if (!validateCPF(cleanDoc)) {
          newErrors.document = 'CPF inválido'
        }
      } else if (cleanDoc.length === 14) {
        if (!validateCNPJ(cleanDoc)) {
          newErrors.document = 'CNPJ inválido'
        }
      } else {
        newErrors.document = 'CPF ou CNPJ inválido'
      }
    }

    if (!formData.phone || formData.phone.replace(/\D/g, '').length < 10) {
      newErrors.phone = 'Telefone inválido'
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    onValidChange(isValid)
    return isValid
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    let formattedValue = value

    if (name === 'document') {
      formattedValue = formatDocument(value)
    } else if (name === 'phone') {
      formattedValue = formatPhone(value)
    }

    const newData = {
      ...formData,
      [name]: formattedValue,
    }

    setFormData(newData)
    onChange(newData)
  }

  return (
    <div className="space-y-4">
      {/* Nome/Razão Social */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Nome / Razão Social
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Seu nome completo ou empresa"
          className={`input-base ${errors.name ? 'border-red-500' : ''}`}
        />
        {errors.name && (
          <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errors.name}
          </div>
        )}
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="seu@email.com"
          className={`input-base ${errors.email ? 'border-red-500' : ''}`}
        />
        {errors.email && (
          <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errors.email}
          </div>
        )}
      </div>

      {/* CPF/CNPJ */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          CPF / CNPJ
        </label>
        <input
          type="text"
          name="document"
          value={formData.document}
          onChange={handleChange}
          placeholder="Seu CPF ou CNPJ"
          className={`input-base ${errors.document ? 'border-red-500' : ''}`}
          maxLength="18"
        />
        {errors.document && (
          <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errors.document}
          </div>
        )}
        <p className="text-xs text-neutral-400 mt-2">
          {formData.document.replace(/\D/g, '').length === 11
            ? 'CPF'
            : formData.document.replace(/\D/g, '').length === 14
              ? 'CNPJ'
              : 'CPF ou CNPJ'}
        </p>
      </div>

      {/* Telefone/WhatsApp */}
      <div>
        <label className="block text-sm font-medium text-white mb-2">
          Telefone / WhatsApp
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="(11) 99999-9999"
          className={`input-base ${errors.phone ? 'border-red-500' : ''}`}
          maxLength="15"
        />
        {errors.phone && (
          <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            {errors.phone}
          </div>
        )}
      </div>
    </div>
  )
}
