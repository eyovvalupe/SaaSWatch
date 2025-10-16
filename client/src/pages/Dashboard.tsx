import { MetricCard } from "@/components/MetricCard";
import { SpendingChart } from "@/components/SpendingChart";
import { ApplicationCard } from "@/components/ApplicationCard";
import { ActionRecommendation } from "@/components/ActionRecommendation";
import { RenewalCalendar } from "@/components/RenewalCalendar";
import { Package, DollarSign, CreditCard, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus } from "lucide-react";

// TODO: Remove mock data when connecting to backend
import slackLogo from '@assets/generated_images/Slack_app_icon_a668dc5a.png';
import salesforceLogo from '@assets/generated_images/Salesforce_app_icon_0d18cc45.png';
import zoomLogo from '@assets/generated_images/Zoom_app_icon_3be960fb.png';
import githubLogo from '@assets/generated_images/GitHub_app_icon_40d531dd.png';
import figmaLogo from '@assets/generated_images/Figma_app_icon_91c3879c.png';
import notionLogo from '@assets/generated_images/Notion_app_icon_9574a133.png';

const mockSpendingData = [
  { month: 'Jan', spend: 7200 },
  { month: 'Feb', spend: 7500 },
  { month: 'Mar', spend: 7800 },
  { month: 'Apr', spend: 8100 },
  { month: 'May', spend: 8000 },
  { month: 'Jun', spend: 8420 },
];

const mockApplications = [
  { id: 'slack', name: 'Slack', category: 'Communication', monthlyCost: 800, status: 'approved' as const, logo: slackLogo },
  { id: 'salesforce', name: 'Salesforce', category: 'CRM', monthlyCost: 1500, status: 'approved' as const, logo: salesforceLogo },
  { id: 'zoom', name: 'Zoom', category: 'Video Conferencing', monthlyCost: 300, status: 'trial' as const, logo: zoomLogo },
  { id: 'github', name: 'GitHub', category: 'Development', monthlyCost: 840, status: 'approved' as const, logo: githubLogo },
  { id: 'figma', name: 'Figma', category: 'Design', monthlyCost: 300, status: 'approved' as const, logo: figmaLogo },
  { id: 'notion', name: 'Notion', category: 'Productivity', monthlyCost: 80, status: 'shadow' as const, logo: notionLogo },
];

const mockRenewals = [
  { id: '1', appName: 'Salesforce', renewalDate: 'Dec 15, 2024', annualCost: 18000, daysUntilRenewal: 25 },
  { id: '2', appName: 'GitHub', renewalDate: 'Jan 20, 2025', annualCost: 10080, daysUntilRenewal: 45 },
  { id: '3', appName: 'Slack', renewalDate: 'Feb 10, 2025', annualCost: 9600, daysUntilRenewal: 66 },
  { id: '4', appName: 'Zoom', renewalDate: 'Mar 5, 2025', annualCost: 3600, daysUntilRenewal: 90 },
];

export default function Dashboard() {
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
          value={24}
          trend={{ value: 12, isPositive: true }}
          icon={Package}
        />
        <MetricCard
          title="Monthly Spend"
          value="$8,420"
          trend={{ value: 8, isPositive: false }}
          icon={DollarSign}
        />
        <MetricCard
          title="Active Licenses"
          value={156}
          trend={{ value: 5, isPositive: true }}
          icon={CreditCard}
        />
        <MetricCard
          title="Potential Savings"
          value="$1,240"
          icon={TrendingUp}
          iconColor="text-chart-2"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SpendingChart data={mockSpendingData} />
        <RenewalCalendar renewals={mockRenewals} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recommended Actions</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <ActionRecommendation
            id="downgrade-zoom"
            type="downgrade"
            appName="Zoom"
            title="Downgrade to lower tier"
            description="Current usage patterns suggest a lower tier plan would suffice. Save money without losing essential features."
            priority="medium"
            actionLabel="Review Downgrade"
            metadata={{
              currentCost: 300,
              potentialCost: 180,
              currentUsers: 25,
              activeUsers: 15
            }}
            onAction={() => console.log('Review downgrade')}
          />
          
          <ActionRecommendation
            id="renew-salesforce"
            type="renew"
            appName="Salesforce"
            title="Contract renewal approaching"
            description="Annual contract expires in 30 days. Review terms and negotiate better rates before auto-renewal."
            priority="high"
            actionLabel="Review Renewal"
            metadata={{
              renewalDate: "Dec 15, 2024",
              contractValue: 18000
            }}
            onAction={() => console.log('Review renewal')}
          />
          
          <ActionRecommendation
            id="track-slack"
            type="track-users"
            appName="Slack"
            title="Monitor user activity"
            description="10 users inactive for 30+ days. Track usage patterns to optimize license allocation."
            priority="low"
            actionLabel="View Users"
            metadata={{
              currentUsers: 50,
              activeUsers: 40
            }}
            onAction={() => console.log('Track users')}
          />
          
          <ActionRecommendation
            id="cost-figma"
            type="cost-review"
            appName="Figma"
            title="Cost per signed agreement review"
            description="Actual spend deviates from signed agreement. Review contract terms and billing."
            priority="high"
            actionLabel="Review Cost"
            metadata={{
              currentCost: 450,
              potentialCost: 300,
              contractValue: 3600
            }}
            onAction={() => console.log('Review cost')}
          />
        </div>
      </div>

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
          {mockApplications.map((app) => (
            <ApplicationCard
              key={app.id}
              {...app}
              onClick={() => console.log(`${app.name} clicked`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
