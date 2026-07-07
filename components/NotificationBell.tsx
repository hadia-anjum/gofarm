"use client";

import { useAuthStore } from "@/stores/authStore";
import { useUserDataStore } from "@/stores/userDataStore";
import Link from "next/link";
import { Bell } from "lucide-react";

export default function NotificationBell() {
  const { user } = useAuthStore();
  const unreadNotifications = useUserDataStore(
    (state) => state.unreadNotifications
  );

  if (!user) {
    return null;
  }

  const displayCount = unreadNotifications > 9 ? "9+" : unreadNotifications;

  return (
    <Link href="/user/notifications" className="relative inline-block group">
      <Bell className="group-hover:text-gofarm-light-green hoverEffect" />
      {unreadNotifications > 0 ? (
        <span
          className={`absolute -top-1 -right-1 bg-gofarm-green text-white rounded-full text-xs font-semibold flex items-center justify-center min-w-3.5 h-3.5 ${
            unreadNotifications > 9 ? "px-1" : ""
          }`}
        >
          {displayCount}
        </span>
      ) : (
        <span
          className={`absolute -top-1 -right-1 bg-gofarm-green text-white rounded-full text-xs font-semibold flex items-center justify-center min-w-3.5 h-3.5`}
        >
          0
        </span>
      )}
    </Link>
  );
}
