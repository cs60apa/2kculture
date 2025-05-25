"use client";

import { AdminDashboardLayout } from "@/components/admin-dashboard-layout";
import { AdminProvider } from "@/components/providers/admin-context";
import { AdminAuth } from "@/components/admin-auth";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuth>
      <AdminProvider>
        <AdminDashboardLayout>{children}</AdminDashboardLayout>
      </AdminProvider>
    </AdminAuth>
  );
}
