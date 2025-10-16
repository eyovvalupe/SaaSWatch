import { LicenseTable } from '../LicenseTable';

export default function LicenseTableExample() {
  const mockLicenses = [
    { id: '1', appName: 'Slack', totalLicenses: 50, activeUsers: 45, monthlyCostPerLicense: 16 },
    { id: '2', appName: 'Salesforce', totalLicenses: 30, activeUsers: 28, monthlyCostPerLicense: 50 },
    { id: '3', appName: 'Zoom', totalLicenses: 25, activeUsers: 15, monthlyCostPerLicense: 12 },
    { id: '4', appName: 'GitHub', totalLicenses: 40, activeUsers: 38, monthlyCostPerLicense: 21 },
    { id: '5', appName: 'Figma', totalLicenses: 20, activeUsers: 12, monthlyCostPerLicense: 15 },
  ];

  return (
    <div className="p-4">
      <LicenseTable licenses={mockLicenses} />
    </div>
  );
}
