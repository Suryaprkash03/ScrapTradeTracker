import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Edit, Save, X, DollarSign, Calendar, CreditCard, FileText } from "lucide-react";
import type { Payment } from "@shared/schema";

interface ViewPaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment | null;
}

export default function ViewPaymentModal({ open, onOpenChange, payment }: ViewPaymentModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Payment>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Payment>) => {
      const response = await fetch(`/api/payments/${payment?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update payment");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Payment updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update payment",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setFormData(payment || {});
    setIsEditing(true);
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  if (!payment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Payment Details - #{payment.id}</span>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button onClick={handleEdit} size="sm">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave} size="sm" disabled={updateMutation.isPending}>
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
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="dealId">Deal ID</Label>
            <Input
              id="dealId"
              type="number"
              value={isEditing ? formData.dealId || '' : payment.dealId}
              onChange={(e) => setFormData({...formData, dealId: parseInt(e.target.value)})}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="paymentType">Payment Type</Label>
            {isEditing ? (
              <Select value={formData.paymentType || ''} onValueChange={(value) => setFormData({...formData, paymentType: value})}>
                <SelectTrigger>
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
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-gray-500" />
                <Input value={payment.paymentType} disabled />
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <Input
                id="amount"
                value={isEditing ? formData.amount || '' : payment.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={isEditing ? formData.currency || '' : payment.currency}
              onChange={(e) => setFormData({...formData, currency: e.target.value})}
              disabled={!isEditing}
            />
          </div>

          <div>
            <Label htmlFor="gstAmount">GST Amount</Label>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <Input
                id="gstAmount"
                value={isEditing ? formData.gstAmount || '' : payment.gstAmount || ''}
                onChange={(e) => setFormData({...formData, gstAmount: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="totalAmount">Total Amount</Label>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <Input
                id="totalAmount"
                value={isEditing ? formData.totalAmount || '' : payment.totalAmount || ''}
                onChange={(e) => setFormData({...formData, totalAmount: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            {isEditing ? (
              <Select value={formData.status || ''} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
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
                <Badge className={getStatusColor(payment.status)}>
                  {payment.status}
                </Badge>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="proofDocument">Proof Document</Label>
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <Input
                id="proofDocument"
                value={isEditing ? formData.proofDocument || '' : payment.proofDocument || ''}
                onChange={(e) => setFormData({...formData, proofDocument: e.target.value})}
                disabled={!isEditing}
              />
            </div>
          </div>

          <div className="col-span-2">
            <Label>Created At</Label>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <Input value={new Date(payment.createdAt).toLocaleString()} disabled />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}