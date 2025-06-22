import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Eye, Ship, Package, Clock, MapPin, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EditShipmentModal from "@/components/modals/edit-shipment-modal";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { insertShipmentSchema, type Shipment, type Deal } from "@shared/schema";

const createShipmentSchema = insertShipmentSchema.extend({
  dealId: z.number().min(1, "Deal is required"),
});

type CreateShipmentForm = z.infer<typeof createShipmentSchema>;

export default function ShipmentsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: shipments, isLoading } = useQuery<Shipment[]>({
    queryKey: ["/api/shipments"],
  });

  const { data: deals } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  const form = useForm<CreateShipmentForm>({
    resolver: zodResolver(createShipmentSchema),
    defaultValues: {
      dealId: 0,
      containerNo: "",
      vesselName: "",
      eta: undefined,
      status: "preparation",
      trackingNotes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateShipmentForm) => apiRequest("POST", "/api/shipments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      toast({
        title: "Success",
        description: "Shipment created successfully",
      });
      form.reset();
      setShowCreateModal(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create shipment",
        variant: "destructive",
      });
    },
  });

  const deleteShipmentMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/shipments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      toast({
        title: "Success",
        description: "Shipment deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete shipment",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setShowEditModal(true);
  };

  const handleDelete = (shipment: Shipment) => {
    if (confirm(`Are you sure you want to delete this shipment?`)) {
      deleteShipmentMutation.mutate(shipment.id);
    }
  };

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Shipment> }) =>
      apiRequest("PUT", `/api/shipments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] });
      toast({
        title: "Success",
        description: "Shipment updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update shipment",
        variant: "destructive",
      });
    },
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      preparation: { variant: "outline" as const, label: "Preparation" },
      pickup: { variant: "secondary" as const, label: "Pickup" },
      gate_in: { variant: "default" as const, label: "Gate In" },
      sealed: { variant: "default" as const, label: "Sealed" },
      dispatched: { variant: "default" as const, label: "Dispatched" },
      delivered: { variant: "default" as const, label: "Delivered" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.preparation;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getDealInfo = (dealId: number) => {
    const deal = deals?.find(d => d.id === dealId);
    return deal?.dealId || "Unknown Deal";
  };

  const onSubmit = (data: CreateShipmentForm) => {
    createMutation.mutate(data);
  };

  const filteredShipments = shipments?.filter(shipment => {
    const matchesStatus = !filters.status || filters.status === "all" || shipment.status === filters.status;
    const matchesSearch = !filters.search || 
      (shipment.containerNo?.toLowerCase().includes(filters.search.toLowerCase())) ||
      (shipment.vesselName?.toLowerCase().includes(filters.search.toLowerCase())) ||
      getDealInfo(shipment.dealId).toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const totalShipments = shipments?.length || 0;
  const inTransit = shipments?.filter(s => s.status === 'dispatched').length || 0;
  const delivered = shipments?.filter(s => s.status === 'delivered').length || 0;
  const pending = shipments?.filter(s => s.status !== 'delivered').length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Shipment Tracking</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Shipment
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                <p className="text-2xl font-bold text-gray-800">{totalShipments}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Ship className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Transit</p>
                <p className="text-2xl font-bold text-gray-800">{inTransit}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Package className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-800">{delivered}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-800">{pending}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Shipments Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Shipments</CardTitle>
            <div className="flex space-x-4">
              <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="preparation">Preparation</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="gate_in">Gate In</SelectItem>
                  <SelectItem value="sealed">Sealed</SelectItem>
                  <SelectItem value="dispatched">Dispatched</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Search shipments..."
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
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Container No</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">Vessel Name</th>
                  <th className="text-left px-6 py-4 text-sm font-medium text-gray-700">ETA</th>
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
                ) : filteredShipments?.length ? (
                  filteredShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-800">
                        {getDealInfo(shipment.dealId)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {shipment.containerNo || "Not assigned"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {shipment.vesselName || "Not assigned"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {shipment.eta ? new Date(shipment.eta).toLocaleDateString() : "TBD"}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(shipment.status)}</td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex space-x-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleEdit(shipment)}
                          >
                            <Edit className="w-4 h-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Eye className="w-4 h-4 text-gray-600" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDelete(shipment)}
                            disabled={deleteShipmentMutation.isPending}
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
                      No shipments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Create Shipment Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Shipment</DialogTitle>
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
                <Label htmlFor="containerNo">Container Number</Label>
                <Input
                  id="containerNo"
                  placeholder="Enter container number"
                  {...form.register("containerNo")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vesselName">Vessel Name</Label>
                <Input
                  id="vesselName"
                  placeholder="Enter vessel name"
                  {...form.register("vesselName")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eta">ETA</Label>
                <Input
                  id="eta"
                  type="datetime-local"
                  {...form.register("eta")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trackingNotes">Tracking Notes</Label>
              <Input
                id="trackingNotes"
                placeholder="Enter tracking notes..."
                {...form.register("trackingNotes")}
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
                {createMutation.isPending ? "Creating..." : "Create Shipment"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      <EditShipmentModal 
        open={showEditModal} 
        onOpenChange={setShowEditModal}
        shipment={selectedShipment}
      />
    </div>
  );
}
