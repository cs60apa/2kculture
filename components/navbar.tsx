"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useUser();

  const routes = [
    {
      label: "Discover",
      href: "/discover",
      active: pathname === "/",
    },
    {
      label: "Library",
      href: "/library",
      active: pathname === "/library",
    },
  ];

  return (
    <div className="fixed w-full z-50 flex justify-between items-center py-2 px-4 border-b border-primary/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-x-4">
        <Link href="/">
          <h1 className="hidden md:block text-xl font-bold text-primary">
            2kCulture
          </h1>
        </Link>
        <div className="hidden md:flex items-center gap-x-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary px-4 py-2 rounded-md",
                route.active
                  ? "text-black dark:text-white bg-black/10 dark:bg-white/10"
                  : "text-muted-foreground"
              )}
            >
              {route.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="relative w-full max-w-md hidden lg:flex items-center mx-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search songs, artists, albums..."
          className="pl-10 bg-secondary"
        />
      </div>
      <div className="flex items-center gap-x-4">
        <div className="flex items-center gap-x-2">
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-x-2">
          {isSignedIn && (
            <>
              <Link
                href="/analytics"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md",
                  pathname.startsWith("/analytics")
                    ? "text-black dark:text-white bg-black/10 dark:bg-white/10"
                    : "text-muted-foreground"
                )}
              >
                Analytics
              </Link>
              <Link
                href="/studio"
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary px-3 py-2 rounded-md",
                  pathname.startsWith("/studio")
                    ? "text-black dark:text-white bg-black/10 dark:bg-white/10"
                    : "text-muted-foreground"
                )}
              >
                Studio
              </Link>
            </>
          )}
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <div className="flex items-center gap-x-4">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button size="sm">Sign up</Button>
              </SignUpButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
