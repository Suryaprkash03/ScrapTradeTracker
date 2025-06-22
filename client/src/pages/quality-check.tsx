import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { CheckCircle, ClipboardCheck, Scale, Zap } from "lucide-react";
import type { QualityCheck, Deal, Inventory } from "@shared/schema";

interface QualityCheckData {
  dealId?: number;
  inventoryId?: number;
  grossWeight: string;
  netWeight: string;
  moisture: string;
  radiation: string;
  purityPercent: string;
  testResults: any;
  weighbridgeData: any;
  inspectionImages: string[];
}

export default function QualityCheckPage() {
  const [checkData, setCheckData] = useState<Partial<QualityCheckData>>({
    testResults: {},
    weighbridgeData: {},
    inspectionImages: []
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: qualityChecks = [], isLoading: checksLoading } = useQuery({
    queryKey: ['/api/quality-checks'],
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['/api/deals'],
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ['/api/inventory'],
  });

  const createQualityCheckMutation = useMutation({
    mutationFn: (data: QualityCheckData) =>
      apiRequest("POST", "/api/quality-checks", { ...data, checkedBy: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/quality-checks'] });
      toast({
        title: "Success",
        description: "Quality check recorded successfully",
      });
      setDialogOpen(false);
      setCheckData({
        testResults: {},
        weighbridgeData: {},
        inspectionImages: []
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record quality check",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    if (!checkData.dealId && !checkData.inventoryId) {
      toast({
        title: "Error",
        description: "Please select either a deal or inventory item",
        variant: "destructive",
      });
      return;
    }

    createQualityCheckMutation.mutate(checkData as QualityCheckData);
  };

  const handleWeighbridgeData = (field: string, value: string) => {
    setCheckData(prev => ({
      ...prev,
      weighbridgeData: {
        ...prev.weighbridgeData,
        [field]: value
      }
    }));
  };

  const handleTestResults = (field: string, value: string) => {
    setCheckData(prev => ({
      ...prev,
      testResults: {
        ...prev.testResults,
        [field]: value
      }
    }));
  };

  if (checksLoading) {
    return <div>Loading quality checks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quality Control</h1>
          <p className="text-muted-foreground">
            Record and manage quality checks for scrap metal inventory
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <ClipboardCheck className="mr-2 h-4 w-4" />
              New Quality Check
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Record Quality Check</DialogTitle>
              <DialogDescription>
                Record quality test results and weighbridge data
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="deal">Deal (Optional)</Label>
                  <Select
                    value={checkData.dealId?.toString() || ''}
                    onValueChange={(value) => setCheckData(prev => ({ 
                      ...prev, 
                      dealId: value ? parseInt(value) : undefined,
                      inventoryId: undefined 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select deal" />
                    </SelectTrigger>
                    <SelectContent>
                      {deals.map((deal: Deal) => (
                        <SelectItem key={deal.id} value={deal.id.toString()}>
                          {deal.dealId}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="inventory">Inventory Item (Optional)</Label>
                  <Select
                    value={checkData.inventoryId?.toString() || ''}
                    onValueChange={(value) => setCheckData(prev => ({ 
                      ...prev, 
                      inventoryId: value ? parseInt(value) : undefined,
                      dealId: undefined 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select inventory" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventory.map((item: Inventory) => (
                        <SelectItem key={item.id} value={item.id.toString()}>
                          {item.itemId} - {item.metalType}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="grossWeight">Gross Weight (kg)</Label>
                  <Input
                    id="grossWeight"
                    type="number"
                    step="0.01"
                    value={checkData.grossWeight || ''}
                    onChange={(e) => setCheckData(prev => ({ ...prev, grossWeight: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="netWeight">Net Weight (kg)</Label>
                  <Input
                    id="netWeight"
                    type="number"
                    step="0.01"
                    value={checkData.netWeight || ''}
                    onChange={(e) => setCheckData(prev => ({ ...prev, netWeight: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="moisture">Moisture (%)</Label>
                  <Input
                    id="moisture"
                    type="number"
                    step="0.01"
                    value={checkData.moisture || ''}
                    onChange={(e) => setCheckData(prev => ({ ...prev, moisture: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="radiation">Radiation Level</Label>
                  <Input
                    id="radiation"
                    value={checkData.radiation || ''}
                    onChange={(e) => setCheckData(prev => ({ ...prev, radiation: e.target.value }))}
                    placeholder="Enter radiation level"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="purityPercent">Purity Percentage (%)</Label>
                <Input
                  id="purityPercent"
                  type="number"
                  step="0.01"
                  value={checkData.purityPercent || ''}
                  onChange={(e) => setCheckData(prev => ({ ...prev, purityPercent: e.target.value }))}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-3">
                <Label>Weighbridge Data</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Vehicle Weight (kg)"
                    value={checkData.weighbridgeData?.vehicleWeight || ''}
                    onChange={(e) => handleWeighbridgeData('vehicleWeight', e.target.value)}
                  />
                  <Input
                    placeholder="Load Weight (kg)"
                    value={checkData.weighbridgeData?.loadWeight || ''}
                    onChange={(e) => handleWeighbridgeData('loadWeight', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Test Results</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Carbon Content (%)"
                    value={checkData.testResults?.carbonContent || ''}
                    onChange={(e) => handleTestResults('carbonContent', e.target.value)}
                  />
                  <Input
                    placeholder="Sulfur Content (%)"
                    value={checkData.testResults?.sulfurContent || ''}
                    onChange={(e) => handleTestResults('sulfurContent', e.target.value)}
                  />
                  <Input
                    placeholder="Phosphorus Content (%)"
                    value={checkData.testResults?.phosphorusContent || ''}
                    onChange={(e) => handleTestResults('phosphorusContent', e.target.value)}
                  />
                  <Input
                    placeholder="Manganese Content (%)"
                    value={checkData.testResults?.manganeseContent || ''}
                    onChange={(e) => handleTestResults('manganeseContent', e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleSubmit}
                disabled={createQualityCheckMutation.isPending}
              >
                {createQualityCheckMutation.isPending ? "Recording..." : "Record Quality Check"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {qualityChecks.map((check: QualityCheck) => (
          <Card key={check.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                  <div>
                    <h3 className="font-semibold">Quality Check #{check.id}</h3>
                    <p className="text-sm text-muted-foreground">
                      {check.dealId ? `Deal: ${deals.find((d: Deal) => d.id === check.dealId)?.dealId}` : 
                       check.inventoryId ? `Item: ${inventory.find((i: Inventory) => i.id === check.inventoryId)?.itemId}` : 
                       'No reference'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(check.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Gross Weight</p>
                    <p className="text-sm text-muted-foreground">{check.grossWeight || 'N/A'} kg</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Net Weight</p>
                    <p className="text-sm text-muted-foreground">{check.netWeight || 'N/A'} kg</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Purity</p>
                    <p className="text-sm text-muted-foreground">{check.purityPercent || 'N/A'}%</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div>
                    <p className="text-sm font-medium">Moisture</p>
                    <p className="text-sm text-muted-foreground">{check.moisture || 'N/A'}%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}