import { RenewalCalendar } from '../RenewalCalendar';

export default function RenewalCalendarExample() {
  const mockRenewals = [
    { id: '1', appName: 'Salesforce', renewalDate: 'Dec 15, 2024', annualCost: 18000, daysUntilRenewal: 25 },
    { id: '2', appName: 'GitHub', renewalDate: 'Jan 20, 2025', annualCost: 10080, daysUntilRenewal: 45 },
    { id: '3', appName: 'Slack', renewalDate: 'Feb 10, 2025', annualCost: 9600, daysUntilRenewal: 66 },
    { id: '4', appName: 'Zoom', renewalDate: 'Mar 5, 2025', annualCost: 3600, daysUntilRenewal: 90 },
  ];

  return (
    <div className="p-4 max-w-md">
      <RenewalCalendar renewals={mockRenewals} />
    </div>
  );
}
