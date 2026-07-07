"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import {
  Store,
  Package,
  Users,
  Settings,
  BarChart3,
  UserCheck,
  Shield,
  LogOut,
  Menu,
  X,
  User,
  ChevronDown,
  ChevronUp,
  Home,
} from "lucide-react";

interface VendorManagementTopNavProps {
  currentPath: string;
  user: {
    displayName?: string | null;
    email?: string | null;
    photoURL?: string | null;
    firstName?: string;
    lastName?: string;
  } | null;
}

const vendorManagementRoutes = [
  {
    label: "Overview",
    icon: BarChart3,
    href: "/vendor-management",
  },
  {
    label: "Vendor Products",
    icon: Package,
    href: "/vendor-management/products",
  },
  {
    label: "Vendors List",
    icon: Users,
    href: "/vendor-management/vendors",
  },
  {
    label: "Vendor Requests",
    icon: UserCheck,
    href: "/vendor-management/requests",
  },
  {
    label: "Settings",
    icon: Settings,
    href: "/vendor-management/settings",
  },
];

const VendorManagementTopNav = ({
  currentPath,
  user,
}: VendorManagementTopNavProps) => {
  const logout = useAuthStore((state) => state.logout);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleMobileMenuToggle = () => {
    if (!isAnimating) {
      setIsAnimating(true);
      setMobileMenuOpen(!mobileMenuOpen);
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-purple-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-linear-to-br from-purple-500 to-purple-600 rounded-xl">
              <Store className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">Vendor Management</h2>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMobileMenuToggle}
            className="p-2 transition-transform duration-200 hover:scale-105"
            disabled={isAnimating}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5 transition-transform duration-200" />
            ) : (
              <Menu className="h-5 w-5 transition-transform duration-200" />
            )}
          </Button>
        </div>
      </div>

      {/* Desktop Top Navigation */}
      <div className="hidden lg:block">
        <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
          {/* Header */}
          <div className="p-6 bg-linear-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Store className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-xl text-white">
                    Vendor Management
                  </h2>
                  <p className="text-white/80 text-sm">
                    Admin Control Panel for Vendors
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/admin"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 transition-all border border-white/30"
                >
                  <Home className="w-4 h-4 text-white" />
                  <span className="text-white text-sm font-medium">
                    Back to Admin
                  </span>
                </Link>
                <div className="flex items-center space-x-4">
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt="Admin avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white/30"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-white/90 text-sm">Online</span>
                  </div>
                </div>
                <Button
                  onClick={() => logout()}
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-white/20 border border-white/30 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>

          {/* Accordion Toggle Header */}
          <div className="px-6 py-4 border-b border-gray-100">
            <Button
              variant="ghost"
              onClick={() => setDesktopMenuOpen(!desktopMenuOpen)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-all duration-200"
            >
              <div className="flex items-center space-x-2">
                <Menu className="h-5 w-5 text-purple-600" />
                <span className="font-medium text-gray-900">
                  Navigation Menu
                </span>
              </div>
              {desktopMenuOpen ? (
                <ChevronUp className="h-5 w-5 text-gray-500 transition-transform duration-200" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500 transition-transform duration-200" />
              )}
            </Button>
          </div>

          {/* Collapsible Horizontal Navigation */}
          <div
            className={cn(
              "grid transition-all duration-300 ease-in-out",
              desktopMenuOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            )}
          >
            <div className="overflow-hidden">
              <nav className="px-4 py-3">
                <div className="flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide">
                  {vendorManagementRoutes.map((route, index) => {
                    const isActive = currentPath === route.href;
                    const Icon = route.icon;

                    return (
                      <Link
                        key={route.href}
                        href={route.href}
                        className={cn(
                          "flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 group border-2 transform whitespace-nowrap shrink-0",
                          isActive
                            ? "bg-purple-100 border-purple-500 shadow-md"
                            : "hover:bg-gray-50 border-gray-200 hover:border-purple-300"
                        )}
                        style={{
                          animationDelay: desktopMenuOpen
                            ? `${index * 50}ms`
                            : "0ms",
                        }}
                      >
                        <div
                          className={cn(
                            "p-1.5 rounded-md transition-all duration-200",
                            isActive
                              ? "bg-purple-500 text-white shadow-md"
                              : "bg-gray-100 text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600"
                          )}
                        >
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div
                          className={cn(
                            "font-medium text-xs transition-colors duration-200",
                            isActive ? "text-purple-700" : "text-gray-900"
                          )}
                        >
                          {route.label}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden mobile-menu-container",
          mobileMenuOpen
            ? "max-h-[800px] opacity-100 mt-2"
            : "max-h-0 opacity-0 mt-0"
        )}
      >
        <div
          className={cn(
            "bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden transform transition-all duration-300 ease-out",
            mobileMenuOpen
              ? "translate-y-0 scale-100"
              : "-translate-y-4 scale-95"
          )}
        >
          {/* Mobile Profile Section */}
          <div
            className={cn(
              "p-6 bg-linear-to-r from-purple-500 to-purple-600 text-white transition-all duration-200 delay-75",
              mobileMenuOpen
                ? "translate-y-0 opacity-100"
                : "-translate-y-2 opacity-0"
            )}
          >
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Store className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg text-white">
                  Vendor Management
                </h2>
                <p className="text-white/80 text-sm">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-white/60">{user?.email}</p>
              </div>
              {user?.photoURL && (
                <img
                  src={user.photoURL}
                  alt="Admin avatar"
                  className="w-12 h-12 rounded-full object-cover border-2 border-white/30"
                />
              )}
            </div>
          </div>

          {/* Mobile Navigation Links */}
          <nav
            className={cn(
              "p-6 space-y-2 transition-all duration-300 delay-100",
              mobileMenuOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-2 opacity-0"
            )}
          >
            <Link
              href="/admin"
              onClick={() => {
                setMobileMenuOpen(false);
                setIsAnimating(true);
                setTimeout(() => setIsAnimating(false), 300);
              }}
              className="flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group hover:bg-gray-50 hover:shadow-md text-gray-900 border border-gray-200"
            >
              <div className="p-3 rounded-lg bg-gray-100 text-gray-600 group-hover:bg-purple-100 group-hover:text-purple-600 transition-all">
                <Home className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-base text-gray-900">
                  Back to Admin
                </div>
              </div>
            </Link>

            <div className="border-t border-gray-200 my-4" />

            {vendorManagementRoutes.map((route, index) => {
              const isActive = currentPath === route.href;
              const Icon = route.icon;

              return (
                <Link
                  key={route.href}
                  href={route.href}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsAnimating(true);
                    setTimeout(() => setIsAnimating(false), 300);
                  }}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group",
                    isActive
                      ? "bg-linear-to-r from-purple-500 to-purple-600 text-white shadow-lg"
                      : "hover:bg-gray-50 hover:shadow-md text-gray-900"
                  )}
                  style={{
                    animationDelay: mobileMenuOpen ? `${index * 50}ms` : "0ms",
                  }}
                >
                  <div
                    className={cn(
                      "p-3 rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-purple-100 text-purple-600 group-hover:bg-purple-200"
                    )}
                  >
                    <Icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </div>
                  <div className="flex-1">
                    <div
                      className={cn(
                        "font-semibold text-base transition-colors duration-200",
                        isActive ? "text-white" : "text-gray-900"
                      )}
                    >
                      {route.label}
                    </div>
                  </div>
                  {isActive && (
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-sm" />
                  )}
                </Link>
              );
            })}

            {/* Sign Out Button */}
            <div className="pt-4 border-t border-gray-200 mt-4">
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setIsAnimating(true);
                  setTimeout(() => {
                    setIsAnimating(false);
                    logout();
                  }, 300);
                }}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-200 transform hover:scale-105 active:scale-95"
              >
                <LogOut className="h-5 w-5 mr-3" />
                <span className="font-medium">Sign Out</span>
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default VendorManagementTopNav;
