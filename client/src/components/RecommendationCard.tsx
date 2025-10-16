import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, TrendingDown, Users } from "lucide-react";

interface RecommendationCardProps {
  id: string;
  type: "underutilized" | "duplicate" | "unused";
  title: string;
  description: string;
  potentialSavings: number;
  onAction?: () => void;
}

const typeConfig = {
  underutilized: {
    icon: TrendingDown,
    color: "text-chart-3",
    bgColor: "bg-chart-3/10",
    label: "Underutilized",
  },
  duplicate: {
    icon: AlertCircle,
    color: "text-chart-4",
    bgColor: "bg-chart-4/10",
    label: "Duplicate",
  },
  unused: {
    icon: Users,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: "Unused",
  },
};

export function RecommendationCard({ 
  id, 
  type, 
  title, 
  description, 
  potentialSavings,
  onAction 
}: RecommendationCardProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Card data-testid={`card-recommendation-${id}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`rounded-md p-2 ${config.bgColor}`}>
            <Icon className={`h-4 w-4 ${config.color}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-sm" data-testid={`text-recommendation-title-${id}`}>
                {title}
              </h3>
              <Badge variant="outline" className="bg-chart-2/20 text-chart-2 border-chart-2/30 shrink-0">
                Save ${potentialSavings}/mo
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{description}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={onAction}
              data-testid={`button-action-${id}`}
            >
              Review
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
