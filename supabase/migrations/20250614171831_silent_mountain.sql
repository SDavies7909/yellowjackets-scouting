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
      - `team_ids` (uuid array, referenced teams)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for public read/write access (suitable for scouting events)
*/

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  number integer UNIQUE NOT NULL,
  name text NOT NULL DEFAULT '',
  mood_tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create strategies table
CREATE TABLE IF NOT EXISTS strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  summary text NOT NULL DEFAULT '',
  team_ids uuid[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;

-- Create policies for teams table (public access for scouting events)
CREATE POLICY "Anyone can read teams"
  ON teams
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert teams"
  ON teams
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update teams"
  ON teams
  FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can delete teams"
  ON teams
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create policies for strategies table
CREATE POLICY "Anyone can read strategies"
  ON strategies
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can insert strategies"
  ON strategies
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can update strategies"
  ON strategies
  FOR UPDATE
  TO anon, authenticated
  USING (true);

CREATE POLICY "Anyone can delete strategies"
  ON strategies
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategies_updated_at
  BEFORE UPDATE ON strategies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();