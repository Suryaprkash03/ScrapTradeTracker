import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit, Eye, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AddInventoryModal from "@/components/modals/add-inventory-modal";
import EditInventoryModal from "@/components/modals/edit-inventory-modal";
import { apiRequest } from "@/lib/queryClient";
import type { Inventory } from "@shared/schema";

export default function InventoryPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null);
  const [filters, setFilters] = useState({
    metalType: "",
    grade: "",
    status: "",
    search: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/inventory/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Success",
        description: "Item deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (item: Inventory) => {
    setSelectedItem(item);
    setShowEditModal(true);
  };

  const handleDelete = (item: Inventory) => {
    if (confirm(`Are you sure you want to delete ${item.itemId}?`)) {
      deleteItemMutation.mutate(item.id);
    }
  };

  const { data: inventory, isLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/inventory/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
      toast({
        title: "Success",
        description: "Inventory item deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete inventory item",
        variant: "destructive",
      });
    },
  });



  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { variant: "default" as const, label: "Available" },
      reserved: { variant: "secondary" as const, label: "Reserved" },
      sold: { variant: "destructive" as const, label: "Sold" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const filteredInventory = inventory?.filter(item => {
    const matchesMetalType = !filters.metalType || item.metalType === filters.metalType;
    const matchesGrade = !filters.grade || item.grade === filters.grade;
    const matchesStatus = !filters.status || item.status === filters.status;
    const matchesSearch = !filters.search || 
      item.itemId.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.metalType.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesMetalType && matchesGrade && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Inventory Management</h1>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add New Item
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Metal Type</label>
              <Select value={filters.metalType} onValueChange={(value) => setFilters({...filters, metalType: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="Steel">Steel</SelectItem>
                  <SelectItem value="Aluminum">Aluminum</SelectItem>
                  <SelectItem value="Copper">Copper</SelectItem>
                  <SelectItem value="Iron">Iron</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
              <Select value={filters.grade} onValueChange={(value) => setFilters({...filters, grade: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Grades" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Grades</SelectItem>
                  <SelectItem value="Grade A">Grade A</SelectItem>
                  <SelectItem value="Grade B">Grade B</SelectItem>
                  <SelectItem value="Grade C">Grade C</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <Input
                placeholder="Search items..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Item ID</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Metal Type</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Grade</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Quantity</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Unit</th>
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
                ) : filteredInventory?.length ? (
                  filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">{item.itemId}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.metalType}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.grade}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.quantity}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.unit}</td>
                      <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="w-4 h-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(item)}
                            disabled={deleteItemMutation.isPending}
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
                      No inventory items found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Showing {filteredInventory?.length || 0} results
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                Previous
              </Button>
              <Button variant="default" size="sm">
                1
              </Button>
              <Button variant="outline" size="sm" disabled>
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddInventoryModal open={showAddModal} onOpenChange={setShowAddModal} />
      <EditInventoryModal 
        open={showEditModal} 
        onOpenChange={setShowEditModal}
        inventory={selectedItem}
      />
    </div>
  );
}
