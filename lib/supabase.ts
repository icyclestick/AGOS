import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = !!(supabaseUrl && supabaseKey)
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl!, supabaseKey!) : null

export type Barangay = {
  id: string
  name: string
  current_level: number
  daily_consumption: number
  shortage_threshold: number
  priority: number
  water_needed: number
  population: number
  latitude: number
  longitude: number
}

export type PumpingStation = {
  id: string
  name: string
  capacity: number
  latitude: number
  longitude: number
}

export type CostMatrix = {
  station_id: string
  barangay_id: string
  cost: number
  distance: number
}

// Enhanced mock data with Manila coordinates and population
export const mockBarangays: Barangay[] = [
  {
    id: "B1",
    name: "Tondo",
    current_level: 2500,
    daily_consumption: 500,
    shortage_threshold: 2000,
    priority: 10,
    water_needed: 5000,
    population: 628106,
    latitude: 14.6199,
    longitude: 120.9647,
  },
  {
    id: "B2",
    name: "Binondo",
    current_level: 1800,
    daily_consumption: 300,
    shortage_threshold: 1500,
    priority: 8,
    water_needed: 3500,
    population: 12985,
    latitude: 14.5995,
    longitude: 120.9739,
  },
  {
    id: "B3",
    name: "Malate",
    current_level: 3000,
    daily_consumption: 600,
    shortage_threshold: 2500,
    priority: 9,
    water_needed: 4000,
    population: 77513,
    latitude: 14.5648,
    longitude: 120.9959,
  },
  {
    id: "B4",
    name: "Ermita",
    current_level: 1200,
    daily_consumption: 400,
    shortage_threshold: 1000,
    priority: 7,
    water_needed: 6000,
    population: 9618,
    latitude: 14.5833,
    longitude: 120.9833,
  },
  {
    id: "B5",
    name: "Sampaloc",
    current_level: 2200,
    daily_consumption: 450,
    shortage_threshold: 1800,
    priority: 9,
    water_needed: 4500,
    population: 192843,
    latitude: 14.6042,
    longitude: 121.0042,
  },
  {
    id: "B6",
    name: "Santa Mesa",
    current_level: 1600,
    daily_consumption: 350,
    shortage_threshold: 1400,
    priority: 6,
    water_needed: 3000,
    population: 99933,
    latitude: 14.5986,
    longitude: 121.0117,
  },
  {
    id: "B7",
    name: "Quiapo",
    current_level: 2800,
    daily_consumption: 550,
    shortage_threshold: 2300,
    priority: 8,
    water_needed: 5500,
    population: 24886,
    latitude: 14.5958,
    longitude: 120.9847,
  },
  {
    id: "B8",
    name: "San Nicolas",
    current_level: 1400,
    daily_consumption: 320,
    shortage_threshold: 1200,
    priority: 5,
    water_needed: 2800,
    population: 44241,
    latitude: 14.6031,
    longitude: 120.9764,
  },
]

export const mockStations: PumpingStation[] = [
  { id: "PS1", name: "Putatan Station", capacity: 10000, latitude: 14.6042, longitude: 120.9542 },
  { id: "PS2", name: "Balara Station", capacity: 12000, latitude: 14.6847, longitude: 121.0736 },
  { id: "PS3", name: "La Mesa Station", capacity: 8000, latitude: 14.7042, longitude: 121.0542 },
  { id: "PS4", name: "Novaliches Station", capacity: 9500, latitude: 14.7236, longitude: 121.0347 },
]

export const mockCostMatrix: CostMatrix[] = [
  { station_id: "PS1", barangay_id: "B1", cost: 20, distance: 2.1 },
  { station_id: "PS1", barangay_id: "B2", cost: 25, distance: 2.8 },
  { station_id: "PS1", barangay_id: "B3", cost: 30, distance: 4.2 },
  { station_id: "PS1", barangay_id: "B4", cost: 35, distance: 3.8 },
  { station_id: "PS1", barangay_id: "B5", cost: 40, distance: 5.1 },
  { station_id: "PS1", barangay_id: "B6", cost: 45, distance: 6.2 },
  { station_id: "PS1", barangay_id: "B7", cost: 22, distance: 2.5 },
  { station_id: "PS1", barangay_id: "B8", cost: 28, distance: 3.1 },
  { station_id: "PS2", barangay_id: "B1", cost: 15, distance: 8.2 },
  { station_id: "PS2", barangay_id: "B2", cost: 18, distance: 8.8 },
  { station_id: "PS2", barangay_id: "B3", cost: 35, distance: 12.1 },
  { station_id: "PS2", barangay_id: "B4", cost: 40, distance: 11.5 },
  { station_id: "PS2", barangay_id: "B5", cost: 20, distance: 7.9 },
  { station_id: "PS2", barangay_id: "B6", cost: 25, distance: 7.2 },
  { station_id: "PS2", barangay_id: "B7", cost: 30, distance: 9.1 },
  { station_id: "PS2", barangay_id: "B8", cost: 32, distance: 8.7 },
  { station_id: "PS3", barangay_id: "B1", cost: 45, distance: 11.2 },
  { station_id: "PS3", barangay_id: "B2", cost: 40, distance: 11.8 },
  { station_id: "PS3", barangay_id: "B3", cost: 15, distance: 15.1 },
  { station_id: "PS3", barangay_id: "B4", cost: 18, distance: 14.5 },
  { station_id: "PS3", barangay_id: "B5", cost: 50, distance: 10.9 },
  { station_id: "PS3", barangay_id: "B6", cost: 55, distance: 10.2 },
  { station_id: "PS3", barangay_id: "B7", cost: 42, distance: 12.1 },
  { station_id: "PS3", barangay_id: "B8", cost: 48, distance: 11.7 },
  { station_id: "PS4", barangay_id: "B1", cost: 35, distance: 9.8 },
  { station_id: "PS4", barangay_id: "B2", cost: 30, distance: 10.4 },
  { station_id: "PS4", barangay_id: "B3", cost: 25, distance: 13.7 },
  { station_id: "PS4", barangay_id: "B4", cost: 20, distance: 13.1 },
  { station_id: "PS4", barangay_id: "B5", cost: 15, distance: 9.5 },
  { station_id: "PS4", barangay_id: "B6", cost: 18, distance: 8.8 },
  { station_id: "PS4", barangay_id: "B7", cost: 38, distance: 10.7 },
  { station_id: "PS4", barangay_id: "B8", cost: 35, distance: 10.3 },
]
