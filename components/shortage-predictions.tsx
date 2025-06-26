import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ShortageResult } from "@/lib/algorithms"

interface ShortagePredictionsProps {
  results: ShortageResult[]
}

export function ShortagePredictions({ results }: ShortagePredictionsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Critical":
        return "destructive"
      case "Low":
        return "secondary"
      default:
        return "default"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">🔍 A* Shortage Predictions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Barangay</th>
                <th className="text-left p-2 font-medium">Water Level (L)</th>
                <th className="text-left p-2 font-medium">Days to Shortage</th>
                <th className="text-left p-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.barangay.id} className="border-b">
                  <td className="p-2 font-medium">{result.barangay.name}</td>
                  <td className="p-2">{result.barangay.current_level.toLocaleString()}</td>
                  <td className="p-2">{result.daysToShortage}</td>
                  <td className="p-2">
                    <Badge variant={getStatusColor(result.status)}>{result.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
