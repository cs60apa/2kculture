"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Pencil,
  Music,
  Disc,
  FileText,
  Folder,
  Play,
  ArrowRight,
  Plus,
  Upload,
  Save,
  Trash,
  MoreHorizontal,
  Clock,
  Edit,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Define content types that can be created in the studio
type ContentType = "song" | "album" | "playlist" | "blog";

// Content Studio page for admin
export default function ContentStudioPage() {
  const { user } = useUser();
  const userId = user?.id || "";

  const [activeTab, setActiveTab] = useState<string>("drafts");
  const [selectedContentType, setSelectedContentType] =
    useState<ContentType | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Fetch drafts
  const draftSongs =
    useQuery(api.music.getDraftSongsByArtist, { artistId: userId }) ?? [];
  const allAlbums =
    useQuery(api.music.getAlbumsByArtist, { artistId: userId }) ?? [];
  const draftAlbums = allAlbums.filter((album) => !album.isPublic);

  // Get recent activity
  const recentActivity = useQuery(api.analytics.getRecentActivity) ?? [];

  // Calculate stats
  const totalDrafts = draftSongs.length + draftAlbums.length;
  const publishedSongs =
    useQuery(api.music.getSongsByArtist, { artistId: userId }) ?? [];
  const publishedSongsCount = publishedSongs.filter(
    (song) => song.isPublic
  ).length;

  // Handle content creation
  const handleCreateContent = (type: ContentType) => {
    setSelectedContentType(type);
    setIsCreateDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setSelectedContentType(null);
  };

  // Navigate to appropriate creation page
  const navigateToCreate = () => {
    setIsCreateDialogOpen(false);

    switch (selectedContentType) {
      case "song":
        window.location.href = "/admin/upload";
        break;
      case "album":
        window.location.href = "/admin/albums?create=true";
        break;
      case "playlist":
        // Future feature
        break;
      case "blog":
        // Future feature
        break;
    }
  };

  // Format date
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time ago
  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";

    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";

    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";

    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";

    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";

    return Math.floor(seconds) + " seconds ago";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Content Studio</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage your music and content
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                Drafts
              </p>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold">{totalDrafts}</h3>
                <Badge
                  variant="outline"
                  className="bg-yellow-50 text-yellow-600 border-yellow-200"
                >
                  In Progress
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {draftSongs.length} songs, {draftAlbums.length} albums
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                Published
              </p>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold">{publishedSongsCount}</h3>
                <Badge
                  variant="outline"
                  className="bg-green-50 text-green-600 border-green-200"
                >
                  Live
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {publishedSongsCount} songs,{" "}
                {allAlbums.filter((a) => a.isPublic).length} albums
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                Total Plays
              </p>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold">
                  {publishedSongs.reduce(
                    (sum, song) => sum + (song.plays || 0),
                    0
                  )}
                </h3>
                <div className="flex items-center text-xs text-green-600">
                  <ArrowRight className="h-3 w-3 mr-1 rotate-45" />
                  12%
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Across all songs
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                Storage Used
              </p>
              <div className="flex items-end justify-between">
                <h3 className="text-2xl font-bold">2.4 GB</h3>
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-600 border-blue-200"
                >
                  25%
                </Badge>
              </div>
              <Progress value={25} className="h-1 mt-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Your Content</CardTitle>
              <CardDescription>
                Manage your drafts and published content
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <div className="px-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="drafts">Drafts</TabsTrigger>
                    <TabsTrigger value="published">Published</TabsTrigger>
                    <TabsTrigger value="all">All Content</TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="drafts" className="mt-6">
                  {totalDrafts === 0 ? (
                    <div className="text-center py-12 px-6">
                      <div className="flex justify-center">
                        <FileText className="h-12 w-12 text-muted-foreground opacity-20" />
                      </div>
                      <h3 className="mt-4 text-lg font-medium">
                        No Drafts Found
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        You don't have any draft content. Create something new!
                      </p>
                      <Button
                        className="mt-4"
                        onClick={() => setIsCreateDialogOpen(true)}
                      >
                        Create New
                      </Button>
                    </div>
                  ) : (
                    <ScrollArea className="h-[400px] px-6">
                      <div className="space-y-4 pt-1 pb-6">
                        {draftSongs.slice(0, 5).map((song) => (
                          <div
                            key={song._id}
                            className="flex items-center justify-between py-2 border-b"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded bg-secondary overflow-hidden flex-shrink-0">
                                {song.coverArt ? (
                                  <Image
                                    src={song.coverArt}
                                    alt={song.title}
                                    width={40}
                                    height={40}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full w-full">
                                    <Music className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{song.title}</p>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Song
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Created {formatDate(song._creationTime)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/songs?edit=${song._id}`}>
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Link>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Play className="mr-2 h-4 w-4" />
                                    Preview
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Publish
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}

                        {draftAlbums.slice(0, 5).map((album) => (
                          <div
                            key={album._id}
                            className="flex items-center justify-between py-2 border-b"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded bg-secondary overflow-hidden flex-shrink-0">
                                {album.coverArt ? (
                                  <Image
                                    src={album.coverArt}
                                    alt={album.title}
                                    width={40}
                                    height={40}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full w-full">
                                    <Disc className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{album.title}</p>
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Album
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Created {formatDate(album._creationTime)}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/albums?edit=${album._id}`}>
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Link>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <ArrowRight className="mr-2 h-4 w-4" />
                                    Publish
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-destructive focus:text-destructive">
                                    <Trash className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>

                      {totalDrafts > 10 && (
                        <div className="py-4 text-center">
                          <Button variant="outline" asChild>
                            <Link href="/admin/drafts">View All Drafts</Link>
                          </Button>
                        </div>
                      )}
                    </ScrollArea>
                  )}
                </TabsContent>

                <TabsContent value="published" className="mt-6">
                  <ScrollArea className="h-[400px] px-6">
                    <div className="space-y-4 pt-1 pb-6">
                      {publishedSongs
                        .filter((song) => song.isPublic)
                        .slice(0, 10)
                        .map((song) => (
                          <div
                            key={song._id}
                            className="flex items-center justify-between py-2 border-b"
                          >
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded bg-secondary overflow-hidden flex-shrink-0">
                                {song.coverArt ? (
                                  <Image
                                    src={song.coverArt}
                                    alt={song.title}
                                    width={40}
                                    height={40}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full w-full">
                                    <Music className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <p className="font-medium">{song.title}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant="default" className="text-xs">
                                    Public
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {song.plays || 0} plays
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" asChild>
                                <Link href={`/admin/songs?edit=${song._id}`}>
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Link>
                              </Button>
                              <Button variant="ghost" size="sm" asChild>
                                <Link
                                  href={`/admin/analytics?songId=${song._id}`}
                                >
                                  Stats
                                </Link>
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="py-4 text-center">
                      <Button variant="outline" asChild>
                        <Link href="/admin/songs">
                          View All Published Content
                        </Link>
                      </Button>
                    </div>
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="all" className="mt-6">
                  <div className="px-6 pb-6">
                    <div className="rounded-lg border p-6 text-center">
                      <h3 className="text-lg font-medium">All Content View</h3>
                      <p className="mt-2 text-sm text-muted-foreground">
                        View comprehensive lists of all your content in the
                        dedicated sections.
                      </p>
                      <div className="mt-4 flex flex-wrap justify-center gap-2">
                        <Button variant="outline" asChild>
                          <Link href="/admin/songs">
                            <Music className="mr-2 h-4 w-4" />
                            Songs
                          </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href="/admin/albums">
                            <Disc className="mr-2 h-4 w-4" />
                            Albums
                          </Link>
                        </Button>
                        <Button variant="outline" asChild>
                          <Link href="/admin/drafts">
                            <FileText className="mr-2 h-4 w-4" />
                            Drafts
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and actions</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {recentActivity.length === 0 ? (
                    <div className="text-center py-6">
                      <Clock className="h-8 w-8 text-muted-foreground opacity-20 mx-auto" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        No recent activity to display
                      </p>
                    </div>
                  ) : (
                    recentActivity.map((activity, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 pb-3 border-b"
                      >
                        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center mt-0.5">
                          {activity.type === "play" ? (
                            <Play className="h-3.5 w-3.5" />
                          ) : activity.type === "like" ? (
                            <Music className="h-3.5 w-3.5" />
                          ) : (
                            <Upload className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm">{activity.message}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Shortcuts to common tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
              <Link href="/admin/upload">
                <Upload className="h-8 w-8 mb-2" />
                <span>Upload Song</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
              <Link href="/admin/albums?create=true">
                <Disc className="h-8 w-8 mb-2" />
                <span>Create Album</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
              <Link href="/admin/drafts">
                <FileText className="h-8 w-8 mb-2" />
                <span>View Drafts</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4" asChild>
              <Link href="/admin/analytics">
                <Pencil className="h-8 w-8 mb-2" />
                <span>Analytics</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Create Content Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Content</DialogTitle>
            <DialogDescription>
              Choose what type of content you want to create.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <RadioGroup
              defaultValue="song"
              value={selectedContentType || undefined}
              onValueChange={(value) =>
                setSelectedContentType(value as ContentType)
              }
            >
              <div className="flex items-center space-x-2 pb-2 border-b">
                <RadioGroupItem value="song" id="song" />
                <Label
                  htmlFor="song"
                  className="flex items-center cursor-pointer"
                >
                  <Music className="mr-2 h-4 w-4" />
                  Song
                </Label>
              </div>
              <div className="flex items-center space-x-2 pb-2 border-b">
                <RadioGroupItem value="album" id="album" />
                <Label
                  htmlFor="album"
                  className="flex items-center cursor-pointer"
                >
                  <Disc className="mr-2 h-4 w-4" />
                  Album
                </Label>
              </div>
              <div className="flex items-center space-x-2 pb-2 border-b opacity-60">
                <RadioGroupItem value="playlist" id="playlist" disabled />
                <Label
                  htmlFor="playlist"
                  className="flex items-center cursor-not-allowed"
                >
                  <Folder className="mr-2 h-4 w-4" />
                  Playlist (Coming Soon)
                </Label>
              </div>
              <div className="flex items-center space-x-2 pb-2 border-b opacity-60">
                <RadioGroupItem value="blog" id="blog" disabled />
                <Label
                  htmlFor="blog"
                  className="flex items-center cursor-not-allowed"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Blog Post (Coming Soon)
                </Label>
              </div>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button onClick={navigateToCreate} disabled={!selectedContentType}>
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
