import type { Barangay, PumpingStation, CostMatrix } from "./supabase"

// A* Algorithm for Shortage Prediction with Enhanced Heuristics
export interface ShortageResult {
  barangay: Barangay
  daysToShortage: number
  status: "Safe" | "Warning" | "Critical"
  heuristicScore?: number
  riskFactors?: {
    consumptionRate: number
    populationDensity: number
    distanceToStation: number
    priorityWeight: number
  }
}

// A* Node for shortage prediction
interface ShortageNode {
  barangay: Barangay
  gScore: number // Actual cost (current depletion rate)
  hScore: number // Heuristic estimate (risk factors)
  fScore: number // Total score (g + h)
}

export function predictShortages(barangays: Barangay[]): ShortageResult[] {
  // Create nodes for A* processing
  const nodes: ShortageNode[] = barangays.map((barangay) => {
    const gScore = calculateActualCost(barangay)
    const hScore = calculateHeuristic(barangay)

    return {
      barangay,
      gScore,
      hScore,
      fScore: gScore + hScore,
    }
  })

  // Sort by fScore (A* priority queue concept)
  nodes.sort((a, b) => b.fScore - a.fScore)

  // Process each node and calculate shortage predictions
  return nodes.map((node) => {
    const { barangay, gScore, hScore, fScore } = node

    // Calculate base days to shortage - Pure mathematical calculation
    const baseDays = Math.max(0, barangay.current_level / barangay.daily_consumption)

    // Don't apply heuristic adjustment to days - keep it accurate
    const adjustedDays = baseDays

    // Calculate days to threshold for status determination
    const daysToThreshold = Math.max(
      0,
      (barangay.current_level - barangay.shortage_threshold) / barangay.daily_consumption,
    )

    let status: "Safe" | "Warning" | "Critical" = "Safe"

    // Status determination based on threshold and days remaining
    if (barangay.current_level <= barangay.shortage_threshold) {
      status = "Critical"
    } else if (adjustedDays <= 7) {
      status = "Warning"
    } else {
      status = "Safe"
    }

    // Calculate risk factors for transparency
    const riskFactors = calculateRiskFactors(barangay)

    return {
      barangay,
      daysToShortage: Math.round(adjustedDays * 10) / 10,
      status,
      heuristicScore: Math.round(fScore * 10) / 10,
      riskFactors,
    }
  })
}

// Calculate g(n) - Actual cost based on current consumption patterns
function calculateActualCost(barangay: Barangay): number {
  const consumptionRate = barangay.daily_consumption / barangay.current_level
  const thresholdRatio = barangay.shortage_threshold / barangay.current_level
  const depletion = consumptionRate * 100 // Scale to 0-100
  const urgency = thresholdRatio * 50 // Scale threshold urgency

  return Math.min(100, depletion + urgency)
}

// Calculate h(n) - Heuristic estimate based on multiple risk factors
function calculateHeuristic(barangay: Barangay): number {
  let heuristic = 0

  // Population density factor (higher population = higher risk)
  const populationDensity = barangay.population / 10000 // Normalize
  heuristic += Math.min(30, populationDensity * 5)

  // Priority factor (higher priority = higher risk weight)
  const priorityWeight = (barangay.priority / 10) * 20
  heuristic += priorityWeight

  // Distance heuristic using coordinates (Manhattan distance from center)
  const centerLat = 14.6042 // Manila center latitude
  const centerLng = 120.9542 // Manila center longitude
  const distance = Math.abs(barangay.latitude - centerLat) + Math.abs(barangay.longitude - centerLng)
  const distanceFactor = Math.min(25, distance * 50)
  heuristic += distanceFactor

  // Water need vs current level ratio
  const needRatio = barangay.water_needed / barangay.current_level
  const needFactor = Math.min(25, needRatio * 15)
  heuristic += needFactor

  return Math.min(100, heuristic)
}

// Calculate detailed risk factors for transparency
function calculateRiskFactors(barangay: Barangay): {
  consumptionRate: number
  populationDensity: number
  distanceToStation: number
  priorityWeight: number
} {
  const consumptionRate = Math.round((barangay.daily_consumption / barangay.current_level) * 1000) / 10
  const populationDensity = Math.round((barangay.population / 10000) * 10) / 10

  // Calculate distance from Manila center as proxy for station distance
  const centerLat = 14.6042
  const centerLng = 120.9542
  const distanceToStation =
    Math.round((Math.abs(barangay.latitude - centerLat) + Math.abs(barangay.longitude - centerLng)) * 100) / 10

  const priorityWeight = Math.round((barangay.priority / 10) * 100) / 10

  return {
    consumptionRate,
    populationDensity,
    distanceToStation,
    priorityWeight,
  }
}

// Knapsack Algorithm for Resource Allocation
export interface KnapsackResult {
  barangay: Barangay
  allocated: boolean
  allocatedWater: number
  efficiency: number
}

export function knapsackAllocation(barangays: Barangay[], totalSupply: number): KnapsackResult[] {
  const items = barangays.map((barangay) => ({
    barangay,
    efficiency: barangay.priority / barangay.water_needed,
    allocated: false,
    allocatedWater: 0,
  }))

  items.sort((a, b) => b.efficiency - a.efficiency)

  let remainingSupply = totalSupply

  for (const item of items) {
    if (remainingSupply >= item.barangay.water_needed) {
      item.allocated = true
      item.allocatedWater = item.barangay.water_needed
      remainingSupply -= item.barangay.water_needed
    }
  }

  return items
}

// Hungarian Algorithm for Assignment Problem
export interface AssignmentResult {
  station: PumpingStation
  assignedBarangay: Barangay | null
  distance: number
  cost: number
  waterDelivered: number
}

export function hungarianAssignment(
  stations: PumpingStation[],
  selectedBarangays: Barangay[],
  costMatrix: CostMatrix[],
): AssignmentResult[] {
  const costs: { [stationId: string]: { [barangayId: string]: { cost: number; distance: number } } } = {}
  costMatrix.forEach((entry) => {
    if (!costs[entry.station_id]) costs[entry.station_id] = {}
    costs[entry.station_id][entry.barangay_id] = { cost: entry.cost, distance: entry.distance }
  })

  const assignments: AssignmentResult[] = []
  const assignedBarangays = new Set<string>()

  // Sort barangays by priority (highest first)
  const sortedBarangays = [...selectedBarangays].sort((a, b) => b.priority - a.priority)

  for (const barangay of sortedBarangays) {
    if (assignedBarangays.has(barangay.id)) continue

    let bestStation: PumpingStation | null = null
    let minCost = Number.POSITIVE_INFINITY
    let bestDistance = 0

    for (const station of stations) {
      const stationData = costs[station.id]?.[barangay.id]
      if (stationData && stationData.cost < minCost) {
        minCost = stationData.cost
        bestDistance = stationData.distance
        bestStation = station
      }
    }

    if (bestStation) {
      assignments.push({
        station: bestStation,
        assignedBarangay: barangay,
        distance: bestDistance,
        cost: minCost,
        waterDelivered: barangay.water_needed,
      })
      assignedBarangays.add(barangay.id)
    }
  }

  // Add unassigned stations
  for (const station of stations) {
    if (!assignments.find((a) => a.station.id === station.id)) {
      assignments.push({
        station,
        assignedBarangay: null,
        distance: 0,
        cost: 0,
        waterDelivered: 0,
      })
    }
  }

  return assignments
}
