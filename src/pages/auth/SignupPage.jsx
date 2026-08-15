import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { AlertCircle, Mail, Lock, User, Zap, ChevronRight } from 'lucide-react'

export default function SignupPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'car_hunter', // car_hunter, lojista, vistoriadora
    phone: ''
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem')
      return
    }

    setLoading(true)

    try {
      const { success, error: signupError } = await signup(
        formData.email,
        formData.password,
        {
          full_name: formData.fullName,
          role: formData.role,
          phone: formData.phone
        }
      )

      if (success) {
        navigate('/painel')
      } else {
        setError(signupError || 'Falha ao criar conta')
      }
    } catch (err) {
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-dark-card border border-dark-border mb-4">
            <Zap className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ValidaVolt</h1>
          <p className="text-neutral-400 text-sm">Criar Conta</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${
                s <= step ? 'bg-accent' : 'bg-dark-border'
              }`}
            ></div>
          ))}
        </div>

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="card-base mb-6">
          {error && (
            <div className="flex gap-3 p-4 rounded-lg bg-red-900/20 border border-red-600/30 mb-4">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {step === 1 ? (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">
                Informações Básicas
              </h2>

              {/* Full Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">
                  Nome Completo
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="input-base pl-10"
                    placeholder="Seu nome"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="input-base pl-10"
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">
                  WhatsApp
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  className="input-base"
                  placeholder="(11) 99999-9999"
                />
              </div>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Próximo
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-white mb-6">
                Tipo de Conta
              </h2>

              {/* Role Selection */}
              <div className="space-y-3 mb-6">
                {[
                  {
                    value: 'car_hunter',
                    label: 'Car Hunter',
                    desc: 'Comprador individual de veículos'
                  },
                  {
                    value: 'lojista',
                    label: 'Revenda/Lojista',
                    desc: 'Donos de concessionárias'
                  },
                  {
                    value: 'vistoriadora',
                    label: 'Vistoriadora',
                    desc: 'Empresa de vistoria profissional'
                  }
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                      formData.role === option.value
                        ? 'border-accent bg-dark-card'
                        : 'border-dark-border hover:border-dark-border'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={formData.role === option.value}
                      onChange={handleChange}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-medium text-white text-sm">{option.label}</p>
                      <p className="text-xs text-neutral-500">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* Passwords */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-white mb-2">
                  Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="input-base pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-white mb-2">
                  Confirme a Senha
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="input-base pl-10"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary flex-1"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex-1"
                >
                  {loading ? 'Criando...' : 'Criar Conta'}
                </button>
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <p className="text-center text-sm text-neutral-400">
          Já tem conta?{' '}
          <Link to="/login" className="text-accent hover:underline font-medium">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
