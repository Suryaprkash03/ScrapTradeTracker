"use client"

import AddPartnerModal from "@/components/modals/add-partner-modal"
import ViewPartnerModal from "@/components/modals/view-partner-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { getInitials } from "@/lib/auth"
import { apiRequest } from "@/lib/queryClient"
import type { Partner } from "@shared/schema"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Building,
  Edit,
  Eye,
  Filter,
  Globe,
  Handshake,
  Mail,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react"
import { useState } from "react"

export default function PartnersPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null)
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    search: "",
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const deletePartnerMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/partners/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/partners"] })
      toast({
        title: "Success",
        description: "Partner deleted successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete partner",
        variant: "destructive",
      })
    },
  })

  const handleEdit = (partner: Partner) => {
    setSelectedPartner(partner)
    setShowViewModal(true)
  }

  const handleDelete = (partner: Partner) => {
    if (confirm(`Are you sure you want to delete ${partner.companyName}?`)) {
      deletePartnerMutation.mutate(partner.id)
    }
  }

  const { data: partners, isLoading } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  })

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      supplier: {
        gradient: "from-blue-500 to-cyan-600",
        bg: "from-blue-50 to-cyan-50",
        icon: Truck,
        label: "Supplier",
      },
      buyer: {
        gradient: "from-emerald-500 to-teal-600",
        bg: "from-emerald-50 to-teal-50",
        icon: ShoppingCart,
        label: "Buyer",
      },
      both: {
        gradient: "from-purple-500 to-indigo-600",
        bg: "from-purple-50 to-indigo-50",
        icon: Handshake,
        label: "Both",
      },
    }

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.supplier
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: {
        gradient: "from-emerald-500 to-teal-600",
        bg: "from-emerald-50 to-teal-50",
        label: "Active",
      },
      inactive: {
        gradient: "from-gray-500 to-slate-600",
        bg: "from-gray-50 to-slate-50",
        label: "Inactive",
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.active

    return (
      <div
        className={`inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r ${config.bg} border border-white/50`}
      >
        <div className={`w-2 h-2 rounded-full mr-2 ${status === "active" ? "bg-emerald-500" : "bg-gray-500"}`} />
        <span className={`text-xs font-semibold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}>
          {config.label}
        </span>
      </div>
    )
  }

  const filteredPartners = partners?.filter((partner) => {
    const matchesType = !filters.type || filters.type === "all" || partner.type === filters.type
    const matchesStatus = !filters.status || filters.status === "all" || partner.status === filters.status
    const matchesSearch =
      !filters.search ||
      partner.companyName.toLowerCase().includes(filters.search.toLowerCase()) ||
      partner.contactPerson.toLowerCase().includes(filters.search.toLowerCase()) ||
      partner.email.toLowerCase().includes(filters.search.toLowerCase())

    return matchesType && matchesStatus && matchesSearch
  })

  const totalSuppliers = partners?.filter((p) => p.type === "supplier" || p.type === "both").length || 0
  const totalBuyers = partners?.filter((p) => p.type === "buyer" || p.type === "both").length || 0
  const activePartnerships = partners?.filter((p) => p.status === "active").length || 0

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
                  Partners Management
                </h1>
                <p className="text-gray-600">Manage your business partnerships</p>
              </div>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Partner
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Suppliers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{totalSuppliers}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                    <span className="text-sm text-blue-600 font-medium">Supply chain</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Truck className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Buyers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{totalBuyers}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
                    <span className="text-sm text-emerald-600 font-medium">Customer base</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <ShoppingCart className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Partnerships</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{activePartnerships}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2" />
                    <span className="text-sm text-purple-600 font-medium">Collaborations</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Handshake className="w-6 h-6 text-white" />
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Partner Type</label>
                <Select value={filters.type} onValueChange={(value) => setFilters({ ...filters, type: value })}>
                  <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/20">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="supplier">Suppliers</SelectItem>
                    <SelectItem value="buyer">Buyers</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Status</label>
                <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                  <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/20">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search partners..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10 bg-white/60 backdrop-blur-sm border-white/20"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Partners Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Company</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Contact Person</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Type</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Country</th>
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
                  ) : filteredPartners?.length ? (
                    filteredPartners.map((partner) => (
                      <tr
                        key={partner.id}
                        className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                              <span className="text-white font-medium text-sm">{getInitials(partner.companyName)}</span>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <Building className="w-4 h-4 text-indigo-500" />
                                <p className="text-sm font-bold text-gray-900">{partner.companyName}</p>
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <Mail className="w-3 h-3 text-gray-400" />
                                <p className="text-xs text-gray-500 font-medium">{partner.email}</p>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">{partner.contactPerson}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getTypeBadge(partner.type)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Globe className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-medium text-gray-700">{partner.country}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(partner.status)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(partner)}
                              className="h-8 w-8 p-0 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-200 transition-all duration-300"
                            >
                              <Edit className="w-4 h-4 text-indigo-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedPartner(partner)
                                setShowViewModal(true)
                              }}
                              className="h-8 w-8 p-0 hover:bg-gradient-to-br hover:from-gray-50 hover:to-slate-50 hover:border-gray-200 transition-all duration-300"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(partner)}
                              disabled={deletePartnerMutation.isPending}
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
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <div className="flex flex-col items-center gap-4">
                          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                            <Handshake className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-700">No partners found</p>
                            <p className="text-gray-500 text-sm">Try adjusting your filters or add a new partner</p>
                          </div>
                          <Button
                            onClick={() => setShowAddModal(true)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Partner
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredPartners && filteredPartners.length > 0 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100/50 bg-gradient-to-r from-gray-50/80 to-gray-100/80">
                <div className="text-sm font-medium text-gray-600">
                  Showing <span className="font-bold text-gray-900">{filteredPartners?.length || 0}</span> results
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

        <AddPartnerModal open={showAddModal} onOpenChange={setShowAddModal} />
        <ViewPartnerModal open={showViewModal} onOpenChange={setShowViewModal} partner={selectedPartner} />
      </div>
    </div>
  )
}
