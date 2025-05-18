"use client";

import { useAdmin } from "@/components/providers/admin-context";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Music,
  List,
  Settings,
  Pencil,
  BarChart2,
  Home,
  LogOut,
} from "lucide-react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

export function AdminSidebar({
  isOpen = true,
  onToggle,
}: {
  isOpen?: boolean;
  onToggle?: () => void;
}) {
  const { activePage, setActivePage } = useAdmin();
  const router = useRouter();
  const { signOut } = useClerk();
  const pathname = usePathname();

  // Sync the active page with the current URL when the component mounts
  useEffect(() => {
    const path = pathname.split("/").pop();

    if (pathname === "/admin") {
      setActivePage("dashboard");
    } else if (path) {
      setActivePage(path);
    }
  }, [pathname, setActivePage]);

  const handleNavigate = (page: string) => {
    setActivePage(page);
    router.push(`/admin/${page === "dashboard" ? "" : page}`);

    // On mobile, close sidebar after navigation
    if (window.innerWidth < 768 && onToggle) {
      onToggle();
    }
  };

  return (
    <SidebarProvider defaultOpen={isOpen}>
      <Sidebar
        className={`fixed left-0 top-0 z-40 h-full transition-all duration-300 ${isOpen ? "translate-x-0 w-full md:w-64" : "-translate-x-full md:translate-x-0 md:w-[80px]"}`}
      >
        <SidebarHeader className="pt-4">
          <div className="flex items-center gap-2 px-4">
            <Music className="h-8 w-8 text-primary" />
            <div
              className={`font-bold text-lg transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 md:hidden"}`}
            >
              2KCulture Admin
            </div>
          </div>
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Main</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activePage === "dashboard"}
                    onClick={() => handleNavigate("dashboard")}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activePage === "content-studio"}
                    onClick={() => handleNavigate("content-studio")}
                  >
                    <Pencil className="h-4 w-4" />
                    <span>Content Studio</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activePage === "all-songs"}
                    onClick={() => handleNavigate("all-songs")}
                  >
                    <List className="h-4 w-4" />
                    <span>All Songs</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activePage === "analytics"}
                    onClick={() => handleNavigate("analytics")}
                  >
                    <BarChart2 className="h-4 w-4" />
                    <span>Analytics</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    isActive={activePage === "settings"}
                    onClick={() => handleNavigate("settings")}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Advanced Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex flex-col gap-2 p-4">
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Back to Site
              </Link>
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={async () => {
                await signOut();
                router.push("/sign-in");
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
    </SidebarProvider>
  );
}
