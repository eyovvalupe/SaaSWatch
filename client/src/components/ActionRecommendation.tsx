import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  TrendingDown, 
  RefreshCw, 
  Users, 
  Calendar, 
  DollarSign,
  AlertTriangle 
} from "lucide-react";

export type ActionType = "downgrade" | "renew" | "track-users" | "review-renewal" | "cost-review";

interface ActionRecommendationProps {
  id: string;
  type: ActionType;
  appName: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  actionLabel: string;
  metadata?: {
    currentCost?: number;
    potentialCost?: number;
    renewalDate?: string;
    currentUsers?: number;
    activeUsers?: number;
    contractValue?: number;
  };
  onAction?: () => void;
}

const typeConfig = {
  downgrade: {
    icon: TrendingDown,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  renew: {
    icon: RefreshCw,
    color: "text-chart-1",
    bgColor: "bg-chart-1/10",
  },
  "track-users": {
    icon: Users,
    color: "text-chart-5",
    bgColor: "bg-chart-5/10",
  },
  "review-renewal": {
    icon: Calendar,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
  },
  "cost-review": {
    icon: DollarSign,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
  },
};

const priorityConfig = {
  high: { color: "bg-chart-4/20 text-chart-4 border-chart-4/30", icon: AlertTriangle },
  medium: { color: "bg-chart-3/20 text-chart-3 border-chart-3/30", icon: AlertTriangle },
  low: { color: "bg-muted text-muted-foreground border-border", icon: null },
};

export function ActionRecommendation({ 
  id, 
  type, 
  appName,
  title, 
  description, 
  priority,
  actionLabel,
  metadata,
  onAction 
}: ActionRecommendationProps) {
  const config = typeConfig[type];
  const priorityInfo = priorityConfig[priority];
  const Icon = config.icon;
  const PriorityIcon = priorityInfo.icon;

  return (
    <Card data-testid={`card-action-${id}`} className="hover-elevate">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`rounded-md p-2 ${config.bgColor} shrink-0`}>
            <Icon className={`h-4 w-4 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm" data-testid={`text-action-title-${id}`}>
                    {title}
                  </h3>
                  <Badge variant="outline" className={priorityInfo.color}>
                    {PriorityIcon && <PriorityIcon className="h-3 w-3 mr-1" />}
                    {priority}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{appName}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{description}</p>
            
            {metadata && (
              <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                {metadata.currentCost !== undefined && metadata.potentialCost !== undefined && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Current: </span>
                      <span className="font-mono font-semibold">${metadata.currentCost}/mo</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">After: </span>
                      <span className="font-mono font-semibold text-chart-2">${metadata.potentialCost}/mo</span>
                    </div>
                  </>
                )}
                {metadata.renewalDate && (
                  <div>
                    <span className="text-muted-foreground">Renewal: </span>
                    <span className="font-mono">{metadata.renewalDate}</span>
                  </div>
                )}
                {metadata.contractValue !== undefined && (
                  <div>
                    <span className="text-muted-foreground">Contract: </span>
                    <span className="font-mono font-semibold">${metadata.contractValue.toLocaleString()}</span>
                  </div>
                )}
                {metadata.currentUsers !== undefined && metadata.activeUsers !== undefined && (
                  <>
                    <div>
                      <span className="text-muted-foreground">Licenses: </span>
                      <span className="font-mono">{metadata.currentUsers}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Active: </span>
                      <span className="font-mono">{metadata.activeUsers}</span>
                    </div>
                  </>
                )}
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onAction}
              data-testid={`button-action-${id}`}
            >
              {actionLabel}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
