"use client"

import ViewPaymentModal from "@/components/modals/view-payment-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/queryClient"
import { zodResolver } from "@hookform/resolvers/zod"
import { insertPaymentSchema, type Deal, type Payment } from "@shared/schema"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Banknote,
  Calculator,
  CheckCircle,
  Clock,
  CreditCard,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Plus,
  Receipt,
  TrendingUp,
} from "lucide-react"
import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const createPaymentSchema = insertPaymentSchema.extend({
  dealId: z.number().min(1, "Deal is required"),
  amount: z.string().min(1, "Amount is required"),
  totalAmount: z.string().min(1, "Total amount is required"),
})

type CreatePaymentForm = z.infer<typeof createPaymentSchema>

export default function FinancePage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)
  const [filters, setFilters] = useState({
    status: "",
    paymentType: "",
    search: "",
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  })

  const { data: deals } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  })

  const form = useForm<CreatePaymentForm>({
    resolver: zodResolver(createPaymentSchema),
    defaultValues: {
      dealId: 0,
      paymentType: "",
      amount: "",
      currency: "USD",
      status: "pending",
      proofDocument: "",
      gstAmount: "",
      totalAmount: "",
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/payments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] })
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      })
      form.reset()
      setShowCreateModal(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      })
    },
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        gradient: "from-amber-500 to-orange-600",
        bg: "from-amber-50 to-orange-50",
        icon: Clock,
        label: "Pending",
      },
      completed: {
        gradient: "from-emerald-500 to-teal-600",
        bg: "from-emerald-50 to-teal-50",
        icon: CheckCircle,
        label: "Completed",
      },
      failed: {
        gradient: "from-red-500 to-pink-600",
        bg: "from-red-50 to-pink-50",
        icon: Clock,
        label: "Failed",
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const StatusIcon = config.icon

    return (
      <div
        className={`inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r ${config.bg} border border-white/50`}
      >
        <StatusIcon className="w-3 h-3 mr-1.5 text-gray-600" />
        <span className={`text-xs font-semibold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
          {config.label}
        </span>
      </div>
    )
  }

  const getPaymentTypeBadge = (type: string) => {
    const typeConfig = {
      TT: {
        gradient: "from-indigo-500 to-purple-600",
        bg: "from-indigo-50 to-purple-50",
        icon: Banknote,
        label: "Telegraphic Transfer",
      },
      LC: {
        gradient: "from-blue-500 to-cyan-600",
        bg: "from-blue-50 to-cyan-50",
        icon: FileText,
        label: "Letter of Credit",
      },
      cash: {
        gradient: "from-gray-500 to-slate-600",
        bg: "from-gray-50 to-slate-50",
        icon: DollarSign,
        label: "Cash",
      },
    }

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.TT
    const TypeIcon = config.icon

    return (
      <div
        className={`inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r ${config.bg} border border-white/50`}
      >
        <TypeIcon className="w-3 h-3 mr-1.5 text-gray-600" />
        <span className={`text-xs font-semibold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
          {config.label}
        </span>
      </div>
    )
  }

  const getDealInfo = (dealId: number) => {
    const deal = deals?.find((d) => d.id === dealId)
    return deal?.dealId || "Unknown Deal"
  }

  // Calculate GST and total when amount changes
  const watchAmount = form.watch("amount")
  React.useEffect(() => {
    if (watchAmount) {
      const amount = Number.parseFloat(watchAmount)
      const gst = amount * 0.18 // 18% GST
      const total = amount + gst
      form.setValue("gstAmount", gst.toString())
      form.setValue("totalAmount", total.toString())
    }
  }, [watchAmount, form])

  const onSubmit = (data: CreatePaymentForm) => {
    const submitData = {
      ...data,
      dealId: Number.parseInt(data.dealId.toString()),
      amount: data.amount,
      gstAmount: data.gstAmount,
      totalAmount: data.totalAmount,
    }
    createMutation.mutate(submitData)
  }

  const filteredPayments = payments?.filter((payment) => {
    const matchesStatus = !filters.status || filters.status === "all" || payment.status === filters.status
    const matchesType =
      !filters.paymentType || filters.paymentType === "all" || payment.paymentType === filters.paymentType
    const matchesSearch =
      !filters.search ||
      getDealInfo(payment.dealId).toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.paymentType.toLowerCase().includes(filters.search.toLowerCase())

    return matchesStatus && matchesType && matchesSearch
  })

  const totalPayments = payments?.length || 0
  const completedPayments = payments?.filter((p) => p.status === "completed").length || 0
  const pendingPayments = payments?.filter((p) => p.status === "pending").length || 0
  const totalAmount = payments?.reduce((sum, payment) => sum + Number.parseFloat(payment.totalAmount), 0) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/10 to-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/10 to-teal-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Finance Management
                </h1>
                <p className="text-gray-600">Track payments and financial transactions</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Record Payment
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Payments</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{totalPayments}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500 mr-1" />
                    <span className="text-sm text-indigo-600 font-medium">All transactions</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{completedPayments}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
                    <span className="text-sm text-emerald-600 font-medium">Successful</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{pendingPayments}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2" />
                    <span className="text-sm text-amber-600 font-medium">In progress</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">${(totalAmount / 1000000).toFixed(1)}M</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="text-sm text-purple-600 font-medium">Revenue</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payments Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="border-b border-gray-100/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-indigo-600" />
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  All Payments
                </CardTitle>
              </div>
              <div className="flex space-x-3">
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger className="w-32 bg-white/60 backdrop-blur-sm border-white/20">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.paymentType}
                  onValueChange={(value) => setFilters({ ...filters, paymentType: value })}
                >
                  <SelectTrigger className="w-32 bg-white/60 backdrop-blur-sm border-white/20">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="TT">TT</SelectItem>
                    <SelectItem value="LC">LC</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search payments..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-64 bg-white/60 backdrop-blur-sm border-white/20"
                />
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Deal ID</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Payment Type</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Amount</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">GST</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Total</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <tr key={index}>
                        {Array.from({ length: 7 }).map((_, cellIndex) => (
                          <td key={cellIndex} className="px-6 py-4">
                            <Skeleton className="h-4 w-full" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : filteredPayments?.length ? (
                    filteredPayments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">{getDealInfo(payment.dealId)}</td>
                        <td className="px-6 py-4">{getPaymentTypeBadge(payment.paymentType)}</td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-600">
                          ${Number.parseFloat(payment.amount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-600">
                          ${payment.gstAmount ? Number.parseFloat(payment.gstAmount).toLocaleString() : "0"}
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-900">
                          ${Number.parseFloat(payment.totalAmount).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <Button
                              onClick={() => {
                                setSelectedPayment(payment)
                                setShowViewModal(true)
                              }}
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-200 transition-all duration-300"
                            >
                              <Edit className="w-4 h-4 text-indigo-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedPayment(payment)
                                setShowViewModal(true)
                              }}
                              className="h-8 w-8 hover:bg-gradient-to-br hover:from-gray-50 hover:to-slate-50 hover:border-gray-200 transition-all duration-300"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <DollarSign className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-semibold text-gray-700">No payments found</p>
                        <p className="text-sm text-gray-500">Get started by recording your first payment</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Create Payment Modal */}
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border-white/20">
            <DialogHeader className="pb-4 border-b border-gray-100/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Record New Payment
                  </DialogTitle>
                  <p className="text-sm text-gray-600">Add a new payment transaction to the system</p>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Receipt className="w-4 h-4 text-indigo-600" />
                    <CardTitle className="text-sm font-semibold text-gray-900">Payment Information</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dealId" className="text-sm font-semibold text-gray-700">
                        Deal
                      </Label>
                      <Select onValueChange={(value) => form.setValue("dealId", Number.parseInt(value))}>
                        <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/20">
                          <SelectValue placeholder="Select Deal" />
                        </SelectTrigger>
                        <SelectContent>
                          {deals?.map((deal) => (
                            <SelectItem key={deal.id} value={deal.id.toString()}>
                              {deal.dealId}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {form.formState.errors.dealId && (
                        <p className="text-sm text-red-600 font-medium">{form.formState.errors.dealId.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="paymentType" className="text-sm font-semibold text-gray-700">
                        Payment Type
                      </Label>
                      <Select onValueChange={(value) => form.setValue("paymentType", value)}>
                        <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/20">
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TT">Telegraphic Transfer</SelectItem>
                          <SelectItem value="LC">Letter of Credit</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                        </SelectContent>
                      </Select>
                      {form.formState.errors.paymentType && (
                        <p className="text-sm text-red-600 font-medium">{form.formState.errors.paymentType.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-sm font-semibold text-gray-700">
                        Amount
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="Enter amount"
                        className="bg-white/60 backdrop-blur-sm border-white/20"
                        {...form.register("amount")}
                      />
                      {form.formState.errors.amount && (
                        <p className="text-sm text-red-600 font-medium">{form.formState.errors.amount.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-sm font-semibold text-gray-700">
                        Currency
                      </Label>
                      <Select onValueChange={(value) => form.setValue("currency", value)}>
                        <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/20">
                          <SelectValue placeholder="Select Currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Calculator className="w-4 h-4 text-indigo-600" />
                    <CardTitle className="text-sm font-semibold text-gray-900">Tax Calculation</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gstAmount" className="text-sm font-semibold text-gray-700">
                        GST Amount (18%)
                      </Label>
                      <Input
                        id="gstAmount"
                        type="number"
                        placeholder="GST amount"
                        className="bg-gray-50/80 backdrop-blur-sm border-white/20"
                        {...form.register("gstAmount")}
                        readOnly
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="totalAmount" className="text-sm font-semibold text-gray-700">
                        Total Amount
                      </Label>
                      <Input
                        id="totalAmount"
                        type="number"
                        placeholder="Total amount"
                        className="bg-gray-50/80 backdrop-blur-sm border-white/20"
                        {...form.register("totalAmount")}
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proofDocument" className="text-sm font-semibold text-gray-700">
                      Proof Document
                    </Label>
                    <Input
                      id="proofDocument"
                      placeholder="Document reference or upload link"
                      className="bg-white/60 backdrop-blur-sm border-white/20"
                      {...form.register("proofDocument")}
                    />
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100/50">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="bg-white/60 backdrop-blur-sm border-white/20"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                >
                  {createMutation.isPending ? "Recording..." : "Record Payment"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <ViewPaymentModal open={showViewModal} onOpenChange={setShowViewModal} payment={selectedPayment} />
      </div>
    </div>
  )
}
