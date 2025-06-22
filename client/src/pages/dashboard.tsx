"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { useQuery } from "@tanstack/react-query"
import {
  Activity,
  ArrowUpRight,
  Calendar,
  CheckCircle,
  Clock,
  DollarSign,
  FileOutput,
  FileText,
  Globe,
  MoreHorizontal,
  Package,
  Plus,
  Recycle,
  Ship,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  UserPlus,
  Zap,
} from "lucide-react"

import AddInventoryModal from "@/components/modals/add-inventory-modal"
import AddPartnerModal from "@/components/modals/add-partner-modal"
import CreateDealModal from "@/components/modals/create-deal-modal"
import ReportGenerationModal from "@/components/modals/report-generation-modal"
import { useAuth } from "@/hooks/use-auth"
import { useState } from "react"

interface DashboardStats {
  totalInventory: number
  activeDeals: number
  monthlyRevenue: number
  pendingShipments: number
  lifecycleStages: Record<string, number>
  recentLifecycleUpdates: number
  totalLifecycleUpdates: number
  completedDeals?: number
  totalValue?: number
  activePartnerships?: number
}

interface LifecycleStats {
  collection: number
  sorting: number
  cleaning: number
  melting: number
  distribution: number
  recycled: number
}

export default function Dashboard() {
  const { user } = useAuth()
  const [showAddInventory, setShowAddInventory] = useState(false)
  const [showAddPartner, setShowAddPartner] = useState(false)
  const [showCreateDeal, setShowCreateDeal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  })
  const { data: inventory } = useQuery({
    queryKey: ["/api/inventory"],
  })
  const { data: payments } = useQuery({
    queryKey: ["/api/payments"],
  })
  const { data: lifecycleUpdates } = useQuery({
    queryKey: ["/api/lifecycle-updates"],
  })

  // Calculate lifecycle statistics with real-time data
  const lifecycleStats: LifecycleStats = {
    collection: stats?.lifecycleStages?.collection || 0,
    sorting: stats?.lifecycleStages?.sorting || 0,
    cleaning: stats?.lifecycleStages?.cleaning || 0,
    melting: stats?.lifecycleStages?.melting || 0,
    distribution: stats?.lifecycleStages?.distribution || 0,
    recycled: stats?.lifecycleStages?.recycled || 0,
  }

  const totalLifecycleItems = Object.values(lifecycleStats).reduce((sum, count) => sum + count, 0)

  const recentActivities = [
    {
      id: 1,
      icon: Plus,
      iconColor: "text-violet-600",
      iconBg: "bg-gradient-to-br from-violet-50 to-violet-100",
      title: "New steel batch added",
      description: "2.5 tons of high-grade steel",
      time: "2 hours ago",
      type: "inventory",
      priority: "high",
    },
    {
      id: 2,
      icon: CheckCircle,
      iconColor: "text-emerald-600",
      iconBg: "bg-gradient-to-br from-emerald-50 to-emerald-100",
      title: "Deal #D-2024-001 confirmed",
      description: "$2.4M contract finalized",
      time: "4 hours ago",
      type: "deal",
      priority: "medium",
    },
    {
      id: 3,
      icon: Ship,
      iconColor: "text-amber-600",
      iconBg: "bg-gradient-to-br from-amber-50 to-amber-100",
      title: "Shipment departed port",
      description: "Container #CNT-789 en route",
      time: "6 hours ago",
      type: "shipment",
      priority: "medium",
    },
    {
      id: 4,
      icon: UserPlus,
      iconColor: "text-rose-600",
      iconBg: "bg-gradient-to-br from-rose-50 to-rose-100",
      title: "New partner registered",
      description: "Steel Industries Ltd. verified",
      time: "1 day ago",
      type: "partner",
      priority: "low",
    },
  ]

  const StatCard = ({ icon: Icon, title, value, subtitle, trend, trendValue, gradient, loading = false }: any) => {
    return (
      <Card className="relative overflow-hidden border-0 bg-white/60  shadow-lg hover:shadow-xl transition-all duration-300 group">
        <div
          className={`absolute inset-0 ${gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}
        />
        <CardContent className="p-6 relative">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <p className="text-sm font-semibold text-slate-600 tracking-wide uppercase">{title}</p>
                {trend && (
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                      trend === "up"
                        ? "bg-emerald-100/80 text-emerald-700 border border-emerald-200/50"
                        : "bg-rose-100/80 text-rose-700 border border-rose-200/50"
                    }`}
                  >
                    {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {trendValue}
                  </div>
                )}
              </div>
              {loading ? (
                <Skeleton className="h-9 w-28 mb-2" />
              ) : (
                <p className="text-3xl font-bold text-slate-800 mb-2 tracking-tight">{value}</p>
              )}
              {subtitle && <p className="text-sm text-slate-500 font-medium">{subtitle}</p>}
            </div>
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
            >
              <Icon className="w-7 h-7 text-white drop-shadow-sm" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const lifecycleStages = [
    {
      name: "Collection",
      value: lifecycleStats.collection,
      gradient: "from-indigo-500 to-purple-600",
      bgGradient: "from-indigo-50 to-purple-50",
      textColor: "text-indigo-700",
      icon: Globe,
    },
    {
      name: "Sorting",
      value: lifecycleStats.sorting,
      gradient: "from-amber-500 to-orange-600",
      bgGradient: "from-amber-50 to-orange-50",
      textColor: "text-amber-700",
      icon: Target,
    },
    {
      name: "Cleaning",
      value: lifecycleStats.cleaning,
      gradient: "from-cyan-500 to-blue-600",
      bgGradient: "from-cyan-50 to-blue-50",
      textColor: "text-cyan-700",
      icon: Sparkles,
    },
    {
      name: "Melting",
      value: lifecycleStats.melting,
      gradient: "from-red-500 to-pink-600",
      bgGradient: "from-red-50 to-pink-50",
      textColor: "text-red-700",
      icon: Zap,
    },
    {
      name: "Distribution",
      value: lifecycleStats.distribution,
      gradient: "from-emerald-500 to-teal-600",
      bgGradient: "from-emerald-50 to-teal-50",
      textColor: "text-emerald-700",
      icon: Ship,
    },
    {
      name: "Recycled",
      value: lifecycleStats.recycled,
      gradient: "from-violet-500 to-purple-600",
      bgGradient: "from-violet-50 to-purple-50",
      textColor: "text-violet-700",
      icon: Recycle,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-violet-400/20 to-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-rose-400/10 to-pink-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative space-y-8 p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <div className="w-2 h-2 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full animate-pulse" />
            </div>
            <p className="text-slate-600 font-medium">
              Welcome back, <span className="text-slate-800 font-semibold">{user?.name || "User"}</span>. Here's your
              business overview.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm border-slate-200/60">
              <Calendar className="w-4 h-4 text-slate-600" />
              <span className="font-medium text-slate-700">
                {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </span>
            </Badge>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            icon={Package}
            title="Total Inventory"
            value={stats?.totalInventory?.toLocaleString() || 0}
            subtitle="Active items in stock"
            trend="up"
            trendValue="+12.5%"
            gradient="bg-gradient-to-br from-indigo-500 to-purple-600"
            loading={isLoading}
          />
          <StatCard
            icon={FileText}
            title="Active Deals"
            value={stats?.activeDeals || 0}
            subtitle="Ongoing negotiations"
            trend="up"
            trendValue="+8.2%"
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            loading={isLoading}
          />
          <StatCard
            icon={DollarSign}
            title="Monthly Revenue"
            value={`$${((stats?.monthlyRevenue || 0) / 1000000).toFixed(1)}M`}
            subtitle="Current month earnings"
            trend="up"
            trendValue="+15.8%"
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            loading={isLoading}
          />
          <StatCard
            icon={Ship}
            title="Pending Shipments"
            value={stats?.pendingShipments || 0}
            subtitle={`${Math.min(5, stats?.pendingShipments || 0)} need attention`}
            trend={stats?.pendingShipments && stats.pendingShipments > 10 ? "down" : "up"}
            trendValue="2 urgent"
            gradient="bg-gradient-to-br from-rose-500 to-pink-600"
            loading={isLoading}
          />
        </div>

        {/* Revenue and Activity */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
          {/* Revenue Summary */}
          <Card className="xl:col-span-3 border-0 bg-white/60 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-6">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  Revenue Overview
                </CardTitle>
                <Button variant="ghost" size="sm" className="hover:bg-slate-100/60">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="relative p-5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100/50 group hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="text-2xl font-bold text-indigo-700 mb-1">
                      ${((stats?.monthlyRevenue || 0) / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-sm text-indigo-600 font-semibold">Monthly Revenue</div>
                  </div>
                </div>
                <div className="relative p-5 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl border border-emerald-100/50 group hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="text-2xl font-bold text-emerald-700 mb-1">{stats?.completedDeals || 0}</div>
                    <div className="text-sm text-emerald-600 font-semibold">Completed Deals</div>
                  </div>
                </div>
                <div className="relative p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100/50 group hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="text-2xl font-bold text-amber-700 mb-1">
                      ${((stats?.totalValue || 0) / 100000).toFixed(1)}L
                    </div>
                    <div className="text-sm text-amber-600 font-semibold">Total Deal Value</div>
                  </div>
                </div>
                <div className="relative p-5 bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl border border-rose-100/50 group hover:shadow-lg transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-pink-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="text-2xl font-bold text-rose-700 mb-1">{stats?.activePartnerships || 0}</div>
                    <div className="text-sm text-rose-600 font-semibold">Active Partners</div>
                  </div>
                </div>
              </div>
              <div className="space-y-4 pt-6 border-t border-slate-200/60">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-xl border border-emerald-100/30">
                  <span className="text-sm font-semibold text-slate-700">Revenue Growth</span>
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-bold text-emerald-700">+15.8%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50/50 to-purple-50/50 rounded-xl border border-violet-100/30">
                  <span className="text-sm font-semibold text-slate-700">Deal Conversion Rate</span>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-violet-600" />
                    <span className="text-sm font-bold text-violet-700">68.2%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="xl:col-span-2 border-0 bg-white/60 backdrop-blur-sm shadow-lg">
            <CardHeader className="pb-6">
              <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50/60 transition-all duration-300 group border border-transparent hover:border-slate-200/40"
                    >
                      <div
                        className={`w-12 h-12 ${activity.iconBg} rounded-xl flex items-center justify-center flex-shrink-0 border border-white/50 shadow-sm group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className={`w-5 h-5 ${activity.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm font-semibold text-slate-800">{activity.title}</p>
                          <Badge
                            variant={activity.priority === "high" ? "default" : "secondary"}
                            className={`text-xs ml-2 ${
                              activity.priority === "high"
                                ? "bg-gradient-to-r from-rose-500 to-pink-600"
                                : activity.priority === "medium"
                                  ? "bg-gradient-to-r from-amber-500 to-orange-600"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {activity.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 mb-2 font-medium">{activity.description}</p>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <p className="text-xs text-slate-500">{activity.time}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scrap Lifecycle Management - Admin View */}
        {user?.role === "admin" && (
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* Lifecycle Stages Overview */}
            <Card className="xl:col-span-3 border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <Recycle className="w-4 h-4 text-white" />
                    </div>
                    <span>Scrap Lifecycle Overview</span>
                  </CardTitle>
                  <Badge className="gap-2 px-4 py-2 bg-gradient-to-r from-slate-100 to-slate-200 text-slate-700 hover:from-slate-200 hover:to-slate-300">
                    <Target className="w-3 h-3" />
                    {totalLifecycleItems.toLocaleString()} Total Items
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {lifecycleStages.map((stage, index) => {
                    const percentage = totalLifecycleItems > 0 ? (stage.value / totalLifecycleItems) * 100 : 0
                    const StageIcon = stage.icon
                    return (
                      <div
                        key={stage.name}
                        className={`relative p-5 bg-gradient-to-br ${stage.bgGradient} rounded-2xl border border-white/50 group hover:shadow-lg transition-all duration-300`}
                      >
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${stage.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
                        />
                        <div className="relative">
                          <div className="flex items-center justify-between mb-3">
                            <div
                              className={`w-10 h-10 bg-gradient-to-br ${stage.gradient} rounded-xl flex items-center justify-center shadow-sm`}
                            >
                              <StageIcon className="w-5 h-5 text-white" />
                            </div>
                            <span className={`text-xs font-bold ${stage.textColor} bg-white/60 px-2 py-1 rounded-full`}>
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className={`text-2xl font-bold ${stage.textColor} mb-1`}>
                            {stage.value.toLocaleString()}
                          </div>
                          <div className="text-sm font-semibold text-slate-600 mb-3">{stage.name}</div>
                          <Progress
                            value={percentage}
                            className="h-2"
                            style={{
                              background: `linear-gradient(to right, ${stage.gradient.replace("from-", "").replace("to-", ", ")})`,
                            }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="pt-6 border-t border-slate-200/60">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50/50 to-purple-50/50 rounded-xl border border-violet-100/30">
                    <span className="text-sm font-semibold text-slate-700">Processing Efficiency</span>
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-violet-600" />
                      <span className="text-sm font-bold text-violet-700">87.3%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Lifecycle Updates */}
            <Card className="xl:col-span-2 border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <span>Lifecycle Updates</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {lifecycleUpdates?.slice(0, 3).map((update: any) => (
                    <div
                      key={update.id}
                      className="p-4 bg-gradient-to-r from-slate-50/50 to-slate-100/50 rounded-xl border border-slate-200/40 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge className="text-xs bg-gradient-to-r from-indigo-500 to-purple-600">
                            {update.previousStage ? `${update.previousStage} → ${update.newStage}` : update.newStage}
                          </Badge>
                          <Badge
                            variant={update.status === "completed" ? "default" : "outline"}
                            className={`text-xs ${
                              update.status === "completed"
                                ? "bg-gradient-to-r from-emerald-500 to-teal-600"
                                : "border-slate-300 text-slate-600"
                            }`}
                          >
                            {update.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-2 text-xs text-slate-600">
                        <div className="flex items-center gap-2">
                          <Package className="w-3 h-3" />
                          <span className="font-medium">ID: {update.inventoryId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(update.updatedAt).toLocaleDateString()}</span>
                        </div>
                        {update.inspectionNotes && (
                          <div className="text-xs text-slate-500 mt-2 p-2 bg-white/60 rounded-lg border border-slate-200/40">
                            {update.inspectionNotes}
                          </div>
                        )}
                      </div>
                    </div>
                  )) || (
                    <div className="text-center text-slate-500 py-12">
                      <Activity className="w-12 h-12 mx-auto mb-4 opacity-30" />
                      <p className="text-sm font-medium">No recent updates</p>
                    </div>
                  )}
                  <div className="pt-4 border-t border-slate-200/60 space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-emerald-50/50 to-teal-50/50 rounded-lg border border-emerald-100/30">
                      <span className="text-sm font-semibold text-slate-700">Recent (7 days)</span>
                      <span className="font-bold text-emerald-700">{stats?.recentLifecycleUpdates || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-violet-50/50 to-purple-50/50 rounded-lg border border-violet-100/30">
                      <span className="text-sm font-semibold text-slate-700">Total Updates</span>
                      <span className="font-bold text-violet-700">{stats?.totalLifecycleUpdates || 0}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl font-bold text-slate-800 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <Button
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-indigo-200 hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group bg-white/40 backdrop-blur-sm"
                onClick={() => setShowAddInventory(true)}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Plus className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Add Inventory</span>
              </Button>

              <Button
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-emerald-200 hover:border-emerald-400 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 transition-all duration-300 group bg-white/40 backdrop-blur-sm"
                onClick={() => setShowCreateDeal(true)}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Create Deal</span>
              </Button>

              <Button
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-rose-200 hover:border-rose-400 hover:bg-gradient-to-br hover:from-rose-50 hover:to-pink-50 transition-all duration-300 group bg-white/40 backdrop-blur-sm"
                onClick={() => setShowAddPartner(true)}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Add Partner</span>
              </Button>

              <Button
                variant="outline"
                className="h-32 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-amber-200 hover:border-amber-400 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 transition-all duration-300 group bg-white/40 backdrop-blur-sm"
                onClick={() => setShowReportModal(true)}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <FileOutput className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-slate-700">Generate Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <AddInventoryModal open={showAddInventory} onOpenChange={setShowAddInventory} />
        <AddPartnerModal open={showAddPartner} onOpenChange={setShowAddPartner} />
        <CreateDealModal open={showCreateDeal} onOpenChange={setShowCreateDeal} />
        <ReportGenerationModal open={showReportModal} onOpenChange={setShowReportModal} />
      </div>
    </div>
  )
}
