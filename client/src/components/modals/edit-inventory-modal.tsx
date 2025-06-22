import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertInventorySchema, type Inventory } from "@shared/schema";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  inventory: Inventory | null;
}

const formSchema = insertInventorySchema.extend({
  quantity: z.string().min(1, "Quantity is required"),
  rate: z.string().min(1, "Rate is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function EditInventoryModal({ open, onOpenChange, inventory }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemId: inventory?.itemId || "",
      metalType: inventory?.metalType || "",
      grade: inventory?.grade || "",
      quantity: inventory?.quantity || "",
      unit: inventory?.unit || "KG",
      rate: inventory?.rate || "",
      location: inventory?.location || "",
      status: inventory?.status || "available",
      inspectionNotes: inventory?.inspectionNotes || "",
      lifecycleStage: inventory?.lifecycleStage || "collection",
      barcode: inventory?.barcode || "",
      qrCode: inventory?.qrCode || "",
      batchNumber: inventory?.batchNumber || "",
    },
  });

  React.useEffect(() => {
    if (inventory) {
      form.reset({
        itemId: inventory.itemId,
        metalType: inventory.metalType,
        grade: inventory.grade,
        quantity: inventory.quantity,
        unit: inventory.unit,
        rate: inventory.rate,
        location: inventory.location || "",
        status: inventory.status,
        inspectionNotes: inventory.inspectionNotes || "",
        lifecycleStage: inventory.lifecycleStage,
        barcode: inventory.barcode || "",
        qrCode: inventory.qrCode || "",
        batchNumber: inventory.batchNumber || "",
      });
    }
  }, [inventory, form]);

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", `/api/inventory/${inventory?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Success",
        description: "Inventory updated successfully",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update inventory",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const submitData = {
      ...data,
      qualityReports: inventory?.qualityReports || [],
    };
    mutation.mutate(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Inventory Item</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="itemId">Item ID</Label>
              <Input
                id="itemId"
                placeholder="Enter item ID"
                {...form.register("itemId")}
              />
              {form.formState.errors.itemId && (
                <p className="text-sm text-red-600">{form.formState.errors.itemId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="metalType">Metal Type</Label>
              <Select 
                value={form.watch("metalType")} 
                onValueChange={(value) => form.setValue("metalType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Metal Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="copper">Copper</SelectItem>
                  <SelectItem value="aluminum">Aluminum</SelectItem>
                  <SelectItem value="steel">Steel</SelectItem>
                  <SelectItem value="brass">Brass</SelectItem>
                  <SelectItem value="iron">Iron</SelectItem>
                  <SelectItem value="stainless_steel">Stainless Steel</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.metalType && (
                <p className="text-sm text-red-600">{form.formState.errors.metalType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Input
                id="grade"
                placeholder="e.g., Grade A, Grade B"
                {...form.register("grade")}
              />
              {form.formState.errors.grade && (
                <p className="text-sm text-red-600">{form.formState.errors.grade.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                {...form.register("quantity")}
              />
              {form.formState.errors.quantity && (
                <p className="text-sm text-red-600">{form.formState.errors.quantity.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select 
                value={form.watch("unit")} 
                onValueChange={(value) => form.setValue("unit", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KG">KG</SelectItem>
                  <SelectItem value="MT">MT (Metric Tons)</SelectItem>
                  <SelectItem value="LB">LB (Pounds)</SelectItem>
                  <SelectItem value="TON">TON</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.unit && (
                <p className="text-sm text-red-600">{form.formState.errors.unit.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="rate">Rate per Unit</Label>
              <Input
                id="rate"
                type="number"
                placeholder="Enter rate"
                {...form.register("rate")}
              />
              {form.formState.errors.rate && (
                <p className="text-sm text-red-600">{form.formState.errors.rate.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={form.watch("status")} 
                onValueChange={(value) => form.setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-600">{form.formState.errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lifecycleStage">Lifecycle Stage</Label>
              <Select 
                value={form.watch("lifecycleStage")} 
                onValueChange={(value) => form.setValue("lifecycleStage", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collection">Collection</SelectItem>
                  <SelectItem value="sorting">Sorting</SelectItem>
                  <SelectItem value="cleaning">Cleaning</SelectItem>
                  <SelectItem value="melting">Melting</SelectItem>
                  <SelectItem value="distribution">Distribution</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.lifecycleStage && (
                <p className="text-sm text-red-600">{form.formState.errors.lifecycleStage.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                placeholder="Enter barcode"
                {...form.register("barcode")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="qrCode">QR Code</Label>
              <Input
                id="qrCode"
                placeholder="Enter QR code"
                {...form.register("qrCode")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="batchNumber">Batch Number</Label>
              <Input
                id="batchNumber"
                placeholder="Enter batch number"
                {...form.register("batchNumber")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., Warehouse A, Section 2"
              {...form.register("location")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="inspectionNotes">Inspection Notes</Label>
            <Textarea
              id="inspectionNotes"
              placeholder="Any inspection notes or quality remarks"
              {...form.register("inspectionNotes")}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Updating..." : "Update Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}