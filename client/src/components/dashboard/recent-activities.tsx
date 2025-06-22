import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, FileText, Package, Users, DollarSign } from "lucide-react";
import type { Deal, Inventory, Partner, Payment } from "@shared/schema";

export default function RecentActivities() {
  const { data: deals, isLoading: dealsLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  const { data: inventory, isLoading: inventoryLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: partners, isLoading: partnersLoading } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  });

  const { data: payments, isLoading: paymentsLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments"],
  });

  const isLoading = dealsLoading || inventoryLoading || partnersLoading || paymentsLoading;

  // Combine and sort recent activities
  const recentActivities = [];

  if (deals) {
    deals.slice(0, 3).forEach(deal => {
      recentActivities.push({
        id: `deal-${deal.id}`,
        type: "deal",
        title: `New Deal Created`,
        description: `Deal ${deal.dealId} for ${deal.quantity} units`,
        time: new Date(deal.createdAt),
        icon: FileText,
        color: "text-blue-600",
      });
    });
  }

  if (inventory) {
    inventory.slice(0, 2).forEach(item => {
      recentActivities.push({
        id: `inventory-${item.id}`,
        type: "inventory",
        title: `Inventory Added`,
        description: `${item.metalType} - ${item.grade} (${item.quantity} ${item.unit})`,
        time: new Date(item.createdAt),
        icon: Package,
        color: "text-green-600",
      });
    });
  }

  if (partners) {
    partners.slice(0, 2).forEach(partner => {
      recentActivities.push({
        id: `partner-${partner.id}`,
        type: "partner",
        title: `Partner Added`,
        description: `${partner.companyName} - ${partner.type}`,
        time: new Date(partner.createdAt),
        icon: Users,
        color: "text-purple-600",
      });
    });
  }

  if (payments) {
    payments.slice(0, 2).forEach(payment => {
      recentActivities.push({
        id: `payment-${payment.id}`,
        type: "payment",
        title: `Payment Recorded`,
        description: `${payment.paymentType} - $${payment.totalAmount}`,
        time: new Date(payment.createdAt),
        icon: DollarSign,
        color: "text-yellow-600",
      });
    });
  }

  // Sort by time (most recent first)
  recentActivities.sort((a, b) => b.time.getTime() - a.time.getTime());

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Recent Activities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="flex items-center space-x-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))
          ) : recentActivities.length > 0 ? (
            recentActivities.slice(0, 8).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center`}>
                    <activity.icon className={`w-4 h-4 ${activity.color}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{activity.title}</p>
                    <p className="text-xs text-gray-500">{activity.description}</p>
                  </div>
                </div>
                <div className="text-xs text-gray-400">
                  {activity.time.toLocaleDateString()}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No recent activities</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}