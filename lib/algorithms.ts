import type {
  Barangay,
  PumpingStation,
  WaterTower,
  AssignmentMatrix,
  LiveBarangayData,
  LiveTowerData,
  LiveStationData,
  UserInput,
  ShortagePrediction,
  WaterAllocation,
  StationAssignment,
  SystemState
} from "./supabase"

// Algorithm 1: A* for Shortage Prediction (Barangay-level)
export function predictShortages(
  barangays: Barangay[],
  liveBarangayData: LiveBarangayData[],
  userInput: UserInput
): ShortagePrediction[] {
  const threshold = 20; // L/s threshold for safety
  const predictions: ShortagePrediction[] = barangays.map(barangay => {
    const liveData = liveBarangayData.find(d => d.barangayId === barangay.id)
    if (!liveData) {
      return {
        barangay,
        gScore: 0,
        hScore: Infinity,
        fScore: Infinity,
        timeToShortage: Infinity,
        status: "Safe"
      }
    }
    const gScore = 50 - liveData.currentFlowRate
    const hScore = liveData.dropRate > 0 ?
      (liveData.currentFlowRate - threshold) / liveData.dropRate :
      Infinity
    const fScore = gScore + hScore
    let status: "Safe" | "Warning" | "Critical" = "Safe"
    if (liveData.currentFlowRate < threshold) {
      status = "Critical"
    } else if (liveData.currentFlowRate === threshold || hScore <= 1) {
      status = "Warning"
    }
    let waterNeededToBeSafe: number | undefined = undefined;
    if (status === "Critical" && liveData) {
      waterNeededToBeSafe = Math.max(0, threshold - liveData.currentFlowRate) * userInput.emergencyDuration * 3600;
    }
    return {
      barangay,
      gScore: Math.round(gScore * 10) / 10,
      hScore: Math.round(hScore * 10) / 10,
      fScore: Math.round(fScore * 10) / 10,
      timeToShortage: Math.round(hScore * 10) / 10,
      status,
      waterNeededToBeSafe
    }
  })
  return predictions.sort((a, b) => b.fScore - a.fScore)
}

// Algorithm 2: Branch & Bound Knapsack for Water Allocation (Tower to Station)
export function allocateWater(
  pumpingStations: PumpingStation[],
  liveStationData: LiveStationData[],
  liveTowerData: LiveTowerData[],
  userInput: UserInput
): WaterAllocation[] {
  const totalAvailableWater = liveTowerData.reduce((sum, tower) => sum + tower.currentWater, 0)

  // Calculate water needed for each station
  const items = pumpingStations.map(station => {
    const liveData = liveStationData.find(d => d.stationId === station.id)
    const currentFlow = liveData?.currentFlowRate || 0
    const waterNeeded = Math.max(0, (station.thresholdFlowRate - currentFlow)) *
      userInput.emergencyDuration * 3600 // convert to liters

    return {
      station,
      waterNeeded,
      priority: station.priority,
      allocated: false,
      waterAllocated: 0
    }
  })

  // Simple greedy knapsack (can be replaced with proper branch & bound)
  items.sort((a, b) => b.priority - a.priority)

  let remainingWater = totalAvailableWater
  const allocations: WaterAllocation[] = []

  for (const item of items) {
    if (remainingWater >= item.waterNeeded && item.waterNeeded > 0) {
      allocations.push({
        station: item.station,
        allocated: true,
        waterNeeded: item.waterNeeded,
        waterAllocated: item.waterNeeded,
        priority: item.priority
      })
      remainingWater -= item.waterNeeded
    } else {
      allocations.push({
        station: item.station,
        allocated: false,
        waterNeeded: item.waterNeeded,
        waterAllocated: 0,
        priority: item.priority
      })
    }
  }

  return allocations
}

