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
import { Edit, Save, X, MapPin, Mail, Phone } from "lucide-react";
import type { Partner } from "@shared/schema";

interface ViewPartnerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: Partner | null;
}

export default function ViewPartnerModal({ open, onOpenChange, partner }: ViewPartnerModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Partner>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Partner>) => {
      const response = await fetch(`/api/partners/${partner?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update partner");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Partner updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update partner",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setFormData(partner || {});
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  if (!partner) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'supplier': return 'bg-blue-100 text-blue-800';
      case 'buyer': return 'bg-purple-100 text-purple-800';
      case 'both': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Partner Details - {partner.companyName}</span>
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
          <div className="col-span-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={isEditing ? formData.companyName || '' : partner.companyName}
              onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="contactPerson">Contact Person</Label>
            <Input
              id="contactPerson"
              value={isEditing ? formData.contactPerson || '' : partner.contactPerson}
              onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="country">Country</Label>
            <Input
              id="country"
              value={isEditing ? formData.country || '' : partner.country}
              onChange={(e) => setFormData({...formData, country: e.target.value})}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-500" />
              <Input
                id="email"
                type="email"
                value={isEditing ? formData.email || '' : partner.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <Input
                id="phone"
                value={isEditing ? formData.phone || '' : partner.phone || ''}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="type">Partner Type</Label>
            {isEditing ? (
              <Select value={formData.type || ''} onValueChange={(value) => setFormData({...formData, type: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="supplier">Supplier</SelectItem>
                  <SelectItem value="buyer">Buyer</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center">
                <Badge className={getTypeColor(partner.type)}>
                  {partner.type}
                </Badge>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            {isEditing ? (
              <Select value={formData.status || ''} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center">
                <Badge className={getStatusColor(partner.status)}>
                  {partner.status}
                </Badge>
              </div>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="address">Address</Label>
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-500 mt-2" />
              <Textarea
                id="address"
                value={isEditing ? formData.address || '' : partner.address || ''}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                disabled={!isEditing}
                rows={3}
              />
            </div>
          </div>

          <div className="col-span-2">
            <Label>Created At</Label>
            <Input value={new Date(partner.createdAt).toLocaleString()} disabled />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}