import { useState, useEffect } from 'react'
import { supabase, type Team } from '../lib/supabase'

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initial fetch
    fetchTeams()

    // Set up real-time subscription
    const subscription = supabase
      .channel('teams_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'teams' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setTeams(prev => [...prev, payload.new as Team])
          } else if (payload.eventType === 'UPDATE') {
            setTeams(prev => prev.map(team => 
              team.id === payload.new.id ? payload.new as Team : team
            ))
          } else if (payload.eventType === 'DELETE') {
            setTeams(prev => prev.filter(team => team.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('number')

      if (error) throw error
      setTeams(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teams')
    } finally {
      setLoading(false)
    }
  }

  const addTeam = async (number: number, name: string) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert([{ number, name }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add team')
      throw err
    }
  }

  const updateTeamMoodTags = async (teamId: string, moodTags: string[]) => {
    try {
      const { error } = await supabase
        .from('teams')
        .update({ mood_tags: moodTags })
        .eq('id', teamId)

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update mood tags')
      throw err
    }
  }

  return {
    teams,
    loading,
    error,
    addTeam,
    updateTeamMoodTags,
    refetch: fetchTeams
  }
}