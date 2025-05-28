"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useUserContext } from "@/components/providers/user-provider";

export function AdminAuth({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const userData = useUserContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (userData.role !== "admin") {
      router.push("/");
      return;
    }
  }, [isLoaded, isSignedIn, userData, router]);

  if (!isLoaded || !isSignedIn || userData.role !== "admin") {
    return null;
  }

  return <>{children}</>;
}
