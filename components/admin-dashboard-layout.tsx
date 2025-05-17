"use client";

import { AdminHeader } from "@/components/admin-header";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarInset } from "@/components/ui/sidebar";
import { useState, useEffect } from "react";
import { useMobile } from "@/hooks/use-mobile";

export function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isMobile = useMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Update sidebar state when screen size changes
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <div className="flex h-screen">
      <AdminSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex flex-1 flex-col overflow-hidden">
        <AdminHeader
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          isSidebarOpen={sidebarOpen}
        />
        <SidebarInset>
          <div className="p-4 sm:p-6 overflow-auto">{children}</div>
        </SidebarInset>
      </div>
    </div>
  );
}
