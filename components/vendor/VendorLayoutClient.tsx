"use client";

import { useAuthStore } from "@/stores/authStore";
import { usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Container from "@/components/Container";

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/vendor/dashboard",
    icon: LayoutDashboard,
    description: "Overview & stats",
  },
  {
    title: "Products",
    href: "/vendor/products",
    icon: Package,
    description: "Manage inventory",
  },
  {
    title: "Orders",
    href: "/vendor/orders",
    icon: ShoppingCart,
    description: "Track sales",
  },
  {
    title: "Analytics",
    href: "/vendor/analytics",
    icon: BarChart3,
    description: "Business insights",
  },
  {
    title: "Settings",
    href: "/vendor/settings",
    icon: Settings,
    description: "Store preferences",
  },
];

interface VendorLayoutClientProps {
  user: {
    uid: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
  };
  children: React.ReactNode;
}

export function VendorLayoutClient({
  user,
  children,
}: VendorLayoutClientProps) {
  const logout = useAuthStore((state) => state.logout);
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen py-5 bg-linear-to-br from-gray-50 via-white to-green-50">
      <Container className="py-6">
        <div className="flex flex-col gap-6">
          {/* Mobile Header */}
          <div className="lg:hidden">
            <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-green-200">
              <div className="flex items-center space-x-3">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Vendor avatar"
                    className="w-10 h-10 rounded-full object-cover border-2 border-green-300"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <Store className="h-6 w-6 text-green-600" />
                  </div>
                )}
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {user?.displayName || "Vendor"}
                  </h2>
                  <p className="text-sm text-gray-500">Vendor Dashboard</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2"
              >
                {sidebarOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Desktop Top Navigation */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl shadow-xl border border-green-200 overflow-hidden">
              {/* Vendor Profile Header */}
              <div className="p-6 bg-linear-to-r from-green-600 to-emerald-600 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {user?.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Vendor avatar"
                        className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                        <Store className="h-6 w-6 text-white" />
                      </div>
                    )}
                    <div>
                      <h2 className="font-bold text-lg text-white">
                        {user?.displayName || "Vendor"}
                      </h2>
                      <p className="text-white/80 text-sm">{user?.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <span className="text-white/90 text-sm">
                        Vendor Active
                      </span>
                    </div>
                    <Button
                      onClick={logout}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-white/20 border border-white/30"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </div>
              </div>

              {/* Horizontal Navigation */}
              <nav className="p-6">
                <div className="flex flex-wrap gap-3">
                  {sidebarItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.title}
                        href={item.href}
                        className={cn(
                          "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group border",
                          isActive
                            ? "bg-green-50 border-green-300 shadow-sm"
                            : "hover:bg-gray-50 border-gray-200 hover:border-green-300"
                        )}
                      >
                        <div
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isActive
                              ? "bg-green-600 text-white"
                              : "bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-green-600"
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div
                            className={cn(
                              "font-medium text-sm",
                              isActive ? "text-green-700" : "text-gray-900"
                            )}
                          >
                            {item.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.description}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>
          </div>

          {/* Mobile Sidebar */}
          <div className={cn("lg:hidden", sidebarOpen ? "block" : "hidden")}>
            <div className="bg-white rounded-2xl shadow-xl border border-green-200 overflow-hidden">
              {/* Vendor Profile Section */}
              <div className="p-6 bg-linear-to-r from-green-600 to-emerald-600 text-white">
                <div className="flex items-center space-x-4">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Vendor avatar"
                      className="w-16 h-16 rounded-full object-cover border-3 border-white/30"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                      <Store className="h-8 w-8 text-white" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className="font-bold text-lg text-white">
                      {user?.displayName || "Vendor"}
                    </h2>
                    <p className="text-white/80 text-sm">{user?.email}</p>
                    <div className="flex items-center mt-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                      <span className="text-white/90 text-xs">
                        Vendor Active
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation */}
              <nav className="p-4 space-y-2">
                {sidebarItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl transition-all duration-200 group",
                        isActive
                          ? "bg-green-50 border border-green-300 shadow-sm"
                          : "hover:bg-gray-50 border border-transparent"
                      )}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={cn(
                            "p-2 rounded-lg transition-colors",
                            isActive
                              ? "bg-green-600 text-white"
                              : "bg-gray-100 text-gray-600 group-hover:bg-green-100 group-hover:text-green-600"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div
                            className={cn(
                              "font-medium",
                              isActive ? "text-green-700" : "text-gray-900"
                            )}
                          >
                            {item.title}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.description}
                          </div>
                        </div>
                      </div>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-colors",
                          isActive ? "text-green-600" : "text-gray-400"
                        )}
                      />
                    </Link>
                  );
                })}
              </nav>

              {/* Mobile Sign Out Button */}
              <div className="p-4 border-t border-gray-100">
                <Button
                  onClick={logout}
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-xl border border-green-200 overflow-hidden">
              <div className="p-6 lg:p-8">{children}</div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
