import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X, Ship, Calendar, Package } from "lucide-react";
import type { Shipment } from "@shared/schema";

interface ViewShipmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: Shipment | null;
}

export default function ViewShipmentModal({ open, onOpenChange, shipment }: ViewShipmentModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Shipment>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Shipment>) => {
      const response = await fetch(`/api/shipments/${shipment?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update shipment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Shipment updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update shipment",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setFormData(shipment || {});
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  if (!shipment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparation': return 'bg-yellow-100 text-yellow-800';
      case 'loading': return 'bg-blue-100 text-blue-800';
      case 'in_transit': return 'bg-purple-100 text-purple-800';
      case 'customs': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Shipment Details - {shipment.containerNo}</span>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={handleEdit} size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave} size="sm" disabled={updateMutation.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} size="sm" variant="outline">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dealId">Deal ID</Label>
            <Input
              id="dealId"
              type="number"
              value={isEditing ? formData.dealId || '' : shipment.dealId}
              onChange={(e) => setFormData({...formData, dealId: parseInt(e.target.value)})}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="containerNo">Container Number</Label>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-gray-500" />
              <Input
                id="containerNo"
                value={isEditing ? formData.containerNo || '' : shipment.containerNo}
                onChange={(e) => setFormData({...formData, containerNo: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="col-span-2">
            <Label htmlFor="vesselName">Vessel Name</Label>
            <div className="flex items-center gap-2">
              <Ship className="w-4 h-4 text-gray-500" />
              <Input
                id="vesselName"
                value={isEditing ? formData.vesselName || '' : shipment.vesselName}
                onChange={(e) => setFormData({...formData, vesselName: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="eta">ETA (Estimated Time of Arrival)</Label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Input
                id="eta"
                type="datetime-local"
                value={isEditing ? 
                  formData.eta ? new Date(formData.eta).toISOString().slice(0, 16) : '' :
                  shipment.eta ? new Date(shipment.eta).toISOString().slice(0, 16) : ''
                }
                onChange={(e) => setFormData({...formData, eta: new Date(e.target.value).toISOString()})}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            {isEditing ? (
              <Select value={formData.status || ''} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="preparation">Preparation</SelectItem>
                  <SelectItem value="loading">Loading</SelectItem>
                  <SelectItem value="in_transit">In Transit</SelectItem>
                  <SelectItem value="customs">Customs</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center">
                <Badge className={getStatusColor(shipment.status)}>
                  {shipment.status}
                </Badge>
              </div>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="trackingNotes">Tracking Notes</Label>
            <Textarea
              id="trackingNotes"
              value={isEditing ? formData.trackingNotes || '' : shipment.trackingNotes || ''}
              onChange={(e) => setFormData({...formData, trackingNotes: e.target.value})}
              disabled={!isEditing}
              rows={4}
              placeholder="Add tracking updates, port information, or delivery notes..."
            />
          </div>

          <div className="col-span-2">
            <Label>Created At</Label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Input value={new Date(shipment.createdAt).toLocaleString()} disabled />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}