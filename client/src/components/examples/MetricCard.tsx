import { MetricCard } from '../MetricCard';
import { Package, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

export default function MetricCardExample() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-4">
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
        icon={TrendingUp}
      />
      <MetricCard
        title="Potential Savings"
        value="$1,240"
        icon={AlertCircle}
        iconColor="text-chart-3"
      />
    </div>
  );
}
