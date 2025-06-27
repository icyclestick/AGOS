"use client";

import { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import type { Barangay, PumpingStation, WaterTower } from "@/lib/supabase";
import type { ShortagePrediction } from "@/lib/algorithms";

interface ManilaMapProps {
  barangays: Barangay[];
  stations: PumpingStation[];
  waterTowers: WaterTower[];
  shortagePredictions: ShortagePrediction[];
  selectedBarangay: Barangay | null;
  onBarangayClick: (barangay: Barangay) => void;
}

export function ManilaMap({
  barangays,
  stations,
  waterTowers,
  shortagePredictions,
  selectedBarangay,
  onBarangayClick,
}: ManilaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    const initMap = async () => {
      // Dynamically import Leaflet
      const L = (await import("leaflet")).default;

      // Import CSS
      await import("leaflet/dist/leaflet.css");

      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      });

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }

      // Initialize map centered on the area with the barangays
      const map = L.map(mapRef.current).setView([14.65, 121.11], 12);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      mapInstanceRef.current = map;

      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Add water tower markers
      waterTowers.forEach((tower) => {
        const marker = L.marker([tower.location.lat, tower.location.lng], {
          icon: L.divIcon({
            className: "custom-div-icon",
            html: `<div class="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">WT</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        });

        const popupContent = `
          <div class="p-2">
            <h3 class="font-bold text-lg">${tower.name}</h3>
            <p class="text-sm">Max Capacity: ${tower.maxCapacity.toLocaleString()}L</p>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(map);
        markersRef.current.push(marker);
      });

      // Add barangay markers
      barangays.forEach((barangay) => {
        const shortageData = shortagePredictions.find(
          (r) => r.barangay.id === barangay.id
        );
        const status = shortageData?.status || "Safe";

        const color =
          status === "Critical"
            ? "#ef4444"
            : status === "Warning"
            ? "#f59e0b"
            : "#10b981";

        const marker = L.circleMarker(
          [barangay.location.lat, barangay.location.lng],
          {
            radius: 8,
            fillColor: color,
            color: "#ffffff",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8,
          }
        );

        const popupContent = `
          <div class="p-2">
            <h3 class="font-bold text-lg">${barangay.name}</h3>
            <p class="text-sm">Status: ${status}</p>
            <p class="text-sm">Time to Shortage: ${
              shortageData?.timeToShortage || "N/A"
            } hours</p>
            <p class="text-sm">Water Needed: ${
              shortageData?.waterNeededToBeSafe
                ? (shortageData.waterNeededToBeSafe / 1000).toFixed(1) + "kL"
                : "0L"
            }</p>
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
        `;

        marker.bindPopup(popupContent);
        marker.on("click", () => onBarangayClick(barangay));
        marker.addTo(map);
        markersRef.current.push(marker);
      });

      // Add pumping station markers
      stations.forEach((station) => {
        const marker = L.marker([station.location.lat, station.location.lng], {
          icon: L.divIcon({
            className: "custom-div-icon",
            html: `<div class="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">PS</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          }),
        });

        const popupContent = `
          <div class="p-2">
            <h3 class="font-bold text-lg">${station.name}</h3>
            <p class="text-sm">Threshold Flow Rate: ${
              station.thresholdFlowRate
            } L/s</p>
            <p class="text-sm">Population Served: ${station.populationServed.toLocaleString()}</p>
            <p class="text-sm">Priority: ${station.priority}</p>
          </div>
        `;

        marker.bindPopup(popupContent);
        marker.addTo(map);
        markersRef.current.push(marker);
      });

      // Add legend
      const legend = L.control({ position: "bottomright" });
      legend.onAdd = function () {
        const div = L.DomUtil.create("div", "info legend");
        div.style.backgroundColor = "white";
        div.style.padding = "10px";
        div.style.borderRadius = "5px";
        div.style.boxShadow = "0 0 15px rgba(0,0,0,0.2)";
        div.style.fontSize = "12px";
        div.innerHTML = `
          <h4 style="margin: 0 0 8px 0; font-weight: bold;">Legend</h4>
          <div style="margin-bottom: 5px;">
            <div style="display: inline-block; width: 12px; height: 12px; background: #8b5cf6; border-radius: 50%; margin-right: 5px;"></div>
            <span>Water Towers</span>
          </div>
          <div style="margin-bottom: 5px;">
            <div style="display: inline-block; width: 12px; height: 12px; background: #2563eb; border-radius: 50%; margin-right: 5px;"></div>
            <span>Pumping Stations</span>
          </div>
          <div style="margin-bottom: 5px;">
            <div style="display: inline-block; width: 12px; height: 12px; background: #ef4444; border-radius: 50%; margin-right: 5px;"></div>
            <span>Barangays (Critical)</span>
          </div>
          <div style="margin-bottom: 5px;">
            <div style="display: inline-block; width: 12px; height: 12px; background: #f59e0b; border-radius: 50%; margin-right: 5px;"></div>
            <span>Barangays (Warning)</span>
          </div>
          <div style="margin-bottom: 5px;">
            <div style="display: inline-block; width: 12px; height: 12px; background: #10b981; border-radius: 50%; margin-right: 5px;"></div>
            <span>Barangays (Safe)</span>
          </div>
        `;
        return div;
      };
      legend.addTo(map);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [barangays, stations, waterTowers, shortagePredictions]);

  return (
    <Card className="h-full">
      <div ref={mapRef} className="w-full h-full min-h-[600px] rounded-lg" />
    </Card>
  );
}
