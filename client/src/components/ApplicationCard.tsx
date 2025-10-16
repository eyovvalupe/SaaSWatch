import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiSlack, SiSalesforce, SiZoom, SiGithub, SiFigma, SiNotion } from "react-icons/si";
import { Package } from "lucide-react";

interface ApplicationCardProps {
  id: string;
  name: string;
  category: string;
  monthlyCost: number;
  status: "approved" | "shadow" | "trial";
  logo: string;
  onClick?: () => void;
}

const statusConfig = {
  approved: { label: "Approved", className: "bg-chart-2/20 text-chart-2 border-chart-2/30" },
  shadow: { label: "Shadow IT", className: "bg-chart-4/20 text-chart-4 border-chart-4/30" },
  trial: { label: "Trial", className: "bg-chart-3/20 text-chart-3 border-chart-3/30" },
};

const logoMap: Record<string, any> = {
  "Slack": SiSlack,
  "Salesforce": SiSalesforce,
  "Zoom": SiZoom,
  "GitHub": SiGithub,
  "Figma": SiFigma,
  "Notion": SiNotion,
};

export function ApplicationCard({ id, name, category, monthlyCost, status, logo, onClick }: ApplicationCardProps) {
  const statusInfo = statusConfig[status];
  const LogoIcon = logoMap[name] || Package;
  
  return (
    <Card 
      className="hover-elevate active-elevate-2 cursor-pointer"
      onClick={onClick}
      data-testid={`card-application-${id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div 
            className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center"
            data-testid={`img-app-logo-${id}`}
          >
            <LogoIcon className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-sm truncate" data-testid={`text-app-name-${id}`}>
                  {name}
                </h3>
                <p className="text-xs text-muted-foreground truncate" data-testid={`text-app-category-${id}`}>{category}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('App menu clicked');
                }}
                data-testid={`button-app-menu-${id}`}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>
            </div>
            <div className="mt-3 flex items-center justify-between gap-2">
              <Badge variant="outline" className={statusInfo.className}>
                {statusInfo.label}
              </Badge>
              <span className="text-sm font-mono font-semibold" data-testid={`text-app-cost-${id}`}>
                ${monthlyCost}/mo
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
