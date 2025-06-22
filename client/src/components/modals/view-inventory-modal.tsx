"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import type { Inventory } from "@shared/schema"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Calendar, Edit, FileText, MapPin, Package, Save, X } from "lucide-react"
import { useState } from "react"

interface ViewInventoryModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  inventory: Inventory | null
}

export default function ViewInventoryModal({ open, onOpenChange, inventory }: ViewInventoryModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Inventory>>({})
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<Inventory>) => {
      const response = await fetch(`/api/inventory/${inventory?.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update inventory")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/inventory"] })
      setIsEditing(false)
      toast({
        title: "Success",
        description: "Inventory item updated successfully",
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update inventory item",
        variant: "destructive",
      })
    },
  })

  const handleEdit = () => {
    setFormData(inventory || {})
    setIsEditing(true)
  }

  const handleSave = () => {
    updateMutation.mutate(formData)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setFormData({})
  }

  if (!inventory) return null

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: {
        className: "bg-green-100 text-green-800 border-green-200",
        label: "Available",
      },
      reserved: {
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
        label: "Reserved",
      },
      sold: {
        className: "bg-red-100 text-red-800 border-red-200",
        label: "Sold",
      },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.available
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-6 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-gray-900">{inventory.itemId}</DialogTitle>
                <p className="text-sm text-gray-600 mt-1">Inventory Item Details</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {!isEditing ? (
                <Button onClick={handleEdit} size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    size="sm"
                    disabled={updateMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                  <Button onClick={handleCancel} size="sm" variant="outline">
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-6">
          {/* Basic Information */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="itemId" className="text-sm font-medium text-gray-700">
                    Item ID
                  </Label>
                  <Input
                    id="itemId"
                    value={isEditing ? formData.itemId || "" : inventory.itemId}
                    onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metalType" className="text-sm font-medium text-gray-700">
                    Metal Type
                  </Label>
                  {isEditing ? (
                    <Select
                      value={formData.metalType || ""}
                      onValueChange={(value) => setFormData({ ...formData, metalType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Aluminum">Aluminum</SelectItem>
                        <SelectItem value="Copper">Copper</SelectItem>
                        <SelectItem value="Steel">Steel</SelectItem>
                        <SelectItem value="Brass">Brass</SelectItem>
                        <SelectItem value="Iron">Iron</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={inventory.metalType} disabled className="bg-gray-50" />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="grade" className="text-sm font-medium text-gray-700">
                    Grade
                  </Label>
                  {isEditing ? (
                    <Select
                      value={formData.grade || ""}
                      onValueChange={(value) => setFormData({ ...formData, grade: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Grade A">Grade A</SelectItem>
                        <SelectItem value="Grade B">Grade B</SelectItem>
                        <SelectItem value="Grade C">Grade C</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={inventory.grade} disabled className="bg-gray-50" />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-sm font-medium text-gray-700">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={isEditing ? formData.quantity || "" : inventory.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit" className="text-sm font-medium text-gray-700">
                    Unit
                  </Label>
                  <Input
                    id="unit"
                    value={isEditing ? formData.unit || "" : inventory.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ferrousType" className="text-sm font-medium text-gray-700">
                    Ferrous Type
                  </Label>
                  {isEditing ? (
                    <Select
                      value={formData.ferrousType || ""}
                      onValueChange={(value) => setFormData({ ...formData, ferrousType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ferrous">Ferrous</SelectItem>
                        <SelectItem value="non_ferrous">Non-Ferrous</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input value={inventory.ferrousType} disabled className="bg-gray-50" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Status */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Location & Status</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium text-gray-700">
                    Location
                  </Label>
                  <Input
                    id="location"
                    value={isEditing ? formData.location || "" : inventory.location || ""}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="Enter location"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                    Status
                  </Label>
                  {isEditing ? (
                    <Select
                      value={formData.status || ""}
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="reserved">Reserved</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center h-10">{getStatusBadge(inventory.status)}</div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes & Additional Information */}
          <Card className="shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-semibold text-gray-900">Notes & Additional Information</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inspectionNotes" className="text-sm font-medium text-gray-700">
                    Inspection Notes
                  </Label>
                  <Textarea
                    id="inspectionNotes"
                    value={isEditing ? formData.inspectionNotes || "" : inventory.inspectionNotes || ""}
                    onChange={(e) => setFormData({ ...formData, inspectionNotes: e.target.value })}
                    disabled={!isEditing}
                    rows={4}
                    className={!isEditing ? "bg-gray-50" : ""}
                    placeholder="Enter inspection notes..."
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Created At
                  </Label>
                  <Input value={new Date(inventory.createdAt).toLocaleString()} disabled className="bg-gray-50" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
