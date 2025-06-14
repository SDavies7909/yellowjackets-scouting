import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { TeamCard } from './components/TeamCard'
import { StrategyPanel } from './components/StrategyPanel'
import { AddTeamDialog } from './components/AddTeamDialog'
import { useTeams } from './hooks/useTeams'
import { useStrategy } from './hooks/useStrategy'
import { Plus, Download, QrCode, Zap } from 'lucide-react'
import { CSVLink } from 'react-csv'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

export default function ScoutingApp() {
  const { teams, loading: teamsLoading, addTeam, updateTeamMoodTags } = useTeams()
  const { currentStrategy, loading: strategyLoading, createStrategy } = useStrategy()
  const [showAddTeam, setShowAddTeam] = useState(false)

  const handleAddMoodTag = async (teamId: string, emoji: string) => {
    const team = teams.find(t => t.id === teamId)
    if (!team) return

    const updatedMoodTags = [...(team.mood_tags || []), emoji]
    await updateTeamMoodTags(teamId, updatedMoodTags)
  }

  const handleGenerateStrategy = async (selectedTeams: typeof teams) => {
    if (selectedTeams.length < 3) return

    const summary = `Alliance Strategy: 
    • Auto Phase: ${selectedTeams[0].name} (Team ${selectedTeams[0].number}) leads autonomous scoring
    • Teleop Cycles: ${selectedTeams[1].name} (Team ${selectedTeams[1].number}) focuses on game piece cycling
    • Defense/Support: ${selectedTeams[2].name} (Team ${selectedTeams[2].number}) provides defensive support and backup scoring
    
    Team Synergy: ${selectedTeams.map(t => `${t.name} (#${t.number})`).join(', ')}
    
    Key Focus: Coordinate timing between auto and teleop phases, maintain communication for optimal game piece flow.`

    await createStrategy(summary, selectedTeams.map(t => t.id))
  }

  const exportToPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(20)
    doc.text('FRC Scouting Report', 20, 20)
    
    const tableData = teams.map(team => [
      team.number.toString(),
      team.name,
      (team.mood_tags || []).join(' ') || 'No mood data'
    ])

    autoTable(doc, {
      head: [['Team #', 'Team Name', 'Mood Tags']],
      body: tableData,
      startY: 30,
    })

    if (currentStrategy) {
      doc.addPage()
      doc.setFontSize(16)
      doc.text('Current Strategy', 20, 20)
      doc.setFontSize(12)
      const splitText = doc.splitTextToSize(currentStrategy.summary, 170)
      doc.text(splitText, 20, 35)
    }

    doc.save('scouting-report.pdf')
  }

  const csvData = teams.map(team => ({
    'Team Number': team.number,
    'Team Name': team.name,
    'Mood Tags': (team.mood_tags || []).join(' '),
    'Last Updated': new Date(team.updated_at).toLocaleString()
  }))

  if (teamsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading scouting data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🐝 Yellow Jackets Scouting
              </h1>
              <p className="text-gray-600">Real-time FRC team analysis with Supabase</p>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-6 w-6 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">
                {teams.length} teams tracked
              </span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setShowAddTeam(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Team
            </Button>
            
            <CSVLink
              data={csvData}
              filename="scouting-data.csv"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </CSVLink>
            
            <Button onClick={exportToPDF} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Teams Grid */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🎨 Team Mood Board
                  <span className="text-sm font-normal text-gray-500">
                    (Real-time updates)
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {teams.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🤖</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      No teams added yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Start by adding your first FRC team to begin scouting
                    </p>
                    <Button onClick={() => setShowAddTeam(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Team
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teams.map(team => (
                      <TeamCard
                        key={team.id}
                        team={team}
                        onAddMoodTag={handleAddMoodTag}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Strategy Panel */}
          <div>
            <StrategyPanel
              teams={teams}
              currentStrategy={currentStrategy}
              onGenerateStrategy={handleGenerateStrategy}
              loading={strategyLoading}
            />
          </div>
        </div>

        {/* QR Code & Deployment Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-teal-50 border-green-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <QrCode className="h-6 w-6" />
                QR Code Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Ready for QR code scanning integration using libraries like:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">react-qr-reader</code></li>
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">html5-qrcode</code></li>
                <li>• <code className="bg-gray-100 px-2 py-1 rounded">@zxing/library</code></li>
              </ul>
              <p className="text-sm text-gray-600 mt-3">
                Scanned data will be stored directly in Supabase for instant real-time updates across all devices.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-700">
                🚀 Deployment Ready
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-3">
                Your app is ready for deployment with:
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• ✅ Supabase backend configured</li>
                <li>• ✅ Real-time data synchronization</li>
                <li>• ✅ Responsive design</li>
                <li>• ✅ Export functionality (CSV/PDF)</li>
                <li>• ✅ Production-ready build</li>
              </ul>
              <p className="text-sm text-gray-600 mt-3">
                Deploy to Netlify, Vercel, or any static hosting provider.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Add Team Dialog */}
        <AddTeamDialog
          open={showAddTeam}
          onOpenChange={setShowAddTeam}
          onAddTeam={addTeam}
        />
      </div>
    </div>
  )
}