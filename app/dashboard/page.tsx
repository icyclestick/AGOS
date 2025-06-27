"use client";
import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MapPin, Users, AlertTriangle } from "lucide-react";
import { AuroraText } from "@/components/magicui/aurora-text";
import {
  mockBarangays,
  mockLiveBarangayData,
  type Barangay,
  type LiveBarangayData,
} from "@/lib/supabase";

export default function DashboardPage() {
  // Dashboard data
  const [barangays] = useState<Barangay[]>(mockBarangays);
  const [liveBarangayData] = useState<LiveBarangayData[]>(mockLiveBarangayData);

  // Calculate statistics
  const totalPopulation = barangays.reduce((sum, b) => sum + b.population, 0);
  const criticalCount = liveBarangayData.filter(d => {
    const barangay = barangays.find(b => b.id === d.barangayId);
    return barangay && d.currentFlowRate < d.threshold;
  }).length;
  const safeCount = barangays.length - criticalCount;

  return (
    <div className="min-h-screen w-full flex flex-col bg-white">
      {/* Navigation Header */}
      <header className="sticky top-0 w-full flex items-center justify-between px-6 md:px-16 py-6 bg-white/80 text-stone-900 z-30 backdrop-blur-lg border border-stone-200">
        <div className="flex items-center gap-2">
          <Link href="/" className="hover:opacity-80 transition">
            <span className="font-bold text-2xl tracking-wide text-blue-900">
              <AuroraText>agos</AuroraText>
            </span>
          </Link>
        </div>
        <nav className="flex gap-6 font-medium">
          <Link href="/dashboard" className="hover:text-blue-700 transition">
            Dashboard
          </Link>
          <Link href="/simulation" className="hover:text-blue-700 transition">
            Simulation
          </Link>
          <Link href="/#features" className="hover:text-blue-700 transition">
            Features
          </Link>
          <a
            href="mailto:info@agos.com"
            className="hover:text-blue-700 transition"
          >
            Contact
          </a>
        </nav>
      </header>

      {/* Barangay Dashboard Section */}
      <section className="relative py-24 flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50 overflow-hidden">
        <div className="relative z-10 max-w-7xl w-full">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-blue-700">
              Barangay Dashboard
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Real-time overview of all barangays in Metro Manila with current water flow rates, 
              population data, and status monitoring.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Barangays</p>
                    <p className="text-2xl font-bold text-blue-900">{barangays.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Population</p>
                    <p className="text-2xl font-bold text-green-900">{totalPopulation.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Critical Status</p>
                    <p className="text-2xl font-bold text-red-900">{criticalCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Barangay Information Table */}
          <Card className="bg-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-xl font-semibold text-gray-900">
                Barangay Information & Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left p-4 font-semibold text-gray-700">Barangay</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Population</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Current Flow Rate</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Threshold</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Drop Rate</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Status</th>
                      <th className="text-left p-4 font-semibold text-gray-700">Time to Shortage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {barangays.map((barangay) => {
                      const liveData = liveBarangayData.find(d => d.barangayId === barangay.id);
                      const currentFlowRate = liveData?.currentFlowRate || 0;
                      const threshold = liveData?.threshold || 20;
                      const dropRate = liveData?.dropRate || 0;
                      
                      // Calculate status
                      let status = "Safe";
                      let statusColor = "bg-green-100 text-green-800";
                      let timeToShortage = "N/A";
                      
                      if (currentFlowRate < threshold) {
                        status = "Critical";
                        statusColor = "bg-red-100 text-red-800";
                        // For critical status, already in shortage
                        timeToShortage = "Already in shortage";
                      } else {
                        status = "Safe";
                        statusColor = "bg-green-100 text-green-800";
                        // Calculate time to shortage for safe barangays: (Current Flow Rate - Threshold) / drop rate
                        const dropRatePerSecond = dropRate / 3600;
                        if (dropRatePerSecond > 0) {
                          const timeToShortageHours = (currentFlowRate - threshold) / dropRatePerSecond / 3600;
                          timeToShortage = `${timeToShortageHours.toFixed(1)}h`;
                        }
                      }

                      return (
                        <tr key={barangay.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="p-4 font-medium text-gray-900">{barangay.name}</td>
                          <td className="p-4">{barangay.population.toLocaleString()}</td>
                          <td className="p-4 font-semibold">{currentFlowRate.toFixed(1)} L/s</td>
                          <td className="p-4">{threshold} L/s</td>
                          <td className="p-4">{dropRate.toFixed(2)} L/s/hr</td>
                          <td className="p-4">
                            <Badge className={statusColor}>
                              {status}
                            </Badge>
                          </td>
                          <td className="p-4 font-medium">{timeToShortage}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Status Summary */}
          <div className="flex justify-center mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <p className="text-lg font-semibold text-green-900">{safeCount} Safe</p>
                      <p className="text-sm text-green-700">Barangays with adequate water supply</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-red-50 border-red-200">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <div>
                      <p className="text-lg font-semibold text-red-900">{criticalCount} Critical</p>
                      <p className="text-sm text-red-700">Barangays requiring immediate attention</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
