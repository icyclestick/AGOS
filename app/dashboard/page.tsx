"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Play, MapPin, Users, Droplets, Clock } from "lucide-react";
import {
  mockWaterTowers,
  mockPumpingStations,
  mockBarangays,
  mockAssignmentMatrix,
  mockLiveBarangayData,
  mockLiveTowerData,
  mockLiveStationData,
  mockUserInput,
  type WaterTower,
  type PumpingStation,
  type Barangay,
  type AssignmentMatrix,
  type LiveBarangayData,
  type LiveTowerData,
  type LiveStationData,
  type UserInput,
  type SystemState,
} from "@/lib/supabase";
import {
  runEmergencyWaterSystem,
  type ShortagePrediction,
  type WaterAllocation,
  type StationAssignment,
} from "@/lib/algorithms";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function WaterDistributionDashboard() {
  // Static infrastructure data
  const [waterTowers] = useState<WaterTower[]>(mockWaterTowers);
  const [pumpingStations] = useState<PumpingStation[]>(mockPumpingStations);
  const [barangays] = useState<Barangay[]>(mockBarangays);
  const [assignmentMatrix] = useState<AssignmentMatrix[]>(mockAssignmentMatrix);

  // Live data (simulated)
  const [liveBarangayData] = useState<LiveBarangayData[]>(mockLiveBarangayData);
  const [liveTowerData] = useState<LiveTowerData[]>(mockLiveTowerData);
  const [liveStationData] = useState<LiveStationData[]>(mockLiveStationData);

  // User input
  const [userInput, setUserInput] = useState<UserInput>(mockUserInput);

  // UI state
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState<Barangay | null>(
    null
  );

  // Results
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [hasResults, setHasResults] = useState(false);

  const runSimulation = async () => {
    if (barangays.length === 0 || pumpingStations.length === 0) {
      setError("No data available for simulation");
      return;
    }

    try {
      setSimulating(true);
      setError(null);

      // Run the complete 3-algorithm system
      const results = runEmergencyWaterSystem(
        waterTowers,
        pumpingStations,
        barangays,
        assignmentMatrix,
        liveBarangayData,
        liveTowerData,
        liveStationData,
        userInput
      );

      setSystemState(results);
      setHasResults(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation failed");
    } finally {
      setSimulating(false);
    }
  };

  const criticalCount =
    systemState?.shortagePredictions.filter((r) => r.status === "Critical")
      .length || 0;
  const warningCount =
    systemState?.shortagePredictions.filter((r) => r.status === "Warning")
      .length || 0;
  const totalPopulation = pumpingStations.reduce(
    (sum, s) => sum + s.populationServed,
    0
  );
  const totalWaterAvailable = liveTowerData.reduce(
    (sum, tower) => sum + tower.currentWater,
    0
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Water Distribution Emergency Management
          </h1>
          <p className="text-gray-600">
            Real-time monitoring and emergency response planning using A*,
            Knapsack, and Assignment algorithms
          </p>
        </div>

        {/* Stats and Controls */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
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
                  <p className="text-sm text-gray-600">Population Served</p>
                  <p className="text-2xl font-bold">
                    {totalPopulation.toLocaleString()}
                  </p>
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
                  <p className="text-2xl font-bold text-red-600">
                    {criticalCount + warningCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Droplets className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Available Water</p>
                  <p className="text-2xl font-bold">
                    {totalWaterAvailable.toLocaleString()}L
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Emergency Duration (hours)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={userInput.emergencyDuration}
                  onChange={(e) =>
                    setUserInput({
                      ...userInput,
                      emergencyDuration: Number(e.target.value),
                    })
                  }
                  min="1"
                  max="24"
                  step="1"
                />
                <Button
                  onClick={runSimulation}
                  disabled={simulating}
                  className="w-full"
                  size="sm"
                >
                  {simulating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Run Emergency Analysis
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
            <Card>
              <CardHeader>
                <CardTitle>System Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 relative">
                  {/* Water Towers */}
                  <div className="absolute top-4 left-4">
                    <h4 className="text-sm font-semibold text-blue-800 mb-2">
                      Water Towers
                    </h4>
                    <div className="space-y-1">
                      {waterTowers.map((tower, index) => {
                        const towerData = liveTowerData.find(
                          (t) => t.towerId === tower.id
                        );
                        return (
                          <div
                            key={tower.id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="font-medium">{tower.name}</span>
                            <span className="text-gray-600">
                              {towerData?.currentWater.toLocaleString()}L
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pumping Stations */}
                  <div className="absolute top-4 right-4">
                    <h4 className="text-sm font-semibold text-green-800 mb-2">
                      Pumping Stations
                    </h4>
                    <div className="space-y-1">
                      {pumpingStations.map((station, index) => {
                        const stationData = liveStationData.find(
                          (s) => s.stationId === station.id
                        );
                        const allocation = systemState?.waterAllocations.find(
                          (a) => a.station.id === station.id
                        );
                        return (
                          <div
                            key={station.id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <div
                              className={`w-3 h-3 rounded-full ${
                                allocation?.allocated
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            ></div>
                            <span className="font-medium">{station.name}</span>
                            <span className="text-gray-600">
                              {stationData?.currentFlowRate || 0} L/s
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Barangays */}
                  <div className="absolute bottom-4 left-4 right-4">
                    <h4 className="text-sm font-semibold text-purple-800 mb-2">
                      Barangays
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {barangays.map((barangay) => {
                        const liveData = liveBarangayData.find(
                          (b) => b.barangayId === barangay.id
                        );
                        const prediction =
                          systemState?.shortagePredictions.find(
                            (p) => p.barangay.id === barangay.id
                          );
                        return (
                          <div
                            key={barangay.id}
                            className="flex items-center gap-2 text-xs p-1 bg-white/50 rounded"
                          >
                            <div
                              className={`w-2 h-2 rounded-full ${
                                prediction?.status === "Critical"
                                  ? "bg-red-500"
                                  : prediction?.status === "Warning"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                            ></div>
                            <span className="font-medium">{barangay.name}</span>
                            <span className="text-gray-600">
                              {liveData?.currentFlowRate || 0} L/s
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="bg-white/80 p-3 rounded-lg shadow-sm">
                      <h4 className="text-sm font-semibold mb-2">Legend</h4>
                      <div className="space-y-1 text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <span>Water Towers</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <span>Pumping Stations (Allocated)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                          <span>Pumping Stations (Not Allocated)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span>Barangays (Critical)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>Barangays (Warning)</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span>Barangays (Safe)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Tables */}
          <div className="space-y-6">
            {hasResults && systemState ? (
              <>
                <Tabs defaultValue="shortage" className="w-full mt-8">
                  <TabsList className="mb-4">
                    <TabsTrigger value="shortage">A* Shortage Prediction</TabsTrigger>
                    <TabsTrigger value="knapsack">Knapsack Water Allocation</TabsTrigger>
                    <TabsTrigger value="assignment">Assignment</TabsTrigger>
                  </TabsList>
                  <TabsContent value="shortage">
                    {/* A* Results */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-blue-600">
                            🔍 A* Shortage Prediction
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {systemState.shortagePredictions
                            .slice(0, 5)
                            .map((prediction) => (
                              <div
                                key={prediction.barangay.id}
                                className="flex justify-between items-center p-2 bg-gray-50 rounded"
                              >
                                <span className="font-medium">
                                  {prediction.barangay.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`px-2 py-1 rounded text-xs ${
                                      prediction.status === "Critical"
                                        ? "bg-red-100 text-red-800"
                                        : prediction.status === "Warning"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    {prediction.status}
                                  </span>
                                  <span className="text-sm text-gray-600">
                                    {prediction.timeToShortage.toFixed(1)}h
                                  </span>
                                  {prediction.status === "Critical" && prediction.waterNeededToBeSafe !== undefined && (
                                    <span className="ml-2 px-2 py-1 rounded text-xs bg-red-200 text-red-900 font-semibold">
                                      Needs {Math.ceil(prediction.waterNeededToBeSafe).toLocaleString()}L to be Safe
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="knapsack">
                    {/* Knapsack Results */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-green-600">
                            🎒 Knapsack Water Allocation
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {systemState.waterAllocations.map((allocation) => (
                            <div
                              key={allocation.station.id}
                              className="flex justify-between items-center p-2 bg-gray-50 rounded"
                            >
                              <span className="font-medium">
                                {allocation.station.name}
                              </span>
                              <div className="flex items-center gap-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    allocation.allocated
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {allocation.allocated
                                    ? "Allocated"
                                    : "Not Allocated"}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {allocation.waterAllocated.toLocaleString()}L
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                  <TabsContent value="assignment">
                    {/* Assignment Results */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-purple-600">
                            🚰 Assignment
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {systemState.stationAssignments.map((assignment) => (
                            <div
                              key={assignment.station.id}
                              className="flex flex-col gap-1 p-2 bg-gray-50 rounded"
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-medium">
                                  {assignment.station.name}
                                </span>
                                <span className="text-sm text-gray-600">
                                  Total Delivered: {assignment.totalWaterDelivered.toLocaleString()}L
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {assignment.assignedBarangays.length > 0 ? (
                                  assignment.assignedBarangays.map((barangay) => (
                                    <span
                                      key={barangay.id}
                                      className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800"
                                    >
                                      {barangay.name}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-xs text-gray-400">No barangays assigned</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>

                {/* Summary Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle>Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          Total Water Needed
                        </p>
                        <p className="text-lg font-bold">
                          {systemState.totalWaterNeeded.toLocaleString()}L
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Total Water Allocated
                        </p>
                        <p className="text-lg font-bold text-green-600">
                          {systemState.totalWaterAllocated.toLocaleString()}L
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Barangays Helped
                        </p>
                        <p className="text-lg font-bold text-blue-600">
                          {systemState.barangaysHelped}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">
                          Barangays Not Helped
                        </p>
                        <p className="text-lg font-bold text-red-600">
                          {systemState.barangaysNotHelped}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Algorithm Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">
                        🔍 A* Shortage Prediction
                      </h3>
                      <p className="text-sm text-blue-700">
                        Predicts which barangays will hit water shortage first
                        using flow rate analysis and time-to-shortage
                        estimation.
                      </p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">
                        🎒 Knapsack Water Allocation
                      </h3>
                      <p className="text-sm text-green-700">
                        Optimizes emergency water distribution from towers to
                        pumping stations, maximizing impact with limited supply.
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <h3 className="font-semibold text-purple-900 mb-2">
                        🚰 Heuristic Assignment
                      </h3>
                      <p className="text-sm text-purple-700">
                        Assigns pumping stations to barangays using
                        nearest-first heuristic to minimize delivery distance.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Demo Mode Notice */}
        <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-md">
          <p className="text-sm text-amber-800">
            <strong>Demo Mode:</strong> Using simulated sensor data. In
            production, this would connect to real SCADA systems for live flow
            rates and water levels.
          </p>
        </div>
      </div>
    </div>
  );
}
