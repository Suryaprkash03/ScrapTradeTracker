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
import { insertInventorySchema, type Inventory } from "@shared/schema"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { BarChart3, Edit, FileText, Hash, Layers, MapPin, Package, Scale } from "lucide-react"
import React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  inventory: Inventory | null
}

const formSchema = insertInventorySchema.extend({
  quantity: z.string().min(1, "Quantity is required"),
  rate: z.string().optional(),
})

type FormData = z.infer<typeof formSchema>

export default function EditInventoryModal({ open, onOpenChange, inventory }: Props) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

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
      ferrousType: inventory?.ferrousType || "ferrous",
    },
  })

  React.useEffect(() => {
    if (inventory) {
      form.reset({
        itemId: inventory.itemId,
        metalType: inventory.metalType,
        grade: inventory.grade,
        quantity: inventory.quantity,
        unit: inventory.unit,
        rate: inventory.rate || "",
        location: inventory.location || "",
        status: inventory.status,
        inspectionNotes: inventory.inspectionNotes || "",
        lifecycleStage: inventory.lifecycleStage || "collection",
        barcode: inventory.barcode || "",
        qrCode: inventory.qrCode || "",
        batchNumber: inventory.batchNumber || "",
        ferrousType: inventory.ferrousType || "ferrous",
      })
    }
  }, [inventory, form])

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", `/api/inventory/${inventory?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] })
      toast({
        title: "Success",
        description: "Inventory updated successfully",
      })
      onOpenChange(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update inventory",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: FormData) => {
    const submitData = {
      ...data,
      qualityReports: inventory?.qualityReports || [],
    }
    mutation.mutate(submitData)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">Edit Inventory Item</DialogTitle>
              <p className="text-sm text-gray-600 mt-1">Update inventory item information and details</p>
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
                    placeholder="Enter item ID"
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
                  <Select value={form.watch("metalType")} onValueChange={(value) => form.setValue("metalType", value)}>
                    <SelectTrigger className={form.formState.errors.metalType ? "border-red-300" : ""}>
                      <SelectValue placeholder="Select metal type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="copper">Copper</SelectItem>
                      <SelectItem value="aluminum">Aluminum</SelectItem>
                      <SelectItem value="steel">Steel</SelectItem>
                      <SelectItem value="brass">Brass</SelectItem>
                      <SelectItem value="iron">Iron</SelectItem>
                      <SelectItem value="stainless_steel">Stainless Steel</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="zinc">Zinc</SelectItem>
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
                    <Input
                      id="grade"
                      placeholder="e.g., Grade A, Grade B"
                      {...form.register("grade")}
                      className={`pl-10 ${form.formState.errors.grade ? "border-red-300" : ""}`}
                    />
                  </div>
                  {form.formState.errors.grade && (
                    <p className="text-sm text-red-600">{form.formState.errors.grade.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ferrousType" className="text-sm font-medium text-gray-700">
                    Material Type *
                  </Label>
                  <Select
                    value={form.watch("ferrousType")}
                    onValueChange={(value) => form.setValue("ferrousType", value)}
                  >
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

          {/* Quantity & Pricing */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Scale className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Quantity & Pricing</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    Unit *
                  </Label>
                  <Select value={form.watch("unit")} onValueChange={(value) => form.setValue("unit", value)}>
                    <SelectTrigger className={form.formState.errors.unit ? "border-red-300" : ""}>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="KG">KG - Kilograms</SelectItem>
                      <SelectItem value="MT">MT - Metric Tons</SelectItem>
                      <SelectItem value="LB">LB - Pounds</SelectItem>
                      <SelectItem value="TON">TON - Tons</SelectItem>
                      <SelectItem value="PCS">PCS - Pieces</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.unit && (
                    <p className="text-sm text-red-600">{form.formState.errors.unit.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate" className="text-sm font-medium text-gray-700">
                    Rate per Unit
                  </Label>
                  <Input id="rate" type="number" placeholder="Enter rate" {...form.register("rate")} />
                  {form.formState.errors.rate && (
                    <p className="text-sm text-red-600">{form.formState.errors.rate.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status & Lifecycle */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Status & Lifecycle</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Status *
                  </Label>
                  <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value)}>
                    <SelectTrigger className={form.formState.errors.status ? "border-red-300" : ""}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="reserved">Reserved</SelectItem>
                      <SelectItem value="sold">Sold</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="quality_check">Quality Check</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.status && (
                    <p className="text-sm text-red-600">{form.formState.errors.status.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lifecycleStage" className="text-sm font-medium text-gray-700">
                    Lifecycle Stage
                  </Label>
                  <Select
                    value={form.watch("lifecycleStage")}
                    onValueChange={(value) => form.setValue("lifecycleStage", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="collection">Collection</SelectItem>
                      <SelectItem value="sorting">Sorting</SelectItem>
                      <SelectItem value="cleaning">Cleaning</SelectItem>
                      <SelectItem value="melting">Melting</SelectItem>
                      <SelectItem value="distribution">Distribution</SelectItem>
                      <SelectItem value="recycled">Recycled</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.lifecycleStage && (
                    <p className="text-sm text-red-600">{form.formState.errors.lifecycleStage.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tracking & Identification */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Hash className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Tracking & Identification</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode" className="text-sm font-medium text-gray-700">
                    Barcode
                  </Label>
                  <Input id="barcode" placeholder="Enter barcode" {...form.register("barcode")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="qrCode" className="text-sm font-medium text-gray-700">
                    QR Code
                  </Label>
                  <Input id="qrCode" placeholder="Enter QR code" {...form.register("qrCode")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="batchNumber" className="text-sm font-medium text-gray-700">
                    Batch Number
                  </Label>
                  <Input id="batchNumber" placeholder="Enter batch number" {...form.register("batchNumber")} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Notes */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Location & Notes</h3>
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
                      placeholder="e.g., Warehouse A, Section 2"
                      {...form.register("location")}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inspectionNotes" className="text-sm font-medium text-gray-700">
                    Inspection Notes
                  </Label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                    <Textarea
                      id="inspectionNotes"
                      placeholder="Any inspection notes or quality remarks"
                      {...form.register("inspectionNotes")}
                      rows={3}
                      className="pl-10 resize-none"
                    />
                  </div>
                </div>
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
              {mutation.isPending ? "Updating..." : "Update Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
