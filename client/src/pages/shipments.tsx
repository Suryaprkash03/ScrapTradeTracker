"use client"

import ViewShipmentModal from "@/components/modals/view-shipment-modal"
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
import type { Deal, Shipment } from "@shared/schema"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Anchor,
  CheckCircle2,
  Clock,
  Container,
  Edit,
  Eye,
  MapPin,
  Package,
  Plus,
  Ship,
  Timer,
  Trash2,
  TrendingUp,
  Truck,
} from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const createShipmentSchema = z.object({
  dealId: z.number().min(1, "Deal is required"),
  containerNo: z.string().optional(),
  vesselName: z.string().optional(),
  eta: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid ETA format",
    }),
  status: z.string().default("preparation"),
  trackingNotes: z.string().optional(),
})

type CreateShipmentForm = z.infer<typeof createShipmentSchema>

export default function ShipmentsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: shipments, isLoading } = useQuery<Shipment[]>({
    queryKey: ["/api/shipments"],
  })

  const { data: deals } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  })

  const form = useForm<CreateShipmentForm>({
    resolver: zodResolver(createShipmentSchema),
    defaultValues: {
      dealId: 0,
      containerNo: "",
      vesselName: "",
      eta: "",
      status: "preparation",
      trackingNotes: "",
    },
  })

  const createMutation = useMutation({
    mutationFn: (data: CreateShipmentForm) => apiRequest("POST", "/api/shipments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] })
      toast({
        title: "Success",
        description: "Shipment created successfully",
      })
      form.reset()
      setShowCreateModal(false)
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create shipment",
        variant: "destructive",
      })
    },
  })

  const deleteShipmentMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/shipments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] })
      toast({
        title: "Success",
        description: "Shipment deleted successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete shipment",
        variant: "destructive",
      })
    },
  })

  const handleEdit = (shipment: Shipment) => {
    setSelectedShipment(shipment)
    setShowEditModal(true)
  }

  const handleDelete = (shipment: Shipment) => {
    if (confirm(`Are you sure you want to delete this shipment?`)) {
      deleteShipmentMutation.mutate(shipment.id)
    }
  }

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Shipment> }) =>
      apiRequest("PUT", `/api/shipments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] })
      toast({
        title: "Success",
        description: "Shipment updated successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update shipment",
        variant: "destructive",
      })
    },
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      preparation: {
        gradient: "from-slate-500 to-gray-600",
        bg: "from-slate-50 to-gray-50",
        icon: Timer,
        label: "Preparation",
      },
      pickup: {
        gradient: "from-blue-500 to-cyan-600",
        bg: "from-blue-50 to-cyan-50",
        icon: Truck,
        label: "Pickup",
      },
      gate_in: {
        gradient: "from-indigo-500 to-purple-600",
        bg: "from-indigo-50 to-purple-50",
        icon: MapPin,
        label: "Gate In",
      },
      sealed: {
        gradient: "from-purple-500 to-pink-600",
        bg: "from-purple-50 to-pink-50",
        icon: Container,
        label: "Sealed",
      },
      dispatched: {
        gradient: "from-orange-500 to-amber-600",
        bg: "from-orange-50 to-amber-50",
        icon: Ship,
        label: "Dispatched",
      },
      delivered: {
        gradient: "from-emerald-500 to-teal-600",
        bg: "from-emerald-50 to-teal-50",
        icon: CheckCircle2,
        label: "Delivered",
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.preparation
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

  const getDealInfo = (dealId: number) => {
    const deal = deals?.find((d) => d.id === dealId)
    return deal?.dealId || "Unknown Deal"
  }

  const onSubmit = (data: CreateShipmentForm) => {
    // Prepare data for API submission with proper date formatting
    const submitData = {
      dealId: data.dealId,
      containerNo: data.containerNo || "",
      vesselName: data.vesselName || "",
      eta: data.eta ? new Date(data.eta).toISOString() : "",
      status: data.status,
      trackingNotes: data.trackingNotes || "",
    }

    console.log("Submitting shipment data:", submitData)
    createMutation.mutate(submitData)
  }

  const filteredShipments = shipments?.filter((shipment) => {
    const matchesStatus = !filters.status || filters.status === "all" || shipment.status === filters.status
    const matchesSearch =
      !filters.search ||
      shipment.containerNo?.toLowerCase().includes(filters.search.toLowerCase()) ||
      shipment.vesselName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      getDealInfo(shipment.dealId).toLowerCase().includes(filters.search.toLowerCase())

    return matchesStatus && matchesSearch
  })

  const totalShipments = shipments?.length || 0
  const inTransit = shipments?.filter((s) => s.status === "dispatched").length || 0
  const delivered = shipments?.filter((s) => s.status === "delivered").length || 0
  const pending = shipments?.filter((s) => s.status !== "delivered").length || 0

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
                <Ship className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Shipment Tracking
                </h1>
                <p className="text-gray-600">Monitor and manage all shipments</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Shipment
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Shipments</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{totalShipments}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500 mr-1" />
                    <span className="text-sm text-indigo-600 font-medium">All containers</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Ship className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">In Transit</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{inTransit}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-2" />
                    <span className="text-sm text-orange-600 font-medium">En route</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Truck className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Delivered</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{delivered}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
                    <span className="text-sm text-emerald-600 font-medium">Completed</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{pending}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2" />
                    <span className="text-sm text-amber-600 font-medium">Processing</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Shipments Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="border-b border-gray-100/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5 text-indigo-600" />
                <CardTitle className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  All Shipments
                </CardTitle>
              </div>
              <div className="flex space-x-3">
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger className="w-40 bg-white/60 backdrop-blur-sm border-white/20">
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
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Container No</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Vessel Name</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">ETA</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200/50">
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
                      <tr
                        key={shipment.id}
                        className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300"
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          {getDealInfo(shipment.dealId)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Container className="w-4 h-4 text-indigo-500" />
                            <span className="text-sm font-medium text-gray-600">
                              {shipment.containerNo || "Not assigned"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Anchor className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-600">
                              {shipment.vesselName || "Not assigned"}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-600">
                          {shipment.eta ? new Date(shipment.eta).toLocaleDateString() : "TBD"}
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(shipment.status)}</td>
                        <td className="px-6 py-4 text-sm">
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedShipment(shipment)
                                setShowViewModal(true)
                              }}
                              className="h-8 w-8 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-200 transition-all duration-300"
                            >
                              <Edit className="w-4 h-4 text-indigo-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setSelectedShipment(shipment)
                                setShowViewModal(true)
                              }}
                              className="h-8 w-8 hover:bg-gradient-to-br hover:from-gray-50 hover:to-slate-50 hover:border-gray-200 transition-all duration-300"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(shipment)}
                              disabled={deleteShipmentMutation.isPending}
                              className="h-8 w-8 hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 hover:border-red-200 transition-all duration-300"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Ship className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-lg font-semibold text-gray-700">No shipments found</p>
                        <p className="text-sm text-gray-500">Get started by adding your first shipment</p>
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
          <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-sm border-white/20">
            <DialogHeader className="pb-4 border-b border-gray-100/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                    Add New Shipment
                  </DialogTitle>
                  <p className="text-sm text-gray-600">Create a new shipment record for tracking</p>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <Card className="bg-white/60 backdrop-blur-sm border-white/20">
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-indigo-600" />
                    <CardTitle className="text-sm font-semibold text-gray-900">Shipment Information</CardTitle>
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
                      <Label htmlFor="containerNo" className="text-sm font-semibold text-gray-700">
                        Container Number
                      </Label>
                      <Input
                        id="containerNo"
                        placeholder="Enter container number"
                        className="bg-white/60 backdrop-blur-sm border-white/20"
                        {...form.register("containerNo")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vesselName" className="text-sm font-semibold text-gray-700">
                        Vessel Name
                      </Label>
                      <Input
                        id="vesselName"
                        placeholder="Enter vessel name"
                        className="bg-white/60 backdrop-blur-sm border-white/20"
                        {...form.register("vesselName")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="eta" className="text-sm font-semibold text-gray-700">
                        ETA (Optional)
                      </Label>
                      <Input
                        id="eta"
                        type="datetime-local"
                        className="bg-white/60 backdrop-blur-sm border-white/20"
                        {...form.register("eta")}
                      />
                      {form.formState.errors.eta && (
                        <p className="text-sm text-red-600 font-medium">{form.formState.errors.eta.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-semibold text-gray-700">
                      Initial Status
                    </Label>
                    <Select onValueChange={(value) => form.setValue("status", value)} defaultValue="preparation">
                      <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/20">
                        <SelectValue placeholder="Select initial status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="preparation">
                          <div className="flex items-center space-x-2">
                            <Timer className="w-4 h-4 text-slate-500" />
                            <span>Preparation</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="pickup">
                          <div className="flex items-center space-x-2">
                            <Truck className="w-4 h-4 text-blue-500" />
                            <span>Pickup</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="gate_in">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-indigo-500" />
                            <span>Gate In</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="sealed">
                          <div className="flex items-center space-x-2">
                            <Container className="w-4 h-4 text-purple-500" />
                            <span>Sealed</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="dispatched">
                          <div className="flex items-center space-x-2">
                            <Ship className="w-4 h-4 text-orange-500" />
                            <span>Dispatched</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="delivered">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span>Delivered</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {form.formState.errors.status && (
                      <p className="text-sm text-red-600 font-medium">{form.formState.errors.status.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="trackingNotes" className="text-sm font-semibold text-gray-700">
                      Tracking Notes
                    </Label>
                    <Input
                      id="trackingNotes"
                      placeholder="Enter tracking notes..."
                      className="bg-white/60 backdrop-blur-sm border-white/20"
                      {...form.register("trackingNotes")}
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
                  onClick={() => {
                    // Debug form validation
                    const errors = form.formState.errors
                    if (Object.keys(errors).length > 0) {
                      console.log("Form validation errors:", errors)
                    }
                  }}
                >
                  {createMutation.isPending ? "Creating..." : "Create Shipment"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <ViewShipmentModal open={showViewModal} onOpenChange={setShowViewModal} shipment={selectedShipment} />
      </div>
    </div>
  )
}
