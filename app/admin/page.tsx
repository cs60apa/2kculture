"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the dashboard page
    router.push("/admin/dashboard");
  }, [router]);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="animate-pulse flex flex-col items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-secondary"></div>
        <div className="h-4 w-40 rounded bg-secondary"></div>
      </div>
    </div>
  );
}
