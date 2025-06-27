import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { StationAssignment } from "@/lib/algorithms"

interface AssignmentTableProps {
  results: StationAssignment[]
}

export function AssignmentTable({ results }: AssignmentTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">🚰 Delivery Assignment Table (Assignment Problem)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Pumping Station</th>
                <th className="text-left p-2 font-medium">Barangay Assigned</th>
                <th className="text-left p-2 font-medium">Distance (km)</th>
                <th className="text-left p-2 font-medium">Cost</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.station.id} className="border-b">
                  <td className="p-2 font-medium">{result.station.name}</td>
                  <td className="p-2">
                    {result.assignedBarangays.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {result.assignedBarangays.map((barangay) => (
                          <span key={barangay.id} className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                            {barangay.name}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="p-2">{result.totalDistance.toFixed(1)}</td>
                  <td className="p-2">{result.totalWaterDelivered.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
