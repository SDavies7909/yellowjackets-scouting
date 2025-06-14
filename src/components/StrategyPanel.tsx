import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { type Team, type Strategy } from '../lib/supabase'
import { Brain, Users, Target } from 'lucide-react'

interface StrategyPanelProps {
  teams: Team[]
  currentStrategy: Strategy | null
  onGenerateStrategy: (teams: Team[]) => void
  loading: boolean
}

export function StrategyPanel({ teams, currentStrategy, onGenerateStrategy, loading }: StrategyPanelProps) {
  const topTeams = teams.slice(0, 3)

  const generateAutoStrategy = () => {
    if (topTeams.length >= 3) {
      onGenerateStrategy(topTeams)
    }
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-purple-700">
          <Brain className="h-6 w-6" />
          Strategy Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="h-4 w-4" />
          <span>Using top {Math.min(teams.length, 3)} teams</span>
        </div>
        
        <Button 
          onClick={generateAutoStrategy}
          disabled={teams.length < 3 || loading}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          <Target className="h-4 w-4 mr-2" />
          Generate Alliance Strategy
        </Button>
        
        {currentStrategy && (
          <div className="bg-white rounded-lg p-4 border border-purple-200">
            <h4 className="font-semibold text-purple-700 mb-2">Current Strategy:</h4>
            <p className="text-sm text-gray-700 leading-relaxed">
              {currentStrategy.summary}
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Generated: {new Date(currentStrategy.created_at).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}