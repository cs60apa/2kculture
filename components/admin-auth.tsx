"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AdminAuth({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const router = useRouter();
  const userData = useQuery(
    api.music.getUser,
    isLoaded && user ? { userId: user.id } : "skip"
  );

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push("/sign-in");
      } else if (userData && userData.role !== "admin") {
        router.push("/");
      }
    }
  }, [isLoaded, isSignedIn, userData, router]);

  // Show a loading state while authentication is checking
  if (!isLoaded) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-secondary"></div>
          <div className="h-4 w-24 rounded bg-secondary"></div>
        </div>
      </div>
    );
  }

  // Allow the content to render
  if (!userData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-secondary"></div>
          <div className="h-4 w-24 rounded bg-secondary"></div>
        </div>
      </div>
    );
  }

  if (userData.role !== "admin") {
    // Show loading state while redirecting
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-secondary"></div>
          <div className="h-4 w-24 rounded bg-secondary"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
