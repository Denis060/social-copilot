"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Menu, Plus, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button, buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { SidebarContent, navItems } from "./sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export function Topbar() {
  const pathname = usePathname();
  const { setTheme } = useTheme();

  // Find the current page title
  const currentNavItem = navItems.find(
    (item) => pathname === item.href || (pathname?.startsWith(item.href) && item.href !== "/dashboard")
  );
  const pageTitle = currentNavItem ? currentNavItem.title : "Dashboard";

  return (
    <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 shrink-0 z-40 sticky top-0 backdrop-blur-sm">
      <Sheet>
        <SheetTrigger className={buttonVariants({ variant: "outline", size: "icon", className: "shrink-0 md:hidden" })}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle navigation menu</span>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0 w-72">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetDescription className="sr-only">
            Access the navigation links, profile, and upgrade features.
          </SheetDescription>
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <div className="flex-1">
        <h1 className="text-lg font-semibold md:text-xl">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/dashboard/composer" title="New Post" className={buttonVariants({ variant: "outline", size: "sm", className: "hidden sm:flex" })}>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Link>
        
        <Link href="/dashboard/composer" title="New Post" className={buttonVariants({ variant: "outline", size: "icon", className: "sm:hidden" })}>
          <Plus className="h-4 w-4" />
          <span className="sr-only">New Post</span>
        </Link>

        <Button variant="ghost" size="icon" title="Notifications">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Toggle notifications</span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" })}>
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              System
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