// Algorithm 3: Heuristic Assignment for Station to Barangay
export function assignStationsToBarangays(
  barangays: Barangay[],
  pumpingStations: PumpingStation[],
  assignmentMatrix: AssignmentMatrix[],
  waterAllocations: WaterAllocation[],
  liveBarangayData: LiveBarangayData[]
): StationAssignment[] {
  // Get stations that received water allocation
  const allocatedStations = waterAllocations.filter(wa => wa.allocated)

  // Find barangays in need (below threshold)
  const barangaysInNeed = barangays.filter(barangay => {
    const liveData = liveBarangayData.find(d => d.barangayId === barangay.id)
    return liveData && liveData.currentFlowRate <= 20 // threshold (changed from < to <=)
  })

  const assignments: StationAssignment[] = []

  // For each allocated station, assign nearest barangays in need
  for (const waterAllocation of allocatedStations) {
    const station = waterAllocation.station
    const assignedBarangays: Barangay[] = []
    let totalDistance = 0

    // Find barangays that can be served by this station
    const possibleBarangays = barangaysInNeed.filter(barangay => {
      const assignment = assignmentMatrix.find(am =>
        am.stationId === station.id && am.barangayId === barangay.id
      )
      return assignment !== undefined
    })

    // Sort by distance (nearest first)
    possibleBarangays.sort((a, b) => {
      const distA = assignmentMatrix.find(am =>
        am.stationId === station.id && am.barangayId === a.id
      )?.distance || Infinity
      const distB = assignmentMatrix.find(am =>
        am.stationId === station.id && am.barangayId === b.id
      )?.distance || Infinity
      return distA - distB
    })

    // Assign barangays until station capacity is reached
    let remainingCapacity = waterAllocation.waterAllocated
    for (const barangay of possibleBarangays) {
      if (remainingCapacity > 0) {
        assignedBarangays.push(barangay)
        const distance = assignmentMatrix.find(am =>
          am.stationId === station.id && am.barangayId === barangay.id
        )?.distance || 0
        totalDistance += distance
        remainingCapacity -= 10000 // assume 10,000L per barangay (simplified)
      }
    }

    if (assignedBarangays.length > 0) {
      assignments.push({
        station,
        assignedBarangays,
        totalWaterDelivered: waterAllocation.waterAllocated,
        totalDistance: Math.round(totalDistance * 10) / 10
      })
    }
  }

  return assignments
}

// Main function to run all algorithms
export function runEmergencyWaterSystem(
  waterTowers: WaterTower[],
  pumpingStations: PumpingStation[],
  barangays: Barangay[],
  assignmentMatrix: AssignmentMatrix[],
  liveBarangayData: LiveBarangayData[],
  liveTowerData: LiveTowerData[],
  liveStationData: LiveStationData[],
  userInput: UserInput
): SystemState {
  // Step 1: A* Shortage Prediction
  const shortagePredictions = predictShortages(barangays, liveBarangayData, userInput)

  // Step 2: Knapsack Water Allocation
  const waterAllocations = allocateWater(pumpingStations, liveStationData, liveTowerData, userInput)

  // Step 3: Assignment Problem
  const stationAssignments = assignStationsToBarangays(
    barangays,
    pumpingStations,
    assignmentMatrix,
    waterAllocations,
    liveBarangayData
  )

  // Calculate summary metrics
  const totalWaterNeeded = waterAllocations.reduce((sum, wa) => sum + wa.waterNeeded, 0)
  const totalWaterAvailable = liveTowerData.reduce((sum, tower) => sum + tower.currentWater, 0)
  const totalWaterAllocated = waterAllocations.reduce((sum, wa) => sum + wa.waterAllocated, 0)
  const barangaysHelped = stationAssignments.reduce((sum, sa) => sum + sa.assignedBarangays.length, 0)
  const barangaysNotHelped = barangays.length - barangaysHelped

  return {
    waterTowers,
    pumpingStations,
    barangays,
    assignmentMatrix,
    liveBarangayData,
    liveTowerData,
    liveStationData,
    userInput,
    shortagePredictions,
    waterAllocations,
    stationAssignments,
    totalWaterNeeded,
    totalWaterAvailable,
    totalWaterAllocated,
    barangaysHelped,
    barangaysNotHelped
  }
}

export type { ShortagePrediction, WaterAllocation, StationAssignment };
