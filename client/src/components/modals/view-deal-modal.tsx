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
import { Edit, Save, X, DollarSign, Calendar, User } from "lucide-react";
import type { Deal } from "@shared/schema";

interface ViewDealModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: Deal | null;
}

export default function ViewDealModal({ open, onOpenChange, deal }: ViewDealModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Deal>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Deal>) => {
      const response = await fetch(`/api/deals/${deal?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update deal");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Deal updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update deal",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setFormData(deal || {});
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  if (!deal) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Deal Details - {deal.dealId}</span>
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
              value={isEditing ? formData.dealId || '' : deal.dealId}
              onChange={(e) => setFormData({...formData, dealId: e.target.value})}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="buyerId">Buyer ID</Label>
            <Input
              id="buyerId"
              type="number"
              value={isEditing ? formData.buyerId || '' : deal.buyerId}
              onChange={(e) => setFormData({...formData, buyerId: parseInt(e.target.value)})}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="inventoryId">Inventory ID</Label>
            <Input
              id="inventoryId"
              type="number"
              value={isEditing ? formData.inventoryId || '' : deal.inventoryId}
              onChange={(e) => setFormData({...formData, inventoryId: parseInt(e.target.value)})}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              value={isEditing ? formData.quantity || '' : deal.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="rate">Rate</Label>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <Input
                id="rate"
                value={isEditing ? formData.rate || '' : deal.rate}
                onChange={(e) => setFormData({...formData, rate: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={isEditing ? formData.currency || '' : deal.currency}
              onChange={(e) => setFormData({...formData, currency: e.target.value})}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="totalValue">Total Value</Label>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <Input
                id="totalValue"
                value={isEditing ? formData.totalValue || '' : deal.totalValue}
                onChange={(e) => setFormData({...formData, totalValue: e.target.value})}
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center">
                <Badge className={getStatusColor(deal.status)}>
                  {deal.status}
                </Badge>
              </div>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="paymentTerms">Payment Terms</Label>
            <Textarea
              id="paymentTerms"
              value={isEditing ? formData.paymentTerms || '' : deal.paymentTerms || ''}
              onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
              disabled={!isEditing}
              rows={2}
            />
          </div>

          <div className="col-span-2">
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              value={isEditing ? formData.specialInstructions || '' : deal.specialInstructions || ''}
              onChange={(e) => setFormData({...formData, specialInstructions: e.target.value})}
              disabled={!isEditing}
              rows={3}
            />
          </div>

          <div className="col-span-2">
            <Label>Created At</Label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Input value={new Date(deal.createdAt).toLocaleString()} disabled />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}