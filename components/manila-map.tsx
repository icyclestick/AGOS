"use client"

import { useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import type { Barangay, PumpingStation } from "@/lib/supabase"
import type { ShortageResult } from "@/lib/algorithms"

interface ManilaMapProps {
  barangays: Barangay[]
  stations: PumpingStation[]
  shortageResults: ShortageResult[]
  selectedBarangay: Barangay | null
  onBarangayClick: (barangay: Barangay) => void
}

export function ManilaMap({ barangays, stations, shortageResults, selectedBarangay, onBarangayClick }: ManilaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return

    const initMap = async () => {
      // Dynamically import Leaflet
      const L = (await import("leaflet")).default

      // Import CSS
      await import("leaflet/dist/leaflet.css")

      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      })

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
      }

      // Initialize map centered on Manila
      const map = L.map(mapRef.current).setView([14.5995, 120.9842], 12)

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map)

      mapInstanceRef.current = map

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []

      // Add barangay markers
      barangays.forEach((barangay) => {
        const shortageData = shortageResults.find((r) => r.barangay.id === barangay.id)
        const status = shortageData?.status || "Safe"

        const color = status === "Critical" ? "#ef4444" : status === "Warning" ? "#f59e0b" : "#10b981"

        const marker = L.circleMarker([barangay.latitude, barangay.longitude], {
          radius: 8,
          fillColor: color,
          color: "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        })

        const popupContent = `
          <div class="p-2">
            <h3 class="font-bold text-lg">${barangay.name}</h3>
            <p class="text-sm text-gray-600">Population: ${barangay.population.toLocaleString()}</p>
            <p class="text-sm">Current Water: ${barangay.current_level.toLocaleString()}L</p>
            <p class="text-sm">Daily Consumption: ${barangay.daily_consumption.toLocaleString()}L</p>
            <p class="text-sm">Days to Shortage: ${shortageData?.daysToShortage || "N/A"}</p>
            <div class="mt-2">
              <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                status === "Critical"
                  ? "bg-red-100 text-red-800"
                  : status === "Warning"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-green-100 text-green-800"
              }">
                ${status}
              </span>
            </div>
          </div>
        `

        marker.bindPopup(popupContent)
        marker.on("click", () => onBarangayClick(barangay))
        marker.addTo(map)
        markersRef.current.push(marker)
      })

      // Add pumping station markers
      stations.forEach((station) => {
        const marker = L.marker([station.latitude, station.longitude], {
          icon: L.divIcon({
            className: "custom-div-icon",
            html: `<div class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">PS</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        })

        const popupContent = `
          <div class="p-2">
            <h3 class="font-bold text-lg">${station.name}</h3>
            <p class="text-sm">Capacity: ${station.capacity.toLocaleString()}L</p>
          </div>
        `

        marker.bindPopup(popupContent)
        marker.addTo(map)
        markersRef.current.push(marker)
      })
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [barangays, stations, shortageResults])

  return (
    <Card className="h-full">
      <div ref={mapRef} className="w-full h-full min-h-[600px] rounded-lg" />
    </Card>
  )
}
