import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle,
  DollarSign,
  FileOutput,
  FileText,
  Package,
  Plus,
  Ship,
  TrendingUp,
  UserPlus,
  Recycle,
  Activity,
  BarChart3
} from "lucide-react";

import AddInventoryModal from "@/components/modals/add-inventory-modal";
import AddPartnerModal from "@/components/modals/add-partner-modal";
import CreateDealModal from "@/components/modals/create-deal-modal";
import ReportGenerationModal from "@/components/modals/report-generation-modal";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";

interface DashboardStats {
  totalInventory: number;
  activeDeals: number;
  monthlyRevenue: number;
  pendingShipments: number;
  lifecycleStages: Record<string, number>;
  recentLifecycleUpdates: number;
  totalLifecycleUpdates: number;
}

interface LifecycleStats {
  collection: number;
  sorting: number;
  cleaning: number;
  melting: number;
  distribution: number;
  recycled: number;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: inventory } = useQuery({
    queryKey: ["/api/inventory"],
  });

  const { data: payments } = useQuery({
    queryKey: ["/api/payments"],
  });

  const { data: lifecycleUpdates } = useQuery({
    queryKey: ["/api/lifecycle-updates"],
  });

  // Calculate lifecycle statistics with real-time data
  const lifecycleStats: LifecycleStats = {
    collection: stats?.lifecycleStages?.collection || 0,
    sorting: stats?.lifecycleStages?.sorting || 0,
    cleaning: stats?.lifecycleStages?.cleaning || 0,
    melting: stats?.lifecycleStages?.melting || 0,
    distribution: stats?.lifecycleStages?.distribution || 0,
    recycled: stats?.lifecycleStages?.recycled || 0,
  };



  const recentActivities = [
    {
      id: 1,
      icon: Plus,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-100",
      title: "New steel batch added",
      time: "2 hours ago",
    },
    {
      id: 2,
      icon: CheckCircle,
      iconColor: "text-green-600",
      iconBg: "bg-green-100",
      title: "Deal #D-2024-001 confirmed",
      time: "4 hours ago",
    },
    {
      id: 3,
      icon: Ship,
      iconColor: "text-yellow-600",
      iconBg: "bg-yellow-100",
      title: "Shipment departed port",
      time: "6 hours ago",
    },
    {
      id: 4,
      icon: UserPlus,
      iconColor: "text-purple-600",
      iconBg: "bg-purple-100",
      title: "New partner registered",
      time: "1 day ago",
    },
  ];

  const StatCard = ({ icon: Icon, title, value, subtitle, trend }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            {isLoading ? (
              <Skeleton className="h-8 w-20 mt-1" />
            ) : (
              <p className="text-3xl font-bold text-gray-800">{value}</p>
            )}
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1 flex items-center">
                {trend && <TrendingUp className="w-4 h-4 mr-1" />}
                {subtitle}
              </p>
            )}
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Package}
          title="Total Inventory"
          value={stats?.totalInventory || 0}
          subtitle="+12.5% from last month"
          trend={true}
        />
        <StatCard
          icon={FileText}
          title="Active Deals"
          value={stats?.activeDeals || 0}
          subtitle="+8.2% from last month"
          trend={true}
        />
        <StatCard
          icon={DollarSign}
          title="Monthly Revenue"
          value={`$${((stats?.monthlyRevenue || 0) / 1000000).toFixed(1)}M`}
          subtitle="+15.8% from last month"
          trend={true}
        />
        <StatCard
          icon={Ship}
          title="Pending Shipments"
          value={stats?.pendingShipments || 0}
          subtitle={`${Math.min(5, stats?.pendingShipments || 0)} require attention`}
        />
      </div>

      {/* Revenue and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">₹{((stats?.monthlyRevenue || 0) / 1000000).toFixed(1)}M</div>
                  <div className="text-sm text-gray-600">Monthly Revenue</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats?.completedDeals || 0}</div>
                  <div className="text-sm text-gray-600">Completed Deals</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">₹{((stats?.totalValue || 0) / 100000).toFixed(1)}L</div>
                  <div className="text-sm text-gray-600">Total Deal Value</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats?.activePartnerships || 0}</div>
                  <div className="text-sm text-gray-600">Active Partners</div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Revenue Growth</span>
                  <span className="text-green-600 font-medium">+15.8% from last month</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`w-8 h-8 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-4 h-4 ${activity.iconColor}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                      <p className="text-xs text-gray-600">{activity.time}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scrap Lifecycle Management - Admin View */}
      {user?.role === 'admin' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lifecycle Stages Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Recycle className="w-5 h-5" />
                <span>Scrap Lifecycle Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{lifecycleStats.collection}</div>
                    <div className="text-xs text-gray-600">Collection</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-50 rounded-lg">
                    <div className="text-xl font-bold text-yellow-600">{lifecycleStats.sorting}</div>
                    <div className="text-xs text-gray-600">Sorting</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-xl font-bold text-orange-600">{lifecycleStats.cleaning}</div>
                    <div className="text-xs text-gray-600">Cleaning</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-xl font-bold text-red-600">{lifecycleStats.melting}</div>
                    <div className="text-xs text-gray-600">Melting</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{lifecycleStats.distribution}</div>
                    <div className="text-xs text-gray-600">Distribution</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">{lifecycleStats.recycled}</div>
                    <div className="text-xs text-gray-600">Recycled</div>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Total Inventory Items</span>
                    <span className="font-medium">{stats?.totalInventory || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Lifecycle Updates */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Recent Lifecycle Updates</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lifecycleUpdates?.slice(0, 6).map((update: any) => (
                  <div key={update.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">
                          {update.previousStage ? `${update.previousStage} → ${update.newStage}` : update.newStage}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {update.status}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Inventory ID: {update.inventoryId} • {new Date(update.updatedAt).toLocaleDateString()}
                      </div>
                      {update.inspectionNotes && (
                        <div className="text-xs text-gray-500 mt-1 truncate">
                          {update.inspectionNotes}
                        </div>
                      )}
                    </div>
                  </div>
                )) || (
                  <div className="text-center text-gray-500 py-4">
                    No recent lifecycle updates
                  </div>
                )}
                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Recent Updates (7 days)</span>
                    <span className="font-medium">{stats?.recentLifecycleUpdates || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-gray-600">Total Updates</span>
                    <span className="font-medium">{stats?.totalLifecycleUpdates || 0}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2 border-dashed hover:border-primary hover:bg-blue-50"
              onClick={() => setShowAddInventory(true)}
            >
              <Plus className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Add Inventory</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2 border-dashed hover:border-primary hover:bg-blue-50"
              onClick={() => setShowCreateDeal(true)}
            >
              <FileText className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Create Deal</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2 border-dashed hover:border-primary hover:bg-blue-50"
              onClick={() => setShowAddPartner(true)}
            >
              <UserPlus className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Add Partner</span>
            </Button>
            
            <Button
              variant="outline"
              className="h-24 flex flex-col items-center justify-center space-y-2 border-dashed hover:border-primary hover:bg-blue-50"
              onClick={() => setShowReportModal(true)}
            >
              <FileOutput className="w-6 h-6 text-primary" />
              <span className="text-sm font-medium">Generate Report</span>
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
  );
}
