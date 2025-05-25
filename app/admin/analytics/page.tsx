import { Card } from "@/components/ui/card";
import { LineChart, BarChart } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Analytics page for admin
export default function AdminAnalyticsPage() {
  // Example: fetch analytics for a placeholder artist and timeframe
  const analytics = useQuery(api.analytics.getPlayCountAnalytics, {
    artistId: "admin",
    timeframe: "30days",
  });
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Analytics</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="p-6 flex flex-col items-center justify-center">
          <p className="font-bold">Total Plays (30 days):</p>
          <p className="text-2xl">{analytics ? analytics.totalPlays : "-"}</p>
          <p className="text-sm text-muted-foreground">
            Start sharing your music to see analytics
          </p>
        </Card>
        <Card className="p-6 flex flex-col items-center justify-center">
          <p className="font-bold">Unique Listeners (30 days):</p>
          <p className="text-2xl">
            {analytics ? analytics.uniqueListeners : "-"}
          </p>
          <p className="text-sm text-muted-foreground">
            Upload more songs to compare performance
          </p>
        </Card>
      </div>
      {/* TODO: Add more analytics widgets and real charts */}
    </div>
  );
}
