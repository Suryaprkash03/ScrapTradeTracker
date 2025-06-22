import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, TrendingUp, FileText, Download, Calendar } from "lucide-react";
import { generateReport } from "@/lib/reportGenerator";
import { useToast } from "@/hooks/use-toast";
import type { Deal, Inventory, Partner, Shipment } from "@shared/schema";

export default function ReportsPage() {
  const { toast } = useToast();
  const { data: deals, isLoading: dealsLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  const { data: inventory, isLoading: inventoryLoading } = useQuery<Inventory[]>({
    queryKey: ["/api/inventory"],
  });

  const { data: partners, isLoading: partnersLoading } = useQuery<Partner[]>({
    queryKey: ["/api/partners"],
  });

  const { data: shipments, isLoading: shipmentsLoading } = useQuery<Shipment[]>({
    queryKey: ["/api/shipments"],
  });

  const isLoading = dealsLoading || inventoryLoading || partnersLoading || shipmentsLoading;

  // Calculate analytics
  const monthlyVolume = inventory?.reduce((total, item) => total + parseFloat(item.quantity), 0) || 0;
  const topBuyers = partners?.filter(p => p.type === 'buyer' || p.type === 'both').slice(0, 5) || [];
  const profitPerDeal = deals?.map(deal => ({
    id: deal.dealId,
    profit: parseFloat(deal.totalValue) * 0.15, // Assuming 15% profit margin
  })) || [];

  const metalTypeBreakdown = inventory?.reduce((acc, item) => {
    acc[item.metalType] = (acc[item.metalType] || 0) + parseFloat(item.quantity);
    return acc;
  }, {} as Record<string, number>) || {};

  const handleGenerateReport = async (reportType: string) => {
    try {
      let type = '';
      switch (reportType) {
        case 'Inventory Summary':
          type = 'inventory';
          break;
        case 'Financial Report':
          type = 'financial';
          break;
        case 'Partner Analysis':
          type = 'partners';
          break;
        case 'Shipment Report':
          type = 'operations';
          break;
        case 'Summary':
          type = 'inventory'; // Default to inventory for summary
          break;
        default:
          type = 'inventory';
      }
      
      await generateReport(type);
      toast({
        title: "Report Generated",
        description: `${reportType} has been downloaded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Reports & Analytics</h1>
        <div className="flex space-x-3">
          <Select>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => handleGenerateReport("Summary")}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Monthly Volume</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-800">{monthlyVolume.toLocaleString()} T</p>
                )}
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +12.5%
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Partners</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-800">{partners?.filter(p => p.status === 'active').length || 0}</p>
                )}
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +8.2%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue Growth</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-800">+15.8%</p>
                )}
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  vs last month
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Deal Size</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-20 mt-1" />
                ) : (
                  <p className="text-2xl font-bold text-gray-800">
                    ₹{deals?.length ? Math.round(deals.reduce((sum, d) => sum + parseFloat(d.totalValue), 0) * 83 / deals.length / 100000) : 0}L
                  </p>
                )}
                <p className="text-sm text-green-600 mt-1 flex items-center">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  +5.4%
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Scrap Volume */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Scrap Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(metalTypeBreakdown).map(([type, quantity]) => (
                  <div key={type} className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">{quantity.toLocaleString()} T</div>
                    <div className="text-sm text-gray-600">{type}</div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Total Volume</span>
                  <span className="text-lg font-bold text-gray-900">{monthlyVolume.toLocaleString()} T</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Buyers Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Top Buyers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))
              ) : topBuyers.length > 0 ? (
                topBuyers.map((buyer, index) => (
                  <div key={buyer.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-white text-xs font-medium">{index + 1}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-800">{buyer.companyName}</span>
                    </div>
                    <span className="text-sm text-gray-600">{buyer.country}</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No buyer data available</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Profit Analysis */}
        <Card>
          <CardHeader>
            <CardTitle>Profit Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                {profitPerDeal.slice(0, 5).map((deal) => (
                  <div key={deal.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-600">{deal.id}</span>
                    <span className="text-sm font-bold text-green-600">₹{(deal.profit * 83 / 100000).toFixed(1)}L</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Avg Profit/Deal</span>
                  <span className="text-lg font-bold text-gray-900">
                    ₹{profitPerDeal.length > 0 ? 
                      ((profitPerDeal.reduce((sum, d) => sum + d.profit, 0) / profitPerDeal.length * 83) / 100000).toFixed(1) : 
                      '0.0'}L
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Metal Type Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Metal Type Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))
              ) : Object.keys(metalTypeBreakdown).length > 0 ? (
                Object.entries(metalTypeBreakdown).map(([type, quantity]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-800">{type}</span>
                    <span className="text-sm text-gray-600">{quantity.toLocaleString()} T</span>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-500 py-8">No metal type data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleGenerateReport("Inventory Summary")}
            >
              <FileText className="w-6 h-6 text-primary" />
              <span className="text-sm">Inventory Summary</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleGenerateReport("Financial Report")}
            >
              <FileText className="w-6 h-6 text-primary" />
              <span className="text-sm">Financial Report</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleGenerateReport("Partner Analysis")}
            >
              <FileText className="w-6 h-6 text-primary" />
              <span className="text-sm">Partner Analysis</span>
            </Button>

            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center space-y-2"
              onClick={() => handleGenerateReport("Shipment Report")}
            >
              <FileText className="w-6 h-6 text-primary" />
              <span className="text-sm">Shipment Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
