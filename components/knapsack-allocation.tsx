import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { KnapsackResult } from "@/lib/algorithms"

interface KnapsackAllocationProps {
  results: KnapsackResult[]
  totalSupply: number
}

export function KnapsackAllocation({ results, totalSupply }: KnapsackAllocationProps) {
  const totalAllocated = results.filter((r) => r.allocated).reduce((sum, r) => sum + r.barangay.water_needed, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">🎒 Knapsack Allocation</CardTitle>
        <div className="text-sm text-muted-foreground">
          Allocated: {totalAllocated.toLocaleString()}L / {totalSupply.toLocaleString()}L (
          {Math.round((totalAllocated / totalSupply) * 100)}%)
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">Barangay</th>
                <th className="text-left p-2 font-medium">Water Needed (L)</th>
                <th className="text-left p-2 font-medium">Priority</th>
                <th className="text-left p-2 font-medium">Efficiency</th>
                <th className="text-left p-2 font-medium">Allocated?</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.barangay.id} className="border-b">
                  <td className="p-2 font-medium">{result.barangay.name}</td>
                  <td className="p-2">{result.barangay.water_needed.toLocaleString()}</td>
                  <td className="p-2">{result.barangay.priority}</td>
                  <td className="p-2">{result.efficiency.toFixed(4)}</td>
                  <td className="p-2">
                    <Badge variant={result.allocated ? "default" : "secondary"}>
                      {result.allocated ? "Yes" : "No"}
                    </Badge>
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
