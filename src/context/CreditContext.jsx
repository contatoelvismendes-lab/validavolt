import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

const CreditContext = createContext()

export const CreditProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Buscar créditos do usuário
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchCredits()

      // Assinar mudanças em tempo real
      const subscription = supabase
        .from('user_credits')
        .on('*', payload => {
          if (payload.new.user_id === user.id) {
            setCredits(payload.new.balance)
          }
        })
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, user?.id])

  const fetchCredits = async () => {
    try {
      setError(null)
      const { data, error } = await supabase
        .from('user_credits')
        .select('balance')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setCredits(data?.balance || 0)
    } catch (err) {
      console.error('Credit fetch error:', err)
      setError(err.message)
      setCredits(0)
    } finally {
      setLoading(false)
    }
  }

  const deductCredit = async (amount = 1, reportId = null) => {
    try {
      setError(null)

      // Verificar se tem saldo
      if (credits < amount) {
        return { success: false, error: 'Saldo insuficiente de créditos' }
      }

      // Deduzir crédito
      const { data, error } = await supabase
        .from('user_credits')
        .update({ balance: credits - amount })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // Log na tabela de transactions
      await supabase.from('credit_transactions').insert([{
        user_id: user.id,
        type: 'deduct',
        amount,
        balance_after: data.balance,
        report_id: reportId,
        created_at: new Date().toISOString()
      }])

      setCredits(data.balance)
      return { success: true, balance: data.balance }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  const addCredits = async (amount, transactionId = null) => {
    try {
      setError(null)

      const { data, error } = await supabase
        .from('user_credits')
        .update({ balance: credits + amount })
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      // Log na tabela de transactions
      await supabase.from('credit_transactions').insert([{
        user_id: user.id,
        type: 'add',
        amount,
        balance_after: data.balance,
        transaction_id: transactionId,
        created_at: new Date().toISOString()
      }])

      setCredits(data.balance)
      return { success: true, balance: data.balance }
    } catch (err) {
      setError(err.message)
      return { success: false, error: err.message }
    }
  }

  const hasEnoughCredits = (amount = 1) => credits >= amount

  const value = {
    credits,
    loading,
    error,
    deductCredit,
    addCredits,
    hasEnoughCredits,
    fetchCredits
  }

  return <CreditContext.Provider value={value}>{children}</CreditContext.Provider>
}

export const useCredits = () => {
  const context = useContext(CreditContext)
  if (!context) {
    throw new Error('useCredits deve ser usado dentro de CreditProvider')
  }
  return context
}
