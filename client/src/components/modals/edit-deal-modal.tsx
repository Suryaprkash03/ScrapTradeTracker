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
import { insertDealSchema, type Deal, type Partner, type Inventory } from "@shared/schema";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: Deal | null;
}

const formSchema = insertDealSchema.extend({
  quantity: z.string().min(1, "Quantity is required"),
  rate: z.string().min(1, "Rate is required"),
  totalValue: z.string().min(1, "Total value is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function EditDealModal({ open, onOpenChange, deal }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: partners } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  });

  const { data: inventory } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const buyers = partners?.filter(p => p.type === "buyer" || p.type === "both") || [];
  const availableInventory = inventory?.filter(i => i.status === "available") || [];

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      dealId: deal?.dealId || "",
      buyerId: deal?.buyerId || 0,
      inventoryId: deal?.inventoryId || 0,
      quantity: deal?.quantity || "",
      rate: deal?.rate || "",
      currency: deal?.currency || "USD",
      totalValue: deal?.totalValue || "",
      status: deal?.status || "draft",
      paymentTerms: deal?.paymentTerms || "",
      specialInstructions: deal?.specialInstructions || "",
    },
  });

  React.useEffect(() => {
    if (deal) {
      form.reset({
        dealId: deal.dealId,
        buyerId: deal.buyerId,
        inventoryId: deal.inventoryId,
        quantity: deal.quantity,
        rate: deal.rate,
        currency: deal.currency,
        totalValue: deal.totalValue,
        status: deal.status,
        paymentTerms: deal.paymentTerms || "",
        specialInstructions: deal.specialInstructions || "",
      });
    }
  }, [deal, form]);

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", `/api/deals/${deal?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      toast({
        title: "Success",
        description: "Deal updated successfully",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update deal",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const submitData = {
      ...data,
      buyerId: parseInt(data.buyerId.toString()),
      inventoryId: parseInt(data.inventoryId.toString()),
      quantity: data.quantity,
      rate: data.rate,
      totalValue: data.totalValue,
    };
    mutation.mutate(submitData);
  };

  // Calculate total value when quantity or rate changes
  const watchQuantity = form.watch("quantity");
  const watchRate = form.watch("rate");

  React.useEffect(() => {
    if (watchQuantity && watchRate) {
      const total = (parseFloat(watchQuantity) * parseFloat(watchRate)).toString();
      form.setValue("totalValue", total);
    }
  }, [watchQuantity, watchRate, form]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Deal</DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="dealId">Deal ID</Label>
              <Input
                id="dealId"
                placeholder="Enter deal ID"
                {...form.register("dealId")}
              />
              {form.formState.errors.dealId && (
                <p className="text-sm text-red-600">{form.formState.errors.dealId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="buyerId">Buyer</Label>
              <Select 
                value={form.watch("buyerId")?.toString()} 
                onValueChange={(value) => form.setValue("buyerId", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Buyer" />
                </SelectTrigger>
                <SelectContent>
                  {buyers.map((buyer) => (
                    <SelectItem key={buyer.id} value={buyer.id.toString()}>
                      {buyer.companyName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.buyerId && (
                <p className="text-sm text-red-600">{form.formState.errors.buyerId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="inventoryId">Inventory Item</Label>
              <Select 
                value={form.watch("inventoryId")?.toString()} 
                onValueChange={(value) => form.setValue("inventoryId", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Item" />
                </SelectTrigger>
                <SelectContent>
                  {availableInventory.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.metalType} - {item.grade} ({item.itemId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.inventoryId && (
                <p className="text-sm text-red-600">{form.formState.errors.inventoryId.message}</p>
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
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-600">{form.formState.errors.status.message}</p>
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
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={form.watch("currency")} 
                onValueChange={(value) => form.setValue("currency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.currency && (
                <p className="text-sm text-red-600">{form.formState.errors.currency.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalValue">Total Value</Label>
              <Input
                id="totalValue"
                type="number"
                placeholder="Calculated automatically"
                {...form.register("totalValue")}
                readOnly
              />
              {form.formState.errors.totalValue && (
                <p className="text-sm text-red-600">{form.formState.errors.totalValue.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentTerms">Payment Terms</Label>
            <Input
              id="paymentTerms"
              placeholder="e.g., 30% advance, 70% on delivery"
              {...form.register("paymentTerms")}
            />
            {form.formState.errors.paymentTerms && (
              <p className="text-sm text-red-600">{form.formState.errors.paymentTerms.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              placeholder="Any special handling or shipping instructions"
              {...form.register("specialInstructions")}
              rows={3}
            />
            {form.formState.errors.specialInstructions && (
              <p className="text-sm text-red-600">{form.formState.errors.specialInstructions.message}</p>
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
              {mutation.isPending ? "Updating..." : "Update Deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}