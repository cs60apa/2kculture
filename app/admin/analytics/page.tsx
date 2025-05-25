import { Card } from "@/components/ui/card";
import { LineChart, BarChart } from "lucide-react";

// Analytics page for admin
export default function AdminAnalyticsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="p-6 flex flex-col items-center justify-center">
          <LineChart className="h-12 w-12 mb-2" />
          <p>No play data available yet</p>
          <p className="text-sm text-muted-foreground">
            Start sharing your music to see analytics
          </p>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center">
          <BarChart className="h-12 w-12 mb-2" />
          <p>No song performance data available yet</p>
          <p className="text-sm text-muted-foreground">
            Upload more songs to compare performance
          </p>
        </Card>
      </div>
      {/* TODO: Add more analytics widgets and real charts */}
    </div>
  );
}
