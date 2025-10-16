import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface License {
  id: string;
  appName: string;
  totalLicenses: number;
  activeUsers: number;
  monthlyCostPerLicense: number;
}

interface LicenseTableProps {
  licenses: License[];
}

export function LicenseTable({ licenses }: LicenseTableProps) {
  const getUtilization = (activeUsers: number, totalLicenses: number) => {
    return (activeUsers / totalLicenses) * 100;
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return "bg-chart-2";
    if (utilization >= 50) return "bg-chart-3";
    return "bg-chart-4";
  };

  return (
    <Card data-testid="card-license-table">
      <CardHeader>
        <CardTitle className="text-lg">License Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application</TableHead>
                <TableHead className="text-right">Total Licenses</TableHead>
                <TableHead className="text-right">Active Users</TableHead>
                <TableHead className="text-right">Unused</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead className="text-right">Monthly Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {licenses.map((license) => {
                const utilization = getUtilization(license.activeUsers, license.totalLicenses);
                const unused = license.totalLicenses - license.activeUsers;
                const totalCost = license.totalLicenses * license.monthlyCostPerLicense;

                return (
                  <TableRow key={license.id} data-testid={`row-license-${license.id}`}>
                    <TableCell className="font-medium" data-testid={`text-app-${license.id}`}>
                      {license.appName}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {license.totalLicenses}
                    </TableCell>
                    <TableCell className="text-right font-mono text-sm">
                      {license.activeUsers}
                    </TableCell>
                    <TableCell className="text-right">
                      {unused > 0 && (
                        <Badge variant="outline" className="bg-chart-4/20 text-chart-4 border-chart-4/30">
                          {unused}
                        </Badge>
                      )}
                      {unused === 0 && <span className="text-muted-foreground">-</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress 
                          value={utilization} 
                          className="h-2 w-20"
                          indicatorClassName={getUtilizationColor(utilization)}
                        />
                        <span className="text-xs font-mono text-muted-foreground w-12">
                          {utilization.toFixed(0)}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-mono font-semibold">
                      ${totalCost.toLocaleString()}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
