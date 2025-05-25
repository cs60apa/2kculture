"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ArrowRight,
  BarChart2,
  Download,
  Music,
  Upload,
  Users,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import Image from "next/image";

// Dashboard page for admin
export default function AdminDashboardPage() {
  const { user } = useUser();
  const userId = user?.id || "";

  const songs = useQuery(api.music.getSongs) ?? [];
  const albums =
    useQuery(api.music.getAlbumsByArtist, { artistId: userId }) ?? [];
  const drafts =
    useQuery(api.music.getDraftSongsByArtist, { artistId: userId }) ?? [];
  const analytics = useQuery(api.analytics.getDashboardStats) ?? {
    totalPlays: 0,
    dailyPlays: [],
    topSongs: [],
  };
  const recentActivity = useQuery(api.analytics.getRecentActivity) ?? [];

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Songs
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {songs.length || <Skeleton className="h-8 w-12" />}
                </h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Music className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-muted-foreground">
              <span className="text-green-500 font-medium">
                +{drafts.length} draft(s)
              </span>
              <span className="ml-1.5">to be published</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Albums
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {albums.length || <Skeleton className="h-8 w-12" />}
                </h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Music className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-muted-foreground">
              <span className="text-blue-500 font-medium">
                Featured collections
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Total Plays
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {analytics.totalPlays.toLocaleString() || (
                    <Skeleton className="h-8 w-16" />
                  )}
                </h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <BarChart2 className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-muted-foreground">
              <span className="text-green-500 font-medium">
                +
                {analytics.dailyPlays?.[analytics.dailyPlays.length - 1]
                  ?.count || 0}{" "}
                today
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Audience
                </p>
                <h3 className="text-2xl font-bold mt-1">
                  {analytics.totalPlays > 0
                    ? Math.floor(analytics.totalPlays / 10)
                    : 0}
                </h3>
              </div>
              <div className="p-2 bg-primary/10 rounded-full">
                <Users className="h-5 w-5 text-primary" />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm text-muted-foreground">
              <span className="text-green-500 font-medium">
                Growing audience
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-5 space-y-6">
          {/* Analytics Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>
                Plays and engagement over the last 30 days
              </CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.dailyPlays?.length > 0 ? (
                <div className="h-[300px] w-full flex items-end justify-between gap-2 border-b border-border pt-4">
                  {analytics.dailyPlays.slice(-14).map((day, i) => (
                    <div
                      key={i}
                      className="relative flex flex-col items-center"
                    >
                      <div
                        className="w-12 bg-primary/80 rounded-t-sm"
                        style={{
                          height: `${Math.max(
                            (day.count /
                              (Math.max(
                                ...analytics.dailyPlays.map((d) => d.count)
                              ) || 1)) *
                              250,
                            20
                          )}px`,
                        }}
                      ></div>
                      <span className="text-xs text-muted-foreground mt-1">
                        {new Date(day.date).getDate()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-[300px] w-full flex items-center justify-center">
                  <p className="text-muted-foreground">No data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your latest music and engagement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {recentActivity.length > 0 ? (
                  <div className="space-y-4">
                    {recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent/50"
                      >
                        <div className="h-12 w-12 rounded-md bg-secondary flex-shrink-0 overflow-hidden">
                          {activity.coverArt ? (
                            <Image
                              src={activity.coverArt}
                              alt={activity.title || "Activity"}
                              width={48}
                              height={48}
                              className="object-cover h-full w-full"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full">
                              <Music className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {activity.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {activity.type} •{" "}
                            {new Date(activity.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-sm font-medium">
                          {activity.type === "play" &&
                            `${activity.count} plays`}
                          {activity.type === "like" &&
                            `${activity.count} likes`}
                          {activity.type === "upload" && "Uploaded"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <Music className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="font-medium">No recent activity</p>
                    <p className="text-sm text-muted-foreground">
                      Upload your first song to get started
                    </p>
                    <Button asChild className="mt-4">
                      <Link href="/admin/upload">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Music
                      </Link>
                    </Button>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" asChild>
                <Link href="/admin/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New Song
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/admin/songs">
                  <Music className="mr-2 h-4 w-4" />
                  Manage Songs
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                asChild
              >
                <Link href="/admin/analytics">
                  <BarChart2 className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
              <Button
                variant="secondary"
                className="w-full justify-start"
                asChild
              >
                <Link href="/admin/drafts">
                  <Download className="mr-2 h-4 w-4" />
                  View Drafts
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Top Songs */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing</CardTitle>
              <CardDescription>Your most played songs</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.topSongs?.length > 0 ? (
                <div className="space-y-4">
                  {analytics.topSongs.slice(0, 5).map((song, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="font-bold text-muted-foreground w-4">
                        {index + 1}
                      </div>
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
                        <p className="text-xs text-muted-foreground">
                          {song.plays} plays
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/songs?id=${song.id}`}>
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">No data available yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
