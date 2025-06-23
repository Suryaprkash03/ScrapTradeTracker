"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { Payment } from "@shared/schema"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  FileText,
  Loader,
  Save,
  X,
  XCircle,
} from "lucide-react"
import { useState } from "react"

interface ViewPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payment: Payment | null
}

export default function ViewPaymentModal({ open, onOpenChange, payment }: ViewPaymentModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Payment>>({})
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Payment>) => {
      const response = await fetch(`/api/payments/${payment?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update payment")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] })
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Payment updated successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment",
        variant: "destructive",
      })
    },
  })

  const handleEdit = () => {
    setFormData(payment || {})
    setIsEditing(true)
  }

  const handleSave = () => {
    updateMutation.mutate(formData)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({})
  }

  if (!payment) return null

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return {
          color: "bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200",
          icon: CheckCircle,
          iconColor: "text-emerald-600",
        }
      case "pending":
        return {
          color: "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200",
          icon: Clock,
          iconColor: "text-amber-600",
        }
      case "failed":
        return {
          color: "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border-red-200",
          icon: XCircle,
          iconColor: "text-red-600",
        }
      case "processing":
        return {
          color: "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200",
          icon: Loader,
          iconColor: "text-blue-600",
        }
      default:
        return {
          color: "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-700 border-gray-200",
          icon: AlertCircle,
          iconColor: "text-gray-600",
        }
    }
  }

  const statusConfig = getStatusConfig(payment.status)
  const StatusIcon = statusConfig.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 rounded-lg" />

        {/* Glass effect overlay */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-lg border border-white/20" />

        <div className="relative z-10">
          <DialogHeader className="pb-6">
            <DialogTitle className="flex items-center justify-between text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <span>Payment Details - #{payment.id}</span>
              </div>
              <div className="flex gap-2">
                {!isEditing ? (
                  <Button
                    onClick={handleEdit}
                    size="sm"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={handleSave}
                      size="sm"
                      disabled={updateMutation.isPending}
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      {updateMutation.isPending ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      size="sm"
                      variant="outline"
                      className="border-gray-300 hover:bg-gray-50 shadow-sm hover:shadow-md transition-all duration-200"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Status Banner */}
          <div className={`mb-6 p-4 rounded-xl border ${statusConfig.color} shadow-sm`}>
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-5 h-5 ${statusConfig.iconColor}`} />
              <div>
                <h3 className="font-semibold">Payment Status</h3>
                <p className="text-sm opacity-80">Current status: {payment.status}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"></div>
                Deal Information
              </h3>

              <div className="space-y-4">
                <div className="group">
                  <Label htmlFor="dealId" className="text-sm font-medium text-gray-700 mb-2 block">
                    Deal ID
                  </Label>
                  <div className="relative">
                    <Input
                      id="dealId"
                      type="number"
                      value={isEditing ? formData.dealId || "" : payment.dealId}
                      onChange={(e) => setFormData({ ...formData, dealId: Number.parseInt(e.target.value) })}
                      disabled={!isEditing}
                      className={`pl-10 ${!isEditing ? "bg-gray-50/50" : "bg-white"} border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200`}
                    />
                    <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  </div>
                </div>

                <div className="group">
                  <Label htmlFor="paymentType" className="text-sm font-medium text-gray-700 mb-2 block">
                    Payment Type
                  </Label>
                  {isEditing ? (
                    <Select
                      value={formData.paymentType || ""}
                      onValueChange={(value) => setFormData({ ...formData, paymentType: value })}
                    >
                      <SelectTrigger className="bg-white border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Wire Transfer">Wire Transfer</SelectItem>
                        <SelectItem value="Letter of Credit">Letter of Credit</SelectItem>
                        <SelectItem value="TT Payment">TT Payment</SelectItem>
                        <SelectItem value="Bank Draft">Bank Draft</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="relative">
                      <Input value={payment.paymentType} disabled className="pl-10 bg-gray-50/50 border-gray-200" />
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Amount Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-full"></div>
                Amount Details
              </h3>

              <div className="space-y-4">
                <div className="group">
                  <Label htmlFor="amount" className="text-sm font-medium text-gray-700 mb-2 block">
                    Amount
                  </Label>
                  <div className="relative">
                    <Input
                      id="amount"
                      value={isEditing ? formData.amount || "" : payment.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      disabled={!isEditing}
                      className={`pl-10 ${!isEditing ? "bg-gray-50/50" : "bg-white"} border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200`}
                    />
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  </div>
                </div>

                <div className="group">
                  <Label htmlFor="currency" className="text-sm font-medium text-gray-700 mb-2 block">
                    Currency
                  </Label>
                  <Input
                    id="currency"
                    value={isEditing ? formData.currency || "" : payment.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    disabled={!isEditing}
                    className={`${!isEditing ? "bg-gray-50/50" : "bg-white"} border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200`}
                  />
                </div>
              </div>
            </div>

            {/* GST Information */}
            <div className="group">
              <Label htmlFor="gstAmount" className="text-sm font-medium text-gray-700 mb-2 block">
                GST Amount
              </Label>
              <div className="relative">
                <Input
                  id="gstAmount"
                  value={isEditing ? formData.gstAmount || "" : payment.gstAmount || ""}
                  onChange={(e) => setFormData({ ...formData, gstAmount: e.target.value })}
                  disabled={!isEditing}
                  className={`pl-10 ${!isEditing ? "bg-gray-50/50" : "bg-white"} border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200`}
                />
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-amber-500" />
              </div>
            </div>

            {/* Total Amount */}
            <div className="group">
              <Label htmlFor="totalAmount" className="text-sm font-medium text-gray-700 mb-2 block">
                Total Amount
              </Label>
              <div className="relative">
                <Input
                  id="totalAmount"
                  value={isEditing ? formData.totalAmount || "" : payment.totalAmount || ""}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  disabled={!isEditing}
                  className={`pl-10 ${!isEditing ? "bg-gray-50/50" : "bg-white"} border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200 font-semibold`}
                />
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-indigo-500" />
              </div>
            </div>

            {/* Status */}
            <div className="group">
              <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-2 block">
                Status
              </Label>
              {isEditing ? (
                <Select
                  value={formData.status || ""}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger className="bg-white border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center">
                  <Badge className={`${statusConfig.color} border shadow-sm px-3 py-1 font-medium`}>
                    <StatusIcon className={`w-3 h-3 mr-1 ${statusConfig.iconColor}`} />
                    {payment.status}
                  </Badge>
                </div>
              )}
            </div>

            {/* Proof Document */}
            <div className="group">
              <Label htmlFor="proofDocument" className="text-sm font-medium text-gray-700 mb-2 block">
                Proof Document
              </Label>
              <div className="relative">
                <Input
                  id="proofDocument"
                  value={isEditing ? formData.proofDocument || "" : payment.proofDocument || ""}
                  onChange={(e) => setFormData({ ...formData, proofDocument: e.target.value })}
                  disabled={!isEditing}
                  className={`pl-10 ${!isEditing ? "bg-gray-50/50" : "bg-white"} border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all duration-200`}
                />
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            {/* Created At */}
            <div className="col-span-1 md:col-span-2">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">Created At</Label>
              <div className="relative">
                <Input
                  value={new Date(payment.createdAt).toLocaleString()}
                  disabled
                  className="pl-10 bg-gray-50/50 border-gray-200"
                />
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
