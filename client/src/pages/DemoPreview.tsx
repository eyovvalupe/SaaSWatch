import { MetricCard } from "@/components/MetricCard";
import { SpendingChart } from "@/components/SpendingChart";
import { ApplicationCard } from "@/components/ApplicationCard";
import { ActionRecommendation } from "@/components/ActionRecommendation";
import { RenewalCalendar } from "@/components/RenewalCalendar";
import { Package, DollarSign, CreditCard, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useQuery } from "@tanstack/react-query";
import type { Application, License, Renewal, Recommendation, SpendingHistory } from "@shared/schema";

interface DemoData {
  applications: Application[];
  licenses: License[];
  renewals: Renewal[];
  recommendations: Recommendation[];
  spendingHistory: SpendingHistory[];
  stats: {
    totalApplications: number;
    totalLicenses: number;
    totalActiveLicenses: number;
    monthlySpend: number;
    potentialSavings: number;
  };
}

export default function DemoPreview() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const { data: demoData, isLoading, isError, refetch } = useQuery<DemoData>({
    queryKey: ['/api/demo-data'],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-muted-foreground">Loading demo...</div>
      </div>
    );
  }

  if (isError || !demoData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Failed to load demo data</h2>
          <p className="text-muted-foreground mb-4">
            Unable to fetch the demo organization. Please try again.
          </p>
          <Button onClick={() => refetch()} data-testid="button-retry-demo">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const { applications, renewals, recommendations, spendingHistory, stats } = demoData;

  // Transform spending history for chart
  const spendingData = spendingHistory.map(item => ({
    month: item.month,
    spend: Number(item.totalSpend)
  }));

  // Transform renewals for calendar
  const renewalData = renewals.map(renewal => {
    const app = applications.find(a => a.id === renewal.applicationId);
    const renewalDate = new Date(renewal.renewalDate);
    const today = new Date();
    const daysUntilRenewal = Math.ceil((renewalDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      id: renewal.id,
      appName: app?.name || 'Unknown',
      renewalDate: renewalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      annualCost: Number(renewal.annualCost),
      daysUntilRenewal
    };
  });

  // Transform recommendations for action cards
  const actionRecommendations = recommendations.map(rec => {
    const app = applications.find(a => a.id === rec.applicationId);
    return {
      id: rec.id,
      type: rec.type as any,
      appName: app?.name || 'Unknown',
      title: rec.title,
      description: rec.description,
      priority: rec.priority as any,
      actionLabel: rec.actionLabel,
      metadata: {
        currentCost: rec.currentCost ? Number(rec.currentCost) : undefined,
        potentialCost: rec.potentialCost ? Number(rec.potentialCost) : undefined,
        renewalDate: rec.renewalDate || undefined,
        currentUsers: rec.currentUsers || undefined,
        activeUsers: rec.activeUsers || undefined,
        contractValue: rec.contractValue ? Number(rec.contractValue) : undefined,
      }
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Alert className="mb-6 border-primary/50 bg-primary/10">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Demo Preview Mode</AlertTitle>
        <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
          <span>You're viewing a read-only demo. Log in to manage your own SaaS applications.</span>
          <Button 
            size="sm" 
            onClick={handleLogin}
            data-testid="button-demo-login"
          >
            Log In Now
          </Button>
        </AlertDescription>
      </Alert>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            icon={Package}
            title="Total Applications"
            value={stats.totalApplications}
            trend={{ value: 12, isPositive: true }}
            data-testid="metric-total-applications"
          />
          <MetricCard
            icon={CreditCard}
            title="Active Licenses"
            value={`${stats.totalActiveLicenses}/${stats.totalLicenses}`}
            trend={{ value: 5, isPositive: true }}
            data-testid="metric-active-licenses"
          />
          <MetricCard
            icon={DollarSign}
            title="Monthly Spend"
            value={`$${stats.monthlySpend.toLocaleString()}`}
            trend={{ value: 3, isPositive: false }}
            data-testid="metric-monthly-spend"
          />
          <MetricCard
            icon={TrendingUp}
            title="Potential Savings"
            value={`$${stats.potentialSavings.toLocaleString()}`}
            trend={{ value: 8, isPositive: true }}
            data-testid="metric-potential-savings"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingChart data={spendingData} />
          <RenewalCalendar renewals={renewalData} />
        </div>

        <div className="space-y-6">
          <div className="bg-black dark:bg-black p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">Recommended Actions</h2>
            <div className="space-y-4">
              {actionRecommendations.map((rec) => (
                <ActionRecommendation key={rec.id} {...rec} />
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">All Applications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {applications.map((app) => (
                  <ApplicationCard 
                    key={app.id} 
                    id={app.id}
                    name={app.name}
                    category={app.category}
                    monthlyCost={Number(app.monthlyCost)}
                    status={app.status as "approved" | "shadow" | "trial"}
                    logo={app.logoUrl || ""}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
