"use client";

import { AdminProvider } from "@/components/providers/admin-provider";
import { AdminAuth } from "@/components/admin-auth";
import { Toaster } from "@/components/ui/sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminProvider>
      <AdminAuth>
        <div className="min-h-screen">
          {children}
          <Toaster />
        </div>
      </AdminAuth>
    </AdminProvider>
  );
}
