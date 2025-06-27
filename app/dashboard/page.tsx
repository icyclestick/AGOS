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
  mockTowerStationMapping,
  mockUserInput,
  type WaterTower,
  type PumpingStation,
  type Barangay,
  type AssignmentMatrix,
  type LiveBarangayData,
  type LiveTowerData,
  type LiveStationData,
  type TowerStationMapping,
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
  const [towerStationMapping] = useState<TowerStationMapping[]>(mockTowerStationMapping);

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
        towerStationMapping,
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
                        // Check if this station has any assigned barangays in the assignment results
                        const stationAssignment = systemState?.stationAssignments.find(
                          (sa) => sa.station.id === station.id
                        );
                        const hasAllocation = stationAssignment && stationAssignment.assignedBarangays.length > 0;
                        return (
                          <div
                            key={station.id}
                            className="flex items-center gap-2 text-xs"
                          >
                            <div
                              className={`w-3 h-3 rounded-full ${
                                hasAllocation
                                  ? "bg-green-500"
                                  : "bg-gray-400"
                              }`}
                            ></div>
                            <span className="font-medium">{station.name}</span>
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
                              {liveData?.currentFlowRate || 0}
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
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2 font-medium">Barangay</th>
                                <th className="text-left p-2 font-medium">Current Flow Rate</th>
                                <th className="text-left p-2 font-medium">Threshold</th>
                                <th className="text-left p-2 font-medium">Drop Rate (L/s/hr)</th>
                                <th className="text-left p-2 font-medium">Time to Shortage (h)</th>
                                <th className="text-left p-2 font-medium">Status</th>
                                <th className="text-left p-2 font-medium">Water Needed (L)</th>
                                <th className="text-left p-2 font-medium">Current Water Supply (L)</th>
                                <th className="text-left p-2 font-medium">Target Flow Rate</th>
                              </tr>
                            </thead>
                            <tbody>
                              {systemState.shortagePredictions.map((prediction) => {
                                const liveData = systemState.liveBarangayData.find(d => d.barangayId === prediction.barangay.id);
                                const currentFlowRate = liveData?.currentFlowRate || 0;
                                // Current water supply based on 1 hour, not emergency duration
                                const currentWaterSupply = currentFlowRate * 3600; // 1 hour in seconds
                                const threshold = 20; // L/s threshold for safety
                                const dropRate = liveData?.dropRate || 0;
                                const dropRatePerSecond = dropRate / 3600; // convert L/s/hr to L/s
                                const emergencyDuration = systemState.userInput.emergencyDuration;
                                
                                // Calculate dynamic target flow rate
                                const targetFlowRate = threshold + (dropRatePerSecond * emergencyDuration * 3600);
                                
                                return (
                                  <tr key={prediction.barangay.id} className="border-b">
                                    <td className="p-2 font-medium">{prediction.barangay.name}</td>
                                    <td className="p-2">{currentFlowRate}</td>
                                    <td className="p-2">{threshold}</td>
                                    <td className="p-2">{dropRate}</td>
                                    <td className="p-2">{prediction.timeToShortage.toFixed(1)}</td>
                                    <td className="p-2">
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
                                    </td>
                                    <td className="p-2">
                                      {prediction.waterNeededToBeSafe ? 
                                        Math.ceil(prediction.waterNeededToBeSafe).toLocaleString() : 
                                        "0"
                                      }
                                    </td>
                                    <td className="p-2">{Math.round(currentWaterSupply).toLocaleString()}</td>
                                    <td className="p-2 font-semibold">{targetFlowRate.toFixed(1)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Computation of Total Water Needed */}
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-orange-600">
                            📊 Computation of Total Water Needed
                                </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2 font-medium">Barangay</th>
                                <th className="text-left p-2 font-medium">Status</th>
                                <th className="text-left p-2 font-medium">Current Flow Rate</th>
                                <th className="text-left p-2 font-medium">Target Flow Rate</th>
                                <th className="text-left p-2 font-medium">Flow Rate After Emergency</th>
                                <th className="text-left p-2 font-medium">Water Needed (L)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {systemState.shortagePredictions
                                .map((prediction) => {
                                  const liveData = systemState.liveBarangayData.find(d => d.barangayId === prediction.barangay.id);
                                  const threshold = 20; // L/s threshold for safety
                                  const dropRate = liveData?.dropRate || 0;
                                  const dropRatePerSecond = dropRate / 3600; // convert L/s/hr to L/s
                                  const emergencyDuration = systemState.userInput.emergencyDuration;
                                  
                                  // Calculate dynamic target flow rate
                                  const targetFlowRate = threshold + (dropRatePerSecond * emergencyDuration * 3600);
                                  
                                  // Calculate flow rate after emergency
                                  const currentFlowRate = liveData?.currentFlowRate || 0;
                                  const flowRateAfterEmergency = currentFlowRate - (dropRatePerSecond * emergencyDuration * 3600);
                                  
                                  // Barangay doesn't need water if current flow rate is bigger than target flow rate
                                  const needsWater = currentFlowRate < targetFlowRate;
                                  
                                  return (
                                    <tr key={prediction.barangay.id} className="border-b">
                                      <td className="p-2 font-medium">{prediction.barangay.name}</td>
                                      <td className="p-2">
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
                                      </td>
                                      <td className="p-2">{currentFlowRate}</td>
                                      <td className="p-2 font-semibold">{targetFlowRate.toFixed(1)}</td>
                                      <td className="p-2">{flowRateAfterEmergency.toFixed(1)}</td>
                                      <td className="p-2 font-semibold">
                                        {needsWater && prediction.waterNeededToBeSafe ? 
                                          Math.ceil(prediction.waterNeededToBeSafe).toLocaleString() : 
                                          "0"
                                        }
                                      </td>
                                    </tr>
                                  );
                                })
                                .filter((_, index) => {
                                  // Filter to show only barangays that need water
                                  const prediction = systemState.shortagePredictions[index];
                                  const liveData = systemState.liveBarangayData.find(d => d.barangayId === prediction.barangay.id);
                                  const threshold = 20;
                                  const dropRate = liveData?.dropRate || 0;
                                  const dropRatePerSecond = dropRate / 3600;
                                  const emergencyDuration = systemState.userInput.emergencyDuration;
                                  const targetFlowRate = threshold + (dropRatePerSecond * emergencyDuration * 3600);
                                  const currentFlowRate = liveData?.currentFlowRate || 0;
                                  
                                  return currentFlowRate < targetFlowRate;
                                })}
                            </tbody>
                            <tfoot>
                              <tr className="border-t-2 bg-gray-50">
                                <td colSpan={5} className="p-2 font-semibold text-right">Total Water Needed:</td>
                                <td className="p-2 font-bold">
                                  {systemState.shortagePredictions
                                    .filter(prediction => {
                                      const liveData = systemState.liveBarangayData.find(d => d.barangayId === prediction.barangay.id);
                                      const threshold = 20;
                                      const dropRate = liveData?.dropRate || 0;
                                      const dropRatePerSecond = dropRate / 3600;
                                      const emergencyDuration = systemState.userInput.emergencyDuration;
                                      const targetFlowRate = threshold + (dropRatePerSecond * emergencyDuration * 3600);
                                      const currentFlowRate = liveData?.currentFlowRate || 0;
                                      
                                      return currentFlowRate < targetFlowRate;
                                    })
                                    .reduce((sum, prediction) => sum + (prediction.waterNeededToBeSafe || 0), 0)
                                    .toLocaleString()}L
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Barangay Water Donation Capacity */}
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-teal-600">
                            💧 Barangay Water Donation Capacity (Pre-Knapsack)
                                  </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2 font-medium">Barangay</th>
                                <th className="text-left p-2 font-medium">Status</th>
                                <th className="text-left p-2 font-medium">Current Flow Rate</th>
                                <th className="text-left p-2 font-medium">Target Flow Rate</th>
                                <th className="text-left p-2 font-medium">Max Safe Donation (L)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                // Calculate potential suppliers (same logic as in the algorithm)
                                const potentialSuppliers = systemState.shortagePredictions
                                  .filter(prediction => {
                                    return prediction.timeToShortage > systemState.userInput.emergencyDuration;
                                  })
                                  .map(prediction => {
                                    const liveData = systemState.liveBarangayData.find(d => d.barangayId === prediction.barangay.id);
                                    if (!liveData) return null;
                                    
                                    const currentFlowRate = liveData.currentFlowRate;
                                    const dropRatePerSecond = liveData.dropRate / 3600;
                                    
                                    const threshold = 20;
                                    const targetFlowRate = threshold + (dropRatePerSecond * systemState.userInput.emergencyDuration * 3600);
                                    
                                    // Simple calculation: (Current Flow Rate - Safe Flow Rate) × 3600
                                    const maxSafeDonation = Math.max(0, (currentFlowRate - targetFlowRate) * 3600);
                                    
                                    return {
                                      barangay: prediction.barangay,
                                      status: prediction.status,
                                      currentFlowRate,
                                      safeFlowRate: targetFlowRate,
                                      maxSafeDonation: maxSafeDonation
                                    };
                                  })
                                  .filter((supplier): supplier is NonNullable<typeof supplier> => supplier !== null && supplier.maxSafeDonation > 0);
                                
                                return potentialSuppliers.map((supplier) => (
                                  <tr key={supplier.barangay.id} className="border-b">
                                    <td className="p-2 font-medium">{supplier.barangay.name}</td>
                                    <td className="p-2">
                                      <span
                                        className={`px-2 py-1 rounded text-xs ${
                                          supplier.status === "Critical"
                                            ? "bg-red-100 text-red-800"
                                            : supplier.status === "Warning"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-green-100 text-green-800"
                                        }`}
                                      >
                                        {supplier.status}
                                    </span>
                                    </td>
                                    <td className="p-2">{supplier.currentFlowRate}</td>
                                    <td className="p-2 font-semibold">{supplier.safeFlowRate.toFixed(1)}</td>
                                    <td className="p-2 font-bold text-green-600">
                                      {Math.round(supplier.maxSafeDonation).toLocaleString()}
                                    </td>
                                  </tr>
                                ));
                              })()}
                            </tbody>
                            <tfoot>
                              <tr className="border-t-2 bg-gray-50">
                                <td colSpan={4} className="p-2 font-semibold text-right">Total Available for Donation:</td>
                                <td className="p-2 font-bold">
                                  {(() => {
                                    const totalExcessWater = systemState.shortagePredictions
                                      .filter(prediction => {
                                        return prediction.timeToShortage > systemState.userInput.emergencyDuration;
                                      })
                                      .reduce((sum, prediction) => {
                                        const liveData = systemState.liveBarangayData.find(d => d.barangayId === prediction.barangay.id);
                                        if (!liveData) return sum;
                                        
                                        const currentFlowRate = liveData.currentFlowRate;
                                        const dropRatePerSecond = liveData.dropRate / 3600;
                                        
                                        const threshold = 20;
                                        const targetFlowRate = threshold + (dropRatePerSecond * systemState.userInput.emergencyDuration * 3600);
                                        
                                        // Simple calculation: (Current Flow Rate - Safe Flow Rate) × 3600
                                        const maxSafeDonation = Math.max(0, (currentFlowRate - targetFlowRate) * 3600);
                                        
                                        return sum + maxSafeDonation;
                                      }, 0);
                                    
                                    return totalExcessWater.toLocaleString();
                                  })()}L
                                </td>
                              </tr>
                            </tfoot>
                          </table>
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
                            🎒 Knapsack Water Allocation (Branch & Bound)
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2 font-medium">Barangay</th>
                                <th className="text-left p-2 font-medium">Status</th>
                                <th className="text-left p-2 font-medium">Priority</th>
                                <th className="text-left p-2 font-medium">Water Needed (L)</th>
                                <th className="text-left p-2 font-medium">Allocation Status</th>
                                <th className="text-left p-2 font-medium">Water Allocated (L)</th>
                                <th className="text-left p-2 font-medium">Water Sources</th>
                              </tr>
                            </thead>
                            <tbody>
                          {systemState.waterAllocations.map((allocation) => (
                                <tr key={allocation.barangay.id} className="border-b">
                                  <td className="p-2 font-medium">{allocation.barangay.name}</td>
                                  <td className="p-2">
                                    <span
                                      className={`px-2 py-1 rounded text-xs ${
                                        allocation.status === "Critical"
                                          ? "bg-red-100 text-red-800"
                                          : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {allocation.status}
                              </span>
                                  </td>
                                  <td className="p-2">{allocation.priority}</td>
                                  <td className="p-2">{allocation.waterNeeded.toLocaleString()}</td>
                                  <td className="p-2">
                                <span
                                  className={`px-2 py-1 rounded text-xs ${
                                    allocation.allocated
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                      {allocation.allocated ? "Allocated" : "Not Allocated"}
                                </span>
                                  </td>
                                  <td className="p-2 font-semibold">
                                    {allocation.waterAllocated.toLocaleString()}
                                  </td>
                                  <td className="p-2">
                                    <div className="text-xs">
                                      {allocation.waterSources && allocation.waterSources.length > 0 ? (
                                        allocation.waterSources.map((source, index) => (
                                          <div key={index} className="text-blue-600">
                                            {source}
                              </div>
                                        ))
                                      ) : (
                                        <span className="text-gray-400">No sources</span>
                                      )}
                            </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              <tr className="border-t-2 bg-gray-50">
                                <td colSpan={5} className="p-2 font-semibold text-right">Total Water Allocated:</td>
                                <td colSpan={2} className="p-2 font-bold">
                                  {systemState.waterAllocations
                                    .reduce((sum, wa) => sum + wa.waterAllocated, 0)
                                    .toLocaleString()}L
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Tower-Station Assignments */}
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-indigo-600">
                            🏗️ Tower-Station Assignments
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2 font-medium">Water Tower</th>
                                <th className="text-left p-2 font-medium">Assigned Station</th>
                                <th className="text-left p-2 font-medium">Current Water (L)</th>
                                <th className="text-left p-2 font-medium">Max Capacity (L)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {towerStationMapping.map((mapping) => {
                                const tower = waterTowers.find(t => t.id === mapping.towerId);
                                const station = pumpingStations.find(s => s.id === mapping.stationId);
                                const liveTower = liveTowerData.find(t => t.towerId === mapping.towerId);
                                
                                return (
                                  <tr key={mapping.towerId} className="border-b">
                                    <td className="p-2 font-medium">{tower?.name || mapping.towerId}</td>
                                    <td className="p-2 font-medium">{station?.name || mapping.stationId}</td>
                                    <td className="p-2 font-semibold text-blue-600">
                                      {(liveTower?.currentWater || 0).toLocaleString()}
                                    </td>
                                    <td className="p-2">{(tower?.maxCapacity || 0).toLocaleString()}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Updated Barangay Status After Water Allocation */}
                    <Card className="mt-6">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span className="text-purple-600">
                            📊 Updated Barangay Status After Water Allocation
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2 font-medium">Barangay</th>
                                <th className="text-left p-2 font-medium">Original Flow Rate</th>
                                <th className="text-left p-2 font-medium">Original Water Supply (L)</th>
                                <th className="text-left p-2 font-medium">Water Received (L)</th>
                                <th className="text-left p-2 font-medium">Water Given (L)</th>
                                <th className="text-left p-2 font-medium">Updated Flow Rate</th>
                                <th className="text-left p-2 font-medium">Target Flow Rate</th>
                                <th className="text-left p-2 font-medium">Updated Water Supply (L)</th>
                                <th className="text-left p-2 font-medium">Threshold</th>
                                <th className="text-left p-2 font-medium">Drop Rate (L/s/hr)</th>
                                <th className="text-left p-2 font-medium">Time to Shortage (h)</th>
                                <th className="text-left p-2 font-medium">Original Status</th>
                                <th className="text-left p-2 font-medium">Updated Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {systemState.shortagePredictions.map((prediction) => {
                                const liveData = systemState.liveBarangayData.find(d => d.barangayId === prediction.barangay.id);
                                const allocation = systemState.waterAllocations.find(a => a.barangay.id === prediction.barangay.id);
                                const originalFlowRate = liveData?.currentFlowRate || 0;
                                const waterReceived = allocation?.waterAllocated || 0;
                                
                                // Calculate original water supply in liters (1 hour)
                                const originalWaterSupply = originalFlowRate * 3600; // 1 hour in seconds
                                
                                // Calculate water donated by this barangay to others
                                let waterDonated = 0;
                                const donatedToOthers = systemState.waterAllocations
                                  .filter(a => a.barangay.id !== prediction.barangay.id && a.waterSources)
                                  .reduce((total, a) => {
                                    const donatedToThis = a.waterSources?.find(source => 
                                      source.includes(prediction.barangay.name)
                                    );
                                    if (donatedToThis) {
                                      const match = donatedToThis.match(/\(([^)]+)\)/);
                                      if (match) {
                                        const donatedAmount = parseInt(match[1].replace(/,/g, ''));
                                        return total + donatedAmount;
                                      }
                                    }
                                    return total;
                                  }, 0);
                                waterDonated = donatedToOthers;
                                
                                // Calculate target flow rate for this barangay
                                const emergencyDurationHours = systemState.userInput.emergencyDuration;
                                const threshold = 20;
                                const dropRate = liveData?.dropRate || 0;
                                const dropRatePerSecond = dropRate / 3600;
                                const targetFlowRate = threshold + (dropRatePerSecond * emergencyDurationHours * 3600);
                                
                                // Calculate updated water supply in liters (1 hour)
                                const updatedWaterSupply = originalWaterSupply + waterReceived - waterDonated;
                                
                                // Calculate updated flow rate from updated water supply
                                const updatedFlowRate = updatedWaterSupply / 3600;
                                
                                // Calculate updated time to shortage
                                const updatedTimeToShortage = dropRate > 0 ? 
                                  (updatedFlowRate - threshold) / dropRate : Infinity;
                                
                                // Determine updated status
                                let updatedStatus: "Safe" | "Warning" | "Critical" = "Safe";
                                if (updatedFlowRate < threshold) {
                                  updatedStatus = "Critical";
                                } else if (updatedFlowRate === threshold || updatedTimeToShortage <= 1) {
                                  updatedStatus = "Warning";
                                }
                                
                                return (
                                  <tr key={prediction.barangay.id} className="border-b">
                                    <td className="p-2 font-medium">{prediction.barangay.name}</td>
                                    <td className="p-2">{originalFlowRate}</td>
                                    <td className="p-2">{Math.round(originalWaterSupply).toLocaleString()}</td>
                                    <td className="p-2 font-semibold text-green-600">
                                      {waterReceived.toLocaleString()}
                                    </td>
                                    <td className="p-2 font-semibold text-blue-600">
                                      {waterDonated.toLocaleString()}
                                    </td>
                                    <td className="p-2 font-semibold">
                                      {updatedFlowRate.toFixed(1)}
                                    </td>
                                    <td className="p-2 font-semibold">
                                      {targetFlowRate.toFixed(1)}
                                    </td>
                                    <td className="p-2 font-semibold">
                                      {Math.round(updatedWaterSupply).toLocaleString()}
                                    </td>
                                    <td className="p-2">{threshold}</td>
                                    <td className="p-2">{dropRate}</td>
                                    <td className="p-2">{updatedTimeToShortage.toFixed(1)}</td>
                                    <td className="p-2">
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
                                    </td>
                                    <td className="p-2">
                                      <span
                                        className={`px-2 py-1 rounded text-xs ${
                                          updatedStatus === "Critical"
                                            ? "bg-red-100 text-red-800"
                                            : updatedStatus === "Warning"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : "bg-green-100 text-green-800"
                                        }`}
                                      >
                                        {updatedStatus}
                                </span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
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
                            🚰 Assignment (Improved Heuristic)
                          </span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left p-2 font-medium">Station</th>
                                <th className="text-left p-2 font-medium">Assigned Barangays</th>
                                <th className="text-left p-2 font-medium">Total Water Delivered (L)</th>
                                <th className="text-left p-2 font-medium">Total Distance (km)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {systemState.stationAssignments.map((assignment) => {
                                return (
                                  <tr key={assignment.station.id} className="border-b">
                                    <td className="p-2 font-medium">{assignment.station.name}</td>
                                    <td className="p-2">
                                      <div className="flex flex-wrap gap-1">
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
                                    </td>
                                    <td className="p-2 font-semibold">
                                      {assignment.totalWaterDelivered.toLocaleString()}
                                    </td>
                                    <td className="p-2">{assignment.totalDistance}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              <tr className="border-t-2 bg-gray-50">
                                <td colSpan={2} className="p-2 font-semibold text-right">Total:</td>
                                <td className="p-2 font-bold">
                                  {systemState.stationAssignments
                                    .reduce((sum, sa) => sum + sa.totalWaterDelivered, 0)
                                    .toLocaleString()}L
                                </td>
                                <td className="p-2 font-bold">
                                  {systemState.stationAssignments
                                    .reduce((sum, sa) => sum + sa.totalDistance, 0)
                                    .toFixed(1)}km
                                </td>
                              </tr>
                            </tfoot>
                          </table>
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
                          Barangays Needed Help
                        </p>
                        <p className="text-lg font-bold text-orange-600">
                          {systemState.barangaysNeededHelp}
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
