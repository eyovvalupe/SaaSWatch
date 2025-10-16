import { ThemeProvider } from '../ThemeProvider';
import { Button } from '@/components/ui/button';
import { useTheme } from '../ThemeProvider';

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      data-testid="button-theme-toggle"
    >
      {theme === "dark" ? "Light Mode" : "Dark Mode"}
    </Button>
  );
}

export default function ThemeProviderExample() {
  return (
    <ThemeProvider defaultTheme="dark">
      <div className="p-4">
        <ThemeToggle />
      </div>
    </ThemeProvider>
  );
}
