"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  ArrowRight,
  BarChart2,
  Calendar,
  Heart,
  LineChart,
  ListMusic,
  Music,
  Play,
  Share2,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Song } from "@/types/song";

export default function AnalyticsPage() {
  const { user } = useUser();
  const userId = user?.id || "";
  const searchParams = useSearchParams();
  const songIdParam = searchParams.get("songId");
  
  const [timeframe, setTimeframe] = useState<"7days" | "30days" | "90days" | "year">("30days");
  const [activeTab, setActiveTab] = useState(songIdParam ? "song" : "overview");
  const [selectedSongId, setSelectedSongId] = useState<string | null>(songIdParam);
  
  // Fetch analytics data
  const artistAnalytics = useQuery(api.analytics.getArtistAnalytics, { 
    artistId: userId 
  });
  
  const playCountAnalytics = useQuery(api.analytics.getPlayCountAnalytics, {
    artistId: userId,
    timeframe,
  });
  
  const engagementAnalytics = useQuery(api.analytics.getEngagementAnalytics, {
    artistId: userId,
    timeframe,
  });
  
  const selectedSongAnalytics = selectedSongId 
    ? useQuery(api.analytics.getSongAnalytics, { songId: selectedSongId })
    : null;
  
  const songs = useQuery(api.music.getSongsByArtist, { artistId: userId }) || [];
  
  // Find the selected song object
  const selectedSong = songs.find(song => song._id === selectedSongId);
  
  useEffect(() => {
    if (songIdParam) {
      setSelectedSongId(songIdParam);
      setActiveTab("song");
    }
  }, [songIdParam]);
  
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "";
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics</h2>
          <p className="text-muted-foreground">
            Track your music performance and audience engagement
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
            <SelectTrigger className="w-[160px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="year">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="songs">Songs Performance</TabsTrigger>
          <TabsTrigger value="song" disabled={!selectedSongId}>
            Song Details
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Plays</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {artistAnalytics?.totalPlays.toLocaleString() || "0"}
                      </h3>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Play className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4 text-sm text-muted-foreground">
                    <span className="text-green-500 font-medium">
                      +{playCountAnalytics?.totalPlays || 0}
                    </span>
                    <span className="ml-1.5">in the selected period</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Unique Listeners</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {playCountAnalytics?.uniqueListeners.toLocaleString() || "0"}
                      </h3>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4 text-sm text-muted-foreground">
                    <span>From {playCountAnalytics?.rankedSongs.length || 0} songs</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Total Likes</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {artistAnalytics?.totalLikes.toLocaleString() || "0"}
                      </h3>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Heart className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4 text-sm text-muted-foreground">
                    <span className="text-green-500 font-medium">
                      +{engagementAnalytics?.engagementByType?.like || 0}
                    </span>
                    <span className="ml-1.5">in the selected period</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Engagement Rate</p>
                      <h3 className="text-2xl font-bold mt-1">
                        {engagementAnalytics ? `${engagementAnalytics.engagementRate.toFixed(1)}%` : "0%"}
                      </h3>
                    </div>
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Share2 className="h-5 w-5 text-primary" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4 text-sm text-muted-foreground">
                    <span>Likes, shares and comments</span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Plays Over Time</CardTitle>
                  <CardDescription>Daily play count for the selected period</CardDescription>
                </CardHeader>
                <CardContent>
                  {artistAnalytics?.dailyPlays?.length ? (
                    <div className="h-[300px] w-full flex items-end justify-between gap-2 border-b border-border pt-4">
                      {artistAnalytics.dailyPlays.map((day, i) => (
                        <div key={i} className="relative flex flex-col items-center">
                          <div 
                            className="w-12 bg-primary/80 rounded-t-sm" 
                            style={{ 
                              height: `${Math.max(
                                (day.count / (Math.max(...artistAnalytics.dailyPlays.map(d => d.count)) || 1)) * 250, 
                                20
                              )}px` 
                            }}
                          ></div>
                          <span className="text-xs text-muted-foreground mt-1">
                            {new Date(day.date).getDate()}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center">
                      <p className="text-muted-foreground">No play data available yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Songs</CardTitle>
                  <CardDescription>Your most played songs</CardDescription>
                </CardHeader>
                <CardContent>
                  {artistAnalytics?.songAnalytics?.length ? (
                    <ScrollArea className="h-[250px] pr-4">
                      <div className="space-y-4">
                        {artistAnalytics.songAnalytics.slice(0, 5).map((song, index) => (
                          <div 
                            key={index} 
                            className="flex items-center gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded-md"
                            onClick={() => {
                              setSelectedSongId(song.id);
                              setActiveTab("song");
                            }}
                          >
                            <div className="font-bold text-muted-foreground w-4">{index + 1}</div>
                            <div className="h-10 w-10 rounded bg-secondary overflow-hidden">
                              {song.coverArt ? (
                                <Image 
                                  src={song.coverArt} 
                                  alt={song.title} 
                                  width={40} 
                                  height={40} 
                                  className="object-cover h-full w-full" 
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full w-full">
                                  <Music className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{song.title}</p>
                              <p className="text-xs text-muted-foreground">{song.plays} plays</p>
                            </div>
                            <Button variant="ghost" size="icon">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center">
                      <p className="text-muted-foreground">No song data available yet</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Engagement Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Engagement Overview</CardTitle>
                <CardDescription>How listeners are interacting with your music</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Engagement by Type</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Heart className="h-4 w-4 mr-2 text-primary" />
                          <span>Likes</span>
                        </div>
                        <span className="font-medium">
                          {engagementAnalytics?.engagementByType?.like || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Share2 className="h-4 w-4 mr-2 text-primary" />
                          <span>Shares</span>
                        </div>
                        <span className="font-medium">
                          {engagementAnalytics?.engagementByType?.share || 0}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Play className="h-4 w-4 mr-2 text-primary" />
                          <span>Plays</span>
                        </div>
                        <span className="font-medium">
                          {playCountAnalytics?.totalPlays || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <h3 className="font-medium mb-4">Audience Growth</h3>
                    <div className="h-[180px] border rounded-md flex items-center justify-center">
                      <p className="text-muted-foreground text-sm">
                        Detailed audience analytics coming soon
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Songs Performance Tab */}
          <TabsContent value="songs">
            <Card>
              <CardHeader>
                <CardTitle>Song Performance</CardTitle>
                <CardDescription>
                  Compare how your songs are performing
                </CardDescription>
              </CardHeader>
              <CardContent>
                {artistAnalytics?.songAnalytics?.length ? (
                  <div className="space-y-6">
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-4">
                        {artistAnalytics.songAnalytics.map((song, index) => (
                          <div key={index} className="border rounded-md p-4">
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                              <div className="flex items-center gap-3 flex-1">
                                <div className="h-16 w-16 rounded bg-secondary overflow-hidden">
                                  {song.coverArt ? (
                                    <Image 
                                      src={song.coverArt} 
                                      alt={song.title} 
                                      width={64} 
                                      height={64} 
                                      className="object-cover h-full w-full" 
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full w-full">
                                      <Music className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-medium">{song.title}</h3>
                                  <p className="text-sm text-muted-foreground">
                                    {formatDate(song.releaseDate)}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-3 gap-4 mt-4 md:mt-0">
                                <div className="text-center">
                                  <p className="text-sm text-muted-foreground">Plays</p>
                                  <p className="font-medium">{song.plays}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm text-muted-foreground">Likes</p>
                                  <p className="font-medium">{song.likes}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm text-muted-foreground">Engagement</p>
                                  <p className="font-medium">
                                    {song.plays > 0 
                                      ? `${((song.likes / song.plays) * 100).toFixed(1)}%` 
                                      : "0%"}
                                  </p>
                                </div>
                              </div>
                              
                              <Button 
                                variant="outline" 
                                onClick={() => {
                                  setSelectedSongId(song.id);
                                  setActiveTab("song");
                                }}
                              >
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold">No songs available</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mt-2 mb-6">
                      Upload your first song to start tracking performance metrics and analytics
                    </p>
                    <Button asChild>
                      <Link href="/admin/upload">Upload Your First Song</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Song Details Tab */}
          <TabsContent value="song">
            {selectedSong && selectedSongAnalytics ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                      <div className="h-24 w-24 rounded-md bg-secondary overflow-hidden">
                        {selectedSong.coverArt ? (
                          <Image 
                            src={selectedSong.coverArt} 
                            alt={selectedSong.title} 
                            width={96} 
                            height={96} 
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full w-full">
                            <Music className="h-10 w-10 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-2xl">{selectedSong.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {selectedSong.artistName} • Added {formatDate(selectedSong._creationTime)}
                        </CardDescription>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {selectedSong.genres?.map((genre, i) => (
                            <span 
                              key={i}
                              className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button asChild>
                        <Link href={`/admin/songs?id=${selectedSong._id}`}>
                          Edit Song
                        </Link>
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle>Performance Over Time</CardTitle>
                      <CardDescription>Daily play count for this song</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {selectedSongAnalytics.dailyPlays?.length ? (
                        <div className="h-[300px] w-full flex items-end justify-between gap-2 border-b border-border pt-4">
                          {selectedSongAnalytics.dailyPlays.map((day, i) => (
                            <div key={i} className="relative flex flex-col items-center">
                              <div 
                                className="w-12 bg-primary/80 rounded-t-sm" 
                                style={{ 
                                  height: `${Math.max(
                                    (day.count / (Math.max(...selectedSongAnalytics.dailyPlays.map(d => d.count)) || 1)) * 250, 
                                    20
                                  )}px` 
                                }}
                              ></div>
                              <span className="text-xs text-muted-foreground mt-1">
                                {new Date(day.date).getDate()}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="h-[300px] flex items-center justify-center">
                          <p className="text-muted-foreground">No play data available yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Play className="h-4 w-4 text-primary" />
                              <span>Total Plays</span>
                            </div>
                            <span className="font-bold">
                              {selectedSongAnalytics.totalPlays}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Heart className="h-4 w-4 text-primary" />
                              <span>Total Likes</span>
                            </div>
                            <span className="font-bold">
                              {selectedSongAnalytics.totalLikes}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Share2 className="h-4 w-4 text-primary" />
                              <span>Engagement Rate</span>
                            </div>
                            <span className="font-bold">
                              {selectedSongAnalytics.totalPlays > 0 
                                ? `${((selectedSongAnalytics.totalLikes / selectedSongAnalytics.totalPlays) * 100).toFixed(1)}%` 
                                : "0%"}
                            </span>
                          </div>
                        </div>
                        
                        <Separator />
                        
                        <div>
                          <h3 className="font-medium mb-2">Play the song</h3>
                          <audio 
                            src={selectedSong.audioUrl} 
                            controls 
                            className="w-full"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Music className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No song selected</h3>
                  <p className="text-muted-foreground max-w-md mx-auto mt-2 mb-6">
                    Select a song from the Songs Performance tab to see detailed analytics
                  </p>
                  <Button onClick={() => setActiveTab("songs")}>
                    View All Songs
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
