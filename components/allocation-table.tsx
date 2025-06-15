import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { KnapsackResult } from "@/lib/algorithms"

interface AllocationTableProps {
  results: KnapsackResult[]
}

export function AllocationTable({ results }: AllocationTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">🎒 Water Allocation Table (Knapsack)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Barangay</th>
                <th className="text-left p-2 font-medium">Allocated Water</th>
                <th className="text-left p-2 font-medium">Priority</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.barangay.id} className="border-b">
                  <td className="p-2 font-medium">{result.barangay.name}</td>
                  <td className="p-2">
                    {result.allocated ? (
                      <span className="text-green-600 font-medium">{result.allocatedWater.toLocaleString()}L</span>
                    ) : (
                      <span className="text-gray-400">Not allocated</span>
                    )}
                  </td>
                  <td className="p-2">
                    <Badge variant={result.allocated ? "default" : "secondary"}>{result.barangay.priority}</Badge>
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
