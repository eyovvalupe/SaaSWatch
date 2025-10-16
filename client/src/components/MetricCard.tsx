import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowUp, ArrowDown, TrendingUp } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon: LucideIcon;
  iconColor?: string;
}

export function MetricCard({ title, value, trend, icon: Icon, iconColor = "text-primary" }: MetricCardProps) {
  return (
    <Card data-testid={`card-metric-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <h3 className="text-2xl font-bold font-mono" data-testid={`text-metric-value-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            {value}
          </h3>
          {trend && (
            <div className={`flex items-center gap-1 text-xs ${trend.isPositive ? 'text-chart-2' : 'text-chart-4'}`}>
              {trend.isPositive ? (
                <ArrowUp className="h-3 w-3" />
              ) : (
                <ArrowDown className="h-3 w-3" />
              )}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
