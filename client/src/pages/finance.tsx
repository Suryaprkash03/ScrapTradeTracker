import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import React from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Eye, DollarSign, CreditCard, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { insertPaymentSchema, type Payment, type Deal } from "@shared/schema";

const createPaymentSchema = insertPaymentSchema.extend({
  dealId: z.number().min(1, "Deal is required"),
  amount: z.string().min(1, "Amount is required"),
  totalAmount: z.string().min(1, "Total amount is required"),
});

type CreatePaymentForm = z.infer<typeof createPaymentSchema>;

export default function FinancePage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    paymentType: "",
    search: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: payments, isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const { data: deals } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

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
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("POST", "/api/payments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
      form.reset();
      setShowCreateModal(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "outline" as const, label: "Pending" },
      completed: { variant: "default" as const, label: "Completed" },
      failed: { variant: "destructive" as const, label: "Failed" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getPaymentTypeBadge = (type: string) => {
    const typeConfig = {
      TT: { variant: "default" as const, label: "Telegraphic Transfer" },
      LC: { variant: "secondary" as const, label: "Letter of Credit" },
      cash: { variant: "outline" as const, label: "Cash" },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.TT;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDealInfo = (dealId: number) => {
    const deal = deals?.find(d => d.id === dealId);
    return deal?.dealId || "Unknown Deal";
  };

  // Calculate GST and total when amount changes
  const watchAmount = form.watch("amount");
  React.useEffect(() => {
    if (watchAmount) {
      const amount = parseFloat(watchAmount);
      const gst = amount * 0.18; // 18% GST
      const total = amount + gst;
      form.setValue("gstAmount", gst.toString());
      form.setValue("totalAmount", total.toString());
    }
  }, [watchAmount, form]);

  const onSubmit = (data: CreatePaymentForm) => {
    const submitData = {
      ...data,
      dealId: parseInt(data.dealId.toString()),
      amount: data.amount,
      gstAmount: data.gstAmount,
      totalAmount: data.totalAmount,
    };
    createMutation.mutate(submitData);
  };

  const filteredPayments = payments?.filter(payment => {
    const matchesStatus = !filters.status || payment.status === filters.status;
    const matchesType = !filters.paymentType || payment.paymentType === filters.paymentType;
    const matchesSearch = !filters.search || 
      getDealInfo(payment.dealId).toLowerCase().includes(filters.search.toLowerCase()) ||
      payment.paymentType.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesType && matchesSearch;
  });

  const totalPayments = payments?.length || 0;
  const completedPayments = payments?.filter(p => p.status === 'completed').length || 0;
  const pendingPayments = payments?.filter(p => p.status === 'pending').length || 0;
  const totalAmount = payments?.reduce((sum, payment) => sum + parseFloat(payment.totalAmount), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Finance Management</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Payments</p>
                <p className="text-2xl font-bold text-gray-800">{totalPayments}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-800">{completedPayments}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-800">{pendingPayments}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-800">${(totalAmount / 1000000).toFixed(1)}M</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Payments</CardTitle>
            <div className="flex space-x-4">
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filters.paymentType} onValueChange={(value) => setFilters({...filters, paymentType: value})}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="TT">TT</SelectItem>
                  <SelectItem value="LC">LC</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Search payments..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Deal ID</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Payment Type</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Amount</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">GST</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Total</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
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
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        {getDealInfo(payment.dealId)}
                      </td>
                      <td className="px-6 py-4">{getPaymentTypeBadge(payment.paymentType)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        ${parseFloat(payment.amount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        ${payment.gstAmount ? parseFloat(payment.gstAmount).toLocaleString() : '0'}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        ${parseFloat(payment.totalAmount).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="icon">
                            <Edit className="w-4 h-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No payments found
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Record New Payment</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dealId">Deal</Label>
                <Select onValueChange={(value) => form.setValue("dealId", parseInt(value))}>
                  <SelectTrigger>
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
                  <p className="text-sm text-red-600">{form.formState.errors.dealId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentType">Payment Type</Label>
                <Select onValueChange={(value) => form.setValue("paymentType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TT">Telegraphic Transfer</SelectItem>
                    <SelectItem value="LC">Letter of Credit</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.paymentType && (
                  <p className="text-sm text-red-600">{form.formState.errors.paymentType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="Enter amount"
                  {...form.register("amount")}
                />
                {form.formState.errors.amount && (
                  <p className="text-sm text-red-600">{form.formState.errors.amount.message}</p>
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
                <Label htmlFor="gstAmount">GST Amount (18%)</Label>
                <Input
                  id="gstAmount"
                  type="number"
                  placeholder="GST amount"
                  {...form.register("gstAmount")}
                  readOnly
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  placeholder="Total amount"
                  {...form.register("totalAmount")}
                  readOnly
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="proofDocument">Proof Document</Label>
              <Input
                id="proofDocument"
                placeholder="Document reference or upload link"
                {...form.register("proofDocument")}
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Recording..." : "Record Payment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
