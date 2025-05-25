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
import Image from "next/image";
import Link from "next/link";

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
      icon: <Home className="h-5 w-5" />,
      href: "/studio",
    },
    {
      title: "Songs",
      icon: <Music className="h-5 w-5" />,
      href: "/studio/songs",
    },
    {
      title: "Albums",
      icon: <FileAudio className="h-5 w-5" />,
      href: "/studio/albums",
    },
    {
      title: "Drafts",
      icon: <Edit className="h-5 w-5" />,
      href: "/studio/drafts",
    },
    {
      title: "Upload",
      icon: <Upload className="h-5 w-5" />,
      href: "/studio/upload",
    },
    {
      title: "Analytics",
      icon: <BarChart2 className="h-5 w-5" />,
      href: "/studio/analytics",
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/studio/settings",
    },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col bg-muted/50">
        {/* Topbar */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg">DevCircle</span>
            <span className="ml-2 px-2 py-0.5 text-xs rounded bg-blue-100 text-blue-700 font-semibold">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              View Site
              <svg
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
            <button className="rounded-full bg-gray-100 p-2 text-gray-600 hover:bg-gray-200">
              ?
            </button>
            <div className="rounded-full bg-gray-200 w-8 h-8 flex items-center justify-center font-bold text-gray-700">
              A
            </div>
          </div>
        </header>
        <div className="flex flex-1">
          {/* Sidebar */}
          <aside className="hidden md:flex flex-col w-64 border-r bg-white px-6 py-8">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-1">
                {/* Logo placeholder */}
                <Image src="/file.svg" alt="Logo" width={28} height={28} />
                <span className="font-semibold text-xl">DevCircle</span>
              </div>
              <div className="text-xs text-gray-500">
                Content Management System
              </div>
            </div>
            <nav className="flex flex-col gap-1 mt-4">
              {sidebarItems.map((item) => {
                const isActive =
                  typeof window !== "undefined" &&
                  window.location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-gray-100 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-700"
                    }`}
                  >
                    {item.icon}
                    <span>{item.title}</span>
                  </Link>
                );
              })}
            </nav>
          </aside>
          {/* Main content */}
          <main className="flex-1 min-h-0">
            <div className="p-8">{children}</div>
            <Footer />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
