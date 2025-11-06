import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useRoute } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search } from "lucide-react";
import { useLocation } from "wouter";
import type { Integration, User } from "@shared/schema";

export default function ApplicationDetail() {
  const [, params] = useRoute("/applications/:id");
  const [, navigate] = useLocation();
  const integrationId = params?.id;
  const [searchQuery, setSearchQuery] = useState("");

  const { data: integrations = [], isLoading: integrationsLoading } = useQuery<Integration[]>({
    queryKey: ["/api/integrations"],
    enabled: !!integrationId,
  });

  const integration = useMemo(() => {
    return integrations.find((int) => int.id === integrationId);
  }, [integrations, integrationId]);

  const { data: users = [], isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/integrations", integrationId, "users"],
    enabled: !!integrationId,
  });

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter((user) => {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase();
      const email = (user.email || "").toLowerCase();
      return fullName.includes(query) || email.includes(query);
    });
  }, [users, searchQuery]);

  const getInitials = (user: User) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getUserType = (user: User) => {
    if (user.role === "admin") return "Admin";
    return "User";
  };

  if (integrationsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading integration...</p>
      </div>
    );
  }

  if (!integration) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Integration not found</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/applications")}
          data-testid="button-back"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex items-center gap-3">
          {integration.iconUrl ? (
            <img
              src={integration.iconUrl}
              alt={integration.name}
              className="w-10 h-10 object-contain"
              data-testid="img-app-icon"
            />
          ) : (
            <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
              <span className="text-lg font-semibold text-primary">
                {integration.name.charAt(0)}
              </span>
            </div>
          )}
          <h1 className="text-2xl font-semibold" data-testid="text-app-name">
            {integration.name}
          </h1>
        </div>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-users"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? "No users found matching your search" : "No users have added this application yet"}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 font-medium text-sm">
                <div data-testid="header-name">Name</div>
                <div data-testid="header-email">Email</div>
                <div data-testid="header-type">Type</div>
                <div data-testid="header-status">Status</div>
              </div>
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="grid grid-cols-4 gap-4 p-4 items-center hover-elevate"
                  data-testid={`row-user-${user.id}`}
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user.profileImageUrl || undefined}
                        alt={`${user.firstName} ${user.lastName}`}
                      />
                      <AvatarFallback>{getInitials(user)}</AvatarFallback>
                    </Avatar>
                    <span
                      className="font-medium"
                      data-testid={`text-user-name-${user.id}`}
                    >
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.email}
                    </span>
                  </div>
                  <div
                    className="text-sm text-muted-foreground"
                    data-testid={`text-user-email-${user.id}`}
                  >
                    {user.email}
                  </div>
                  <div>
                    <Badge
                      variant={user.role === "admin" ? "default" : "secondary"}
                      data-testid={`badge-user-type-${user.id}`}
                    >
                      {getUserType(user)}
                    </Badge>
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className="bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
                      data-testid={`badge-user-status-${user.id}`}
                    >
                      ✓ Active
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
