"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { getInitials } from "@/lib/auth"
import { hasPageAccess } from "@/lib/permissions"
import {
  BarChart3,
  CheckCircle,
  DollarSign,
  Factory,
  FileText,
  Handshake,
  LayoutDashboard,
  Package,
  Recycle,
  Ship,
  Users,
} from "lucide-react"
import { useLocation } from "wouter"

const allNavigation = [
  { name: "Dashboard", href: "/admin-dashboard", icon: LayoutDashboard },
  { name: "Inventory", href: "/inventory", icon: Package },
  { name: "Lifecycle", href: "/scrap-lifecycle", icon: Recycle },
  { name: "Quality", href: "/quality-check", icon: CheckCircle },
  { name: "Partners", href: "/partners", icon: Handshake },
  { name: "Deals", href: "/deals", icon: FileText },
  { name: "Documents", href: "/documents", icon: FileText },
  { name: "Shipments", href: "/shipments", icon: Ship },
  { name: "Finance", href: "/finance", icon: DollarSign },
  { name: "Reports", href: "/reports", icon: BarChart3 },
  { name: "Users", href: "/users", icon: Users },
]

export default function Sidebar() {
  const [location, setLocation] = useLocation()
  const { user } = useAuth()

  const navigation = allNavigation.filter((item) => !user || hasPageAccess(user.role, item.href))

  const handleNavigation = (href: string) => {
    setLocation(href)
  }

  if (!user) return null

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Factory className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">ScrapFlow</span>
          </div>
        </div>

        {/* User Profile */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div className="w-9 h-9 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-medium">{getInitials(user.name)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user.role.replace("_", " ")}</p>
            </div>
            <div className="w-2 h-2 bg-green-500 rounded-full" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location === item.href || (location === "/" && item.href === "/admin-dashboard")
            const Icon = item.icon

            return (
              <Button
                key={item.name}
                variant="ghost"
                className={`w-full justify-start h-10 px-3 rounded-lg font-medium text-sm ${
                  isActive ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => handleNavigation(item.href)}
              >
                <Icon className="w-4 h-4 mr-3" />
                <span>{item.name}</span>
              </Button>
            )
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Powered by <span className="font-semibold text-gray-700">Zenquix</span>
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
