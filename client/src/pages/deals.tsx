import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Eye, FileText, DollarSign, Clock, CheckCircle, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import CreateDealModal from "@/components/modals/create-deal-modal";
import { apiRequest } from "@/lib/queryClient";
import type { Deal, Partner, Inventory } from "@shared/schema";

export default function DealsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: deals, isLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  const { data: partners } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  });

  const { data: inventory } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const deleteDealMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/deals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      toast({
        title: "Success",
        description: "Deal deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete deal",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal);
    setShowEditModal(true);
  };

  const handleDelete = (deal: Deal) => {
    if (confirm(`Are you sure you want to delete deal ${deal.dealId}?`)) {
      deleteDealMutation.mutate(deal.id);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: "outline" as const, label: "Draft" },
      confirmed: { variant: "default" as const, label: "Confirmed" },
      in_progress: { variant: "secondary" as const, label: "In Progress" },
      completed: { variant: "default" as const, label: "Completed" },
      cancelled: { variant: "destructive" as const, label: "Cancelled" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getBuyerName = (buyerId: number) => {
    const buyer = partners?.find(p => p.id === buyerId);
    return buyer?.companyName || "Unknown Buyer";
  };

  const getInventoryInfo = (inventoryId: number) => {
    const item = inventory?.find(i => i.id === inventoryId);
    return item ? `${item.metalType} - ${item.grade}` : "Unknown Item";
  };

  const filteredDeals = deals?.filter(deal => {
    const matchesStatus = !filters.status || filters.status === "all" || deal.status === filters.status;
    const matchesSearch = !filters.search || 
      deal.dealId.toLowerCase().includes(filters.search.toLowerCase()) ||
      getBuyerName(deal.buyerId).toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const totalDeals = deals?.length || 0;
  const activeDeals = deals?.filter(d => d.status === 'confirmed' || d.status === 'in_progress').length || 0;
  const completedDeals = deals?.filter(d => d.status === 'completed').length || 0;
  const totalValue = deals?.reduce((sum, deal) => sum + parseFloat(deal.totalValue), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Deal Management</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Deal
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Deals</p>
                <p className="text-2xl font-bold text-gray-800">{totalDeals}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Deals</p>
                <p className="text-2xl font-bold text-gray-800">{activeDeals}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-800">{completedDeals}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold text-gray-800">${(totalValue / 1000000).toFixed(1)}M</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deals Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Deals</CardTitle>
            <div className="flex space-x-4">
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Search deals..."
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
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Buyer</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Metal Type</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Quantity</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Value</th>
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
                ) : filteredDeals?.length ? (
                  filteredDeals.map((deal) => (
                    <tr key={deal.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">{deal.dealId}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{getBuyerName(deal.buyerId)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{getInventoryInfo(deal.inventoryId)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{deal.quantity} Units</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        ${parseFloat(deal.totalValue).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(deal.status)}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(deal)}
                          >
                            <Edit className="w-4 h-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(deal)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      No deals found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <CreateDealModal open={showCreateModal} onOpenChange={setShowCreateModal} />
    </div>
  );
}
