import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { AssignmentResult } from "@/lib/algorithms"

interface AssignmentTableProps {
  results: AssignmentResult[]
}

export function AssignmentTable({ results }: AssignmentTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">🚰 Delivery Assignment Table (Hungarian)</CardTitle>
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
                    {result.assignedBarangay ? (
                      <span className="text-blue-600 font-medium">{result.assignedBarangay.name}</span>
                    ) : (
                      <span className="text-gray-400">Unassigned</span>
                    )}
                  </td>
                  <td className="p-2">{result.distance > 0 ? `${result.distance} km` : "-"}</td>
                  <td className="p-2">{result.cost > 0 ? result.cost : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
