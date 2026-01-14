"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, PlusCircle, User } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    href: "/",
    icon: Home,
    label: "Home",
  },
  {
    href: "/housing",
    icon: Search,
    label: "Browse",
  },
  {
    href: "/review/new",
    icon: PlusCircle,
    label: "Review",
  },
  {
    href: "/profile",
    icon: User,
    label: "Profile",
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-school-primary to-gray-900 border-t border-school-secondary/20 md:hidden">
      <div className="grid grid-cols-4 h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 transition-colors",
                isActive
                  ? "text-school-secondary"
                  : "text-gray-400 hover:text-white"
              )}
            >
              <Icon className="h-6 w-6" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
