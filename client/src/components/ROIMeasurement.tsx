import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Application } from "@shared/schema";

interface ROIMeasurementProps {
  application: Application;
}

export function ROIMeasurement({ application }: ROIMeasurementProps) {
  const { toast } = useToast();
  const [roiEnabled, setRoiEnabled] = useState(application.roiEnabled || false);
  const [monthlyValue, setMonthlyValue] = useState(application.monthlyValue || "0");
  const [roiNotes, setRoiNotes] = useState(application.roiNotes || "");

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Application>) => {
      return await apiRequest("PATCH", `/api/applications/${application.id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "ROI Updated",
        description: "ROI measurement settings have been saved successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update ROI settings.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    updateMutation.mutate({
      roiEnabled,
      monthlyValue: monthlyValue.toString(),
      roiNotes,
    });
  };

  const calculateROI = () => {
    const cost = parseFloat(application.monthlyCost || "0");
    const value = parseFloat(monthlyValue || "0");
    if (cost === 0) return 0;
    return ((value - cost) / cost * 100).toFixed(1);
  };

  const roi = parseFloat(calculateROI());
  const isPositiveROI = roi > 0;

  return (
    <Card data-testid="card-roi-measurement">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              ROI Measurement
              <Badge variant="outline" data-testid="badge-addon-feature">Add-on Feature</Badge>
            </CardTitle>
            <CardDescription>
              Track return on investment for {application.name}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="roi-enabled">Enable ROI Tracking</Label>
            <Switch
              id="roi-enabled"
              checked={roiEnabled}
              onCheckedChange={setRoiEnabled}
              data-testid="switch-roi-enabled"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {roiEnabled ? (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthly-cost">Monthly Cost</Label>
                <Input
                  id="monthly-cost"
                  type="text"
                  value={`$${application.monthlyCost}`}
                  disabled
                  data-testid="input-monthly-cost"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly-value">Monthly Value Generated</Label>
                <Input
                  id="monthly-value"
                  type="number"
                  step="0.01"
                  value={monthlyValue}
                  onChange={(e) => setMonthlyValue(e.target.value)}
                  placeholder="0.00"
                  data-testid="input-monthly-value"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roi-notes">ROI Calculation Notes</Label>
              <Textarea
                id="roi-notes"
                value={roiNotes}
                onChange={(e) => setRoiNotes(e.target.value)}
                placeholder="Describe how ROI is calculated (e.g., time saved, revenue generated, cost savings)"
                rows={3}
                data-testid="textarea-roi-notes"
              />
            </div>

            <div className="p-4 bg-muted rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Calculated ROI</p>
                  <p className="text-3xl font-bold flex items-center gap-2" data-testid="text-roi-percentage">
                    {isPositiveROI ? (
                      <TrendingUp className="h-6 w-6 text-green-600" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-red-600" />
                    )}
                    <span className={isPositiveROI ? "text-green-600" : "text-red-600"}>
                      {roi}%
                    </span>
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Net Value</p>
                  <p className="text-2xl font-semibold" data-testid="text-net-value">
                    ${(parseFloat(monthlyValue || "0") - parseFloat(application.monthlyCost || "0")).toFixed(2)}
                    <span className="text-sm text-muted-foreground">/month</span>
                  </p>
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSave} 
              disabled={updateMutation.isPending}
              data-testid="button-save-roi"
            >
              {updateMutation.isPending ? "Saving..." : "Save ROI Settings"}
            </Button>
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>Enable ROI tracking to measure the return on investment for this application.</p>
            <p className="text-sm mt-2">This is an add-on feature available for premium clients.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
