"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  BarChart2,
  Music,
  Upload,
  Users,
  Play,
  Heart,
  Headphones,
  TrendingUp,
  AlertCircle,
  Edit,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function StudioPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();

  // Fetch songs by the current artist
  const allSongs =
    useQuery(
      api.music.getSongsByArtist,
      isLoaded && isSignedIn ? { artistId: user?.id } : "skip"
    ) || [];

  // Fetch popular songs by the current artist
  const userSongs =
    useQuery(
      api.music.getSongsByArtist,
      isLoaded && isSignedIn ? { artistId: user?.id } : "skip"
    ) || [];

  // Sort songs by plays to get popular songs
  const popularSongs = [...(userSongs || [])]
    .sort((a, b) => (b.plays || 0) - (a.plays || 0))
    .slice(0, 5);

  // Calculate key metrics
  const totalSongs = allSongs?.length || 0;
  const publishedSongs = allSongs?.filter((song) => song.isPublic).length || 0;
  const draftSongs = totalSongs - publishedSongs;
  const totalPlays =
    allSongs?.reduce((sum, song) => sum + (song.plays || 0), 0) || 0;
  const totalLikes =
    allSongs?.reduce((sum, song) => sum + (song.likes || 0), 0) || 0;

  // Placeholder data for charts
  const playsData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Song Plays",
        data: [65, 78, 80, 94, 140, 187],
        fill: false,
        borderColor: "rgb(75, 192, 192)",
        tension: 0.1,
      },
    ],
  };

  const likesData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
    datasets: [
      {
        label: "Likes",
        data: [12, 19, 24, 36, 52, 75],
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  const songDistributionData = {
    labels: ["Published", "Drafts"],
    datasets: [
      {
        data: [publishedSongs, draftSongs],
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 206, 86, 0.6)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 206, 86, 1)"],
        borderWidth: 1,
      },
    ],
  };

  // Redirect if not signed in
  if (isLoaded && !isSignedIn) {
    router.push("/");
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Studio Dashboard</h1>
        <Button onClick={() => router.push("/studio/upload")}>
          <Upload className="mr-2 h-4 w-4" /> Upload New Music
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Songs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Music className="mr-2 h-5 w-5 text-blue-500" />
              <div className="text-2xl font-bold">{totalSongs}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Plays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Play className="mr-2 h-5 w-5 text-green-500" />
              <div className="text-2xl font-bold">{totalPlays}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Likes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Heart className="mr-2 h-5 w-5 text-red-500" />
              <div className="text-2xl font-bold">{totalLikes}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Drafts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Edit className="mr-2 h-5 w-5 text-yellow-500" />
              <div className="text-2xl font-bold">{draftSongs}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <Tabs defaultValue="performance" className="w-full">
        <TabsList>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="songs">Song Distribution</TabsTrigger>
        </TabsList>
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Song Plays Over Time</CardTitle>
                <CardDescription>
                  Track your song&apos;s listening trends
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Line
                    data={playsData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top",
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Likes Overview</CardTitle>
                <CardDescription>
                  Monthly likes received on your songs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Bar
                    data={likesData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "top",
                        },
                      },
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="songs" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Song Status Distribution</CardTitle>
                <CardDescription>Published vs. Draft songs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex justify-center">
                  <div className="w-72 h-72">
                    <Doughnut
                      data={songDistributionData}
                      options={{
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: "top",
                          },
                        },
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Songs</CardTitle>
                <CardDescription>Your most played songs</CardDescription>
              </CardHeader>
              <CardContent>
                {popularSongs?.length > 0 ? (
                  <ul className="space-y-4">
                    {popularSongs.map((song, index) => (
                      <li
                        key={song._id}
                        className="flex items-center justify-between border-b pb-2"
                      >
                        <div className="flex items-center">
                          <div className="font-bold mr-2">{index + 1}.</div>
                          <div>
                            <p className="font-medium">{song.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {song.plays || 0} plays • {song.likes || 0} likes
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-xs text-green-500">+12%</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <AlertCircle className="h-10 w-10 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      No song data available yet.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Start uploading music to see your stats!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Recent Activity & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest interactions with your music
            </CardDescription>
          </CardHeader>
          <CardContent className="max-h-72 overflow-y-auto">
            <div className="space-y-4">
              <div className="flex items-start border-b pb-4">
                <div className="mr-4 mt-1">
                  <Play className="h-4 w-4 text-green-500" />
                </div>
                <div>
                  <p className="font-medium">Song Played</p>
                  <p className="text-sm text-muted-foreground">
                    Someone played &quot;Summer Vibes&quot;
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    2 hours ago
                  </p>
                </div>
              </div>

              <div className="flex items-start border-b pb-4">
                <div className="mr-4 mt-1">
                  <Heart className="h-4 w-4 text-red-500" />
                </div>
                <div>
                  <p className="font-medium">New Like</p>
                  <p className="text-sm text-muted-foreground">
                    Someone liked &quot;Night Drive&quot;
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    5 hours ago
                  </p>
                </div>
              </div>

              <div className="flex items-start border-b pb-4">
                <div className="mr-4 mt-1">
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <div>
                  <p className="font-medium">New Listener</p>
                  <p className="text-sm text-muted-foreground">
                    Someone discovered your music for the first time
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    1 day ago
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="mr-4 mt-1">
                  <Headphones className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <p className="font-medium">Complete Listen</p>
                  <p className="text-sm text-muted-foreground">
                    Someone listened to &quot;Ocean Waves&quot; in full
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    2 days ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to manage your music</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push("/studio/upload")}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload New Song
            </Button>

            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push("/studio/drafts")}
            >
              <Edit className="mr-2 h-4 w-4" />
              Manage Drafts ({draftSongs})
            </Button>

            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push("/studio/analytics")}
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              View Detailed Analytics
            </Button>

            <Button
              className="w-full justify-start"
              variant="outline"
              onClick={() => router.push("/studio/songs")}
            >
              <Music className="mr-2 h-4 w-4" />
              Manage All Songs
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
