import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Team = {
  id: string
  number: number
  name: string
  mood_tags: string[]
  created_at: string
  updated_at: string
}

export type Strategy = {
  id: string
  summary: string
  team_ids: string[]
  created_at: string
  updated_at: string
}

export type MatchData = {
  id: string
  team_id: string
  match_number: number
  auto_points: number
  teleop_points: number
  endgame_points: number
  notes: string
  created_at: string
}