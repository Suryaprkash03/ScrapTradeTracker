import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertInventorySchema } from "@shared/schema";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = insertInventorySchema.extend({
  quantity: z.string().min(1, "Quantity is required"),
});

type FormData = z.infer<typeof formSchema>;

export default function AddInventoryModal({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      itemId: "",
      metalType: "",
      grade: "",
      quantity: "",
      unit: "",
      ferrousType: "",
      location: "",
      status: "available",
      inspectionNotes: "",
    },
  });

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/inventory", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Success",
        description: "Inventory item added successfully",
      });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    const submitData = {
      ...data,
      quantity: data.quantity,
      qualityReports: [],
    };
    mutation.mutate(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Inventory Item</DialogTitle>
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
              <Select onValueChange={(value) => form.setValue("metalType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Metal Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Steel">Steel</SelectItem>
                  <SelectItem value="Aluminum">Aluminum</SelectItem>
                  <SelectItem value="Copper">Copper</SelectItem>
                  <SelectItem value="Iron">Iron</SelectItem>
                  <SelectItem value="Brass">Brass</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.metalType && (
                <p className="text-sm text-red-600">{form.formState.errors.metalType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade">Grade</Label>
              <Select onValueChange={(value) => form.setValue("grade", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Grade A">Grade A</SelectItem>
                  <SelectItem value="Grade B">Grade B</SelectItem>
                  <SelectItem value="Grade C">Grade C</SelectItem>
                </SelectContent>
              </Select>
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
              <Select onValueChange={(value) => form.setValue("unit", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Unit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tons">Tons</SelectItem>
                  <SelectItem value="Kilograms">Kilograms</SelectItem>
                  <SelectItem value="Pounds">Pounds</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.unit && (
                <p className="text-sm text-red-600">{form.formState.errors.unit.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="ferrousType">Type</Label>
              <Select onValueChange={(value) => form.setValue("ferrousType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ferrous">Ferrous</SelectItem>
                  <SelectItem value="non_ferrous">Non-Ferrous</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.ferrousType && (
                <p className="text-sm text-red-600">{form.formState.errors.ferrousType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="Storage location"
                {...form.register("location")}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="inspectionNotes">Inspection Notes</Label>
            <Textarea
              id="inspectionNotes"
              placeholder="Enter inspection notes..."
              {...form.register("inspectionNotes")}
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
              {mutation.isPending ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
