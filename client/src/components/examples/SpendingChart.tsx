import { SpendingChart } from '../SpendingChart';

export default function SpendingChartExample() {
  const mockData = [
    { month: 'Jan', spend: 7200 },
    { month: 'Feb', spend: 7500 },
    { month: 'Mar', spend: 7800 },
    { month: 'Apr', spend: 8100 },
    { month: 'May', spend: 8000 },
    { month: 'Jun', spend: 8420 },
  ];

  return (
    <div className="p-4">
      <SpendingChart data={mockData} />
    </div>
  );
}
