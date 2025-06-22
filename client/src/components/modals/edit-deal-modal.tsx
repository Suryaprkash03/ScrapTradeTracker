"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/auth"
import { apiRequest } from "@/lib/queryClient"
import { zodResolver } from "@hookform/resolvers/zod"
import { insertDealSchema, type Deal, type Inventory, type Partner } from "@shared/schema"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { CreditCard, DollarSign, Edit, FileText, Package, User } from "lucide-react"
import React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  deal: Deal | null
}

const formSchema = insertDealSchema.extend({
  quantity: z.string().min(1, "Quantity is required"),
  rate: z.string().min(1, "Rate is required"),
  totalValue: z.string().min(1, "Total value is required"),
})

type FormData = z.infer<typeof formSchema>

export default function EditDealModal({ open, onOpenChange, deal }: Props) {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: partners } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  })

  const { data: inventory } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  })

  const buyers = partners?.filter((p) => p.type === "buyer" || p.type === "both") || []
  const availableInventory = inventory?.filter((i) => i.status === "available") || []

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
  })

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
      })
    }
  }, [deal, form])

  const mutation = useMutation({
    mutationFn: (data: any) => apiRequest("PUT", `/api/deals/${deal?.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] })
      toast({
        title: "Success",
        description: "Deal updated successfully",
      })
      onOpenChange(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update deal",
        variant: "destructive",
      })
    },
  })

  const onSubmit = (data: FormData) => {
    const submitData = {
      ...data,
      buyerId: Number.parseInt(data.buyerId.toString()),
      inventoryId: Number.parseInt(data.inventoryId.toString()),
      quantity: data.quantity,
      rate: data.rate,
      totalValue: data.totalValue,
    }
    mutation.mutate(submitData)
  }

  // Calculate total value when quantity or rate changes
  const watchQuantity = form.watch("quantity")
  const watchRate = form.watch("rate")

  React.useEffect(() => {
    if (watchQuantity && watchRate) {
      const total = (Number.parseFloat(watchQuantity) * Number.parseFloat(watchRate)).toString()
      form.setValue("totalValue", total)
    }
  }, [watchQuantity, watchRate, form])

  const getBuyerName = (buyerId: number) => {
    const buyer = buyers.find((b) => b.id === buyerId)
    return buyer?.companyName || "Unknown Buyer"
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
              <DialogTitle className="text-xl font-semibold text-gray-900">Edit Deal</DialogTitle>
              <p className="text-sm text-gray-600 mt-1">Update deal information and terms</p>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-6">
          {/* Deal Information */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Deal Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dealId" className="text-sm font-medium text-gray-700">
                    Deal ID *
                  </Label>
                  <Input
                    id="dealId"
                    placeholder="Enter deal ID"
                    {...form.register("dealId")}
                    className={form.formState.errors.dealId ? "border-red-300" : ""}
                  />
                  {form.formState.errors.dealId && (
                    <p className="text-sm text-red-600">{form.formState.errors.dealId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Deal Status *
                  </Label>
                  <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value)}>
                    <SelectTrigger className={form.formState.errors.status ? "border-red-300" : ""}>
                      <SelectValue placeholder="Select status" />
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
                  <Label htmlFor="buyerId" className="text-sm font-medium text-gray-700">
                    Buyer *
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Select
                      value={form.watch("buyerId")?.toString()}
                      onValueChange={(value) => form.setValue("buyerId", Number.parseInt(value))}
                    >
                      <SelectTrigger className={`pl-10 ${form.formState.errors.buyerId ? "border-red-300" : ""}`}>
                        <SelectValue placeholder="Select buyer" />
                      </SelectTrigger>
                      <SelectContent>
                        {buyers.map((buyer) => (
                          <SelectItem key={buyer.id} value={buyer.id.toString()}>
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-indigo-100 rounded flex items-center justify-center">
                                <span className="text-xs font-medium text-indigo-700">
                                  {getInitials(buyer.companyName)}
                                </span>
                              </div>
                              {buyer.companyName}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {form.formState.errors.buyerId && (
                    <p className="text-sm text-red-600">{form.formState.errors.buyerId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inventoryId" className="text-sm font-medium text-gray-700">
                    Inventory Item *
                  </Label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Select
                      value={form.watch("inventoryId")?.toString()}
                      onValueChange={(value) => form.setValue("inventoryId", Number.parseInt(value))}
                    >
                      <SelectTrigger className={`pl-10 ${form.formState.errors.inventoryId ? "border-red-300" : ""}`}>
                        <SelectValue placeholder="Select item" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableInventory.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.metalType} - {item.grade} ({item.itemId}) - {item.quantity} {item.unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {form.formState.errors.inventoryId && (
                    <p className="text-sm text-red-600">{form.formState.errors.inventoryId.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pricing Information */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Pricing Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                    Quantity *
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    placeholder="Enter quantity"
                    {...form.register("quantity")}
                    className={form.formState.errors.quantity ? "border-red-300" : ""}
                  />
                  {form.formState.errors.quantity && (
                    <p className="text-sm text-red-600">{form.formState.errors.quantity.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate" className="text-sm font-medium text-gray-700">
                    Rate per Unit *
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="rate"
                      type="number"
                      placeholder="Enter rate"
                      {...form.register("rate")}
                      className={`pl-10 ${form.formState.errors.rate ? "border-red-300" : ""}`}
                    />
                  </div>
                  {form.formState.errors.rate && (
                    <p className="text-sm text-red-600">{form.formState.errors.rate.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium text-gray-700">
                    Currency *
                  </Label>
                  <Select value={form.watch("currency")} onValueChange={(value) => form.setValue("currency", value)}>
                    <SelectTrigger className={form.formState.errors.currency ? "border-red-300" : ""}>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                      <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.currency && (
                    <p className="text-sm text-red-600">{form.formState.errors.currency.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalValue" className="text-sm font-medium text-gray-700">
                    Total Value
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="totalValue"
                      type="number"
                      placeholder="Auto-calculated"
                      {...form.register("totalValue")}
                      readOnly
                      className="pl-10 bg-gray-50"
                    />
                  </div>
                  {form.formState.errors.totalValue && (
                    <p className="text-sm text-red-600">{form.formState.errors.totalValue.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Terms & Instructions */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Terms & Instructions</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms" className="text-sm font-medium text-gray-700">
                    Payment Terms
                  </Label>
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
                  <Label htmlFor="specialInstructions" className="text-sm font-medium text-gray-700">
                    Special Instructions
                  </Label>
                  <Textarea
                    id="specialInstructions"
                    placeholder="Any special handling or shipping instructions"
                    {...form.register("specialInstructions")}
                    rows={3}
                    className="resize-none"
                  />
                  {form.formState.errors.specialInstructions && (
                    <p className="text-sm text-red-600">{form.formState.errors.specialInstructions.message}</p>
                  )}
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
              {mutation.isPending ? "Updating..." : "Update Deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
