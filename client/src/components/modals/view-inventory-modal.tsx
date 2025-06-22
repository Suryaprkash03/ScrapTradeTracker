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
import { Edit, Save, X } from "lucide-react";
import type { Inventory } from "@shared/schema";

interface ViewInventoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: Inventory | null;
}

export default function ViewInventoryModal({ open, onOpenChange, inventory }: ViewInventoryModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Inventory>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Inventory>) => {
      const response = await fetch(`/api/inventory/${inventory?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update inventory");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setFormData(inventory || {});
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  if (!inventory) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'reserved': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Inventory Details - {inventory.itemId}</span>
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
            <Label htmlFor="itemId">Item ID</Label>
            <Input
              id="itemId"
              value={isEditing ? formData.itemId || '' : inventory.itemId}
              onChange={(e) => setFormData({...formData, itemId: e.target.value})}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="metalType">Metal Type</Label>
            {isEditing ? (
              <Select value={formData.metalType || ''} onValueChange={(value) => setFormData({...formData, metalType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Aluminum">Aluminum</SelectItem>
                  <SelectItem value="Copper">Copper</SelectItem>
                  <SelectItem value="Steel">Steel</SelectItem>
                  <SelectItem value="Brass">Brass</SelectItem>
                  <SelectItem value="Iron">Iron</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input value={inventory.metalType} disabled />
            )}
          </div>

          <div>
            <Label htmlFor="grade">Grade</Label>
            {isEditing ? (
              <Select value={formData.grade || ''} onValueChange={(value) => setFormData({...formData, grade: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grade A">Grade A</SelectItem>
                  <SelectItem value="Grade B">Grade B</SelectItem>
                  <SelectItem value="Grade C">Grade C</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input value={inventory.grade} disabled />
            )}
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              value={isEditing ? formData.quantity || '' : inventory.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="unit">Unit</Label>
            <Input
              id="unit"
              value={isEditing ? formData.unit || '' : inventory.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="ferrousType">Ferrous Type</Label>
            {isEditing ? (
              <Select value={formData.ferrousType || ''} onValueChange={(value) => setFormData({...formData, ferrousType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ferrous">Ferrous</SelectItem>
                  <SelectItem value="non_ferrous">Non-Ferrous</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Input value={inventory.ferrousType} disabled />
            )}
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={isEditing ? formData.location || '' : inventory.location || ''}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            {isEditing ? (
              <Select value={formData.status || ''} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="flex items-center">
                <Badge className={getStatusColor(inventory.status)}>
                  {inventory.status}
                </Badge>
              </div>
            )}
          </div>

          <div className="col-span-2">
            <Label htmlFor="inspectionNotes">Inspection Notes</Label>
            <Textarea
              id="inspectionNotes"
              value={isEditing ? formData.inspectionNotes || '' : inventory.inspectionNotes || ''}
              onChange={(e) => setFormData({...formData, inspectionNotes: e.target.value})}
              disabled={!isEditing}
              rows={3}
            />
          </div>

          <div className="col-span-2">
            <Label>Created At</Label>
            <Input value={new Date(inventory.createdAt).toLocaleString()} disabled />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}