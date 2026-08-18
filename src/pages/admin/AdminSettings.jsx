import { useEffect, useState } from 'react'
import { Settings, Save, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

export default function AdminSettings() {
  const [settings, setSettings] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [visibleSecrets, setVisibleSecrets] = useState({})

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('system_settings')
        .select('*')
        .order('category')

      if (error) throw error
      setSettings(data || [])
    } catch (error) {
      console.error('Settings fetch error:', error)
      setMessage({ type: 'error', text: 'Erro ao carregar configurações' })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    try {
      setSaving(true)
      setMessage(null)

      for (const setting of settings) {
        const { error } = await supabase
          .from('system_settings')
          .update({ value: setting.value })
          .eq('id', setting.id)

        if (error) throw error
      }

      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Save error:', error)
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' })
    } finally {
      setSaving(false)
    }
  }

  const handleSettingChange = (id, newValue) => {
    setSettings(settings.map(s => s.id === id ? { ...s, value: newValue } : s))
  }

  const toggleSecretVisibility = (id) => {
    setVisibleSecrets(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-dark-border border-t-accent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-neutral-400">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) acc[setting.category] = []
    acc[setting.category].push(setting)
    return acc
  }, {})

  const categoryLabels = {
    'payment': '💳 Pagamentos',
    'general': '⚙️ Geral',
    'email': '📧 Email',
    'security': '🔒 Segurança'
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Settings className="w-8 h-8 text-accent" />
          Configurações do Sistema
        </h1>
        <p className="text-neutral-400">Gerencie as credenciais e configurações da aplicação</p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-green-900/20 border-green-600/30'
            : 'bg-red-900/20 border-red-600/30'
        }`}>
          <AlertCircle className={`w-5 h-5 ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`} />
          <span className={message.type === 'success' ? 'text-green-400' : 'text-red-400'}>{message.text}</span>
        </div>
      )}

      <div className="space-y-8">
        {Object.entries(groupedSettings).map(([category, categorySettings]) => (
          <div key={category} className="card-base">
            <h2 className="text-xl font-bold text-white mb-6">
              {categoryLabels[category] || category}
            </h2>

            <div className="space-y-6">
              {categorySettings.map((setting) => (
                <div key={setting.id} className="pb-6 border-b border-dark-border last:border-0 last:pb-0">
                  <label className="block text-sm font-medium text-white mb-2">
                    {setting.key}
                    {setting.is_secret && (
                      <span className="ml-2 text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded">
                        🔐 Secreto
                      </span>
                    )}
                  </label>
                  {setting.description && (
                    <p className="text-xs text-neutral-400 mb-3">{setting.description}</p>
                  )}

                  <div className="relative">
                    <input
                      type={setting.is_secret && !visibleSecrets[setting.id] ? 'password' : 'text'}
                      value={setting.value}
                      onChange={(e) => handleSettingChange(setting.id, e.target.value)}
                      className="input-base pr-12"
                      placeholder={`Configurar ${setting.key}`}
                    />
                    {setting.is_secret && (
                      <button
                        onClick={() => toggleSecretVisibility(setting.id)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors"
                      >
                        {visibleSecrets[setting.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Botão de Salvar */}
      <div className="mt-8 sticky bottom-8">
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="btn-primary flex items-center justify-center gap-2 w-full md:w-auto"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-dark-bg border-t-transparent rounded-full animate-spin"></div>
              Salvando...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Salvar Configurações
            </>
          )}
        </button>
      </div>

      {/* Info */}
      <div className="mt-12 p-4 bg-blue-900/20 border border-blue-600/30 rounded-lg">
        <p className="text-blue-400 text-sm">
          💡 <strong>Dica:</strong> Essas configurações são armazenadas com segurança no banco de dados.
          Campos marcados como 🔐 Secreto não são expostos em logs ou APIs públicas.
        </p>
      </div>
    </div>
  )
}
