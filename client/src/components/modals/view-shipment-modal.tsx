"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { Shipment } from "@shared/schema"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Anchor,
  Calendar,
  Clock,
  Container,
  Edit,
  FileText,
  MapPin,
  Navigation,
  Package,
  Save,
  Ship,
  X,
} from "lucide-react"
import { useState } from "react"

interface ViewShipmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  shipment: Shipment | null
}

export default function ViewShipmentModal({ open, onOpenChange, shipment }: ViewShipmentModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Shipment>>({})
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Shipment>) => {
      const response = await fetch(`/api/shipments/${shipment?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update shipment")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/shipments"] })
      setIsEditing(false)
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

  const handleEdit = () => {
    setFormData(shipment || {})
    setIsEditing(true)
  }

  const handleSave = () => {
    updateMutation.mutate(formData)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({})
  }

  if (!shipment) return null

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "preparation":
        return {
          color: "from-amber-500 to-orange-500",
          bg: "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200",
          icon: Package,
          text: "text-amber-800",
        }
      case "loading":
        return {
          color: "from-blue-500 to-cyan-500",
          bg: "bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200",
          icon: Container,
          text: "text-blue-800",
        }
      case "in_transit":
        return {
          color: "from-purple-500 to-indigo-500",
          bg: "bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200",
          icon: Navigation,
          text: "text-purple-800",
        }
      case "customs":
        return {
          color: "from-orange-500 to-red-500",
          bg: "bg-gradient-to-r from-orange-50 to-red-50 border-orange-200",
          icon: FileText,
          text: "text-orange-800",
        }
      case "delivered":
        return {
          color: "from-green-500 to-emerald-500",
          bg: "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200",
          icon: MapPin,
          text: "text-green-800",
        }
      case "confirmed":
        return {
          color: "from-gray-500 to-slate-500",
          bg: "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200",
          icon: Clock,
          text: "text-gray-800",
        }
      default:
        return {
          color: "from-gray-500 to-slate-500",
          bg: "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200",
          icon: Clock,
          text: "text-gray-800",
        }
    }
  }

  const statusConfig = getStatusConfig(shipment.status)
  const StatusIcon = statusConfig.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-blue-50/30 backdrop-blur-sm border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 rounded-lg" />

        <DialogHeader className="relative z-10 pb-6 border-b border-gradient-to-r from-indigo-100 to-purple-100">
          <DialogTitle className="flex items-center justify-between text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg">
                <Ship className="w-6 h-6" />
              </div>
              <span>Shipment {shipment.containerNo}</span>
            </div>
            <div className="flex gap-2">
              {!isEditing ? (
                <Button
                  onClick={handleEdit}
                  size="sm"
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    size="sm"
                    disabled={updateMutation.isPending}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateMutation.isPending ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    size="sm"
                    variant="outline"
                    className="border-gray-300 hover:bg-gray-50 transition-all duration-300"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="relative z-10 space-y-8">
          {/* Status Banner */}
          <div className={`p-4 rounded-xl border-2 ${statusConfig.bg} transition-all duration-300`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-gradient-to-r ${statusConfig.color} text-white shadow-lg`}>
                <StatusIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`font-semibold ${statusConfig.text}`}>
                  Current Status: {shipment.status.replace("_", " ").toUpperCase()}
                </h3>
                <p className="text-sm text-gray-600">
                  Last updated: {new Date(shipment.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Shipment Details */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Package className="w-5 h-5 text-indigo-600" />
              Shipment Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="dealId" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-500" />
                  Deal ID
                </Label>
                <Input
                  id="dealId"
                  type="number"
                  value={isEditing ? formData.dealId || "" : shipment.dealId}
                  onChange={(e) => setFormData({ ...formData, dealId: Number.parseInt(e.target.value) })}
                  disabled={!isEditing}
                  className="bg-white/80 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="containerNo" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Container className="w-4 h-4 text-blue-500" />
                  Container Number
                </Label>
                <Input
                  id="containerNo"
                  value={isEditing ? formData.containerNo || "" : shipment.containerNo}
                  onChange={(e) => setFormData({ ...formData, containerNo: e.target.value })}
                  disabled={!isEditing}
                  className="bg-white/80 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Vessel Information */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Anchor className="w-5 h-5 text-blue-600" />
              Vessel Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="vesselName" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Ship className="w-4 h-4 text-blue-500" />
                  Vessel Name
                </Label>
                <Input
                  id="vesselName"
                  value={isEditing ? formData.vesselName || "" : shipment.vesselName}
                  onChange={(e) => setFormData({ ...formData, vesselName: e.target.value })}
                  disabled={!isEditing}
                  className="bg-white/80 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-300"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="eta" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-green-500" />
                  ETA (Estimated Time of Arrival)
                </Label>
                <Input
                  id="eta"
                  type="datetime-local"
                  value={
                    isEditing
                      ? formData.eta
                        ? new Date(formData.eta).toISOString().slice(0, 16)
                        : ""
                      : shipment.eta
                        ? new Date(shipment.eta).toISOString().slice(0, 16)
                        : ""
                  }
                  onChange={(e) => setFormData({ ...formData, eta: new Date(e.target.value).toISOString() })}
                  disabled={!isEditing}
                  className="bg-white/80 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Status & Tracking */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Navigation className="w-5 h-5 text-purple-600" />
              Status & Tracking
            </h3>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-purple-500" />
                  Current Status
                </Label>
                {isEditing ? (
                  <Select
                    value={formData.status || ""}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="bg-white/80 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preparation">Preparation</SelectItem>
                      <SelectItem value="loading">Loading</SelectItem>
                      <SelectItem value="in_transit">In Transit</SelectItem>
                      <SelectItem value="customs">Customs</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center">
                    <Badge className={`${statusConfig.bg} ${statusConfig.text} border-0 px-4 py-2 text-sm font-medium`}>
                      <StatusIcon className="w-4 h-4 mr-2" />
                      {shipment.status.replace("_", " ").toUpperCase()}
                    </Badge>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="trackingNotes" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-gray-500" />
                  Tracking Notes
                </Label>
                <Textarea
                  id="trackingNotes"
                  value={isEditing ? formData.trackingNotes || "" : shipment.trackingNotes || ""}
                  onChange={(e) => setFormData({ ...formData, trackingNotes: e.target.value })}
                  disabled={!isEditing}
                  rows={4}
                  placeholder="Add tracking updates, port information, or delivery notes..."
                  className="bg-white/80 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400/20 transition-all duration-300 resize-none"
                />
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-600" />
              Record Information
            </h3>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Created At</Label>
              <Input
                value={new Date(shipment.createdAt).toLocaleString()}
                disabled
                className="bg-gray-50 border-gray-200 text-gray-600"
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
