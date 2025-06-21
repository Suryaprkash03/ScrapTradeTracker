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
import { insertDealSchema, type Partner, type Inventory } from "@shared/schema";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = insertDealSchema.extend({
  quantity: z.string().min(1, "Quantity is required"),
  rate: z.string().min(1, "Rate is required"),
  totalValue: z.string().min(1, "Total value is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateDealModal({ open, onOpenChange }: Props) {
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
      dealId: "",
      buyerId: 0,
      inventoryId: 0,
      quantity: "",
      rate: "",
      currency: "USD",
      totalValue: "",
      status: "draft",
      paymentTerms: "",
      specialInstructions: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/deals", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      toast({
        title: "Success",
        description: "Deal created successfully",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create deal",
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
      documents: [],
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
          <DialogTitle>Create New Deal</DialogTitle>
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
              <Select onValueChange={(value) => form.setValue("buyerId", parseInt(value))}>
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
              <Select onValueChange={(value) => form.setValue("inventoryId", parseInt(value))}>
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
              <Select onValueChange={(value) => form.setValue("currency", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="totalValue">Total Value</Label>
              <Input
                id="totalValue"
                type="number"
                placeholder="Total value"
                {...form.register("totalValue")}
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentTerms">Payment Terms</Label>
              <Select onValueChange={(value) => form.setValue("paymentTerms", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Terms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30 Days">30 Days</SelectItem>
                  <SelectItem value="45 Days">45 Days</SelectItem>
                  <SelectItem value="60 Days">60 Days</SelectItem>
                  <SelectItem value="Letter of Credit">Letter of Credit</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialInstructions">Special Instructions</Label>
            <Textarea
              id="specialInstructions"
              placeholder="Enter any special instructions..."
              {...form.register("specialInstructions")}
            />
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Creating..." : "Create Deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
