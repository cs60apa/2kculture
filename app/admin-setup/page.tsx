"use client";

import React from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AdminSetupPage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const router = useRouter();
  const userData = useQuery(api.admin.getCurrentUser);
  const promoteToAdmin = useMutation(api.admin.promoteToAdmin);

  const handlePromote = async () => {
    if (!userData?.clerkUserId) return;
    await promoteToAdmin({
      userId: userData.clerkUserId,
    });

    // Wait a moment for the changes to propagate
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md w-full p-6 bg-card rounded-lg shadow-lg">
          <p className="text-center">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full p-6 bg-card rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Admin Setup</h1>
        {userData ? (
          <div className="space-y-4">
            <div>
              <p>Current user:</p>
              <pre className="bg-muted p-2 rounded mt-1 text-sm">
                {JSON.stringify(userData, null, 2)}
              </pre>
            </div>
            <div>
              <p className="mb-2">
                Current role:{" "}
                <span className="font-medium">{userData.role || "none"}</span>
              </p>
              {userData.role !== "admin" ? (
                <Button onClick={handlePromote} className="w-full">
                  Promote to Admin
                </Button>
              ) : (
                <div className="space-y-4">
                  <p className="text-green-600">You are already an admin!</p>
                  <Button
                    onClick={() => router.push("/admin")}
                    className="w-full"
                  >
                    Go to Admin Dashboard
                  </Button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <p className="text-center">Please sign in first</p>
        )}
      </div>
    </div>
  );
}
