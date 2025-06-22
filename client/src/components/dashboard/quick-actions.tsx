import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Package, Users, FileText, Truck, DollarSign, Settings } from "lucide-react";
import CreateDealModal from "@/components/modals/create-deal-modal";
import AddInventoryModal from "@/components/modals/add-inventory-modal";
import AddPartnerModal from "@/components/modals/add-partner-modal";

export default function QuickActions() {
  const [showCreateDeal, setShowCreateDeal] = useState(false);
  const [showAddInventory, setShowAddInventory] = useState(false);
  const [showAddPartner, setShowAddPartner] = useState(false);

  const quickActions = [
    {
      title: "New Deal",
      description: "Create a new export/import deal",
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
      action: () => setShowCreateDeal(true),
    },
    {
      title: "Add Inventory",
      description: "Add new scrap metal items",
      icon: Package,
      color: "bg-green-100 text-green-600",
      action: () => setShowAddInventory(true),
    },
    {
      title: "Add Partner",
      description: "Register new supplier or buyer",
      icon: Users,
      color: "bg-purple-100 text-purple-600",
      action: () => setShowAddPartner(true),
    },
    {
      title: "Record Payment",
      description: "Add payment transaction",
      icon: DollarSign,
      color: "bg-yellow-100 text-yellow-600",
      action: () => window.location.href = "/finance",
    },
  ];

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 justify-start text-left"
                onClick={action.action}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${action.color}`}>
                    <action.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium">{action.title}</div>
                    <div className="text-sm text-gray-500">{action.description}</div>
                  </div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <CreateDealModal open={showCreateDeal} onOpenChange={setShowCreateDeal} />
      <AddInventoryModal open={showAddInventory} onOpenChange={setShowAddInventory} />
      <AddPartnerModal open={showAddPartner} onOpenChange={setShowAddPartner} />
    </>
  );
}