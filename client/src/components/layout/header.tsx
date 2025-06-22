import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth"; // 👈 import auth hook
import { Bell, LogOut } from "lucide-react";
import { useLocation } from "wouter";

const getPageTitle = (path: string): string => {
  const titles: Record<string, string> = {
    "/": "Dashboard",
    "/dashboard": "Dashboard", 
    "/inventory": "Inventory Management",
    "/partners": "Partners Management",
    "/deals": "Deal Management",
    "/shipments": "Shipment Tracking",
    "/finance": "Finance Management", 
    "/reports": "Reports & Analytics",
    "/users": "User Management",
  };
  
  return titles[path] || "ScrapFlow";
};

export default function Header() {
  const [location] = useLocation();
  const { logout } = useAuth(); // 👈 get logout function

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long", 
    day: "numeric"
  });

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 h-16 flex items-center justify-between px-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-800">
          {getPageTitle(location)}
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </Button>

        {/* Date */}
        <div className="text-sm text-gray-600">
          {currentDate}
        </div>

        {/* Logout */}
        <Button
          variant="ghost"
          size="icon"
          onClick={logout}
          title="Logout"
        >
          <LogOut className="w-5 h-5 text-gray-700" />
        </Button>
      </div>
    </header>
  );
}
