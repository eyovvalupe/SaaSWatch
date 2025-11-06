import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  MessageSquare,
  Users,
  Video,
  GitBranch,
  Palette,
  FileText,
  Aperture,
  Shield,
  Box,
  Droplet,
  Kanban,
  LucideIcon,
  ChromeIcon,
} from "lucide-react";

interface SpendingData {
  name: string;
  optimizedCost: number;
  potentialSavings: number;
  icon?: string;
}

interface TopSpendingChartProps {
  data: SpendingData[];
}

// Map application names to icons
const getAppIcon = (appName: string): LucideIcon => {
  const name = appName.toLowerCase();
  if (name.includes("slack") || name.includes("chat")) return MessageSquare;
  if (name.includes("salesforce") || name.includes("crm")) return Users;
  if (name.includes("zoom") || name.includes("meet") || name.includes("video"))
    return Video;
  if (name.includes("github") || name.includes("git")) return GitBranch;
  if (name.includes("figma") || name.includes("design")) return Palette;
  if (name.includes("notion") || name.includes("document")) return FileText;
  if (name.includes("chrome") || name.includes("browser")) return Aperture;
  if (name.includes("okta") || name.includes("auth")) return Shield;
  if (name.includes("dropbox") || name.includes("box")) return Box;
  if (
    name.includes("azure") ||
    name.includes("cloud") ||
    name.includes("devops")
  )
    return Droplet;
  if (name.includes("jira") || name.includes("project")) return Kanban;
  return Box; // Default icon
};

// Custom X-axis tick with icons
const CustomXAxisTick = ({ x, y, payload }: any) => {
  const Icon = getAppIcon(payload.value);

  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-12} y={0} width={24} height={24}>
        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted">
          <Icon className="h-4 w-4 text-foreground" />
        </div>
      </foreignObject>
    </g>
  );
};

export function TopSpendingChart({ data }: TopSpendingChartProps) {
  // Take only top 10 and sort by total cost
  const topData = data
    .map((item) => ({
      ...item,
      totalCost: item.optimizedCost + item.potentialSavings,
    }))
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 10);

  return (
    <Card data-testid="card-top-spending-chart">
      <CardHeader>
        <CardTitle className="text-black text-[20px]">
          Top 10 Highest-Spend Applications
        </CardTitle>
        <CardDescription className="text-subtitle">
          Organization-Wide Total Cost Breakdown
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[270px]" data-testid="chart-top-spending">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topData} barGap={4} barCategoryGap="25%">
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="hsl(var(--axios))"
                opacity={0.3}
              />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--axios))"
                fontSize={12}
                tickLine={true}
                axisLine={true}
                height={40}
                tick={<CustomXAxisTick />}
              />
              <YAxis
                stroke="hsl(var(--axios))"
                fontSize={12}
                tickLine={true}
                axisLine={true}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted))", opacity: 0.1 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                        <div className="grid gap-2">
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Application
                            </span>
                            <span className="font-bold text-foreground">
                              {data.name}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Optimized Cost
                            </span>
                            <span
                              className="font-bold"
                              style={{ color: "hsl(217, 91%, 60%)" }}
                            >
                              ${data.optimizedCost?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Potential Savings
                            </span>
                            <span
                              className="font-bold"
                              style={{ color: "hsl(199, 89%, 68%)" }}
                            >
                              ${data.potentialSavings?.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex flex-col pt-1 border-t">
                            <span className="text-[0.70rem] uppercase text-muted-foreground">
                              Total Cost
                            </span>
                            <span className="font-bold text-foreground">
                              $
                              {(
                                data.optimizedCost + data.potentialSavings
                              )?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={24}
                iconType="square"
                formatter={(value) => {
                  if (value === "optimizedCost") return "Optimized Cost";
                  if (value === "potentialSavings")
                    return "Potential Cost Saving";
                  return value;
                }}
              />
              <Bar
                dataKey="optimizedCost"
                stackId="a"
                fill="hsl(217, 91%, 60%)"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="potentialSavings"
                stackId="a"
                fill="hsl(199, 89%, 68%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
