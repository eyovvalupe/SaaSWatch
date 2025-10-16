import { useQuery } from "@tanstack/react-query";
import { ROIMeasurement } from "@/components/ROIMeasurement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Package } from "lucide-react";
import type { Application } from "@shared/schema";

export default function ROIPage() {
  const { data: applications, isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  // Filter applications with ROI enabled
  const roiApplications = applications?.filter(app => app.roiEnabled) || [];
  
  // Calculate total ROI
  const totalROI = roiApplications.reduce((sum, app) => {
    const cost = parseFloat(app.monthlyCost || "0");
    const value = parseFloat(app.monthlyValue || "0");
    if (cost === 0) return sum;
    return sum + ((value - cost) / cost * 100);
  }, 0);

  const avgROI = roiApplications.length > 0 ? (totalROI / roiApplications.length).toFixed(1) : "0.0";

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">ROI Measurement</h1>
          <p className="text-muted-foreground mt-2">
            Track return on investment for your SaaS applications
          </p>
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" data-testid="heading-roi">ROI Measurement</h1>
        <p className="text-muted-foreground mt-2">
          Track return on investment for your SaaS applications
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Applications Tracked</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-apps-tracked">
              {roiApplications.length}
            </div>
            <p className="text-xs text-muted-foreground">
              of {applications?.length || 0} total apps
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average ROI</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-roi">
              {avgROI}%
            </div>
            <p className="text-xs text-muted-foreground">
              across tracked applications
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-value">
              ${roiApplications.reduce((sum, app) => sum + parseFloat(app.monthlyValue || "0"), 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              value generated monthly
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Application ROI Tracking</h2>
        {applications && applications.length > 0 ? (
          applications.map((app) => (
            <ROIMeasurement key={app.id} application={app} />
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No applications found. Add applications to start tracking ROI.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
