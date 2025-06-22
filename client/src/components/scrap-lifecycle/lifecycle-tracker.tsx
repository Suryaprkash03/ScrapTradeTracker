import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { LIFECYCLE_STAGES, INVENTORY_STATUS } from "@/lib/permissions";
import { Package, Truck, CheckCircle, XCircle, QrCode, BarChart3 } from "lucide-react";
import type { Inventory } from "@shared/schema";

interface LifecycleUpdateData {
  lifecycleStage: string;
  status: string;
  barcode?: string;
  qrCode?: string;
  batchNumber?: string;
  inspectionNotes?: string;
}

export default function LifecycleTracker() {
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [updateData, setUpdateData] = useState<LifecycleUpdateData>({
    lifecycleStage: '',
    status: '',
  });
  const { toast } = useToast();

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ['/api/inventory'],
  });

  const updateLifecycleMutation = useMutation({
    mutationFn: (data: { id: number; updates: LifecycleUpdateData }) =>
      apiRequest("PATCH", `/api/inventory/${data.id}`, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      toast({
        title: "Success",
        description: "Inventory lifecycle updated successfully",
      });
      setSelectedItem(null);
      setUpdateData({ lifecycleStage: '', status: '' });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update inventory lifecycle",
        variant: "destructive",
      });
    }
  });

  const generateBarcode = () => {
    const barcode = `BC${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    setUpdateData(prev => ({ ...prev, barcode }));
  };

  const generateQRCode = () => {
    const qrCode = `QR${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    setUpdateData(prev => ({ ...prev, qrCode }));
  };

  const getStageProgress = (stage: string) => {
    const stages = LIFECYCLE_STAGES.map(s => s.value);
    const currentIndex = stages.indexOf(stage);
    return ((currentIndex + 1) / stages.length) * 100;
  };

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'collection': return <Package className="h-4 w-4" />;
      case 'sorting': return <BarChart3 className="h-4 w-4" />;
      case 'cleaning': return <CheckCircle className="h-4 w-4" />;
      case 'melting': return <XCircle className="h-4 w-4" />;
      case 'distribution': return <Truck className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const handleUpdate = () => {
    if (!selectedItem) return;
    
    updateLifecycleMutation.mutate({
      id: selectedItem.id,
      updates: updateData
    });
  };

  if (isLoading) {
    return <div>Loading inventory...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scrap Lifecycle Management</h1>
        <p className="text-muted-foreground">
          Track and manage the lifecycle stages of scrap metal inventory
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Inventory Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select Inventory Item</CardTitle>
            <CardDescription>
              Choose an inventory item to update its lifecycle stage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {inventory.map((item: Inventory) => (
                <Card 
                  key={item.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedItem?.id === item.id ? 'ring-2 ring-primary' : ''
                  }`}
                  onClick={() => setSelectedItem(item)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold">{item.itemId}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.metalType} - {item.grade}
                        </p>
                        <p className="text-sm">{item.quantity} {item.unit}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">
                          {LIFECYCLE_STAGES.find(s => s.value === item.lifecycleStage)?.label || item.lifecycleStage}
                        </Badge>
                        <div className="mt-2">
                          <Progress value={getStageProgress(item.lifecycleStage)} className="w-20" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Lifecycle Update Form */}
        <Card>
          <CardHeader>
            <CardTitle>Update Lifecycle</CardTitle>
            <CardDescription>
              {selectedItem ? `Updating: ${selectedItem.itemId}` : 'Select an item to update'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedItem && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="lifecycleStage">Lifecycle Stage</Label>
                  <Select
                    value={updateData.lifecycleStage}
                    onValueChange={(value) => setUpdateData(prev => ({ ...prev, lifecycleStage: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select lifecycle stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {LIFECYCLE_STAGES.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          <div className="flex items-center space-x-2">
                            {getStageIcon(stage.value)}
                            <span>{stage.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={updateData.status}
                    onValueChange={(value) => setUpdateData(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {INVENTORY_STATUS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="batchNumber">Batch Number</Label>
                  <Input
                    id="batchNumber"
                    value={updateData.batchNumber || ''}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, batchNumber: e.target.value }))}
                    placeholder="Enter batch number"
                  />
                </div>

                <div className="grid gap-2">
                  <Label>Barcode</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={updateData.barcode || ''}
                      onChange={(e) => setUpdateData(prev => ({ ...prev, barcode: e.target.value }))}
                      placeholder="Barcode"
                    />
                    <Button onClick={generateBarcode} variant="outline" size="sm">
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>QR Code</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={updateData.qrCode || ''}
                      onChange={(e) => setUpdateData(prev => ({ ...prev, qrCode: e.target.value }))}
                      placeholder="QR Code"
                    />
                    <Button onClick={generateQRCode} variant="outline" size="sm">
                      <QrCode className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="inspectionNotes">Inspection Notes</Label>
                  <Textarea
                    id="inspectionNotes"
                    value={updateData.inspectionNotes || ''}
                    onChange={(e) => setUpdateData(prev => ({ ...prev, inspectionNotes: e.target.value }))}
                    placeholder="Enter inspection notes..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleUpdate} 
                  disabled={updateLifecycleMutation.isPending || !updateData.lifecycleStage || !updateData.status}
                  className="w-full"
                >
                  {updateLifecycleMutation.isPending ? "Updating..." : "Update Lifecycle"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}