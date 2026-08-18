import { useState } from 'react'
import { User, Mail, Phone, LogOut, Save, Camera } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export default function AdminProfile() {
  const { user, profile, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    avatar_url: profile?.avatar_url || ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async () => {
    // Salvar perfil
    setIsEditing(false)
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <User className="w-8 h-8 text-accent" />
          Meu Perfil
        </h1>
        <p className="text-neutral-400">Gerencie suas informações pessoais</p>
      </div>

      {/* Profile Card */}
      <div className="max-w-2xl">
        <div className="card-base">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-dark-border">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-accent/50 flex items-center justify-center">
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="Avatar" className="w-full h-full rounded-full object-cover" />
              ) : (
                <User className="w-12 h-12 text-dark-bg" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{formData.full_name || 'Admin User'}</h2>
              <p className="text-neutral-400 text-sm">Administrador da Plataforma</p>
              <div className="mt-3">
                <span className="inline-block px-3 py-1 bg-green-900/30 text-green-400 text-xs font-medium rounded">
                  ✓ Ativo
                </span>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="space-y-6 mb-8">
            {!isEditing ? (
              // View Mode
              <>
                <div>
                  <label className="text-sm font-medium text-neutral-400 mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <p className="text-white text-lg">{user?.email}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-400 mb-2 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Nome Completo
                  </label>
                  <p className="text-white text-lg">{formData.full_name || 'Não informado'}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-neutral-400 mb-2 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Telefone
                  </label>
                  <p className="text-white text-lg">{formData.phone || 'Não informado'}</p>
                </div>
              </>
            ) : (
              // Edit Mode
              <>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Nome Completo</label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="input-base"
                    placeholder="Seu nome"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.email}
                    disabled
                    className="input-base opacity-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-neutral-400 mt-2">Email não pode ser alterado</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Telefone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-base"
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </>
            )}
          </div>

          {/* Statistics */}
          <div className="mb-8 pb-8 border-b border-dark-border grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-neutral-400 text-sm mb-2">Acesso Desde</p>
              <p className="text-white font-semibold">
                {new Date(profile?.created_at).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="text-center">
              <p className="text-neutral-400 text-sm mb-2">Nível de Acesso</p>
              <p className="text-accent font-semibold">🔑 Administrador</p>
            </div>
            <div className="text-center">
              <p className="text-neutral-400 text-sm mb-2">Status</p>
              <p className="text-green-400 font-semibold">🟢 Online</p>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Editar Perfil
                </button>
                <button
                  onClick={handleLogout}
                  className="btn-secondary flex-1 flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sair
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary flex-1"
                >
                  Cancelar
                </button>
              </>
            )}
          </div>
        </div>

        {/* Security Info */}
        <div className="card-base mt-6">
          <h3 className="text-lg font-semibold text-white mb-4">🔒 Segurança</h3>
          <div className="space-y-3 text-sm text-neutral-400">
            <p>
              ✓ Conta protegida com autenticação de dois fatores (quando habilitada)
            </p>
            <p>
              ✓ Último acesso: Agora
            </p>
            <p>
              ✓ Todas as ações de admin são registradas em auditoria
            </p>
            <button className="mt-4 text-accent hover:text-accent-light transition-colors text-sm font-medium">
              Gerenciar Segurança →
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
