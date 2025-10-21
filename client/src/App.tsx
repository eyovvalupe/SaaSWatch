import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/Dashboard";
import TeamChat from "@/pages/TeamChat";
import VendorCRM from "@/pages/VendorCRM";
import ROIPage from "@/pages/ROIPage";
import Landing from "@/pages/Landing";
import DemoPreview from "@/pages/DemoPreview";
import NotFound from "@/pages/not-found";
import logoImage from "@assets/generated_images/APPFUZE.AI_company_logo_00f9e95d.png";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/demo" component={DemoPreview} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/demo" component={DemoPreview} />
      <Route path="/applications" component={Dashboard} />
      <Route path="/licenses" component={Dashboard} />
      <Route path="/analytics" component={Dashboard} />
      <Route path="/roi" component={ROIPage} />
      <Route path="/team-chat" component={TeamChat} />
      <Route path="/vendor-crm" component={VendorCRM} />
      <Route path="/settings" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <AuthWrapper style={style} />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function AuthWrapper({ style }: { style: any }) {
  const { isAuthenticated, isLoading, user } = useAuth();

  const handleLogout = () => {
    window.location.href = '/api/logout';
  };

  if (isLoading || !isAuthenticated) {
    return <Router />;
  }

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center justify-between gap-4 p-4 border-b">
            <div className="flex items-center gap-4">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <img 
                src={logoImage} 
                alt="Appfuze.ai" 
                className="h-7 w-auto object-contain"
                data-testid="img-header-logo"
              />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground" data-testid="text-user-name">
                {user?.firstName} {user?.lastName}
              </span>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleLogout}
                data-testid="button-logout"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6">
            <Router />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default App;
