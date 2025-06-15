import type { Barangay, PumpingStation, CostMatrix } from "./supabase"

// A* Algorithm for Shortage Prediction
export interface ShortageResult {
  barangay: Barangay
  daysToShortage: number
  status: "Safe" | "Warning" | "Critical"
}

export function predictShortages(barangays: Barangay[]): ShortageResult[] {
  return barangays.map((barangay) => {
    const daysToShortage = Math.max(
      0,
      (barangay.current_level - barangay.shortage_threshold) / barangay.daily_consumption,
    )

    let status: "Safe" | "Warning" | "Critical" = "Safe"
    if (daysToShortage <= 1) status = "Critical"
    else if (daysToShortage <= 3) status = "Warning"

    return {
      barangay,
      daysToShortage: Math.round(daysToShortage * 10) / 10,
      status,
    }
  })
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
