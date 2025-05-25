import { Card } from "@/components/ui/card";

// Dashboard page for admin
export default function AdminDashboardPage() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4">Total Songs: {/* TODO: fetch count */} 0</Card>
      <Card className="p-4">Total Albums: {/* TODO: fetch count */} 0</Card>
      <Card className="p-4">Drafts: {/* TODO: fetch count */} 0</Card>
      <Card className="p-4 col-span-1 md:col-span-3">
        Analytics Summary: {/* TODO: summary chart */}
      </Card>
    </div>
  );
}
