import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey)
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseKey!) : null

// Complete data structure for 3-algorithm water distribution system

// 1. Predefined (Static) Data
export interface WaterTower {
  id: string
  name: string
  location: { lat: number, lng: number }
  maxCapacity: number // liters
}

export interface PumpingStation {
  id: string
  name: string
  location: { lat: number, lng: number }
  thresholdFlowRate: number // minimum required L/s
  priority: number
  populationServed: number
}

export interface Barangay {
  id: string
  name: string
  location: { lat: number, lng: number }
}

// Distance/cost matrix for assignment problem
export interface AssignmentMatrix {
  stationId: string
  barangayId: string
  distance: number // km
  cost: number // can be distance, time, or pipe losses
}

// Tower-Station mapping for 1:1 allocation
export interface TowerStationMapping {
  towerId: string
  stationId: string
  waterAllocated: number
  efficiency: number
}

// 2. Live Data (from sensors/SCADA)
export interface LiveBarangayData {
  barangayId: string
  currentFlowRate: number // L/s from sensors
  dropRate: number // L/s per hour (depreciation rate)
}

export interface LiveTowerData {
  towerId: string
  currentWater: number // liters available
}

export interface LiveStationData {
  stationId: string
  currentFlowRate: number // L/s output
}

// 3. User-Defined Data
export interface UserInput {
  emergencyDuration: number // hours
}

// 4. Algorithm Results
export interface ShortagePrediction {
  barangay: Barangay
  gScore: number // flow drop experienced
  hScore: number // time to shortage
  fScore: number // total risk score
  timeToShortage: number // hours
  status: "Safe" | "Warning" | "Critical"
  waterNeededToBeSafe?: number // amount of water needed to be safe (liters)
}

export interface WaterAllocation {
  barangay: Barangay
  allocated: boolean
  waterNeeded: number // liters
  waterAllocated: number // liters
  priority: number
  status: "Safe" | "Warning" | "Critical"
  waterSources?: string[] // sources of water (barangays and towers)
}

export interface StationAssignment {
  station: PumpingStation
  assignedBarangays: Barangay[]
  totalWaterDelivered: number // liters
  totalDistance: number // km
}

// 5. Complete System State
export interface SystemState {
  // Static infrastructure
  waterTowers: WaterTower[]
  pumpingStations: PumpingStation[]
  barangays: Barangay[]
  assignmentMatrix: AssignmentMatrix[]

  // Live data
  liveBarangayData: LiveBarangayData[]
  liveTowerData: LiveTowerData[]
  liveStationData: LiveStationData[]

  // User input
  userInput: UserInput

  // Algorithm results
  shortagePredictions: ShortagePrediction[]
  waterAllocations: WaterAllocation[]
  stationAssignments: StationAssignment[]

  // Summary metrics
  totalWaterNeeded: number // liters
  totalWaterAvailable: number // liters
  totalWaterAllocated: number // liters
  barangaysHelped: number
  barangaysNeededHelp: number
}

// Mock Data
export const mockWaterTowers: WaterTower[] = [
  { id: "WT1", name: "Tower 1", location: { lat: 14.6042, lng: 120.9542 }, maxCapacity: 150000 },
  { id: "WT2", name: "Tower 2", location: { lat: 14.6142, lng: 120.9642 }, maxCapacity: 150000 },
  { id: "WT3", name: "Tower 3", location: { lat: 14.6242, lng: 120.9742 }, maxCapacity: 150000 }
]

export const mockPumpingStations: PumpingStation[] = [
  { id: "PS1", name: "Station 1", location: { lat: 14.6042, lng: 120.9542 }, thresholdFlowRate: 40, priority: 10, populationServed: 50000 },
  { id: "PS2", name: "Station 2", location: { lat: 14.6142, lng: 120.9642 }, thresholdFlowRate: 35, priority: 8, populationServed: 30000 },
  { id: "PS3", name: "Station 3", location: { lat: 14.6242, lng: 120.9742 }, thresholdFlowRate: 30, priority: 9, populationServed: 40000 }
]

export const mockBarangays: Barangay[] = [
  { id: "B1", name: "Barangay 1", location: { lat: 14.6042, lng: 120.9542 } },
  { id: "B2", name: "Barangay 2", location: { lat: 14.6142, lng: 120.9642 } },
  { id: "B3", name: "Barangay 3", location: { lat: 14.6242, lng: 120.9742 } },
  { id: "B4", name: "Barangay 4", location: { lat: 14.6342, lng: 120.9842 } },
  { id: "B5", name: "Barangay 5", location: { lat: 14.6442, lng: 120.9942 } }
]

export const mockLiveBarangayData: LiveBarangayData[] = [
  { barangayId: "B1", currentFlowRate: 25, dropRate: 2 },
  { barangayId: "B2", currentFlowRate: 20, dropRate: 1.5 },
  { barangayId: "B3", currentFlowRate: 35, dropRate: 1.8 },
  { barangayId: "B4", currentFlowRate: 15, dropRate: 2.5 },
  { barangayId: "B5", currentFlowRate: 28, dropRate: 1.2 }
]

export const mockLiveTowerData: LiveTowerData[] = [
  { towerId: "WT1", currentWater: 80000 },
  { towerId: "WT2", currentWater: 120000 },
  { towerId: "WT3", currentWater: 90000 }
]

export const mockLiveStationData: LiveStationData[] = [
  { stationId: "PS1", currentFlowRate: 30 },
  { stationId: "PS2", currentFlowRate: 25 },
  { stationId: "PS3", currentFlowRate: 28 }
]

export const mockAssignmentMatrix: AssignmentMatrix[] = [
  // Station 1 connections
  { stationId: "PS1", barangayId: "B1", distance: 2.1, cost: 20 },
  { stationId: "PS1", barangayId: "B2", distance: 3.2, cost: 25 },
  { stationId: "PS1", barangayId: "B3", distance: 4.5, cost: 30 },
  { stationId: "PS1", barangayId: "B4", distance: 5.8, cost: 35 },
  { stationId: "PS1", barangayId: "B5", distance: 7.2, cost: 40 },

  // Station 2 connections
  { stationId: "PS2", barangayId: "B1", distance: 5.2, cost: 35 },
  { stationId: "PS2", barangayId: "B2", distance: 2.8, cost: 22 },
  { stationId: "PS2", barangayId: "B3", distance: 3.1, cost: 28 },
  { stationId: "PS2", barangayId: "B4", distance: 4.3, cost: 32 },
  { stationId: "PS2", barangayId: "B5", distance: 6.1, cost: 38 },

  // Station 3 connections
  { stationId: "PS3", barangayId: "B1", distance: 6.1, cost: 40 },
  { stationId: "PS3", barangayId: "B2", distance: 4.8, cost: 32 },
  { stationId: "PS3", barangayId: "B3", distance: 2.5, cost: 18 },
  { stationId: "PS3", barangayId: "B4", distance: 3.7, cost: 25 },
  { stationId: "PS3", barangayId: "B5", distance: 5.4, cost: 30 }
]

export const mockUserInput: UserInput = {
  emergencyDuration: 2 // hours
}
