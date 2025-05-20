"use client";

import React, { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { 
  TrendingUp,
  TrendingDown,
  ArrowRight
} from "lucide-react";
import Image from "next/image";

import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  ArcElement
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

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

export default function AnalyticsPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [timeFrame, setTimeFrame] = useState<"7days" | "30days" | "90days" | "year">("30days");
  
  // Fetch songs by the current artist
  const allSongs = useQuery(
    api.music.getSongsByArtist,
    isLoaded && isSignedIn ? { artistId: user?.id } : "skip"
  ) || [];
  
  // Sort by plays to get popular songs
  const popularSongs = [...allSongs].sort((a, b) => (b.plays || 0) - (a.plays || 0));

  // Total metrics
  const totalSongs = allSongs.length;
  const totalPlays = allSongs.reduce((sum, song) => sum + (song.plays || 0), 0);
  const totalLikes = allSongs.reduce((sum, song) => sum + (song.likes || 0), 0);
  
  // Average engagement metrics
  const avgPlaysPerSong = totalSongs > 0 ? Math.round(totalPlays / totalSongs) : 0;
  const engagementRate = totalPlays > 0 ? Math.round((totalLikes / totalPlays) * 100) : 0;

  // Generate sample data based on timeframe - in a real app, you would fetch this from your API
  const generateTimeLabels = () => {
    const labels = [];
    const now = new Date();
    
    if (timeFrame === "7days") {
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        labels.push(date.toLocaleDateString("en-US", { weekday: 'short' }));
      }
    } else if (timeFrame === "30days") {
      for (let i = 29; i >= 0; i -= 3) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        labels.push(date.toLocaleDateString("en-US", { month: 'short', day: 'numeric' }));
      }
    } else if (timeFrame === "90days") {
      for (let i = 90; i >= 0; i -= 10) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        labels.push(date.toLocaleDateString("en-US", { month: 'short', day: 'numeric' }));
      }
    } else {
      // Year
      for (let i = 11; i >= 0; i--) {
        const date = new Date();
        date.setMonth(now.getMonth() - i);
        labels.push(date.toLocaleDateString("en-US", { month: 'short' }));
      }
    }
    
    return labels;
  };
  
  // Generate sample data - would be replaced with real data from your backend
  const generateSampleData = (max: number, trend: "up" | "down" | "fluctuate" | "stable" = "up") => {
    const length = timeFrame === "7days" ? 7 : 
                   timeFrame === "30days" ? 11 : 
                   timeFrame === "90days" ? 10 : 12;
    
    const data = [];
    let value = trend === "down" ? max : Math.round(max * 0.3);
    
    for (let i = 0; i < length; i++) {
      if (trend === "up") {
        value += Math.round(Math.random() * max * 0.05);
      } else if (trend === "down") {
        value -= Math.round(Math.random() * max * 0.05);
      } else if (trend === "fluctuate") {
        value += Math.round(Math.random() * max * 0.15 - max * 0.075);
      }
      
      // Make sure we don't go below 0
      value = Math.max(0, value);
      data.push(value);
    }
    
    return data;
  };

  // Generate chart data
  const playData = {
    labels: generateTimeLabels(),
    datasets: [
      {
        label: 'Plays',
        data: generateSampleData(totalPlays, "up"),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ],
  };

  const likeData = {
    labels: generateTimeLabels(),
    datasets: [
      {
        label: 'Likes',
        data: generateSampleData(totalLikes, "fluctuate"),
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        borderColor: 'rgba(153, 102, 255, 1)',
        borderWidth: 1,
      }
    ],
  };

  const engagementData = {
    labels: generateTimeLabels(),
    datasets: [
      {
        label: 'Engagement Rate (%)',
        data: generateSampleData(50, "stable"),
        fill: true,
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        tension: 0.3
      }
    ],
  };

  // Generate audience data for the doughnut chart
  const audienceData = {
    labels: ['Mobile', 'Desktop', 'Tablet'],
    datasets: [
      {
        data: [60, 30, 10],
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const listenersByCountry = [
    { country: 'United States', listeners: 2341 },
    { country: 'United Kingdom', listeners: 1423 },
    { country: 'Canada', listeners: 1024 },
    { country: 'Australia', listeners: 843 },
    { country: 'Germany', listeners: 722 }
  ];

  // Function to format date range for display
  const formatDateRange = () => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString("en-US", {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };
    
    const startDate = new Date();
    const endDate = new Date();
    
    if (timeFrame === "7days") {
      startDate.setDate(endDate.getDate() - 7);
    } else if (timeFrame === "30days") {
      startDate.setDate(endDate.getDate() - 30);
    } else if (timeFrame === "90days") {
      startDate.setDate(endDate.getDate() - 90);
    } else {
      startDate.setFullYear(endDate.getFullYear() - 1);
    }
    
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  };

  // Redirect if not signed in
  if (isLoaded && !isSignedIn) {
    router.push("/");
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Track your music&apos;s performance and audience</p>
        </div>
        <Select 
          value={timeFrame} 
          onValueChange={(value) => setTimeFrame(value as any)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Time Period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 Days</SelectItem>
            <SelectItem value="30days">Last 30 Days</SelectItem>
            <SelectItem value="90days">Last 90 Days</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Period Info and Summary */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Summary for {formatDateRange()}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Total Plays</p>
              <div className="flex items-center">
                <div className="text-2xl font-bold mr-2">{totalPlays.toLocaleString()}</div>
                <Badge variant="outline" className="text-green-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +7%
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Total Likes</p>
              <div className="flex items-center">
                <div className="text-2xl font-bold mr-2">{totalLikes.toLocaleString()}</div>
                <Badge variant="outline" className="text-green-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12%
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Avg. Plays per Song</p>
              <div className="flex items-center">
                <div className="text-2xl font-bold mr-2">{avgPlaysPerSong.toLocaleString()}</div>
                <Badge variant="outline" className="text-green-500">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3%
                </Badge>
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground text-sm">Engagement Rate</p>
              <div className="flex items-center">
                <div className="text-2xl font-bold mr-2">{engagementRate}%</div>
                <Badge variant="outline" className="text-red-500">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -2%
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Different Analytics Views */}
      <Tabs defaultValue="engagement" className="w-full">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
          <TabsTrigger value="songs">Songs</TabsTrigger>
        </TabsList>
        
        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Plays Over Time</CardTitle>
                <CardDescription>
                  Track your song&apos;s listens over {timeFrame === "year" ? "the last year" : `the last ${timeFrame}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Line 
                    data={playData} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                    }} 
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Likes Over Time</CardTitle>
                <CardDescription>Track how many people liked your songs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <Bar 
                    data={likeData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: 'top',
                        },
                      },
                    }} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Engagement Rate</CardTitle>
              <CardDescription>The percentage of plays that resulted in likes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <Line 
                  data={engagementData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                          callback: function(value: any) {
                            return value + '%';
                          }
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'top',
                      },
                    },
                  }} 
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Audience Tab */}
        <TabsContent value="audience" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Device Breakdown</CardTitle>
                <CardDescription>What devices your listeners use</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex justify-center">
                  <div className="w-72 h-72">
                    <Doughnut 
                      data={audienceData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'top',
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
                <CardTitle>Top Listener Locations</CardTitle>
                <CardDescription>Countries with the most plays</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead className="text-right">Listeners</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {listenersByCountry.map((item) => (
                      <TableRow key={item.country}>
                        <TableCell>{item.country}</TableCell>
                        <TableCell className="text-right">{item.listeners.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Songs Tab */}
        <TabsContent value="songs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Songs</CardTitle>
              <CardDescription>Your most played songs in this period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Song</TableHead>
                    <TableHead className="text-center">Plays</TableHead>
                    <TableHead className="text-center">Likes</TableHead>
                    <TableHead className="text-right">Engagement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {popularSongs.slice(0, 5).map((song: any, i: number) => {
                    // Calculate engagement rate for each song
                    const songEngagement = song.plays 
                      ? Math.round((song.likes || 0) / song.plays * 100) 
                      : 0;
                      
                    return (
                      <TableRow key={song._id}>
                        <TableCell className="font-medium">{i + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {song.coverArt && (
                              <div className="w-8 h-8 mr-3 rounded overflow-hidden">
                                <Image 
                                  src={song.coverArt} 
                                  alt={song.title}
                                  width={32}
                                  height={32}
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <div className="font-medium">{song.title}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          {(song.plays || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-center">
                          {(song.likes || 0).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {songEngagement}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => router.push('/studio/songs')}>
                  View All Songs <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
