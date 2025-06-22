"use client"

import AddInventoryModal from "@/components/modals/add-inventory-modal"
import ViewInventoryModal from "@/components/modals/view-inventory-modal"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { apiRequest } from "@/lib/queryClient"
import type { Inventory } from "@shared/schema"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  Box,
  CheckCircle,
  Clock,
  Edit,
  Eye,
  Filter,
  Hash,
  Layers,
  Package,
  Plus,
  Scale,
  Search,
  Trash2,
  TrendingUp,
  XCircle,
} from "lucide-react"
import { useState } from "react"

export default function InventoryPage() {
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null)
  const [filters, setFilters] = useState({
    metalType: "",
    grade: "",
    status: "",
    search: "",
  })

  const { toast } = useToast()
  const queryClient = useQueryClient()

  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/inventory/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] })
      toast({
        title: "Success",
        description: "Item deleted successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      })
    },
  })

  const handleEdit = (item: Inventory) => {
    setSelectedItem(item)
    setShowEditModal(true)
  }

  const handleDelete = (item: Inventory) => {
    if (confirm(`Are you sure you want to delete ${item.itemId}?`)) {
      deleteItemMutation.mutate(item.id)
    }
  }

  const { data: inventory, isLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: {
        gradient: "from-emerald-500 to-teal-600",
        bg: "from-emerald-50 to-teal-50",
        icon: CheckCircle,
        label: "Available",
      },
      reserved: {
        gradient: "from-amber-500 to-orange-600",
        bg: "from-amber-50 to-orange-50",
        icon: Clock,
        label: "Reserved",
      },
      sold: {
        gradient: "from-red-500 to-pink-600",
        bg: "from-red-50 to-pink-50",
        icon: XCircle,
        label: "Sold",
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available
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

  const getMetalTypeIcon = (metalType: string) => {
    const metalIcons = {
      Steel: "🔩",
      Aluminum: "⚡",
      Copper: "🔶",
      Iron: "⚙️",
      Brass: "🟡",
    }
    return metalIcons[metalType as keyof typeof metalIcons] || "⚪"
  }

  const filteredInventory = inventory?.filter((item) => {
    const matchesMetalType = !filters.metalType || filters.metalType === "all" || item.metalType === filters.metalType
    const matchesGrade = !filters.grade || filters.grade === "all" || item.grade === filters.grade
    const matchesStatus = !filters.status || filters.status === "all" || item.status === filters.status
    const matchesSearch =
      !filters.search ||
      item.itemId.toLowerCase().includes(filters.search.toLowerCase()) ||
      item.metalType.toLowerCase().includes(filters.search.toLowerCase())

    return matchesMetalType && matchesGrade && matchesStatus && matchesSearch
  })

  const totalItems = inventory?.length || 0
  const availableItems = inventory?.filter((item) => item.status === "available").length || 0
  const reservedSoldItems = inventory?.filter((item) => item.status !== "available").length || 0

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
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Inventory Management
                </h1>
                <p className="text-gray-600">Manage your scrap metal inventory</p>
              </div>
            </div>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Item
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Items</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{totalItems}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-indigo-500 mr-1" />
                    <span className="text-sm text-indigo-600 font-medium">All inventory</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{availableItems}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
                    <span className="text-sm text-emerald-600 font-medium">Ready to sell</span>
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
                  <p className="text-sm font-medium text-gray-600">Reserved/Sold</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{reservedSoldItems}</p>
                  <div className="flex items-center mt-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full mr-2" />
                    <span className="text-sm text-amber-600 font-medium">In process</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-6 h-6 text-white" />
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Metal Type</label>
                <Select
                  value={filters.metalType}
                  onValueChange={(value) => setFilters({ ...filters, metalType: value })}
                >
                  <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/20">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Steel">Steel</SelectItem>
                    <SelectItem value="Aluminum">Aluminum</SelectItem>
                    <SelectItem value="Copper">Copper</SelectItem>
                    <SelectItem value="Iron">Iron</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Grade</label>
                <Select value={filters.grade} onValueChange={(value) => setFilters({ ...filters, grade: value })}>
                  <SelectTrigger className="bg-white/60 backdrop-blur-sm border-white/20">
                    <SelectValue placeholder="All Grades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Grades</SelectItem>
                    <SelectItem value="Grade A">Grade A</SelectItem>
                    <SelectItem value="Grade B">Grade B</SelectItem>
                    <SelectItem value="Grade C">Grade C</SelectItem>
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
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                    <SelectItem value="sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search items..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-10 bg-white/60 backdrop-blur-sm border-white/20"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inventory Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 border-b border-gray-200/50">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Item ID</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Metal Type</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Grade</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Unit</th>
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
                  ) : filteredInventory?.length ? (
                    filteredInventory.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                              <Hash className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-sm font-bold text-gray-900">{item.itemId}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
                              <span className="text-sm">{getMetalTypeIcon(item.metalType)}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-700">{item.metalType}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Layers className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-gray-700">{item.grade}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Scale className="w-4 h-4 text-emerald-500" />
                            <span className="text-sm font-medium text-gray-700">{item.quantity}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-2">
                            <Box className="w-4 h-4 text-amber-500" />
                            <span className="text-sm font-medium text-gray-700">{item.unit}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(item)}
                              className="h-8 w-8 p-0 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-200 transition-all duration-300"
                            >
                              <Edit className="w-4 h-4 text-indigo-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedItem(item)
                                setShowViewModal(true)
                              }}
                              className="h-8 w-8 p-0 hover:bg-gradient-to-br hover:from-gray-50 hover:to-slate-50 hover:border-gray-200 transition-all duration-300"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(item)}
                              disabled={deleteItemMutation.isPending}
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
                            <Package className="w-8 h-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-lg font-bold text-gray-700">No inventory items found</p>
                            <p className="text-gray-500 text-sm">Try adjusting your filters or add a new item</p>
                          </div>
                          <Button
                            onClick={() => setShowAddModal(true)}
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Item
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {filteredInventory && filteredInventory.length > 0 && (
              <div className="px-6 py-4 flex items-center justify-between border-t border-gray-100/50 bg-gradient-to-r from-gray-50/80 to-gray-100/80">
                <div className="text-sm font-medium text-gray-600">
                  Showing <span className="font-bold text-gray-900">{filteredInventory?.length || 0}</span> results
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

        <AddInventoryModal open={showAddModal} onOpenChange={setShowAddModal} />
        <ViewInventoryModal open={showViewModal} onOpenChange={setShowViewModal} inventory={selectedItem} />
      </div>
    </div>
  )
}
