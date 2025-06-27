import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { ShortagePrediction } from "@/lib/supabase"

interface ShortageTableProps {
  results: ShortagePrediction[]
}

export function ShortageTable({ results }: ShortageTableProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Critical":
        return "destructive"
      case "Warning":
        return "secondary"
      default:
        return "default"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">🔍 Predicted Barangay Shortage (A*)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Barangay</th>
                <th className="text-left p-2 font-medium">Population</th>
                <th className="text-left p-2 font-medium">Current Supply</th>
                <th className="text-left p-2 font-medium">Daily Consumption</th>
                <th className="text-left p-2 font-medium">Days Remaining</th>
                <th className="text-left p-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.barangay.id} className="border-b">
                  <td className="p-2 font-medium">{result.barangay.name}</td>
                  <td className="p-2">{result.barangay.population.toLocaleString()}</td>
                  <td className="p-2">-</td>
                  <td className="p-2">-</td>
                  <td className="p-2">{(result.timeToShortage / 24).toFixed(1)}</td>
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
