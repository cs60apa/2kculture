import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Settings page for admin
export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Admin Settings</h1>
      <Card className="p-4 mb-4">
        <div className="mb-2">Profile Settings</div>
        <Button>Update Profile</Button>
      </Card>
      <Card className="p-4">
        <div className="mb-2">Preferences</div>
        <Button>Save Preferences</Button>
      </Card>
    </div>
  );
}
