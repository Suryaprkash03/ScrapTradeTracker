"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/queryClient"
import { zodResolver } from "@hookform/resolvers/zod"
import { insertInventorySchema } from "@shared/schema"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { FileText, Layers, MapPin, Package, Scale } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const formSchema = insertInventorySchema.extend({
  quantity: z.string().min(1, "Quantity is required"),
})

type FormData = z.infer<typeof formSchema>

export default function AddInventoryModal({ open, onOpenChange }: Props) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

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
  })

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/inventory", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] })
      toast({
        title: "Success",
        description: "Inventory item added successfully",
      })
      form.reset()
      onOpenChange(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add inventory item",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: FormData) => {
    const submitData = {
      ...data,
      quantity: data.quantity,
      qualityReports: [],
    }
    mutation.mutate(submitData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">Add New Inventory Item</DialogTitle>
              <p className="text-sm text-gray-600 mt-1">Add a new scrap metal item to inventory</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          {/* Basic Information */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemId" className="text-sm font-medium text-gray-700">
                    Item ID *
                  </Label>
                  <Input
                    id="itemId"
                    placeholder="Enter unique item ID"
                    {...form.register("itemId")}
                    className={form.formState.errors.itemId ? "border-red-300" : ""}
                  />
                  {form.formState.errors.itemId && (
                    <p className="text-sm text-red-600">{form.formState.errors.itemId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metalType" className="text-sm font-medium text-gray-700">
                    Metal Type *
                  </Label>
                  <Select onValueChange={(value) => form.setValue("metalType", value)}>
                    <SelectTrigger className={form.formState.errors.metalType ? "border-red-300" : ""}>
                      <SelectValue placeholder="Select metal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Steel">Steel</SelectItem>
                      <SelectItem value="Aluminum">Aluminum</SelectItem>
                      <SelectItem value="Copper">Copper</SelectItem>
                      <SelectItem value="Iron">Iron</SelectItem>
                      <SelectItem value="Brass">Brass</SelectItem>
                      <SelectItem value="Stainless Steel">Stainless Steel</SelectItem>
                      <SelectItem value="Lead">Lead</SelectItem>
                      <SelectItem value="Zinc">Zinc</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.metalType && (
                    <p className="text-sm text-red-600">{form.formState.errors.metalType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-sm font-medium text-gray-700">
                    Grade *
                  </Label>
                  <div className="relative">
                    <Layers className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Select onValueChange={(value) => form.setValue("grade", value)}>
                      <SelectTrigger className={`pl-10 ${form.formState.errors.grade ? "border-red-300" : ""}`}>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grade A">Grade A - Premium Quality</SelectItem>
                        <SelectItem value="Grade B">Grade B - Standard Quality</SelectItem>
                        <SelectItem value="Grade C">Grade C - Basic Quality</SelectItem>
                        <SelectItem value="Mixed Grade">Mixed Grade</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.formState.errors.grade && (
                    <p className="text-sm text-red-600">{form.formState.errors.grade.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ferrousType" className="text-sm font-medium text-gray-700">
                    Material Type *
                  </Label>
                  <Select onValueChange={(value) => form.setValue("ferrousType", value)}>
                    <SelectTrigger className={form.formState.errors.ferrousType ? "border-red-300" : ""}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ferrous">Ferrous (Contains Iron)</SelectItem>
                      <SelectItem value="non_ferrous">Non-Ferrous (No Iron)</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.ferrousType && (
                    <p className="text-sm text-red-600">{form.formState.errors.ferrousType.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantity & Measurements */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Quantity & Measurements</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                    Quantity *
                  </Label>
                  <div className="relative">
                    <Scale className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="Enter quantity"
                      {...form.register("quantity")}
                      className={`pl-10 ${form.formState.errors.quantity ? "border-red-300" : ""}`}
                    />
                  </div>
                  {form.formState.errors.quantity && (
                    <p className="text-sm text-red-600">{form.formState.errors.quantity.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-sm font-medium text-gray-700">
                    Unit of Measurement *
                  </Label>
                  <Select onValueChange={(value) => form.setValue("unit", value)}>
                    <SelectTrigger className={form.formState.errors.unit ? "border-red-300" : ""}>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Tons">Tons (MT)</SelectItem>
                      <SelectItem value="Kilograms">Kilograms (KG)</SelectItem>
                      <SelectItem value="Pounds">Pounds (LB)</SelectItem>
                      <SelectItem value="Pieces">Pieces (PCS)</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.unit && (
                    <p className="text-sm text-red-600">{form.formState.errors.unit.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Status */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Location & Status</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Storage Location
                  </Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="location"
                      placeholder="e.g., Warehouse A, Section 2, Bay 15"
                      {...form.register("location")}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Status
                  </Label>
                  <Select defaultValue="available" onValueChange={(value) => form.setValue("status", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="quality_check">Quality Check</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inspection Notes */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Inspection Notes</h3>
              </div>
              <div className="space-y-2">
                <Label htmlFor="inspectionNotes" className="text-sm font-medium text-gray-700">
                  Quality & Inspection Notes
                </Label>
                <Textarea
                  id="inspectionNotes"
                  placeholder="Enter quality assessment, condition notes, contamination levels, etc..."
                  {...form.register("inspectionNotes")}
                  rows={4}
                  className="resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 min-w-[120px]"
            >
              {mutation.isPending ? "Adding..." : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
