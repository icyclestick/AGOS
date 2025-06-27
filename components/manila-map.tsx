"use client";

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockBarangays, mockPumpingStations, mockWaterTowers } from '@/lib/supabase';
import { Card } from '@/components/ui/card';

// Fix for default markers in Leaflet with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface ManilaMapProps {
  className?: string;
}

export default function ManilaMap({ className = "h-96 w-full" }: ManilaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map centered on Manila
    const map = L.map(mapRef.current).setView([14.5995, 120.9842], 12);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Custom icons for different types of markers
    const barangayIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6]
    });

    const stationIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #10b981; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });

    const towerIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `<div style="background-color: #f59e0b; width: 14px; height: 14px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [14, 14],
      iconAnchor: [7, 7]
    });

    // Add barangay markers
    mockBarangays.forEach(barangay => {
      const marker = L.marker([barangay.location.lat, barangay.location.lng], {
        icon: barangayIcon
      }).addTo(map);

      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-semibold text-blue-600">${barangay.name}</h3>
          <p class="text-sm text-gray-600">Population: ${barangay.population.toLocaleString()}</p>
          <p class="text-xs text-gray-500">Location: ${barangay.location.lat.toFixed(4)}, ${barangay.location.lng.toFixed(4)}</p>
        </div>
      `);
    });

    // Add pumping station markers
    mockPumpingStations.forEach(station => {
      const marker = L.marker([station.location.lat, station.location.lng], {
        icon: stationIcon
      }).addTo(map);

      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-semibold text-green-600">${station.name}</h3>
          <p class="text-xs text-gray-500">Location: ${station.location.lat.toFixed(4)}, ${station.location.lng.toFixed(4)}</p>
        </div>
      `);
    });

    // Add water tower markers
    mockWaterTowers.forEach(tower => {
      const marker = L.marker([tower.location.lat, tower.location.lng], {
        icon: towerIcon
      }).addTo(map);

      marker.bindPopup(`
        <div class="p-2">
          <h3 class="font-semibold text-orange-600">${tower.name}</h3>
          <p class="text-sm text-gray-600">Capacity: ${tower.maxCapacity.toLocaleString()}L</p>
          <p class="text-xs text-gray-500">Location: ${tower.location.lat.toFixed(4)}, ${tower.location.lng.toFixed(4)}</p>
        </div>
      `);
    });

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className={className}>
      <Card className="h-full">
        <div ref={mapRef} className="h-full w-full rounded-lg" />
      </Card>
      <div className="mt-2 flex items-center justify-center space-x-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-500 rounded-full border border-white shadow-sm"></div>
          <span>Barangays</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-4 h-4 bg-green-500 rounded-full border border-white shadow-sm"></div>
          <span>Pumping Stations</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3.5 h-3.5 bg-orange-500 rounded-full border border-white shadow-sm"></div>
          <span>Water Towers</span>
        </div>
      </div>
    </div>
  );
} 