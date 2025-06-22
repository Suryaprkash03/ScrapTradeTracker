import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Eye, Trash2, Truck, ShoppingCart, Handshake } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddPartnerModal from "@/components/modals/add-partner-modal";
import { apiRequest } from "@/lib/queryClient";
import { getInitials } from "@/lib/auth";
import type { Partner } from "@shared/schema";

export default function PartnersPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    type: "",
    search: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deletePartnerMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/partners/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({
        title: "Success",
        description: "Partner deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete partner",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (partner: Partner) => {
    setSelectedPartner(partner);
    setShowEditModal(true);
  };

  const handleDelete = (partner: Partner) => {
    if (confirm(`Are you sure you want to delete ${partner.companyName}?`)) {
      deletePartnerMutation.mutate(partner.id);
    }
  };

  const { data: partners, isLoading } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/partners/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] });
      toast({
        title: "Success",
        description: "Partner deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete partner",
        variant: "destructive",
      });
    },
  });



  const getTypeBadge = (type: string) => {
    const typeConfig = {
      supplier: { variant: "default" as const, label: "Supplier", icon: Truck },
      buyer: { variant: "secondary" as const, label: "Buyer", icon: ShoppingCart },
      both: { variant: "outline" as const, label: "Both", icon: Handshake },
    };
    
    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.supplier;
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <config.icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge variant={status === "active" ? "default" : "secondary"}>
        {status === "active" ? "Active" : "Inactive"}
      </Badge>
    );
  };

  const filteredPartners = partners?.filter(partner => {
    const matchesType = !filters.type || partner.type === filters.type;
    const matchesSearch = !filters.search || 
      partner.companyName.toLowerCase().includes(filters.search.toLowerCase()) ||
      partner.contactPerson.toLowerCase().includes(filters.search.toLowerCase()) ||
      partner.email.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const totalSuppliers = partners?.filter(p => p.type === "supplier" || p.type === "both").length || 0;
  const totalBuyers = partners?.filter(p => p.type === "buyer" || p.type === "both").length || 0;
  const activePartnerships = partners?.filter(p => p.status === "active").length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Partners Management</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Partner
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                <p className="text-2xl font-bold text-gray-800">{totalSuppliers}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Buyers</p>
                <p className="text-2xl font-bold text-gray-800">{totalBuyers}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Partnerships</p>
                <p className="text-2xl font-bold text-gray-800">{activePartnerships}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Handshake className="w-5 h-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partners Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Partners</CardTitle>
            <div className="flex space-x-4">
              <Select value={filters.type} onValueChange={(value) => setFilters({...filters, type: value})}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="supplier">Suppliers</SelectItem>
                  <SelectItem value="buyer">Buyers</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Search partners..."
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
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Company</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Contact Person</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Type</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Country</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 6 }).map((_, cellIndex) => (
                        <td key={cellIndex} className="px-6 py-4">
                          <Skeleton className="h-4 w-full" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredPartners?.length ? (
                  filteredPartners.map((partner) => (
                    <tr key={partner.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-medium text-sm">
                              {getInitials(partner.companyName)}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{partner.companyName}</p>
                            <p className="text-xs text-gray-600">{partner.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{partner.contactPerson}</td>
                      <td className="px-6 py-4">{getTypeBadge(partner.type)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{partner.country}</td>
                      <td className="px-6 py-4">{getStatusBadge(partner.status)}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(partner)}
                          >
                            <Edit className="w-4 h-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(partner)}
                            disabled={deletePartnerMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No partners found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <AddPartnerModal open={showAddModal} onOpenChange={setShowAddModal} />
    </div>
  );
}
