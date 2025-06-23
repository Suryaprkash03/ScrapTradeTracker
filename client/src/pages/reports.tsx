"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { generateReport } from "@/lib/reportGenerator"
import type { Deal, Inventory, Partner, Shipment } from "@shared/schema"
import { useQuery } from "@tanstack/react-query"
import { BarChart3, DollarSign, Download, FileText, Package, TrendingUp, Users } from "lucide-react"

export default function ReportsPage() {
  const { toast } = useToast()
  const { data: deals, isLoading: dealsLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  })

  const { data: inventory, isLoading: inventoryLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  })

  const { data: partners, isLoading: partnersLoading } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  })

  const { data: shipments, isLoading: shipmentsLoading } = useQuery<Shipment[]>({
    queryKey: ["/api/shipments"],
  })

  const isLoading = dealsLoading || inventoryLoading || partnersLoading || shipmentsLoading

  // Calculate analytics
  const monthlyVolume = inventory?.reduce((total, item) => total + Number.parseFloat(item.quantity), 0) || 0
  const topBuyers = partners?.filter((p) => p.type === "buyer" || p.type === "both").slice(0, 5) || []
  const profitPerDeal =
    deals?.map((deal) => ({
      id: deal.dealId,
      profit: Number.parseFloat(deal.totalValue) * 0.15, // Assuming 15% profit margin
    })) || []

  const metalTypeBreakdown =
    inventory?.reduce(
      (acc, item) => {
        acc[item.metalType] = (acc[item.metalType] || 0) + Number.parseFloat(item.quantity)
        return acc
      },
      {} as Record<string, number>,
    ) || {}

  const handleGenerateReport = async (reportType: string) => {
    try {
      let type = ""
      switch (reportType) {
        case "Inventory Summary":
          type = "inventory"
          break
        case "Financial Report":
          type = "financial"
          break
        case "Partner Analysis":
          type = "partners"
          break
        case "Shipment Report":
          type = "operations"
          break
        case "Summary":
          type = "inventory" // Default to inventory for summary
          break
        default:
          type = "inventory"
      }

      await generateReport(type)
      toast({
        title: "Report Generated",
        description: `${reportType} has been downloaded successfully.`,
      })
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/10 to-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/10 to-teal-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative space-y-6 p-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-white/20 shadow-xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Reports & Analytics
                </h1>
                <p className="text-gray-600">Track performance and generate insights</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Select>
                <SelectTrigger className="w-40 bg-white/60 backdrop-blur-sm border-white/20">
                  <SelectValue placeholder="Time Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="1y">Last year</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={() => handleGenerateReport("Summary")}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Monthly Volume</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20 mt-2" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 mt-2">{monthlyVolume.toLocaleString()} T</p>
                  )}
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 font-medium">+12.5%</span>
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
                  <p className="text-sm font-medium text-gray-600">Active Partners</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-2" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      {partners?.filter((p) => p.status === "active").length || 0}
                    </p>
                  )}
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 font-medium">+8.2%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Revenue Growth</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16 mt-2" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 mt-2">+15.8%</p>
                  )}
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 font-medium">Strong growth</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Deal Size</p>
                  {isLoading ? (
                    <Skeleton className="h-8 w-20 mt-2" />
                  ) : (
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                      $
                      {deals?.length
                        ? Math.round(
                            (deals.reduce((sum, d) => sum + Number.parseFloat(d.totalValue), 0) * 83) /
                              deals.length /
                              100000,
                          )
                        : 0}
                      L
                    </p>
                  )}
                  <div className="flex items-center mt-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
                    <span className="text-sm text-emerald-600 font-medium">+5.4%</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Scrap Volume */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader className="border-b border-gray-100/50">
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Monthly Scrap Volume
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(metalTypeBreakdown).map(([type, quantity], index) => {
                    const gradients = [
                      "from-indigo-500 to-purple-600",
                      "from-blue-500 to-cyan-600",
                      "from-emerald-500 to-teal-600",
                      "from-amber-500 to-orange-600",
                    ]
                    const gradient = gradients[index % gradients.length]
                    return (
                      <div key={type} className={`p-4 bg-gradient-to-br ${gradient} rounded-xl text-white shadow-lg`}>
                        <div className="text-xl font-bold">{quantity.toLocaleString()} T</div>
                        <div className="text-sm opacity-90">{type}</div>
                      </div>
                    )
                  })}
                </div>
                <div className="pt-4 border-t border-gray-100/50">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">Total Volume</span>
                    <span className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      {monthlyVolume.toLocaleString()} T
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Buyers Chart */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader className="border-b border-gray-100/50">
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Top Buyers
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))
                ) : topBuyers.length > 0 ? (
                  topBuyers.map((buyer, index) => (
                    <div
                      key={buyer.id}
                      className="flex items-center justify-between p-3 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 rounded-xl transition-all duration-300"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white text-sm font-medium">{index + 1}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{buyer.companyName}</span>
                      </div>
                      <span className="text-sm text-gray-600 font-medium">{buyer.country}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-8">No buyer data available</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Profit Analysis */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader className="border-b border-gray-100/50">
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Profit Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  {profitPerDeal.slice(0, 5).map((deal) => (
                    <div
                      key={deal.id}
                      className="flex justify-between items-center p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl"
                    >
                      <span className="text-sm font-medium text-gray-700">{deal.id}</span>
                      <span className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        ${((deal.profit * 83) / 100000).toFixed(1)}L
                      </span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-gray-100/50">
                  <div className="flex justify-between items-center p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">Avg Profit/Deal</span>
                    <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                      $
                      {profitPerDeal.length > 0
                        ? (
                            ((profitPerDeal.reduce((sum, d) => sum + d.profit, 0) / profitPerDeal.length) * 83) /
                            100000
                          ).toFixed(1)
                        : "0.0"}
                      L
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metal Type Breakdown */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
            <CardHeader className="border-b border-gray-100/50">
              <CardTitle className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Metal Type Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-lg">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))
                ) : Object.keys(metalTypeBreakdown).length > 0 ? (
                  Object.entries(metalTypeBreakdown).map(([type, quantity], index) => {
                    const metalConfigs = {
                      Steel: {
                        gradient: "from-slate-500 to-gray-700",
                        bg: "from-slate-50 to-gray-50",
                        icon: "🔩",
                        percentage: ((quantity / monthlyVolume) * 100).toFixed(1),
                      },
                      Iron: {
                        gradient: "from-red-500 to-red-700",
                        bg: "from-red-50 to-red-100",
                        icon: "⚙️",
                        percentage: ((quantity / monthlyVolume) * 100).toFixed(1),
                      },
                      Copper: {
                        gradient: "from-orange-500 to-amber-600",
                        bg: "from-orange-50 to-amber-50",
                        icon: "🔶",
                        percentage: ((quantity / monthlyVolume) * 100).toFixed(1),
                      },
                      Aluminum: {
                        gradient: "from-blue-500 to-indigo-600",
                        bg: "from-blue-50 to-indigo-50",
                        icon: "⚡",
                        percentage: ((quantity / monthlyVolume) * 100).toFixed(1),
                      },
                      Brass: {
                        gradient: "from-yellow-500 to-yellow-700",
                        bg: "from-yellow-50 to-yellow-100",
                        icon: "🟡",
                        percentage: ((quantity / monthlyVolume) * 100).toFixed(1),
                      },
                    }

                    const config = metalConfigs[type as keyof typeof metalConfigs] || {
                      gradient: "from-gray-500 to-gray-700",
                      bg: "from-gray-50 to-gray-100",
                      icon: "⚪",
                      percentage: ((quantity / monthlyVolume) * 100).toFixed(1),
                    }

                    return (
                      <div
                        key={type}
                        className={`relative p-4 bg-gradient-to-r ${config.bg} rounded-xl border border-white/50 hover:shadow-lg transition-all duration-300 group overflow-hidden`}
                      >
                        {/* Progress bar background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                        <div className="relative flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`w-10 h-10 bg-gradient-to-br ${config.gradient} rounded-lg flex items-center justify-center shadow-md`}
                            >
                              <span className="text-lg">{config.icon}</span>
                            </div>
                            <div>
                              <span className="text-sm font-bold text-gray-900">{type}</span>
                              <div className="text-xs text-gray-600">{config.percentage}% of total</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span
                              className={`text-lg font-bold bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent`}
                            >
                              {quantity.toLocaleString()} T
                            </span>
                            <div className="w-20 h-2 bg-gray-200 rounded-full mt-1 overflow-hidden">
                              <div
                                className={`h-full bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-500`}
                                style={{
                                  width: `${Math.min(100, (quantity / Math.max(...Object.values(metalTypeBreakdown))) * 100)}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <p className="text-center text-gray-500 py-8">No metal type data available</p>
                )}

                {/* Summary section */}
                <div className="pt-4 border-t border-gray-200/50">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Total Volume</div>
                      <div className="text-lg font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        {monthlyVolume.toLocaleString()} T
                      </div>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg">
                      <div className="text-xs text-gray-600 mb-1">Metal Types</div>
                      <div className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                        {Object.keys(metalTypeBreakdown).length}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Reports */}
        <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-xl">
          <CardHeader className="border-b border-gray-100/50">
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Quick Reports
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-white/60 backdrop-blur-sm border-white/20 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 hover:border-indigo-300 transition-all duration-300 group"
                onClick={() => handleGenerateReport("Inventory Summary")}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-700 font-medium">Inventory Summary</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-white/60 backdrop-blur-sm border-white/20 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 hover:border-emerald-300 transition-all duration-300 group"
                onClick={() => handleGenerateReport("Financial Report")}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-700 font-medium">Financial Report</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-white/60 backdrop-blur-sm border-white/20 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50 hover:border-blue-300 transition-all duration-300 group"
                onClick={() => handleGenerateReport("Partner Analysis")}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-700 font-medium">Partner Analysis</span>
              </Button>

              <Button
                variant="outline"
                className="h-20 flex flex-col items-center justify-center space-y-2 bg-white/60 backdrop-blur-sm border-white/20 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 hover:border-amber-300 transition-all duration-300 group"
                onClick={() => handleGenerateReport("Shipment Report")}
              >
                <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm text-gray-700 font-medium">Shipment Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
