import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface CategoryData {
  category: string;
  percentage: number;
  color: string;
}

interface CategoryChartProps {
  data: CategoryData[];
}

export function CategoryChart({ data }: CategoryChartProps) {
  // Use the colors provided in the data
  const coloredData = data;

  // Custom label with spacing
  const renderLabel = ({
    cx,
    cy,
    midAngle,
    outerRadius,
    category,
    percentage,
  }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = outerRadius + 20;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Add spacing between line and text based on position
    const isRightSide = x > cx;
    const offsetX = isRightSide ? x + 12 : x - 12;

    return (
      <text
        x={offsetX}
        y={y}
        textAnchor={isRightSide ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs text-black font-bold"
      >
        {category}
      </text>
    );
  };

  return (
    <Card data-testid="card-category-chart">
      <CardHeader>
        <CardTitle className="text-black text-[20px]">
          Apps Based On Category
        </CardTitle>
        <CardDescription className="text-subtitle">
          Number of applications in each category
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[270px]" data-testid="chart-category">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={coloredData}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={100}
                paddingAngle={1}
                startAngle={75}
                endAngle={435}
                dataKey="percentage"
                label={renderLabel}
                labelLine={(props: any) => {
                  const { points } = props;
                  const dataIndex = props.index;
                  const segmentColor =
                    coloredData[dataIndex]?.color || "hsl(var(--border))";

                  // Create bent line using polyline (straight segments, not curved)
                  const pointsString = points
                    .map((point: any) => `${point.x},${point.y}`)
                    .join(" ");
                  let bendX;
                  if (points[1].x > points[0].x) {
                    bendX = points[1].x + (points[1].x - points[0].x) * 0.6 + 2;
                  } else {
                    bendX = points[1].x + (points[1].x - points[0].x) * 0.6 - 2;
                  }
                  const bendY = points[1].y; // Keep horizontal line for a clean “bent” shape
                  const bentPointsString = `${points[0].x},${points[0].y},${points[1].x},${points[1].y}, ${bendX},${bendY}`;

                  return (
                    <polyline
                      points={bentPointsString}
                      stroke={segmentColor}
                      strokeWidth={1.5}
                      fill="none"
                      strokeLinejoin="miter"
                      strokeLinecap="round"
                    />
                  );
                }}
              >
                {coloredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border bg-background p-2 shadow-sm">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Category
                            </span>
                            <span className="font-bold text-foreground">
                              {payload[0].payload.category}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Percentage
                            </span>
                            <span className="font-bold text-foreground">
                              {payload[0].value}%
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
