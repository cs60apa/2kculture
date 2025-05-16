"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const createUser = useMutation(api.music.createUser);

  useEffect(() => {
    const syncUser = async () => {
      if (isLoaded && isSignedIn && user) {
        try {
          // Create or retrieve user in Convex
          await createUser({
            userId: user.id,
            name:
              `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
              user.username ||
              "User",
            email: user.emailAddresses[0]?.emailAddress || "",
            imageUrl: user.imageUrl || undefined,
            role: "artist", // Default role - you could make this configurable
          });

          console.log("User synced with Convex database");
        } catch (error) {
          console.error("Error syncing user with Convex:", error);
        }
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, user, createUser]);

  return <>{children}</>;
}
