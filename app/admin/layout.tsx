"use client";

import { AdminProvider } from "@/components/providers/admin-context";
import { AdminAuth } from "@/components/admin-auth";
import { Toaster } from "@/components/ui/sonner";
import { AdminDashboardLayout } from "@/components/admin-dashboard-layout";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <AdminAuth>
        <div className="min-h-screen">
          <AdminDashboardLayout>
            {children}
          </AdminDashboardLayout>
          <Toaster />
        </div>
      </AdminAuth>
    </AdminProvider>
  );
}
