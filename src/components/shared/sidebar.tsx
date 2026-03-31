"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PenBox, CalendarDays, Settings, LogOut, Zap, Share2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Composer",
    href: "/composer",
    icon: PenBox,
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: CalendarDays,
  },
  {
    title: "Accounts",
    href: "/accounts",
    icon: Share2,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function SidebarContent() {
  const pathname = usePathname();
  const { profile, supabase } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6 md:justify-center lg:justify-start">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Zap className="h-6 w-6 fill-primary text-primary shrink-0" />
          <span className="hidden lg:block">Social-Copilot</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 space-y-1">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/dashboard");
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary md:justify-center lg:justify-start",
                  isActive ? "bg-muted text-primary" : "text-muted-foreground"
                )}
                title={item.title}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="hidden lg:block">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="mt-auto p-4 border-t">
        {(!profile || profile.plan === "free") && (
          <div className="mb-4 rounded-xl border bg-card text-card-foreground shadow space-y-3 p-4 hidden lg:block">
            <h3 className="font-semibold text-sm">Upgrade to Premium</h3>
            <p className="text-xs text-muted-foreground">
              Unlock advanced features and unlimited posts.
            </p>
            <Button size="sm" className="w-full">
              Upgrade
            </Button>
          </div>
        )}
        <div className="flex items-center justify-center lg:justify-between mt-2 overflow-hidden">
          <div className="flex items-center gap-2 truncate">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
            </Avatar>
            <div className="hidden lg:grid flex-1 text-left text-sm leading-tight max-w-[120px]">
              <span className="truncate font-semibold flex items-center gap-1">
                {profile?.full_name || "User"}
                {profile?.plan === "premium" && (
                  <span className="text-xs text-primary font-bold" title="Premium">⚡</span>
                )}
              </span>
              <span className="truncate text-xs text-muted-foreground">
                {profile?.email || ""}
              </span>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleSignOut} title="Sign Out" className="hidden lg:flex shrink-0">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <div className="hidden border-r bg-muted/40 md:block md:w-[70px] lg:w-[220px] h-screen shrink-0 sticky top-0 transition-all duration-300">
      <SidebarContent />
    </div>
  );
}
