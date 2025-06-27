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
  { id: "WT1", name: "Marikina Water Tower", location: { lat: 14.6500, lng: 121.1000 }, maxCapacity: 150000 },
  { id: "WT2", name: "Antipolo Water Tower", location: { lat: 14.6200, lng: 121.1200 }, maxCapacity: 150000 },
  { id: "WT3", name: "Pasig Water Tower", location: { lat: 14.6100, lng: 121.1000 }, maxCapacity: 150000 }
]

export const mockPumpingStations: PumpingStation[] = [
  { id: "PS1", name: "San Mateo Pumping Station", location: { lat: 14.67874077019177, lng: 121.11099547398246 }, thresholdFlowRate: 40, priority: 10, populationServed: 50000 },
  { id: "PS2", name: "Modesta Pumping Station", location: { lat: 14.670168854201755, lng: 121.13776040732638 }, thresholdFlowRate: 35, priority: 8, populationServed: 30000 },
  { id: "PS3", name: "Pasig Pumping Station", location: { lat: 14.613133450509213, lng: 121.10222707256456 }, thresholdFlowRate: 30, priority: 9, populationServed: 40000 },
  { id: "PS4", name: "Antipolo Pumping Station", location: { lat: 14.622368122709814, lng: 121.12126321341665 }, thresholdFlowRate: 45, priority: 7, populationServed: 35000 }
]

export const mockBarangays: Barangay[] = [
  { id: "B1", name: "Tumana", location: { lat: 14.657748264302496, lng: 121.09649091706488 } },
  { id: "B2", name: "Barangka", location: { lat: 14.638061338661439, lng: 121.08398005528672 } },
  { id: "B3", name: "Nangka", location: { lat: 14.66811497998012, lng: 121.10890597504279 } },
  { id: "B4", name: "Fortune", location: { lat: 14.659043981881757, lng: 121.12753713847853 } },
  { id: "B5", name: "Concepcion Uno", location: { lat: 14.647016803025403, lng: 121.10492654778768 } }
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
  // Station 1 connections (San Mateo)
  { stationId: "PS1", barangayId: "B1", distance: 2.1, cost: 20 },
  { stationId: "PS1", barangayId: "B2", distance: 3.2, cost: 25 },
  { stationId: "PS1", barangayId: "B3", distance: 1.5, cost: 15 },
  { stationId: "PS1", barangayId: "B4", distance: 2.8, cost: 22 },
  { stationId: "PS1", barangayId: "B5", distance: 4.2, cost: 30 },

  // Station 2 connections (Modesta)
  { stationId: "PS2", barangayId: "B1", distance: 3.2, cost: 25 },
  { stationId: "PS2", barangayId: "B2", distance: 4.8, cost: 32 },
  { stationId: "PS2", barangayId: "B3", distance: 2.8, cost: 22 },
  { stationId: "PS2", barangayId: "B4", distance: 1.1, cost: 12 },
  { stationId: "PS2", barangayId: "B5", distance: 3.5, cost: 28 },

  // Station 3 connections (Pasig)
  { stationId: "PS3", barangayId: "B1", distance: 4.1, cost: 30 },
  { stationId: "PS3", barangayId: "B2", distance: 2.5, cost: 18 },
  { stationId: "PS3", barangayId: "B3", distance: 5.2, cost: 35 },
  { stationId: "PS3", barangayId: "B4", distance: 6.1, cost: 40 },
  { stationId: "PS3", barangayId: "B5", distance: 1.8, cost: 15 },

  // Station 4 connections (Antipolo)
  { stationId: "PS4", barangayId: "B1", distance: 3.8, cost: 28 },
  { stationId: "PS4", barangayId: "B2", distance: 4.2, cost: 30 },
  { stationId: "PS4", barangayId: "B3", distance: 2.9, cost: 22 },
  { stationId: "PS4", barangayId: "B4", distance: 2.3, cost: 18 },
  { stationId: "PS4", barangayId: "B5", distance: 2.7, cost: 20 }
]

// Tower-Station mapping with capacity limits
export const mockTowerStationMapping: TowerStationMapping[] = [
  { towerId: "WT1", stationId: "PS1", waterAllocated: 0, efficiency: 0.95 },
  { towerId: "WT2", stationId: "PS2", waterAllocated: 0, efficiency: 0.92 },
  { towerId: "WT3", stationId: "PS3", waterAllocated: 0, efficiency: 0.94 },
  { towerId: "WT1", stationId: "PS4", waterAllocated: 0, efficiency: 0.93 }
]

export const mockUserInput: UserInput = {
  emergencyDuration: 3 // hours
}
