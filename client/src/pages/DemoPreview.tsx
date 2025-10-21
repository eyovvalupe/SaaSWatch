import { MetricCard } from "@/components/MetricCard";
import { SpendingChart } from "@/components/SpendingChart";
import { ApplicationCard } from "@/components/ApplicationCard";
import { ActionRecommendation } from "@/components/ActionRecommendation";
import { RenewalCalendar } from "@/components/RenewalCalendar";
import { Package, DollarSign, CreditCard, TrendingUp, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DemoPreview() {
  const handleLogin = () => {
    window.location.href = '/api/login';
  };

  const demoApplications = [
    {
      id: "1",
      name: "Slack",
      category: "Communication",
      monthlyCost: 800,
      status: "approved" as const,
      logo: "/assets/generated_images/Slack_app_icon_a668dc5a.png"
    },
    {
      id: "2",
      name: "Salesforce",
      category: "CRM",
      monthlyCost: 1500,
      status: "approved" as const,
      logo: "/assets/generated_images/Salesforce_app_icon_0d18cc45.png"
    },
    {
      id: "3",
      name: "Zoom",
      category: "Video Conferencing",
      monthlyCost: 300,
      status: "trial" as const,
      logo: "/assets/generated_images/Zoom_app_icon_3be960fb.png"
    },
    {
      id: "4",
      name: "GitHub",
      category: "Development",
      monthlyCost: 840,
      status: "approved" as const,
      logo: "/assets/generated_images/GitHub_app_icon_40d531dd.png"
    },
    {
      id: "5",
      name: "Figma",
      category: "Design",
      monthlyCost: 300,
      status: "approved" as const,
      logo: "/assets/generated_images/Figma_app_icon_91c3879c.png"
    },
    {
      id: "6",
      name: "Notion",
      category: "Productivity",
      monthlyCost: 80,
      status: "shadow" as const,
      logo: "/assets/generated_images/Notion_app_icon_9574a133.png"
    }
  ];

  const demoStats = {
    totalApplications: 6,
    totalLicenses: 165,
    totalActiveLicenses: 138,
    monthlySpend: 3820,
    potentialSavings: 420
  };

  const demoSpendingData = [
    { month: "Jan", spend: 3200 },
    { month: "Feb", spend: 3400 },
    { month: "Mar", spend: 3600 },
    { month: "Apr", spend: 3700 },
    { month: "May", spend: 3820 },
    { month: "Jun", spend: 3820 }
  ];

  const today = new Date();
  const demoRenewals = [
    {
      id: "1",
      appName: "Salesforce",
      renewalDate: new Date(today.getFullYear(), today.getMonth() + 1, 15).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      annualCost: 18000,
      daysUntilRenewal: 45
    },
    {
      id: "2",
      appName: "GitHub",
      renewalDate: new Date(today.getFullYear(), today.getMonth() + 2, 20).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      annualCost: 10080,
      daysUntilRenewal: 80
    },
    {
      id: "3",
      appName: "Slack",
      renewalDate: new Date(today.getFullYear(), today.getMonth() + 3, 10).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      annualCost: 9600,
      daysUntilRenewal: 100
    }
  ];

  const demoRecommendations = [
    {
      id: "1",
      type: "downgrade" as const,
      appName: "Zoom",
      title: "Downgrade Zoom License Tier",
      description: "Only 15 of 25 licenses are actively used. Consider downgrading to save costs.",
      priority: "high" as const,
      actionLabel: "Review Options",
      metadata: {
        currentCost: 300,
        potentialCost: 180,
        currentUsers: 25,
        activeUsers: 15
      }
    },
    {
      id: "2",
      type: "cost-review" as const,
      appName: "Salesforce",
      title: "Review Salesforce Contract",
      description: "Annual renewal approaching. Compare with alternatives before auto-renewal.",
      priority: "high" as const,
      actionLabel: "Start Review",
      metadata: {
        renewalDate: new Date(today.getFullYear(), today.getMonth() + 1, 15).toISOString(),
        contractValue: 18000
      }
    },
    {
      id: "3",
      type: "track-users" as const,
      appName: "Notion",
      title: "Shadow IT Detection: Notion",
      description: "Unapproved tool detected. Track usage and evaluate if formal adoption is needed.",
      priority: "medium" as const,
      actionLabel: "Investigate",
      metadata: {}
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Alert className="mb-6 border-primary/50 bg-primary/10">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Demo Preview Mode</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
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
            value={demoStats.totalApplications}
            trend={{ value: 12, isPositive: true }}
          />
          <MetricCard
            icon={CreditCard}
            title="Active Licenses"
            value={`${demoStats.totalActiveLicenses}/${demoStats.totalLicenses}`}
            trend={{ value: 5, isPositive: true }}
          />
          <MetricCard
            icon={DollarSign}
            title="Monthly Spend"
            value={`$${demoStats.monthlySpend.toLocaleString()}`}
            trend={{ value: 3, isPositive: false }}
          />
          <MetricCard
            icon={TrendingUp}
            title="Potential Savings"
            value={`$${demoStats.potentialSavings.toLocaleString()}`}
            trend={{ value: 8, isPositive: true }}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SpendingChart data={demoSpendingData} />
          <RenewalCalendar renewals={demoRenewals} />
        </div>

        <div className="space-y-6">
          <div className="bg-black dark:bg-black p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4 text-white">Recommended Actions</h2>
            <div className="space-y-4">
              {demoRecommendations.map((rec) => (
                <ActionRecommendation key={rec.id} {...rec} />
              ))}
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">All Applications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {demoApplications.map((app) => (
                  <ApplicationCard 
                    key={app.id} 
                    id={app.id}
                    name={app.name}
                    category={app.category}
                    monthlyCost={app.monthlyCost}
                    status={app.status}
                    logo={app.logo}
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
