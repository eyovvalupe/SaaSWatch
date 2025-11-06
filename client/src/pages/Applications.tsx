import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreVertical, Search, SearchX } from "lucide-react";
import { useLocation } from "wouter";
import type { Application, Integration } from "@shared/schema";

export default function Applications() {
  const [, navigate] = useLocation();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteConfirmApp, setDeleteConfirmApp] = useState<Application | null>(
    null,
  );

  const { data: applications = [], isLoading: appsLoading } = useQuery<
    Application[]
  >({
    queryKey: ["/api/applications"],
  });

  const { data: integrations = [], isLoading: integrationsLoading } = useQuery<
    Integration[]
  >({
    queryKey: ["/api/integrations"],
    enabled: isAddModalOpen,
  });

  const addApplicationMutation = useMutation({
    mutationFn: async (integration: Integration) => {
      return await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: integration.name,
          category: "SaaS",
          vendor: integration.name,
          status: "approved",
          monthlyCost: "0.00",
          integrationId: integration.id,
          logoUrl: integration.iconUrl,
        }),
      }).then((res) => res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setIsAddModalOpen(false);
    },
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: async (applicationId: string) => {
      const response = await fetch(`/api/applications/${applicationId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok && response.status !== 204) {
        throw new Error("Failed to delete application");
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
    },
  });

  const addedIntegrationIds = new Set(
    applications.map((app) => app.integrationId).filter(Boolean),
  );

  const filteredIntegrations = integrations.filter((integration) =>
    integration.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleApplicationClick = (app: Application) => {
    if (app.integrationId) {
      navigate(`/applications/${app.integrationId}`);
    }
  };

  if (appsLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading applications...</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold" data-testid="text-page-title">
          Applications
        </h1>
        <Button
          onClick={() => setIsAddModalOpen(true)}
          data-testid="button-add-application"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Application
        </Button>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-4">
        {applications.map((app) => (
          <Card
            key={app.id}
            className="p-4 flex flex-col items-center gap-3 cursor-pointer hover-elevate active-elevate-2 relative"
            onClick={() => handleApplicationClick(app)}
            data-testid={`card-application-${app.id}`}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <div className="absolute top-2 right-[10px]">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    data-testid={`button-menu-${app.id}`}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem data-testid={`menu-edit-${app.id}`}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDeleteConfirmApp(app);
                  }}
                  data-testid={`menu-delete-${app.id}`}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="relative top-[5px] flex flex-col items-center">
              {app.logoUrl ? (
                <img
                  src={app.logoUrl}
                  alt={app.name}
                  className="w-8 h-8 object-contain"
                  data-testid={`img-app-icon-${app.id}`}
                />
              ) : (
                <div
                  className="w-16 h-16 rounded-md bg-primary/10 flex items-center justify-center"
                  data-testid={`div-app-placeholder-${app.id}`}
                >
                  <span className="text-2xl font-semibold text-primary">
                    {app.name.charAt(0)}
                  </span>
                </div>
              )}

              <p
                className="text-sm font-medium text-center line-clamp-2"
                data-testid={`text-app-name-${app.id}`}
              >
                {app.name}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="max-w-4xl h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Add Application</DialogTitle>
          </DialogHeader>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
              data-testid="input-search-integrations"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {integrationsLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading integrations...</p>
              </div>
            ) : filteredIntegrations.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 gap-4"
                data-testid="div-no-search-results"
              >
                <div className="w-32 h-32 rounded-full bg-muted/50 flex items-center justify-center">
                  <SearchX className="w-16 h-16 text-muted-foreground/50" />
                </div>
                <div className="text-center">
                  <h3
                    className="text-lg font-semibold mb-1"
                    data-testid="text-no-results-title"
                  >
                    No search results
                  </h3>
                  <p
                    className="text-sm text-muted-foreground"
                    data-testid="text-no-results-message"
                  >
                    {searchQuery
                      ? `No integrations found matching "${searchQuery}"`
                      : "No integrations available"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {filteredIntegrations.map((integration) => {
                  const isAdded = addedIntegrationIds.has(integration.id);
                  return (
                    <Card
                      key={integration.id}
                      className="p-4 flex flex-col items-center gap-3"
                      data-testid={`card-integration-${integration.id}`}
                    >
                      {integration.iconUrl ? (
                        <img
                          src={integration.iconUrl}
                          alt={integration.name}
                          className="w-12 h-12 object-contain"
                          data-testid={`img-integration-icon-${integration.id}`}
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center">
                          <span className="text-lg font-semibold text-primary">
                            {integration.name.charAt(0)}
                          </span>
                        </div>
                      )}

                      <p className="text-xs font-medium text-center line-clamp-2 flex-1">
                        {integration.name}
                      </p>

                      <Button
                        size="sm"
                        onClick={() =>
                          addApplicationMutation.mutate(integration)
                        }
                        disabled={isAdded || addApplicationMutation.isPending}
                        className="w-full"
                        data-testid={`button-add-${integration.id}`}
                      >
                        {isAdded ? "Added" : "Add"}
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deleteConfirmApp}
        onOpenChange={(open) => !open && setDeleteConfirmApp(null)}
      >
        <AlertDialogContent data-testid="dialog-delete-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle data-testid="text-delete-title">
              Delete Application
            </AlertDialogTitle>
            <AlertDialogDescription data-testid="text-delete-description">
              Are you sure you want to delete{" "}
              <span className="font-semibold">{deleteConfirmApp?.name}</span>?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-delete-cancel">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirmApp) {
                  deleteApplicationMutation.mutate(deleteConfirmApp.id);
                  setDeleteConfirmApp(null);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-delete-confirm"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
