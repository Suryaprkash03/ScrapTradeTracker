"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/use-auth"
import { useToast } from "@/hooks/use-toast"
import { apiRequest, queryClient } from "@/lib/queryClient"
import type { Deal, Inventory, QualityCheck } from "@shared/schema"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
  Award,
  Beaker,
  Calendar,
  CheckCircle,
  ClipboardCheck,
  Droplets,
  Hash,
  Package,
  Radiation,
  Scale,
  TestTube,
  Truck,
  User,
  Zap,
} from "lucide-react"
import { useState } from "react"

interface QualityCheckData {
  dealId?: number
  inventoryId?: number
  grossWeight: string
  netWeight: string
  moisture: string
  radiation: string
  purityPercent: string
  testResults: any
  weighbridgeData: any
  inspectionImages: string[]
}

export default function QualityCheckPage() {
  const [checkData, setCheckData] = useState<Partial<QualityCheckData>>({
    testResults: {},
    weighbridgeData: {},
    inspectionImages: [],
  })
  const [dialogOpen, setDialogOpen] = useState(false)

  const { toast } = useToast()
  const { user } = useAuth()

  const { data: qualityChecks = [], isLoading: checksLoading } = useQuery({
    queryKey: ["/api/quality-checks"],
  })

  const { data: deals = [] } = useQuery({
    queryKey: ["/api/deals"],
  })

  const { data: inventory = [] } = useQuery({
    queryKey: ["/api/inventory"],
  })

  const createQualityCheckMutation = useMutation({
    mutationFn: (data: QualityCheckData) => apiRequest("POST", "/api/quality-checks", { ...data, checkedBy: user?.id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quality-checks"] })
      toast({
        title: "Success",
        description: "Quality check recorded successfully",
      })
      setDialogOpen(false)
      setCheckData({
        testResults: {},
        weighbridgeData: {},
        inspectionImages: [],
      })
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record quality check",
        variant: "destructive",
      })
    },
  })

  const handleSubmit = () => {
    if (!checkData.dealId && !checkData.inventoryId) {
      toast({
        title: "Error",
        description: "Please select either a deal or inventory item",
        variant: "destructive",
      })
      return
    }

    createQualityCheckMutation.mutate(checkData as QualityCheckData)
  }

  const handleWeighbridgeData = (field: string, value: string) => {
    setCheckData((prev) => ({
      ...prev,
      weighbridgeData: {
        ...prev.weighbridgeData,
        [field]: value,
      },
    }))
  }

  const handleTestResults = (field: string, value: string) => {
    setCheckData((prev) => ({
      ...prev,
      testResults: {
        ...prev.testResults,
        [field]: value,
      },
    }))
  }

  const getPurityBadge = (purity: string | number) => {
    const purityNum = typeof purity === "string" ? Number.parseFloat(purity) : purity
    if (purityNum >= 95) {
      return <Badge className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">Excellent</Badge>
    } else if (purityNum >= 85) {
      return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">Good</Badge>
    } else if (purityNum >= 70) {
      return <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">Fair</Badge>
    } else {
      return <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0">Poor</Badge>
    }
  }

  const getRadiationStatus = (radiation: string) => {
    const level = radiation?.toLowerCase()
    if (level?.includes("safe") || level?.includes("normal")) {
      return <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">Safe</Badge>
    } else if (level?.includes("elevated") || level?.includes("medium")) {
      return <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white border-0">Elevated</Badge>
    } else if (level?.includes("high") || level?.includes("danger")) {
      return <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0">High Risk</Badge>
    }
    return (
      <Badge variant="outline" className="border-gray-300">
        Unknown
      </Badge>
    )
  }

  if (checksLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-gray-700">Loading quality checks...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-cyan-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <TestTube className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                Quality Control Center
              </h1>
              <p className="text-gray-600 mt-1">Record and manage quality checks for scrap metal inventory</p>
            </div>
          </div>

          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <ClipboardCheck className="mr-2 h-4 w-4" />
                New Quality Check
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-0 shadow-2xl">
              <DialogHeader className="pb-6 border-b border-gray-100">
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                  <TestTube className="w-6 h-6 text-indigo-600" />
                  Record Quality Check
                </DialogTitle>
                <DialogDescription className="text-gray-600">
                  Record comprehensive quality test results and weighbridge data
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-6">
                {/* Selection Section */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
                      <Hash className="w-5 h-5" />
                      Item Selection
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="deal" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Package className="w-4 h-4" />
                          Deal (Optional)
                        </Label>
                        <Select
                          value={checkData.dealId?.toString() || ""}
                          onValueChange={(value) =>
                            setCheckData((prev) => ({
                              ...prev,
                              dealId: value ? Number.parseInt(value) : undefined,
                              inventoryId: undefined,
                            }))
                          }
                        >
                          <SelectTrigger className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400">
                            <SelectValue placeholder="Select deal" />
                          </SelectTrigger>
                          <SelectContent>
                            {deals.map((deal: Deal) => (
                              <SelectItem key={deal.id} value={deal.id.toString()}>
                                {deal.dealId}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="inventory"
                          className="text-sm font-medium text-gray-700 flex items-center gap-2"
                        >
                          <Package className="w-4 h-4" />
                          Inventory Item (Optional)
                        </Label>
                        <Select
                          value={checkData.inventoryId?.toString() || ""}
                          onValueChange={(value) =>
                            setCheckData((prev) => ({
                              ...prev,
                              inventoryId: value ? Number.parseInt(value) : undefined,
                              dealId: undefined,
                            }))
                          }
                        >
                          <SelectTrigger className="bg-white/80 backdrop-blur-sm border-blue-200 focus:border-blue-400">
                            <SelectValue placeholder="Select inventory" />
                          </SelectTrigger>
                          <SelectContent>
                            {inventory.map((item: Inventory) => (
                              <SelectItem key={item.id} value={item.id.toString()}>
                                {item.itemId} - {item.metalType}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Weight Measurements */}
                <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-emerald-800 flex items-center gap-2">
                      <Scale className="w-5 h-5" />
                      Weight Measurements
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="grossWeight" className="text-sm font-medium text-gray-700">
                          Gross Weight (kg)
                        </Label>
                        <Input
                          id="grossWeight"
                          type="number"
                          step="0.01"
                          value={checkData.grossWeight || ""}
                          onChange={(e) => setCheckData((prev) => ({ ...prev, grossWeight: e.target.value }))}
                          placeholder="0.00"
                          className="bg-white/80 backdrop-blur-sm border-emerald-200 focus:border-emerald-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="netWeight" className="text-sm font-medium text-gray-700">
                          Net Weight (kg)
                        </Label>
                        <Input
                          id="netWeight"
                          type="number"
                          step="0.01"
                          value={checkData.netWeight || ""}
                          onChange={(e) => setCheckData((prev) => ({ ...prev, netWeight: e.target.value }))}
                          placeholder="0.00"
                          className="bg-white/80 backdrop-blur-sm border-emerald-200 focus:border-emerald-400"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quality Metrics */}
                <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-purple-800 flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Quality Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="moisture" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Droplets className="w-4 h-4" />
                          Moisture (%)
                        </Label>
                        <Input
                          id="moisture"
                          type="number"
                          step="0.01"
                          value={checkData.moisture || ""}
                          onChange={(e) => setCheckData((prev) => ({ ...prev, moisture: e.target.value }))}
                          placeholder="0.00"
                          className="bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="radiation"
                          className="text-sm font-medium text-gray-700 flex items-center gap-2"
                        >
                          <Radiation className="w-4 h-4" />
                          Radiation Level
                        </Label>
                        <Input
                          id="radiation"
                          value={checkData.radiation || ""}
                          onChange={(e) => setCheckData((prev) => ({ ...prev, radiation: e.target.value }))}
                          placeholder="Enter radiation level"
                          className="bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="purityPercent"
                          className="text-sm font-medium text-gray-700 flex items-center gap-2"
                        >
                          <Award className="w-4 h-4" />
                          Purity Percentage (%)
                        </Label>
                        <Input
                          id="purityPercent"
                          type="number"
                          step="0.01"
                          value={checkData.purityPercent || ""}
                          onChange={(e) => setCheckData((prev) => ({ ...prev, purityPercent: e.target.value }))}
                          placeholder="0.00"
                          className="bg-white/80 backdrop-blur-sm border-purple-200 focus:border-purple-400"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Weighbridge Data */}
                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-amber-800 flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      Weighbridge Data
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Vehicle Weight (kg)</Label>
                        <Input
                          placeholder="Vehicle Weight (kg)"
                          value={checkData.weighbridgeData?.vehicleWeight || ""}
                          onChange={(e) => handleWeighbridgeData("vehicleWeight", e.target.value)}
                          className="bg-white/80 backdrop-blur-sm border-amber-200 focus:border-amber-400"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Load Weight (kg)</Label>
                        <Input
                          placeholder="Load Weight (kg)"
                          value={checkData.weighbridgeData?.loadWeight || ""}
                          onChange={(e) => handleWeighbridgeData("loadWeight", e.target.value)}
                          className="bg-white/80 backdrop-blur-sm border-amber-200 focus:border-amber-400"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Test Results */}
                <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200/50 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-cyan-800 flex items-center gap-2">
                      <Beaker className="w-5 h-5" />
                      Chemical Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Carbon Content (%)"
                        value={checkData.testResults?.carbonContent || ""}
                        onChange={(e) => handleTestResults("carbonContent", e.target.value)}
                        className="bg-white/80 backdrop-blur-sm border-cyan-200 focus:border-cyan-400"
                      />
                      <Input
                        placeholder="Sulfur Content (%)"
                        value={checkData.testResults?.sulfurContent || ""}
                        onChange={(e) => handleTestResults("sulfurContent", e.target.value)}
                        className="bg-white/80 backdrop-blur-sm border-cyan-200 focus:border-cyan-400"
                      />
                      <Input
                        placeholder="Phosphorus Content (%)"
                        value={checkData.testResults?.phosphorusContent || ""}
                        onChange={(e) => handleTestResults("phosphorusContent", e.target.value)}
                        className="bg-white/80 backdrop-blur-sm border-cyan-200 focus:border-cyan-400"
                      />
                      <Input
                        placeholder="Manganese Content (%)"
                        value={checkData.testResults?.manganeseContent || ""}
                        onChange={(e) => handleTestResults("manganeseContent", e.target.value)}
                        className="bg-white/80 backdrop-blur-sm border-cyan-200 focus:border-cyan-400"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <DialogFooter className="pt-6 border-t border-gray-100">
                <Button
                  onClick={handleSubmit}
                  disabled={createQualityCheckMutation.isPending}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8"
                >
                  {createQualityCheckMutation.isPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Recording...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Record Quality Check
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Quality Checks List */}
        <div className="space-y-6">
          {qualityChecks.length === 0 ? (
            <Card className="bg-white/70 backdrop-blur-xl border-0 shadow-xl">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <TestTube className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Quality Checks Found</h3>
                <p className="text-gray-600 mb-6">
                  Start by recording your first quality check to track material standards.
                </p>
                <Button
                  onClick={() => setDialogOpen(true)}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white"
                >
                  <ClipboardCheck className="w-4 h-4 mr-2" />
                  Record First Quality Check
                </Button>
              </CardContent>
            </Card>
          ) : (
            qualityChecks.map((check: QualityCheck) => (
              <Card
                key={check.id}
                className="bg-white/70 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    {/* Header Info */}
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-900">Quality Check #{check.id}</h3>
                          {check.purityPercent && getPurityBadge(check.purityPercent)}
                          {check.radiation && getRadiationStatus(check.radiation)}
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Hash className="w-4 h-4" />
                            <span>
                              {check.dealId
                                ? `Deal: ${deals.find((d: Deal) => d.id === check.dealId)?.dealId}`
                                : check.inventoryId
                                  ? `Item: ${inventory.find((i: Inventory) => i.id === check.inventoryId)?.itemId}`
                                  : "No reference"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(check.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>Inspector #{check.checkedBy}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:min-w-[400px]">
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-xl border border-blue-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Scale className="w-4 h-4 text-blue-600" />
                          <span className="text-xs font-medium text-blue-800">Gross Weight</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{check.grossWeight || "N/A"} kg</p>
                      </div>

                      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-3 rounded-xl border border-emerald-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Scale className="w-4 h-4 text-emerald-600" />
                          <span className="text-xs font-medium text-emerald-800">Net Weight</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{check.netWeight || "N/A"} kg</p>
                      </div>

                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-xl border border-purple-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Award className="w-4 h-4 text-purple-600" />
                          <span className="text-xs font-medium text-purple-800">Purity</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{check.purityPercent || "N/A"}%</p>
                      </div>

                      <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-3 rounded-xl border border-amber-100">
                        <div className="flex items-center gap-2 mb-1">
                          <Droplets className="w-4 h-4 text-amber-600" />
                          <span className="text-xs font-medium text-amber-800">Moisture</span>
                        </div>
                        <p className="text-sm font-bold text-gray-900">{check.moisture || "N/A"}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  {(check.testResults || check.weighbridgeData) && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {check.testResults && Object.keys(check.testResults).length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              <Beaker className="w-4 h-4 text-cyan-600" />
                              Chemical Analysis
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              {Object.entries(check.testResults).map(([key, value]) => (
                                <div key={key} className="bg-gray-50 p-2 rounded-lg">
                                  <p className="text-xs text-gray-600 capitalize">
                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                  </p>
                                  <p className="text-sm font-medium text-gray-900">{value}%</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {check.weighbridgeData && Object.keys(check.weighbridgeData).length > 0 && (
                          <div className="space-y-3">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              <Truck className="w-4 h-4 text-amber-600" />
                              Weighbridge Data
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              {Object.entries(check.weighbridgeData).map(([key, value]) => (
                                <div key={key} className="bg-gray-50 p-2 rounded-lg">
                                  <p className="text-xs text-gray-600 capitalize">
                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                  </p>
                                  <p className="text-sm font-medium text-gray-900">{value} kg</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
