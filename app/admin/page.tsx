"use client";

import { AdminDashboardLayout } from "@/components/admin-dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ListMusic, Music, Plus, PlayCircle, UserIcon } from "lucide-react";

export default function AdminPage() {
  const { user } = useUser();

  // Get user's songs
  const userSongs = useQuery(
    api.music.getSongsByArtist,
    user?.id ? { artistId: user.id } : "skip"
  );

  // Get public songs count
  const publishedSongs = useQuery(
    api.music.getPublishedSongsByArtist,
    user?.id ? { artistId: user.id } : "skip"
  );

  // Get draft songs count
  const draftSongs = useQuery(
    api.music.getDraftSongsByArtist,
    user?.id ? { artistId: user.id } : "skip"
  );

  // Calculate total plays
  const totalPlays = useMemo(() => {
    return userSongs?.reduce((acc, song) => acc + (song.plays || 0), 0) || 0;
  }, [userSongs]);

  // Generate mock weekly data with trend
  const weeklyData = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const currentDay = new Date().getDay(); // 0 is Sunday

    return Array.from({ length: 7 }, (_, i) => {
      const dayIndex = (currentDay - 6 + i) % 7;
      const day = days[dayIndex >= 0 ? dayIndex : dayIndex + 7];

      // Generate mock data with an upward trend
      const baseValue = Math.floor(Math.random() * 20) + 10;
      const trendFactor = 1 + i * 0.15;

      return {
        day,
        plays: Math.floor(baseValue * trendFactor),
        views: Math.floor(baseValue * trendFactor * 1.5),
      };
    });
  }, []);

  // Generate mock genre distribution
  const genreData = useMemo(() => {
    // Get all genres from songs
    const allGenres = userSongs?.flatMap((song) => song.genres || []) || [];

    // Count occurrences of each genre
    const genreCounts: Record<string, number> = {};
    allGenres.forEach((genre) => {
      if (genre) {
        genreCounts[genre] = (genreCounts[genre] || 0) + 1;
      }
    });

    // If no genres, provide mock data
    if (Object.keys(genreCounts).length === 0) {
      return [
        { name: "Hip Hop", value: 8 },
        { name: "R&B", value: 5 },
        { name: "Trap", value: 4 },
        { name: "Afrobeats", value: 3 },
        { name: "Pop", value: 2 },
      ];
    }

    // Convert to array format for charts
    return Object.entries(genreCounts).map(([name, value]) => ({
      name,
      value,
    }));
  }, [userSongs]);

  // Get recent songs
  const recentSongs = useMemo(() => {
    if (!userSongs) return [];

    return [...userSongs]
      .sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0))
      .slice(0, 5);
  }, [userSongs]);

  // Get top performing songs
  const topSongs = useMemo(() => {
    if (!userSongs) return [];

    return [...userSongs]
      .sort((a, b) => (b.plays || 0) - (a.plays || 0))
      .slice(0, 5);
  }, [userSongs]);

  return (
    <AdminDashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {user?.firstName || "Creator"}
          </h2>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your music activity
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content-studio">
            <Plus className="mr-2 h-4 w-4" /> Upload New Song
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Songs</CardTitle>
            <Music className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userSongs?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              {publishedSongs?.length || 0} published, {draftSongs?.length || 0}{" "}
              drafts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <ListMusic className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {publishedSongs?.length || 0}
            </div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-muted-foreground">
                {(
                  ((publishedSongs?.length || 0) / (userSongs?.length || 1)) *
                  100
                ).toFixed(0)}
                % of your songs
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <UserIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{draftSongs?.length || 0}</div>
            <div className="flex items-center pt-1">
              <span className="text-xs text-muted-foreground">
                {(
                  ((draftSongs?.length || 0) / (userSongs?.length || 1)) *
                  100
                ).toFixed(0)}
                % of your songs
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
            <PlayCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPlays.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all your tracks
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 md:grid-cols-5 mb-8">
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Weekly Performance</CardTitle>
            <CardDescription>
              Plays and views for the last 7 days
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={weeklyData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="plays"
                  stroke="#8884d8"
                  activeDot={{ r: 8 }}
                />
                <Line type="monotone" dataKey="views" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Genre Distribution</CardTitle>
            <CardDescription>
              Breakdown of your content by genre
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={genreData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                >
                  {genreData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(${index * 45}, 70%, 60%)`}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="recent">
        <TabsList>
          <TabsTrigger value="recent">Recent Uploads</TabsTrigger>
          <TabsTrigger value="popular">Top Performing</TabsTrigger>
        </TabsList>

        <TabsContent value="recent" className="mt-6">
          {recentSongs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recentSongs.map((song) => (
                <Card key={song._id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    {song.coverArt ? (
                      <Image
                        src={song.coverArt}
                        alt={song.title || "Song cover"}
                        className="object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <Music className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="font-medium line-clamp-1">{song.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Uploaded{" "}
                      {new Date(song._creationTime || 0).toLocaleDateString()}
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs bg-secondary px-2 py-1 rounded-md">
                        {song.isPublic ? "Published" : "Draft"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {song.plays || 0} plays
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Music className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">
                  You have not uploaded any songs yet.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/admin/content-studio">
                    <Plus className="mr-2 h-4 w-4" /> Upload Your First Song
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="popular" className="mt-6">
          {topSongs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {topSongs.map((song) => (
                <Card key={song._id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    {song.coverArt ? (
                      <Image
                        src={song.coverArt}
                        alt={song.title || "Song cover"}
                        className="object-cover"
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <Music className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="font-medium line-clamp-1">{song.title}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      {song.plays || 0} total plays
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-xs bg-secondary px-2 py-1 rounded-md">
                        {song.isPublic ? "Published" : "Draft"}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Uploaded{" "}
                        {new Date(song._creationTime || 0).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Music className="h-10 w-10 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">
                  You have not uploaded any songs yet.
                </p>
                <Button asChild className="mt-4">
                  <Link href="/admin/content-studio">
                    <Plus className="mr-2 h-4 w-4" /> Upload Your First Song
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </AdminDashboardLayout>
  );
}
