/*
  # FRC Scouting Database Schema

  1. New Tables
    - `teams`
      - `id` (uuid, primary key)
      - `number` (integer, unique team number)
      - `name` (text, team name)
      - `mood_tags` (text array, emoji mood indicators)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `strategies`
      - `id` (uuid, primary key)
      - `summary` (text, strategy description)
      - `team_ids` (uuid array, references to teams)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `match_data`
      - `id` (uuid, primary key)
      - `team_id` (uuid, references teams)
      - `match_number` (integer)
      - `auto_points` (integer)
      - `teleop_points` (integer)
      - `endgame_points` (integer)
      - `notes` (text)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage data
*/

-- Teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer UNIQUE NOT NULL,
  name text NOT NULL,
  mood_tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Strategies table
CREATE TABLE IF NOT EXISTS strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  summary text NOT NULL,
  team_ids uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Match data table
CREATE TABLE IF NOT EXISTS match_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  match_number integer NOT NULL,
  auto_points integer DEFAULT 0,
  teleop_points integer DEFAULT 0,
  endgame_points integer DEFAULT 0,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read teams"
  ON teams
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can insert teams"
  ON teams
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update teams"
  ON teams
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read strategies"
  ON strategies
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can manage strategies"
  ON strategies
  FOR ALL
  TO authenticated
  USING (true);

CREATE POLICY "Anyone can read match data"
  ON match_data
  FOR SELECT
  TO authenticated, anon
  USING (true);

CREATE POLICY "Authenticated users can manage match data"
  ON match_data
  FOR ALL
  TO authenticated
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategies_updated_at
  BEFORE UPDATE ON strategies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();