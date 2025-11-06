import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  UserCheck, 
  Clock, 
  UserX, 
  Search,
} from "lucide-react";
import type { Application, License } from "@shared/schema";

interface UserCounts {
  applicationId: string;
  totalUsers: number;
  activeUsers: number;
  idleUsers: number;
  inactiveUsers: number;
  billableUsers: number;
}

interface AnalyticsRow {
  application: Application;
  license: License;
  userCounts: UserCounts;
}

export default function Analytics() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: applications = [], isLoading: appsLoading } = useQuery<
    Application[]
  >({
    queryKey: ["/api/applications", searchQuery],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchQuery) {
        params.append("search", searchQuery);
      }
      const response = await fetch(`/api/applications?${params.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error("Failed to fetch applications");
      return response.json();
    },
    refetchOnMount: "always",
  });

  const { data: licenses = [], isLoading: licensesLoading } = useQuery<
    License[]
  >({
    queryKey: ["/api/licenses"],
    refetchOnMount: "always",
  });

  const { data: userCounts = [], isLoading: userCountsLoading } = useQuery<
    UserCounts[]
  >({
    queryKey: ["/api/analytics/user-counts"],
    refetchOnMount: "always",
  });

  const isLoading = appsLoading || licensesLoading || userCountsLoading;

  const analyticsData: AnalyticsRow[] = applications.map((app) => {
    const license = licenses.find((l) => l.applicationId === app.id);
    const counts = userCounts.find((c) => c.applicationId === app.id);
    
    return {
      application: app,
      license: license || {
        id: "",
        organizationId: "",
        applicationId: app.id,
        totalLicenses: 0,
        activeUsers: 0,
        idleUsers: 0,
        inactiveUsers: 0,
        billableUsers: 0,
        costPerLicense: "0",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      userCounts: counts || {
        applicationId: app.id,
        totalUsers: 0,
        activeUsers: 0,
        idleUsers: 0,
        inactiveUsers: 0,
        billableUsers: 0,
      },
    };
  });

  const calculateTotalCost = (license: License) => {
    return (parseFloat(license.costPerLicense) * license.billableUsers).toFixed(
      2,
    );
  };

  const calculatePotentialSavings = (license: License) => {
    const unusedLicenses = license.totalLicenses - license.billableUsers;
    return (parseFloat(license.costPerLicense) * unusedLicenses).toFixed(2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Detailed license usage and cost analysis across all applications
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
          <CardTitle className="text-lg">License Usage Overview</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by cloud name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-analytics"
            />
          </div>
        </CardHeader>
        <CardContent>
          {!isLoading && analyticsData.length === 0 ? (
            <div
              className="flex flex-col items-center justify-center py-12"
              data-testid="empty-search-results"
            >
              <Search className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                No Results Found
              </h3>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                {searchQuery
                  ? `No applications found matching "${searchQuery}". Try adjusting your search.`
                  : "No applications available. Load demo data or add applications to get started."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      Cloud Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      <div className="flex items-center gap-2">Total Users</div>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      <div className="flex items-center gap-2">
                        Active Users
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      <div className="flex items-center gap-2">Idle Users</div>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      <div className="flex items-center gap-2">
                        Inactive Users
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      <div className="flex items-center gap-2">
                        Billable Users
                      </div>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      <div className="flex items-center gap-2">Total Cost</div>
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                      <div className="flex items-center gap-2">
                        Potential Savings
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.map(({ application, license, userCounts }) => (
                    <tr
                      key={application.id}
                      className="border-b hover-elevate"
                      data-testid={`row-analytics-${application.id}`}
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded overflow-hidden flex items-center justify-center bg-background">
                            <img
                              src={application.logoUrl || ""}
                              alt={application.name}
                              className="h-full w-full object-contain"
                              data-testid={`img-app-${application.id}`}
                            />
                          </div>
                          <span
                            className="font-medium text-foreground"
                            data-testid={`text-app-name-${application.id}`}
                          >
                            {application.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span
                            className="text-foreground"
                            data-testid={`text-total-users-${application.id}`}
                          >
                            {userCounts.totalUsers}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-primary" />
                          <span
                            className="text-foreground"
                            data-testid={`text-active-users-${application.id}`}
                          >
                            {userCounts.activeUsers}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-500" />
                          <span
                            className="text-foreground"
                            data-testid={`text-idle-users-${application.id}`}
                          >
                            {userCounts.idleUsers}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <UserX className="h-4 w-4 text-red-500" />
                          <span
                            className="text-foreground"
                            data-testid={`text-inactive-users-${application.id}`}
                          >
                            {userCounts.inactiveUsers}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span
                            className="text-foreground"
                            data-testid={`text-billable-users-${application.id}`}
                          >
                            {userCounts.billableUsers}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className="text-foreground font-medium"
                          data-testid={`text-total-cost-${application.id}`}
                        >
                          ${calculateTotalCost(license)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className="text-foreground font-medium"
                          data-testid={`text-potential-savings-${application.id}`}
                        >
                          ${calculatePotentialSavings(license)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
