import {
  LayoutDashboard,
  Package,
  CreditCard,
  BarChart3,
  Settings,
  ChevronRight,
  MessageSquare,
  Building2,
  TrendingUp,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/hooks/useAuth";
import logoImageLight from "@assets/generated_images/appuze.png";
import logoImageDark from "@assets/generated_images/appuze_dark.png";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Applications",
    url: "/applications",
    icon: Package,
  },
  // {
  //   title: "Licenses",
  //   url: "/licenses",
  //   icon: CreditCard,
  // },
  {
    title: "Analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "ROI Measurement",
    url: "/roi",
    icon: TrendingUp,
  },
  {
    title: "Team Chat",
    url: "/team-chat",
    icon: MessageSquare,
  },
  {
    title: "Vendor CRM",
    url: "/vendor-crm",
    icon: Building2,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { theme } = useTheme();
  const { user } = useAuth();

  const getInitials = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
    }
    return "U";
  };

  const getFullName = () => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    return user?.email || "User";
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <img
            src={theme === "dark" ? logoImageDark : logoImageLight}
            alt="AppUze.ai"
            className="h-8 w-auto object-contain"
            data-testid="img-logo"
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={location === item.url}>
                    <Link
                      href={item.url}
                      data-testid={`link-${item.title.toLowerCase()}`}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <div className="flex items-center gap-3 rounded-md p-2 hover-elevate active-elevate-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-1 flex-col">
            <span
              className="text-xs font-medium"
              data-testid="text-sidebar-user-name"
            >
              {getFullName()}
            </span>
            <span className="text-xs text-muted-foreground">
              {user?.email || ""}
            </span>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
