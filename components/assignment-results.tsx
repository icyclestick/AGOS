import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { AssignmentResult } from "@/lib/algorithms"

interface AssignmentResultsProps {
  results: AssignmentResult[]
}

export function AssignmentResults({ results }: AssignmentResultsProps) {
  const totalCost = results.reduce((sum, r) => sum + r.totalCost, 0)
  const totalSent = results.reduce((sum, r) => sum + r.totalSent, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">🚰 Assignment Results (Hungarian Algorithm)</CardTitle>
        <div className="text-sm text-muted-foreground">
          Total Cost: {totalCost} | Total Water Sent: {totalSent.toLocaleString()}L
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Station</th>
                <th className="text-left p-2 font-medium">Assigned Barangays</th>
                <th className="text-left p-2 font-medium">Total Sent (L)</th>
                <th className="text-left p-2 font-medium">Capacity Left (L)</th>
                <th className="text-left p-2 font-medium">Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.station.id} className="border-b">
                  <td className="p-2 font-medium">{result.station.name}</td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      {result.assignedBarangays.length > 0 ? (
                        result.assignedBarangays.map((barangay) => (
                          <Badge key={barangay.id} variant="outline" className="text-xs">
                            {barangay.name}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">None</span>
                      )}
                    </div>
                  </td>
                  <td className="p-2">{result.totalSent.toLocaleString()}</td>
                  <td className="p-2">{result.capacityLeft.toLocaleString()}</td>
                  <td className="p-2">{result.totalCost}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
