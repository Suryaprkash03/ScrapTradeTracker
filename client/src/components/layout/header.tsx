"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/hooks/use-auth"
import { Bell, ChevronDown, LogOut, User } from "lucide-react"
import { useLocation } from "wouter"

const getPageTitle = (path: string): string => {
  const titles: Record<string, string> = {
    "/": "Dashboard",
    "/dashboard": "Dashboard",
    "/admin-dashboard": "Admin Dashboard",
    "/inventory": "Inventory Management",
    "/scrap-lifecycle": "Scrap Lifecycle",
    "/quality-check": "Quality Check",
    "/partners": "Partners Management",
    "/deals": "Deal Management",
    "/documents": "Documents",
    "/shipments": "Shipment Tracking",
    "/finance": "Finance Management",
    "/reports": "Reports & Analytics",
    "/users": "User Management",
  }
  return titles[path] || "ScrapFlow"
}

export default function Header() {
  const [location] = useLocation()
  const { user, logout } = useAuth()

  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <header className="h-16 bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="h-full flex items-center justify-between px-6">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-gray-900">{getPageTitle(location)}</h1>
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-500">
            <div className="w-1 h-1 bg-gray-400 rounded-full" />
            <span>{currentTime}</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative h-9 w-9 rounded-lg hover:bg-gray-100">
            <Bell className="w-4 h-4 text-gray-600" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          {/* User Menu */}
          {user && (
            <div className="flex items-center gap-3 pl-3 pr-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role.replace("_", " ")}</p>
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </div>
          )}

          {/* Logout */}
          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="h-9 w-9 rounded-lg hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
