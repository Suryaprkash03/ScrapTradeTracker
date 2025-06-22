import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { insertShipmentSchema, type Shipment, type Deal } from "@shared/schema";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shipment: Shipment | null;
}

const formSchema = insertShipmentSchema.extend({
  dealId: z.number().min(1, "Deal is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function EditShipmentModal({ open, onOpenChange, shipment }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deals } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dealId: shipment?.dealId || 0,
      containerNo: shipment?.containerNo || "",
      vesselName: shipment?.vesselName || "",
      eta: shipment?.eta ? new Date(shipment.eta).toISOString().split('T')[0] : "",
      status: shipment?.status || "preparation",
      trackingNotes: shipment?.trackingNotes || "",
    },
  });

  React.useEffect(() => {
    if (shipment) {
      form.reset({
        dealId: shipment.dealId,
        containerNo: shipment.containerNo || "",
        vesselName: shipment.vesselName || "",
        eta: shipment.eta ? new Date(shipment.eta).toISOString().split('T')[0] : "",
        status: shipment.status,
        trackingNotes: shipment.trackingNotes || "",
      });
    }
  }, [shipment, form]);

  const mutation = useMutation({
    mutationFn: (data: FormData) => apiRequest("PUT", `/api/shipments/${shipment?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      toast({
        title: "Success",
        description: "Shipment updated successfully",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update shipment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const submitData = {
      ...data,
      eta: data.eta ? new Date(data.eta).toISOString() : undefined,
    };
    mutation.mutate(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Shipment</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dealId">Deal</Label>
              <Select 
                value={form.watch("dealId")?.toString()} 
                onValueChange={(value) => form.setValue("dealId", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Deal" />
                </SelectTrigger>
                <SelectContent>
                  {deals?.map((deal) => (
                    <SelectItem key={deal.id} value={deal.id.toString()}>
                      {deal.dealId} - {deal.quantity} units
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.dealId && (
                <p className="text-sm text-red-600">{form.formState.errors.dealId.message}</p>
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
                  <SelectItem value="preparation">Preparation</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="gate_in">Gate In</SelectItem>
                  <SelectItem value="sealed">Sealed</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-600">{form.formState.errors.status.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="containerNo">Container Number</Label>
              <Input
                id="containerNo"
                placeholder="Enter container number"
                {...form.register("containerNo")}
              />
              {form.formState.errors.containerNo && (
                <p className="text-sm text-red-600">{form.formState.errors.containerNo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vesselName">Vessel Name</Label>
              <Input
                id="vesselName"
                placeholder="Enter vessel name"
                {...form.register("vesselName")}
              />
              {form.formState.errors.vesselName && (
                <p className="text-sm text-red-600">{form.formState.errors.vesselName.message}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="eta">ETA (Estimated Time of Arrival)</Label>
              <Input
                id="eta"
                type="date"
                {...form.register("eta")}
              />
              {form.formState.errors.eta && (
                <p className="text-sm text-red-600">{form.formState.errors.eta.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="trackingNotes">Tracking Notes</Label>
            <Textarea
              id="trackingNotes"
              placeholder="Enter tracking notes or special instructions"
              {...form.register("trackingNotes")}
              rows={3}
            />
            {form.formState.errors.trackingNotes && (
              <p className="text-sm text-red-600">{form.formState.errors.trackingNotes.message}</p>
            )}
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
              {mutation.isPending ? "Updating..." : "Update Shipment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}