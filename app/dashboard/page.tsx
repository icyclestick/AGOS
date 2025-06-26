
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Play, MapPin, Users, Droplets } from "lucide-react"
import {
  supabase,
  isSupabaseConfigured,
  mockBarangays,
  mockStations,
  mockCostMatrix,
  type Barangay,
  type PumpingStation,
  type CostMatrix,
} from "@/lib/supabase"
import {
  predictShortages,
  knapsackAllocation,
  hungarianAssignment,
  type ShortageResult,
  type KnapsackResult,
  type AssignmentResult,
} from "@/lib/algorithms"
import { ManilaMap } from "@/components/manila-map"
import { ShortageTable } from "@/components/shortage-table"
import { AllocationTable } from "@/components/allocation-table"
import { AssignmentTable } from "@/components/assignment-table"

export default function WaterDistributionDashboard() {
  const [barangays, setBarangays] = useState<Barangay[]>([])
  const [stations, setStations] = useState<PumpingStation[]>([])
  const [costMatrix, setCostMatrix] = useState<CostMatrix[]>([])
  const [totalSupply, setTotalSupply] = useState<number>(25000)
  const [loading, setLoading] = useState(true)
  const [simulating, setSimulating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedBarangay, setSelectedBarangay] = useState<Barangay | null>(null)

  // Results
  const [shortageResults, setShortageResults] = useState<ShortageResult[]>([])
  const [knapsackResults, setKnapsackResults] = useState<KnapsackResult[]>([])
  const [assignmentResults, setAssignmentResults] = useState<AssignmentResult[]>([])
  const [hasResults, setHasResults] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!isSupabaseConfigured || !supabase) {
        setBarangays(mockBarangays)
        setStations(mockStations)
        setCostMatrix(mockCostMatrix)
        return
      }

      // Fetch from Supabase (would need enhanced schema)
      setBarangays(mockBarangays)
      setStations(mockStations)
      setCostMatrix(mockCostMatrix)
    } catch (err) {
      console.error("Database error, falling back to mock data:", err)
      setBarangays(mockBarangays)
      setStations(mockStations)
      setCostMatrix(mockCostMatrix)
    } finally {
      setLoading(false)
    }
  }

  const runSimulation = async () => {
    if (barangays.length === 0 || stations.length === 0) {
      setError("No data available for simulation")
      return
    }

    try {
      setSimulating(true)
      setError(null)

      // Step 1: A* Shortage Prediction
      const shortages = predictShortages(barangays)
      setShortageResults(shortages)

      // Step 2: Knapsack Allocation
      const allocation = knapsackAllocation(barangays, totalSupply)
      setKnapsackResults(allocation)

      // Step 3: Hungarian Assignment
      const selectedBarangays = allocation.filter((result) => result.allocated).map((result) => result.barangay)
      const assignments = hungarianAssignment(stations, selectedBarangays, costMatrix)
      setAssignmentResults(assignments)

      setHasResults(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation failed")
    } finally {
      setSimulating(false)
    }
  }

  const criticalCount = shortageResults.filter((r) => r.status === "Critical").length
  const warningCount = shortageResults.filter((r) => r.status === "Warning").length
  const totalPopulation = barangays.reduce((sum, b) => sum + b.population, 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading Manila water distribution data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Manila Water Distribution Dashboard</h1>
          <p className="text-gray-600">Real-time barangay water shortage monitoring and emergency response planning</p>
        </div>

        {/* Stats and Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Barangays</p>
                  <p className="text-2xl font-bold">{barangays.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Population</p>
                  <p className="text-2xl font-bold">{totalPopulation.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">At Risk</p>
                  <p className="text-2xl font-bold text-red-600">{criticalCount + warningCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Label htmlFor="supply">Emergency Supply (L)</Label>
                <Input
                  id="supply"
                  type="number"
                  value={totalSupply}
                  onChange={(e) => setTotalSupply(Number(e.target.value))}
                  min="0"
                  step="1000"
                />
                <Button onClick={runSimulation} disabled={simulating} className="w-full" size="sm">
                  {simulating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                  Run Simulation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Map Section */}
          <div className="lg:row-span-3">
            <ManilaMap
              barangays={barangays}
              stations={stations}
              shortageResults={shortageResults}
              selectedBarangay={selectedBarangay}
              onBarangayClick={setSelectedBarangay}
            />
          </div>

          {/* Results Tables */}
          <div className="space-y-6">
            {hasResults ? (
              <>
                <ShortageTable results={shortageResults} />
                <AllocationTable results={knapsackResults} />
                <AssignmentTable results={assignmentResults} />
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Algorithm Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">🔍 A* Shortage Prediction</h3>
                      <p className="text-sm text-blue-700">
                        Analyzes current water levels and consumption patterns to predict shortage timelines for each
                        barangay.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">🎒 Knapsack Allocation</h3>
                      <p className="text-sm text-green-700">
                        Optimizes emergency water distribution by prioritizing barangays based on population and
                        urgency.
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h3 className="font-semibold text-purple-900 mb-2">🚰 Assignment Problem</h3>
                      <p className="text-sm text-purple-700">
                        Assigns pumping stations to barangays to minimize transportation costs and delivery time.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {!isSupabaseConfigured && (
          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800">
              <strong>Demo Mode:</strong> Using mock Manila barangay data. Configure Supabase to use live database.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
