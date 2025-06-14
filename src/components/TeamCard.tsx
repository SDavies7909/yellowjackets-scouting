import { Card, CardContent } from './ui/card'
import { Button } from './ui/button'
import { type Team } from '../lib/supabase'

interface TeamCardProps {
  team: Team
  onAddMoodTag: (teamId: string, emoji: string) => void
}

const moodEmojis = ["🔥", "😐", "🧱", "⚡️", "💪", "😴", "🎯", "⚠️"]

export function TeamCard({ team, onAddMoodTag }: TeamCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg text-blue-600">
            Team {team.number}
          </h3>
          <span className="text-sm text-gray-500">
            #{team.number}
          </span>
        </div>
        
        <p className="text-gray-700 mb-3 font-medium">{team.name}</p>
        
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-600 mb-2">Add Mood:</p>
          <div className="flex flex-wrap gap-1">
            {moodEmojis.map((emoji) => (
              <Button
                key={emoji}
                size="sm"
                variant="outline"
                className="text-lg p-1 h-8 w-8 hover:scale-110 transition-transform"
                onClick={() => onAddMoodTag(team.id, emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-2">
          <p className="text-sm font-medium text-gray-600 mb-1">Current Mood:</p>
          <div className="text-lg">
            {team.mood_tags && team.mood_tags.length > 0 
              ? team.mood_tags.join(' ') 
              : '😐 Neutral'
            }
          </div>
        </div>
      </CardContent>
    </Card>
  )
}