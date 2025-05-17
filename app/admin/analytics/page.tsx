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
  BarChart,
  Bar,
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
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  Download,
  FileText,
  ListFilter,
  Monitor,
  RefreshCw,
  Smartphone,
  Tablet,
  TrendingUp,
  Users,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#a4de6c"];

export default function AnalyticsPage() {
  const { user } = useUser();
  const [timeRange, setTimeRange] = useState("30days");

  // Get all songs for the user
  const userSongs = useQuery(
    api.music.getSongsByArtist,
    user?.id ? { artistId: user.id } : "skip"
  );

  // Get published songs count
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

  // Calculate average plays per song
  const avgPlays = useMemo(() => {
    if (!userSongs || userSongs.length === 0) return 0;
    return Math.round(totalPlays / userSongs.length);
  }, [totalPlays, userSongs]);

  // Generate mock daily data
  const dailyData = useMemo(() => {
    // Get number of days based on time range
    let days = 7;
    if (timeRange === "30days") days = 30;
    if (timeRange === "90days") days = 90;

    const data = [];
    const now = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      // Generate random data with an upward trend
      const baseValue = Math.max(5, Math.floor(Math.random() * 50));
      const trendFactor = 1 + ((days - i) / days) * 0.5; // Slight upward trend
      const volatility = Math.random() * 0.4 + 0.8; // Random factor between 0.8 and 1.2

      data.push({
        date: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        plays: Math.floor(baseValue * trendFactor * volatility),
        uniqueListeners: Math.floor(baseValue * trendFactor * volatility * 0.7),
        shares: Math.floor(baseValue * trendFactor * volatility * 0.1),
      });
    }

    return data;
  }, [timeRange]);

  // Generate mock top songs data
  const topSongs = useMemo(() => {
    if (!userSongs) return [];

    return [...userSongs]
      .sort((a, b) => (b.plays || 0) - (a.plays || 0))
      .slice(0, 5)
      .map((song) => ({
        title: song.title,
        plays: song.plays || 0,
        uniqueListeners: Math.floor((song.plays || 0) * 0.7),
        completionRate: Math.min(100, Math.floor(Math.random() * 40) + 60), // 60-100%
      }));
  }, [userSongs]);

  // Generate mock genre data
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

  // Generate mock device data
  const deviceData = useMemo(
    () => [
      { name: "Mobile", value: 65 },
      { name: "Desktop", value: 25 },
      { name: "Tablet", value: 10 },
    ],
    []
  );

  // Generate mock geographic data
  const regionData = useMemo(
    () => [
      { name: "North America", value: 45 },
      { name: "Europe", value: 25 },
      { name: "Africa", value: 15 },
      { name: "Asia", value: 10 },
      { name: "South America", value: 5 },
    ],
    []
  );

  // Generate performance data for RadialBarChart
  const performanceData = useMemo(
    () => [
      {
        name: "Completion Rate",
        value: 78,
        fill: "#8884d8",
      },
      {
        name: "Engagement",
        value: 65,
        fill: "#82ca9d",
      },
      {
        name: "Growth",
        value: 87,
        fill: "#ffc658",
      },
    ],
    []
  );

  return (
    <AdminDashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Analytics Dashboard
          </h2>
          <p className="text-muted-foreground">
            Insights and performance metrics for your music
          </p>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
            </SelectContent>
          </Select>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileText className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button size="icon" variant="ghost">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plays</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalPlays.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">↑ 18.2%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Unique Listeners
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.floor(totalPlays * 0.7).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">↑ 12.5%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg. Plays per Song
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgPlays.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">↑ 8.3%</span> from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completion Rate
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500">↑ 5.2%</span> from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="mb-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="songs">Songs</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>Plays Over Time</CardTitle>
                <CardDescription>
                  Daily plays and unique listeners
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={dailyData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="plays"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                      activeDot={{ r: 8 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="uniqueListeners"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Genre Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={genreData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {genreData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Usage</CardTitle>
                <CardDescription>
                  What devices your audience uses
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={deviceData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Percentage"]}
                    />
                    <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                      {deviceData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>
                  Where your listeners are located
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={regionData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Percentage"]}
                    />
                    <Bar dataKey="value" fill="#8884d8" radius={[0, 4, 4, 0]}>
                      {regionData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key metrics at a glance</CardDescription>
              </CardHeader>
              <CardContent className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadialBarChart
                    cx="50%"
                    cy="50%"
                    innerRadius="20%"
                    outerRadius="80%"
                    barSize={10}
                    data={performanceData}
                  >
                    <RadialBar
                      background
                      clockWise
                      dataKey="value"
                      label={{
                        position: "insideStart",
                        fill: "#666",
                        fontSize: 12,
                      }}
                    />
                    <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="songs" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Songs</CardTitle>
              <CardDescription>
                Your songs ranked by total plays
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {topSongs.map((song, index) => (
                  <div key={index} className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge className="h-6 w-6 rounded-full p-0 flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <span className="font-medium">{song.title}</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground gap-3">
                          <span>{song.plays.toLocaleString()} plays</span>
                          <span>•</span>
                          <span>
                            {song.uniqueListeners.toLocaleString()} unique
                            listeners
                          </span>
                          <span>•</span>
                          <span>{song.completionRate}% completion rate</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="h-2 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{
                            width: `${(song.plays / (topSongs[0]?.plays || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {topSongs.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No songs available to analyze
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Listener Demographics</CardTitle>
                <CardDescription>Age and gender breakdown</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { age: "18-24", male: 20, female: 15, other: 5 },
                      { age: "25-34", male: 30, female: 25, other: 7 },
                      { age: "35-44", male: 15, female: 20, other: 3 },
                      { age: "45-54", male: 10, female: 15, other: 2 },
                      { age: "55+", male: 5, female: 8, other: 1 },
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="age" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="male" stackId="a" fill="#8884d8" />
                    <Bar dataKey="female" stackId="a" fill="#82ca9d" />
                    <Bar dataKey="other" stackId="a" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audience Devices</CardTitle>
                <CardDescription>Breakdown by device type</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Smartphone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium flex-1">Mobile</span>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: "65%" }}
                    />
                  </div>

                  <div className="flex items-center">
                    <Monitor className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium flex-1">Desktop</span>
                    <span className="text-sm font-medium">25%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: "25%" }}
                    />
                  </div>

                  <div className="flex items-center">
                    <Tablet className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-sm font-medium flex-1">Tablet</span>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: "10%" }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Listener Engagement</CardTitle>
                <CardDescription>
                  How listeners interact with your content
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="plays"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line type="monotone" dataKey="shares" stroke="#ffc658" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </AdminDashboardLayout>
  );
}
