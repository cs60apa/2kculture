"use client";

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  LineChart,
  BarChart,
  Activity,
  Users,
  PlaySquare,
  TrendingUp,
} from "lucide-react";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AnalyticsPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded } = useUser();

  // Redirect if not signed in
  if (isLoaded && !isSignedIn) {
    return router.push("/");
  }

  return (
    <>
      <Navbar />
      <div className="container max-w-7xl mx-auto pt-24 pb-16 px-4 sm:px-6">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Music Analytics</h1>
            <p className="text-muted-foreground">
              Track your music performance and audience engagement
            </p>
          </div>

          <Tabs defaultValue="overview" className="mb-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="audience">Audience</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Plays
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <PlaySquare className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="text-2xl font-bold">0</div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  +0% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Unique Listeners
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="text-2xl font-bold">0</div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  +0% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Engagement Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Activity className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="text-2xl font-bold">0%</div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  +0% from last month
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Trending Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <TrendingUp className="mr-2 h-4 w-4 text-muted-foreground" />
                  <div className="text-2xl font-bold">0</div>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  +0% from last month
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Plays Over Time</CardTitle>
                <CardDescription>
                  Daily plays for the last 30 days
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center text-center text-muted-foreground">
                  <LineChart className="h-12 w-12 mb-2" />
                  <p>No play data available yet</p>
                  <p className="text-sm">
                    Start sharing your music to see analytics
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Songs</CardTitle>
                <CardDescription>
                  Your most popular tracks by plays
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <div className="flex flex-col items-center text-center text-muted-foreground">
                  <BarChart className="h-12 w-12 mb-2" />
                  <p>No song performance data available yet</p>
                  <p className="text-sm">
                    Upload more songs to compare performance
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Song Performance</CardTitle>
              <CardDescription>
                Detailed metrics for each of your songs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <Activity className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  No analytics data yet
                </h3>
                <p className="max-w-md">
                  As listeners engage with your music, you&apos;ll see detailed
                  performance metrics here. Upload and share your music to start
                  collecting data.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
