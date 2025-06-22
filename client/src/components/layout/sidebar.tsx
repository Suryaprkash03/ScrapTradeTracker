import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getInitials } from "@/lib/auth";
import { hasPageAccess } from "@/lib/permissions";
import {
  BarChart3,
  CheckCircle,
  DollarSign,
  Factory,
  FileText,
  Handshake,
  LayoutDashboard,
  LogOut,
  Package,
  Recycle,
  Ship,
  Users
} from "lucide-react";
import { useLocation } from "wouter";

const allNavigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Admin Dashboard", href: "/admin-dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Scrap Lifecycle", href: "/scrap-lifecycle", icon: Recycle },
  { name: "Quality Check", href: "/quality-check", icon: CheckCircle },
  { name: "Partners", href: "/partners", icon: Handshake },
  { name: "Deals", href: "/deals", icon: FileText },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Shipments", href: "/shipments", icon: Ship },
  { name: "Finance", href: "/finance", icon: DollarSign },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  // { name: "Settings", href: "/settings", icon: Settings },
  { name: "User Management", href: "/users", icon: Users },
];

export default function Sidebar() {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  // Filter navigation based on user role
  const navigation = allNavigation.filter(item => 
    !user || hasPageAccess(user.role, item.href)
  );

  const handleNavigation = (href: string) => {
    setLocation(href);
  };

  const handleLogout = () => {
    logout();
  };

  if (!user) return null;

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-30">
      {/* Header */}
      <div className="flex items-center justify-center h-16 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Factory className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-800">ScrapFlow</span>
        </div>
      </div>
      
      {/* User Profile */}
      <div className="p-4">
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">{getInitials(user.name)}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
            <p className="text-xs text-gray-600 capitalize">{user.role.replace('_', ' ')}</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="px-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href || (location === "/" && item.href === "/dashboard");
          const Icon = item.icon;
          
          return (
            <Button
              key={item.name}
              variant="ghost"
              className={`w-full justify-start h-12 ${
                isActive 
                  ? "bg-primary text-white hover:bg-primary/90" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              onClick={() => handleNavigation(item.href)}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Button>
          );
        })}
      </nav>
      
      {/* Logout */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <Button
          variant="ghost"
          className="w-full justify-start h-12 text-gray-700 hover:bg-gray-100"
          onClick={handleLogout}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );
}
