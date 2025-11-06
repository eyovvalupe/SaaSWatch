import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import logoImageLight from "@assets/generated_images/appuze.png";
import logoImageDark from "@assets/generated_images/appuze_dark.png";

export default function Landing() {
  const { theme } = useTheme();

  const handleLogin = () => {
    console.log("Login button clicked - redirecting to /api/login");
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center space-y-8">
        <div className="flex justify-center">
          <img
            src={theme === "dark" ? logoImageDark : logoImageLight}
            alt="AppUze.ai"
            className="h-16 w-auto object-contain"
            data-testid="img-landing-logo"
          />
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-bold text-primary">
            Welcome to AppUze.ai
          </h1>
          <p className="text-xl text-muted-foreground max-w-xl mx-auto">
            Your all-in-one SaaS management platform. Track applications, manage
            licenses, optimize spending, and collaborate with your team.
          </p>
        </div>

        <div className="space-y-6 pt-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              onClick={handleLogin}
              className="px-8 py-6 text-lg"
              data-testid="button-login"
            >
              Log In to Get Started
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => (window.location.href = "/demo")}
              className="px-8 py-6 text-lg"
              data-testid="button-view-demo"
            >
              View Demo
            </Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-8 text-left">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Track Applications</h3>
              <p className="text-sm text-muted-foreground">
                Discover all SaaS apps in use, including shadow IT
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Optimize Spending</h3>
              <p className="text-sm text-muted-foreground">
                Reduce costs with AI-driven recommendations
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Team Collaboration</h3>
              <p className="text-sm text-muted-foreground">
                Real-time chat and vendor CRM for negotiations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
