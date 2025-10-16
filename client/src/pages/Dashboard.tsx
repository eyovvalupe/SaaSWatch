import { MetricCard } from "@/components/MetricCard";
import { SpendingChart } from "@/components/SpendingChart";
import { ApplicationCard } from "@/components/ApplicationCard";
import { ActionRecommendation } from "@/components/ActionRecommendation";
import { RenewalCalendar } from "@/components/RenewalCalendar";
import { Package, DollarSign, CreditCard, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Application, License, Renewal, Recommendation, SpendingHistory } from "@shared/schema";

export default function Dashboard() {
  const { data: applications = [], isLoading: appsLoading } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
  });

  const { data: licenses = [] } = useQuery<License[]>({
    queryKey: ['/api/licenses'],
  });

  const { data: renewals = [] } = useQuery<Renewal[]>({
    queryKey: ['/api/renewals'],
  });

  const { data: recommendations = [] } = useQuery<Recommendation[]>({
    queryKey: ['/api/recommendations'],
  });

  const { data: spendingHistory = [] } = useQuery<SpendingHistory[]>({
    queryKey: ['/api/spending-history'],
  });

  const { data: stats } = useQuery<{
    totalApplications: number;
    totalLicenses: number;
    totalActiveLicenses: number;
    monthlySpend: number;
    potentialSavings: number;
  }>({
    queryKey: ['/api/dashboard/stats'],
  });

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

  if (appsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold" data-testid="text-page-title">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Monitor your SaaS applications and optimize spending
          </p>
        </div>
        <Button data-testid="button-add-application">
          <Plus className="h-4 w-4 mr-2" />
          Add Application
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Applications"
          value={stats?.totalApplications || 0}
          trend={{ value: 12, isPositive: true }}
          icon={Package}
        />
        <MetricCard
          title="Monthly Spend"
          value={`$${stats?.monthlySpend.toLocaleString() || 0}`}
          trend={{ value: 8, isPositive: false }}
          icon={DollarSign}
        />
        <MetricCard
          title="Active Licenses"
          value={stats?.totalActiveLicenses || 0}
          trend={{ value: 5, isPositive: true }}
          icon={CreditCard}
        />
        <MetricCard
          title="Potential Savings"
          value={`$${stats?.potentialSavings.toLocaleString() || 0}`}
          icon={TrendingUp}
          iconColor="text-chart-2"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SpendingChart data={spendingData} />
        <RenewalCalendar renewals={renewalData} />
      </div>

      {actionRecommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recommended Actions</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {actionRecommendations.map((rec) => (
              <ActionRecommendation
                key={rec.id}
                {...rec}
                onAction={() => console.log(`Action: ${rec.title}`)}
              />
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-lg font-semibold">Recent Applications</h2>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search applications..." 
              className="pl-9"
              data-testid="input-search-applications"
            />
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => (
            <ApplicationCard
              key={app.id}
              id={app.id}
              name={app.name}
              category={app.category}
              monthlyCost={Number(app.monthlyCost)}
              status={app.status as any}
              logo={app.logoUrl || ''}
              onClick={() => console.log(`${app.name} clicked`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
