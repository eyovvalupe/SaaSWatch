import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SpendingChartProps {
  data: Array<{ month: string; spend: number }>;
}

export function SpendingChart({ data }: SpendingChartProps) {
  return (
    <Card data-testid="card-spending-chart">
      <CardHeader>
        <CardTitle className="text-lg">Spending Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="month" 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            <YAxis 
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: "hsl(var(--popover))",
                border: "1px solid hsl(var(--popover-border))",
                borderRadius: "var(--radius)",
                color: "hsl(var(--popover-foreground))"
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, 'Spend']}
            />
            <Line 
              type="monotone" 
              dataKey="spend" 
              stroke="hsl(var(--chart-1))" 
              strokeWidth={2}
              dot={{ fill: "hsl(var(--chart-1))", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
