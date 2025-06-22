"use client"

import CreateDealModal from "@/components/modals/create-deal-modal"
import ViewDealModal from "@/components/modals/view-deal-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/queryClient"
import type { Deal, Inventory, Partner } from "@shared/schema"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  CheckCircle,
  Clock,
  DollarSign,
  Edit,
  Eye,
  FileCheck,
  FileText,
  Filter,
  Handshake,
  Package,
  Plus,
  Search,
  Target,
  Timer,
  Trash2,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react"
import { useState } from "react"

export default function DealsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [filters, setFilters] = useState({
    status: "",
    search: "",
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: deals, isLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  })

  const { data: partners } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  })

  const { data: inventory } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  })

  const deleteDealMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/deals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] })
      toast({
        title: "Success",
        description: "Deal deleted successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete deal",
        variant: "destructive",
      })
    },
  })

  const handleEdit = (deal: Deal) => {
    setSelectedDeal(deal)
    setShowViewModal(true)
  }

  const handleDelete = (deal: Deal) => {
    if (confirm(`Are you sure you want to delete deal ${deal.dealId}?`)) {
      deleteDealMutation.mutate(deal.id)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: {
        gradient: "from-gray-500 to-slate-600",
        bg: "from-gray-50 to-slate-50",
        icon: FileText,
        label: "Draft",
      },
      confirmed: {
        gradient: "from-blue-500 to-cyan-600",
        bg: "from-blue-50 to-cyan-50",
        icon: FileCheck,
        label: "Confirmed",
      },
      in_progress: {
        gradient: "from-amber-500 to-orange-600",
        bg: "from-amber-50 to-orange-50",
        icon: Timer,
        label: "In Progress",
      },
      completed: {
        gradient: "from-emerald-500 to-teal-600",
        bg: "from-emerald-50 to-teal-50",
        icon: CheckCircle,
        label: "Completed",
      },
      cancelled: {
        gradient: "from-red-500 to-pink-600",
        bg: "from-red-50 to-pink-50",
        icon: XCircle,
        label: "Cancelled",
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
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

  const getBuyerName = (buyerId: number) => {
    const buyer = partners?.find((p) => p.id === buyerId)
    return buyer?.companyName || "Unknown Buyer"
  }

  const getInventoryInfo = (inventoryId: number) => {
    const item = inventory?.find((i) => i.id === inventoryId)
    return item ? `${item.metalType} - ${item.grade}` : "Unknown Item"
  }

  const filteredDeals = deals?.filter((deal) => {
    const matchesStatus = !filters.status || filters.status === "all" || deal.status === filters.status
    const matchesSearch =
      !filters.search ||
      deal.dealId.toLowerCase().includes(filters.search.toLowerCase()) ||
      getBuyerName(deal.buyerId).toLowerCase().includes(filters.search.toLowerCase())

    return matchesStatus && matchesSearch
  })

  const totalDeals = deals?.length || 0
  const activeDeals = deals?.filter((d) => d.status === "confirmed" || d.status === "in_progress").length || 0
  const completedDeals = deals?.filter((d) => d.status === "completed").length || 0
  const totalValue = deals?.reduce((sum, deal) => sum + Number.parseFloat(deal.totalValue), 0) || 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/10 to-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/10 to-teal-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative p-6 space-y-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Handshake className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Deal Management
                </h1>
                <p className="text-gray-600">Manage your business deals and contracts</p>
              </div>
            </div>
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Deal
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Deals</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{totalDeals}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500 mr-1" />
                    <span className="text-sm text-indigo-600 font-medium">All contracts</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Deals</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{activeDeals}</p>
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
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{completedDeals}</p>
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
                  <p className="text-sm font-medium text-gray-600">Total Value</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">${(totalValue / 1000000).toFixed(1)}M</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-purple-500 mr-1" />
                    <span className="text-sm text-purple-600 font-medium">Revenue</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="border-b border-gray-100/50">
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent flex items-center gap-2">
              <Filter className="w-5 h-5 text-indigo-600" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Deal Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/20">
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
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search deals..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10 bg-white/60 backdrop-blur-sm border-white/20"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Deals Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Deal ID</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Buyer</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Metal Type</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Value</th>
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
                  ) : filteredDeals?.length ? (
                    filteredDeals.map((deal) => (
                      <tr
                        key={deal.id}
                        className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                              <span className="text-white text-xs font-bold">{deal.dealId.slice(-2)}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{deal.dealId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">{getBuyerName(deal.buyerId)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Package className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-700">
                              {getInventoryInfo(deal.inventoryId)}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium text-gray-700">{deal.quantity} Units</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <DollarSign className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-bold text-gray-900">
                              ${Number.parseFloat(deal.totalValue).toLocaleString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(deal.status)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(deal)}
                              className="h-8 w-8 p-0 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-200 transition-all duration-300"
                            >
                              <Edit className="w-4 h-4 text-indigo-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedDeal(deal)
                                setShowViewModal(true)
                              }}
                              className="h-8 w-8 p-0 hover:bg-gradient-to-br hover:from-gray-50 hover:to-slate-50 hover:border-gray-200 transition-all duration-300"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(deal)}
                              disabled={deleteDealMutation.isPending}
                              className="h-8 w-8 p-0 hover:bg-gradient-to-br hover:from-red-50 hover:to-pink-50 hover:border-red-200 transition-all duration-300"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                            <Handshake className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-700">No deals found</p>
                            <p className="text-gray-500 text-sm">Try adjusting your filters or create a new deal</p>
                          </div>
                          <Button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Deal
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredDeals && filteredDeals.length > 0 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100/50 bg-gradient-to-r from-gray-50/80 to-gray-100/80">
                <div className="text-sm font-medium text-gray-600">
                  Showing <span className="font-bold text-gray-900">{filteredDeals?.length || 0}</span> results
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled className="bg-white/60 backdrop-blur-sm border-white/20">
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                  >
                    1
                  </Button>
                  <Button variant="outline" size="sm" disabled className="bg-white/60 backdrop-blur-sm border-white/20">
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <CreateDealModal open={showCreateModal} onOpenChange={setShowCreateModal} />
        <ViewDealModal open={showViewModal} onOpenChange={setShowViewModal} deal={selectedDeal} />
      </div>
    </div>
  )
}
