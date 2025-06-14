import { useState, useEffect } from 'react'
import { supabase, type Strategy } from '../lib/supabase'

export function useStrategy() {
  const [currentStrategy, setCurrentStrategy] = useState<Strategy | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initial fetch
    fetchCurrentStrategy()

    // Set up real-time subscription
    const subscription = supabase
      .channel('strategies_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'strategies' },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setCurrentStrategy(payload.new as Strategy)
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchCurrentStrategy = async () => {
    try {
      const { data, error } = await supabase
        .from('strategies')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setCurrentStrategy(data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch strategy')
    } finally {
      setLoading(false)
    }
  }

  const createStrategy = async (summary: string, teamIds: string[]) => {
    try {
      const { data, error } = await supabase
        .from('strategies')
        .insert([{ summary, team_ids: teamIds }])
        .select()
        .single()

      if (error) throw error
      setCurrentStrategy(data)
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create strategy')
      throw err
    }
  }

  return {
    currentStrategy,
    loading,
    error,
    createStrategy,
    refetch: fetchCurrentStrategy
  }
}