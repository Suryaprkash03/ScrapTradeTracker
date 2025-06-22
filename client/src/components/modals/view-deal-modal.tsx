"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { Deal } from "@shared/schema"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Calendar, CreditCard, DollarSign, Edit, FileText, Package, Save, User, X } from "lucide-react"
import { useState } from "react"

interface ViewDealModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  deal: Deal | null
}

export default function ViewDealModal({ open, onOpenChange, deal }: ViewDealModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Deal>>({})
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Deal>) => {
      const response = await fetch(`/api/deals/${deal?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update deal")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] })
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Deal updated successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update deal",
        variant: "destructive",
      })
    },
  })

  const handleEdit = () => {
    setFormData(deal || {})
    setIsEditing(true)
  }

  const handleSave = () => {
    updateMutation.mutate(formData)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({})
  }

  if (!deal) return null

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { className: "bg-gray-100 text-gray-800 border-gray-200", label: "Draft" },
      confirmed: { className: "bg-blue-100 text-blue-800 border-blue-200", label: "Confirmed" },
      in_progress: { className: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "In Progress" },
      completed: { className: "bg-green-100 text-green-800 border-green-200", label: "Completed" },
      cancelled: { className: "bg-red-100 text-red-800 border-red-200", label: "Cancelled" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">Deal Details - {deal.dealId}</DialogTitle>
                <p className="text-sm text-gray-600 mt-1">View and manage deal information</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button onClick={handleEdit} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    size="sm"
                    disabled={updateMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
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
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-6">
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
                    Deal ID
                  </Label>
                  <Input
                    id="dealId"
                    value={isEditing ? formData.dealId || "" : deal.dealId}
                    onChange={(e) => setFormData({ ...formData, dealId: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Status
                  </Label>
                  {isEditing ? (
                    <Select
                      value={formData.status || ""}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center h-10">{getStatusBadge(deal.status)}</div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buyerId" className="text-sm font-medium text-gray-700">
                    Buyer ID
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="buyerId"
                      type="number"
                      value={isEditing ? formData.buyerId || "" : deal.buyerId}
                      onChange={(e) => setFormData({ ...formData, buyerId: Number.parseInt(e.target.value) })}
                      disabled={!isEditing}
                      className={`pl-10 ${!isEditing ? "bg-gray-50" : ""}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inventoryId" className="text-sm font-medium text-gray-700">
                    Inventory ID
                  </Label>
                  <div className="relative">
                    <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="inventoryId"
                      type="number"
                      value={isEditing ? formData.inventoryId || "" : deal.inventoryId}
                      onChange={(e) => setFormData({ ...formData, inventoryId: Number.parseInt(e.target.value) })}
                      disabled={!isEditing}
                      className={`pl-10 ${!isEditing ? "bg-gray-50" : ""}`}
                    />
                  </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    value={isEditing ? formData.quantity || "" : deal.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rate" className="text-sm font-medium text-gray-700">
                    Rate per Unit
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="rate"
                      value={isEditing ? formData.rate || "" : deal.rate}
                      onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                      disabled={!isEditing}
                      className={`pl-10 ${!isEditing ? "bg-gray-50" : ""}`}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium text-gray-700">
                    Currency
                  </Label>
                  <Input
                    id="currency"
                    value={isEditing ? formData.currency || "" : deal.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalValue" className="text-sm font-medium text-gray-700">
                    Total Value
                  </Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="totalValue"
                      value={isEditing ? formData.totalValue || "" : deal.totalValue}
                      onChange={(e) => setFormData({ ...formData, totalValue: e.target.value })}
                      disabled={!isEditing}
                      className={`pl-10 ${!isEditing ? "bg-gray-50" : ""}`}
                    />
                  </div>
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
                  <Textarea
                    id="paymentTerms"
                    value={isEditing ? formData.paymentTerms || "" : deal.paymentTerms || ""}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    disabled={!isEditing}
                    rows={2}
                    className={`resize-none ${!isEditing ? "bg-gray-50" : ""}`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialInstructions" className="text-sm font-medium text-gray-700">
                    Special Instructions
                  </Label>
                  <Textarea
                    id="specialInstructions"
                    value={isEditing ? formData.specialInstructions || "" : deal.specialInstructions || ""}
                    onChange={(e) => setFormData({ ...formData, specialInstructions: e.target.value })}
                    disabled={!isEditing}
                    rows={3}
                    className={`resize-none ${!isEditing ? "bg-gray-50" : ""}`}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Information */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">System Information</h3>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Created At</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input value={new Date(deal.createdAt).toLocaleString()} disabled className="pl-10 bg-gray-50" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
