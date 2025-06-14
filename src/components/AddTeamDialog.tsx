import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from './ui/dialog'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Plus, X } from 'lucide-react'

interface AddTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAddTeam: (number: number, name: string) => Promise<void>
}

export function AddTeamDialog({ open, onOpenChange, onAddTeam }: AddTeamDialogProps) {
  const [teamNumber, setTeamNumber] = useState('')
  const [teamName, setTeamName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!teamNumber || !teamName) return

    setLoading(true)
    try {
      await onAddTeam(parseInt(teamNumber), teamName)
      setTeamNumber('')
      setTeamName('')
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to add team:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <div className="flex items-center justify-between">
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Team
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Number
            </label>
            <Input
              type="number"
              value={teamNumber}
              onChange={(e) => setTeamNumber(e.target.value)}
              placeholder="e.g., 1234"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team Name
            </label>
            <Input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="e.g., Yellow Jackets"
              required
            />
          </div>
          
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !teamNumber || !teamName}
              className="flex-1"
            >
              {loading ? 'Adding...' : 'Add Team'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}