"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { INVENTORY_STATUS, LIFECYCLE_STAGES } from "@/lib/permissions"
import { apiRequest, queryClient } from "@/lib/queryClient"
import type { Inventory } from "@shared/schema"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  Activity,
  BarChart3,
  CheckCircle,
  FileText,
  Flame,
  Hash,
  Layers,
  Package,
  QrCode,
  Recycle,
  Truck,
  Zap,
} from "lucide-react"
import { useState } from "react"

interface LifecycleUpdateData {
  lifecycleStage: string
  status: string
  barcode?: string
  qrCode?: string
  batchNumber?: string
  inspectionNotes?: string
}

export default function LifecycleTracker() {
  const [selectedItem, setSelectedItem] = useState<Inventory | null>(null)
  const [updateData, setUpdateData] = useState<LifecycleUpdateData>({
    lifecycleStage: "",
    status: "",
  })
  const { toast } = useToast()

  const { data: inventory = [], isLoading } = useQuery({
    queryKey: ["/api/inventory"],
  })

  const updateLifecycleMutation = useMutation({
    mutationFn: (data: { id: number; updates: LifecycleUpdateData }) =>
      apiRequest("PATCH", `/api/inventory/${data.id}`, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] })
      toast({
        title: "Success",
        description: "Inventory lifecycle updated successfully",
      })
      setSelectedItem(null)
      setUpdateData({ lifecycleStage: "", status: "" })
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update inventory lifecycle",
        variant: "destructive",
      })
    },
  })

  const generateBarcode = () => {
    const barcode = `BC${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
    setUpdateData((prev) => ({ ...prev, barcode }))
  }

  const generateQRCode = () => {
    const qrCode = `QR${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`
    setUpdateData((prev) => ({ ...prev, qrCode }))
  }

  const getStageProgress = (stage: string) => {
    const stages = LIFECYCLE_STAGES.map((s) => s.value)
    const currentIndex = stages.indexOf(stage)
    return ((currentIndex + 1) / stages.length) * 100
  }

  const getStageIcon = (stage: string) => {
    switch (stage) {
      case "collection":
        return <Package className="h-4 w-4" />
      case "sorting":
        return <BarChart3 className="h-4 w-4" />
      case "cleaning":
        return <CheckCircle className="h-4 w-4" />
      case "melting":
        return <Flame className="h-4 w-4" />
      case "distribution":
        return <Truck className="h-4 w-4" />
      default:
        return <Package className="h-4 w-4" />
    }
  }

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "collection":
        return "from-blue-500 to-cyan-500"
      case "sorting":
        return "from-purple-500 to-indigo-500"
      case "cleaning":
        return "from-emerald-500 to-teal-500"
      case "melting":
        return "from-orange-500 to-red-500"
      case "distribution":
        return "from-green-500 to-emerald-500"
      default:
        return "from-gray-500 to-slate-500"
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: {
        className: "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-700 border-emerald-200/50",
        label: "Available",
      },
      reserved: {
        className: "bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-700 border-amber-200/50",
        label: "Reserved",
      },
      sold: {
        className: "bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-700 border-red-200/50",
        label: "Sold",
      },
      processing: {
        className: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-700 border-blue-200/50",
        label: "Processing",
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available
    return (
      <Badge variant="outline" className={`${config.className} backdrop-blur-sm`}>
        {config.label}
      </Badge>
    )
  }

  const handleUpdate = () => {
    if (!selectedItem) return

    updateLifecycleMutation.mutate({
      id: selectedItem.id,
      updates: updateData,
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-indigo-600 animate-spin" />
            <span className="text-lg font-medium text-gray-700">Loading inventory...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 p-6">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-400/20 to-cyan-600/20 rounded-full blur-3xl" />
      </div>

      <div className="relative space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Recycle className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Scrap Lifecycle Management
            </h1>
            <p className="text-gray-600 mt-1">Track and manage the lifecycle stages of scrap metal inventory</p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Inventory Selection */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-indigo-600/10 to-purple-600/10 border-b border-white/20">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Package className="w-5 h-5 text-indigo-600" />
                Select Inventory Item
              </CardTitle>
              <CardDescription className="text-gray-600">
                Choose an inventory item to update its lifecycle stage
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4 max-h-96 overflow-y-auto pr-2 space-y-2">
                {inventory.map((item: Inventory) => (
                  <Card
                    key={item.id}
                    className={`cursor-pointer transition-all duration-300 hover:shadow-lg bg-white/50 backdrop-blur-sm border-white/30 ${
                      selectedItem?.id === item.id
                        ? "ring-2 ring-indigo-500/50 shadow-lg bg-gradient-to-r from-indigo-50/80 to-purple-50/80"
                        : "hover:bg-white/70"
                    }`}
                    onClick={() => setSelectedItem(item)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Hash className="w-4 h-4 text-indigo-600" />
                            <h4 className="font-semibold text-gray-900">{item.itemId}</h4>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Layers className="w-4 h-4" />
                            <span>
                              {item.metalType} - {item.grade}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Package className="w-4 h-4" />
                            <span className="font-medium">
                              {item.quantity} {item.unit}
                            </span>
                          </div>
                        </div>
                        <div className="text-right space-y-3">
                          <Badge
                            variant="outline"
                            className={`bg-gradient-to-r ${getStageColor(item.lifecycleStage)} text-white border-0 shadow-sm`}
                          >
                            <div className="flex items-center gap-1">
                              {getStageIcon(item.lifecycleStage)}
                              <span className="text-xs font-medium">
                                {LIFECYCLE_STAGES.find((s) => s.value === item.lifecycleStage)?.label ||
                                  item.lifecycleStage}
                              </span>
                            </div>
                          </Badge>
                          <div className="space-y-1">
                            <Progress
                              value={getStageProgress(item.lifecycleStage)}
                              className="w-24 h-2 bg-gray-200/50"
                            />
                            <span className="text-xs text-gray-500 font-medium">
                              {Math.round(getStageProgress(item.lifecycleStage))}% Complete
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Lifecycle Update Form */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-purple-600/10 to-indigo-600/10 border-b border-white/20">
              <CardTitle className="flex items-center gap-2 text-gray-900">
                <Zap className="w-5 h-5 text-purple-600" />
                Update Lifecycle
              </CardTitle>
              <CardDescription className="text-gray-600">
                {selectedItem ? (
                  <span className="flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    Updating: <span className="font-medium text-indigo-600">{selectedItem.itemId}</span>
                  </span>
                ) : (
                  "Select an item to update"
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {selectedItem ? (
                <>
                  {/* Current Item Info */}
                  <div className="p-4 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-xl border border-indigo-100/50">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-semibold text-gray-900">{selectedItem.itemId}</h4>
                        <p className="text-sm text-gray-600">
                          {selectedItem.metalType} - {selectedItem.grade}
                        </p>
                      </div>
                      {getStatusBadge(selectedItem.status)}
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="lifecycleStage" className="text-sm font-medium text-gray-700">
                        Lifecycle Stage
                      </Label>
                      <Select
                        value={updateData.lifecycleStage}
                        onValueChange={(value) => setUpdateData((prev) => ({ ...prev, lifecycleStage: value }))}
                      >
                        <SelectTrigger className="bg-white/50 border-gray-200/50 focus:ring-indigo-500/20">
                          <SelectValue placeholder="Select lifecycle stage" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-sm">
                          {LIFECYCLE_STAGES.map((stage) => (
                            <SelectItem key={stage.value} value={stage.value}>
                              <div className="flex items-center space-x-2">
                                {getStageIcon(stage.value)}
                                <span>{stage.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                        Status
                      </Label>
                      <Select
                        value={updateData.status}
                        onValueChange={(value) => setUpdateData((prev) => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger className="bg-white/50 border-gray-200/50 focus:ring-indigo-500/20">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white/95 backdrop-blur-sm">
                          {INVENTORY_STATUS.map((status) => (
                            <SelectItem key={status.value} value={status.value}>
                              {status.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="batchNumber" className="text-sm font-medium text-gray-700">
                        Batch Number
                      </Label>
                      <Input
                        id="batchNumber"
                        value={updateData.batchNumber || ""}
                        onChange={(e) => setUpdateData((prev) => ({ ...prev, batchNumber: e.target.value }))}
                        placeholder="Enter batch number"
                        className="bg-white/50 border-gray-200/50 focus:ring-indigo-500/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">Barcode</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={updateData.barcode || ""}
                          onChange={(e) => setUpdateData((prev) => ({ ...prev, barcode: e.target.value }))}
                          placeholder="Barcode"
                          className="bg-white/50 border-gray-200/50 focus:ring-indigo-500/20"
                        />
                        <Button
                          onClick={generateBarcode}
                          variant="outline"
                          size="sm"
                          className="bg-white/50 border-gray-200/50 hover:bg-indigo-50 hover:border-indigo-200"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-700">QR Code</Label>
                      <div className="flex space-x-2">
                        <Input
                          value={updateData.qrCode || ""}
                          onChange={(e) => setUpdateData((prev) => ({ ...prev, qrCode: e.target.value }))}
                          placeholder="QR Code"
                          className="bg-white/50 border-gray-200/50 focus:ring-indigo-500/20"
                        />
                        <Button
                          onClick={generateQRCode}
                          variant="outline"
                          size="sm"
                          className="bg-white/50 border-gray-200/50 hover:bg-purple-50 hover:border-purple-200"
                        >
                          <QrCode className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="inspectionNotes"
                        className="text-sm font-medium text-gray-700 flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Inspection Notes
                      </Label>
                      <Textarea
                        id="inspectionNotes"
                        value={updateData.inspectionNotes || ""}
                        onChange={(e) => setUpdateData((prev) => ({ ...prev, inspectionNotes: e.target.value }))}
                        placeholder="Enter inspection notes..."
                        rows={3}
                        className="bg-white/50 border-gray-200/50 focus:ring-indigo-500/20 resize-none"
                      />
                    </div>

                    <Button
                      onClick={handleUpdate}
                      disabled={updateLifecycleMutation.isPending || !updateData.lifecycleStage || !updateData.status}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updateLifecycleMutation.isPending ? (
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 animate-spin" />
                          Updating...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Zap className="w-4 h-4" />
                          Update Lifecycle
                        </div>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Item Selected</h3>
                  <p className="text-gray-500">Select an inventory item from the left to update its lifecycle stage</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
