import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Package, 
  FileText, 
  DollarSign, 
  Ship, 
  Plus, 
  TrendingUp,
  Clock,
  CheckCircle,
  UserPlus,
  FileOutput,
  Recycle,
  Factory
} from "lucide-react";
import AddInventoryModal from "@/components/modals/add-inventory-modal";
import AddPartnerModal from "@/components/modals/add-partner-modal";
import CreateDealModal from "@/components/modals/create-deal-modal";
import { useState } from "react";

interface DashboardStats {
  totalInventory: number;
  activeDeals: number;
  monthlyRevenue: number;
  pendingShipments: number;
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
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const [showCreateDeal, setShowCreateDeal] = useState(false);

  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/stats"],
  });

  const { data: inventory } = useQuery({
    queryKey: ["/api/inventory"],
  });

  // Calculate lifecycle statistics
  const lifecycleStats: LifecycleStats = {
    collection: inventory?.filter((item: any) => item.lifecycleStage === 'collection').length || 0,
    sorting: inventory?.filter((item: any) => item.lifecycleStage === 'sorting').length || 0,
    cleaning: inventory?.filter((item: any) => item.lifecycleStage === 'cleaning').length || 0,
    melting: inventory?.filter((item: any) => item.lifecycleStage === 'melting').length || 0,
    distribution: inventory?.filter((item: any) => item.lifecycleStage === 'distribution').length || 0,
    recycled: inventory?.filter((item: any) => item.lifecycleStage === 'recycled').length || 0,
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

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Revenue Trend</CardTitle>
                <div className="flex space-x-2">
                  <Button variant="default" size="sm">7D</Button>
                  <Button variant="outline" size="sm">30D</Button>
                  <Button variant="outline" size="sm">90D</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                  <p>Revenue Chart</p>
                  <p className="text-sm">Chart implementation with Recharts</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
              onClick={() => alert("Report generation functionality would be implemented here")}
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
    </div>
  );
}
