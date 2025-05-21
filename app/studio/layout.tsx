"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Sidebar,
  SidebarProvider,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Home,
  BarChart2,
  Music,
  Upload,
  Edit,
  Settings,
  FileAudio,
} from "lucide-react";

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  // Redirect if not signed in
  if (isLoaded && !isSignedIn) {
    router.push("/");
    return null;
  }

  const sidebarItems = [
    {
      title: "Dashboard",
      icon: <Home className="h-4 w-4" />,
      href: "/studio",
    },
    {
      title: "Analytics",
      icon: <BarChart2 className="h-4 w-4" />,
      href: "/studio/analytics",
    },
    {
      title: "All Songs",
      icon: <Music className="h-4 w-4" />,
      href: "/studio/songs",
    },
    {
      title: "Upload",
      icon: <Upload className="h-4 w-4" />,
      href: "/studio/upload",
    },
    {
      title: "Drafts",
      icon: <Edit className="h-4 w-4" />,
      href: "/studio/drafts",
    },
    {
      title: "Albums",
      icon: <FileAudio className="h-4 w-4" />,
      href: "/studio/albums",
    },
    {
      title: "Settings",
      icon: <Settings className="h-4 w-4" />,
      href: "/studio/settings",
    },
  ];

  return (
    <SidebarProvider>
      <Navbar />
      <div className="flex">
        <div className="hidden md:flex h-[calc(100vh-64px)] w-64 flex-col fixed inset-y-16 z-50">
          <Sidebar>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <a href={item.href} className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </Sidebar>
        </div>
        <div className="pt-16 md:pl-64 w-full">
          <main className="container mx-auto px-4 py-8">{children}</main>
          <Footer />
        </div>
      </div>
    </SidebarProvider>
  );
}
