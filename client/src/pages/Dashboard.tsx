import { MetricCard } from "@/components/MetricCard";
import { SpendingChart } from "@/components/SpendingChart";
import { ApplicationCard } from "@/components/ApplicationCard";
import { ActionRecommendation } from "@/components/ActionRecommendation";
import { RenewalCalendar } from "@/components/RenewalCalendar";
import { Package, DollarSign, CreditCard, TrendingUp, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Plus } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Application, License, Renewal, Recommendation, SpendingHistory } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();
  
  const { data: applications = [], isLoading: appsLoading, error: appsError } = useQuery<Application[]>({
    queryKey: ['/api/applications'],
    retry: false
  });

  const initializeAccountMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/initialize-account');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/licenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/renewals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/spending-history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Account Initialized",
        description: "Your organization has been created! You can now load demo data or start adding your own applications.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initialize account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const seedDemoMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/seed-demo');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/licenses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/renewals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/recommendations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/spending-history'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Demo Data Loaded",
        description: "Your workspace is now populated with sample SaaS applications.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to load demo data. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Check if user needs to initialize their account (no organization)
  const needsInitialization = appsError && 
    (appsError as any)?.message?.includes('not associated with an organization');

  const { data: licenses = [] } = useQuery<License[]>({
    queryKey: ['/api/licenses'],
    enabled: !needsInitialization && !appsLoading
  });

  const { data: renewals = [] } = useQuery<Renewal[]>({
    queryKey: ['/api/renewals'],
    enabled: !needsInitialization && !appsLoading
  });

  const { data: recommendations = [] } = useQuery<Recommendation[]>({
    queryKey: ['/api/recommendations'],
    enabled: !needsInitialization && !appsLoading
  });

  const { data: spendingHistory = [] } = useQuery<SpendingHistory[]>({
    queryKey: ['/api/spending-history'],
    enabled: !needsInitialization && !appsLoading
  });

  const { data: stats } = useQuery<{
    totalApplications: number;
    totalLicenses: number;
    totalActiveLicenses: number;
    monthlySpend: number;
    potentialSavings: number;
  }>({
    queryKey: ['/api/dashboard/stats'],
    enabled: !needsInitialization && !appsLoading
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

  if (needsInitialization) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Card className="w-full max-w-2xl border-primary/50">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Database className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Initialize Your Account</CardTitle>
            <CardDescription className="text-base mt-2">
              Welcome! Let's set up your organization to get started with Appfuze.ai.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">What happens next:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li>We'll create a personal organization for you</li>
                <li>You'll get access to the full Appfuze.ai platform</li>
                <li>You can load demo data or add your own SaaS applications</li>
                <li>Track spending, licenses, and optimize costs</li>
              </ul>
            </div>
            <Button 
              onClick={() => initializeAccountMutation.mutate()}
              disabled={initializeAccountMutation.isPending}
              size="lg"
              className="w-full mt-4"
              data-testid="button-initialize-account"
            >
              {initializeAccountMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Initializing...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Initialize Account
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show empty state if no applications
  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Database className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Welcome to Appfuze.ai</CardTitle>
            <CardDescription className="text-base mt-2">
              Your workspace is empty. Get started by loading demo data to explore the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Demo data includes:</p>
              <ul className="space-y-2 list-disc list-inside">
                <li>6 sample SaaS applications (Slack, Salesforce, Zoom, GitHub, Figma, Notion)</li>
                <li>License tracking and utilization metrics</li>
                <li>Contract renewals and scheduling</li>
                <li>AI-driven cost optimization recommendations</li>
                <li>Spending trends and analytics</li>
                <li>Team chat conversations and vendor CRM threads</li>
              </ul>
            </div>
            <Button 
              onClick={() => seedDemoMutation.mutate()}
              disabled={seedDemoMutation.isPending}
              size="lg"
              className="w-full mt-4"
              data-testid="button-load-demo-data"
            >
              {seedDemoMutation.isPending ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Loading Demo Data...
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" />
                  Load Demo Data
                </>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              Or manually add your first application using the "Add Application" button
            </p>
          </CardContent>
        </Card>
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
        <div className="bg-black rounded-lg p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Recommended Actions</h2>
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
