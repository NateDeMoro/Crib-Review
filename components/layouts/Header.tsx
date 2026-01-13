"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home as HomeIcon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/housing", label: "Browse Housing" },
  { href: "/review/new", label: "Write Review" },
  { href: "/profile", label: "Profile" },
];

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-school-secondary/20 bg-gradient-to-r from-school-primary to-gray-900 backdrop-blur">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <HomeIcon className="h-8 w-8 text-school-secondary" />
          <span className="text-white">
            Campus<span className="text-school-secondary">Nest</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-school-secondary",
                  isActive
                    ? "text-school-secondary"
                    : "text-gray-300"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Auth Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-white hover:text-school-secondary"
            asChild
          >
            <Link href="/auth/signin">Sign In</Link>
          </Button>
          <Button
            className="bg-school-secondary hover:bg-school-secondary/90 text-white"
            asChild
          >
            <Link href="/auth/signup">Sign Up</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <Button variant="ghost" size="icon" className="md:hidden text-white">
          <Menu className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
}
