import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle } from "lucide-react";

interface RenewalItem {
  id: string;
  appName: string;
  renewalDate: string;
  annualCost: number;
  daysUntilRenewal: number;
}

interface RenewalCalendarProps {
  renewals: RenewalItem[];
}

export function RenewalCalendar({ renewals }: RenewalCalendarProps) {
  const getUrgencyColor = (days: number) => {
    if (days <= 30) return "bg-chart-4/20 text-chart-4 border-chart-4/30";
    if (days <= 60) return "bg-chart-3/20 text-chart-3 border-chart-3/30";
    return "bg-muted text-muted-foreground border-border";
  };

  const sortedRenewals = [...renewals].sort((a, b) => a.daysUntilRenewal - b.daysUntilRenewal);

  return (
    <Card data-testid="card-renewal-calendar">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <CardTitle className="text-lg">Upcoming Renewals</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedRenewals.map((renewal) => (
            <div 
              key={renewal.id} 
              className="flex items-center justify-between gap-4 p-3 rounded-md border hover-elevate active-elevate-2"
              data-testid={`renewal-item-${renewal.id}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm" data-testid={`text-renewal-app-${renewal.id}`}>
                    {renewal.appName}
                  </h4>
                  <Badge variant="outline" className={getUrgencyColor(renewal.daysUntilRenewal)}>
                    {renewal.daysUntilRenewal <= 30 && <AlertCircle className="h-3 w-3 mr-1" />}
                    {renewal.daysUntilRenewal}d
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>{renewal.renewalDate}</span>
                  <span className="font-mono font-semibold">
                    ${renewal.annualCost.toLocaleString()}/yr
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
