import { Card } from "@/components/ui/card";
import {
  User,
  Settings as SettingsIcon,
  CreditCard,
  Plug,
  Wallet,
  Mail,
  Bell,
  ChevronRight,
} from "lucide-react";

interface SettingOption {
  id: string;
  title: string;
  description: string;
  icon: typeof User;
}

const settingsOptions: SettingOption[] = [
  {
    id: "account",
    title: "Account Settings",
    description: "Manage your account information and preferences",
    icon: User,
  },
  {
    id: "general",
    title: "General Settings",
    description: "Configure general application settings",
    icon: SettingsIcon,
  },
  {
    id: "payment",
    title: "Payment Settings",
    description: "Manage payment and billing information",
    icon: CreditCard,
  },
  {
    id: "integrations",
    title: "Integrations",
    description: "Connect and manage third-party integrations",
    icon: Plug,
  },
  {
    id: "payment-method",
    title: "Payment Method",
    description: "Add or update payment methods",
    icon: Wallet,
  },
  {
    id: "email",
    title: "Email Settings",
    description: "Configure email preferences and notifications",
    icon: Mail,
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Manage notification preferences",
    icon: Bell,
  },
];

export default function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground" data-testid="text-settings-title">
          Settings
        </h1>
        <p className="text-muted-foreground mt-2" data-testid="text-settings-description">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {settingsOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card
              key={option.id}
              className="p-6 overflow-visible hover-elevate active-elevate-2 cursor-pointer group transition-all"
              data-testid={`card-setting-${option.id}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" data-testid={`icon-${option.id}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-base font-semibold text-foreground mb-1"
                      data-testid={`text-setting-title-${option.id}`}
                    >
                      {option.title}
                    </h3>
                    <p
                      className="text-sm text-muted-foreground"
                      data-testid={`text-setting-description-${option.id}`}
                    >
                      {option.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
