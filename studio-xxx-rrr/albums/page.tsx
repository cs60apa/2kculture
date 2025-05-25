"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import {
  Music,
  Edit,
  Trash2,
  Plus,
  MoreHorizontal,
  AlbumIcon,
  Eye,
  EyeOff,
  BarChart2,
} from "lucide-react";

type Album = Doc<"albums"> & {
  _id: Id<"albums">;
};

type Song = Doc<"songs"> & {
  _id: Id<"songs">;
  albumId?: Id<"albums">;
};
import Image from "next/image";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AlbumsPage() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();

  // Status message state
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
    albumId?: string;
  } | null>(null);

  // Delete album state
  const [deletingAlbumId, setDeletingAlbumId] = useState<string | null>(null);
  const deleteAlbum = useMutation(api.music.deleteAlbum);
  const toggleAlbumPublicationStatus = useMutation(
    api.music.toggleAlbumPublicationStatus
  );

  // Fetch albums by the current artist
  const albums =
    useQuery(
      api.music.getAlbumsByArtist,
      isLoaded && isSignedIn ? { artistId: user?.id } : "skip"
    ) || [];

  // Fetch songs for each album
  const songsByAlbum =
    useQuery(
      api.music.getSongsByArtist,
      isLoaded && isSignedIn ? { artistId: user?.id } : "skip"
    ) || [];

  // Group songs by album
  const albumSongs = albums.reduce<Record<string, Song[]>>((acc, album) => {
    acc[album._id] = songsByAlbum.filter((song) => song.albumId === album._id);
    return acc;
  }, {});

  // Handle delete album
  const handleDeleteAlbum = async (albumId: string) => {
    if (!user || !albumId) return;

    // Confirmation dialog
    if (
      !window.confirm(
        "Are you sure you want to delete this album? This action cannot be undone and will also delete any songs associated with this album."
      )
    ) {
      return;
    }

    setDeletingAlbumId(albumId);

    try {
      await deleteAlbum({
        id: albumId as Id<"albums">,
        artistId: user.id,
      });

      setStatusMessage({
        type: "success",
        message: "Album deleted successfully",
      });

      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Failed to delete album:", error);

      setStatusMessage({
        type: "error",
        message: "Failed to delete album",
        albumId: albumId,
      });

      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } finally {
      setDeletingAlbumId(null);
    }
  };

  // Handle toggle publication status
  const handleTogglePublicationStatus = async (album: Album) => {
    if (!user || !album._id) return;

    try {
      await toggleAlbumPublicationStatus({
        id: album._id as Id<"albums">,
        artistId: user.id,
        isPublic: !album.isPublic,
      });

      setStatusMessage({
        type: "success",
        message: album.isPublic
          ? "Album moved to drafts"
          : "Album published successfully",
      });

      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Failed to update album status:", error);

      setStatusMessage({
        type: "error",
        message: "Failed to update album status",
        albumId: album._id,
      });

      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    }
  };

  // Format date from timestamp
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Calculate album stats
  const getAlbumStats = (albumId: string) => {
    const songs = albumSongs[albumId] || [];
    const totalPlays = songs.reduce((sum, song) => sum + (song.plays || 0), 0);
    const totalLikes = songs.reduce((sum, song) => sum + (song.likes || 0), 0);
    const songCount = songs.length;

    return { totalPlays, totalLikes, songCount };
  };

  // Redirect if not signed in
  if (isLoaded && !isSignedIn) {
    router.push("/");
    return null;
  }

  return (
    <>
      {/* Status message */}
      {statusMessage && (
        <div
          className={`fixed top-20 right-4 z-50 p-4 rounded-md shadow-md ${
            statusMessage.type === "success"
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {statusMessage.message}
        </div>
      )}

      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Albums</h1>
          <Button onClick={() => router.push("/studio/upload")}>
            <Plus className="mr-2 h-4 w-4" /> Create Album
          </Button>
        </div>

        {albums.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="flex flex-col items-center justify-center">
                <AlbumIcon className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Albums Yet</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  Create your first album and organize your songs into a
                  cohesive listening experience.
                </p>
                <Button onClick={() => router.push("/studio/upload")}>
                  <Plus className="mr-2 h-4 w-4" /> Create Your First Album
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => {
              const { totalPlays, totalLikes, songCount } = getAlbumStats(
                album._id
              );

              return (
                <Card key={album._id} className="overflow-hidden">
                  <div className="h-48 relative bg-muted">
                    {album.coverArt ? (
                      <Image
                        src={album.coverArt}
                        alt={album.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full w-full bg-secondary">
                        <AlbumIcon className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    {album.isPublic ? (
                      <Badge className="absolute top-3 left-3 bg-green-500">
                        Published
                      </Badge>
                    ) : (
                      <Badge
                        className="absolute top-3 left-3"
                        variant="outline"
                      >
                        Draft
                      </Badge>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Album Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/studio/albums/${album._id}`)
                          }
                        >
                          <Edit className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleTogglePublicationStatus(album)}
                        >
                          {album.isPublic ? (
                            <>
                              <EyeOff className="mr-2 h-4 w-4" /> Unpublish
                            </>
                          ) : (
                            <>
                              <Eye className="mr-2 h-4 w-4" /> Publish
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => handleDeleteAlbum(album._id)}
                          disabled={deletingAlbumId === album._id}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-xl truncate">
                      {album.title}
                    </CardTitle>
                    <CardDescription>
                      {formatDate(album.releaseDate)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 border rounded-md">
                        <p className="text-xs text-muted-foreground">Songs</p>
                        <p className="font-medium">{songCount}</p>
                      </div>
                      <div className="text-center p-2 border rounded-md">
                        <p className="text-xs text-muted-foreground">Plays</p>
                        <p className="font-medium">{totalPlays}</p>
                      </div>
                      <div className="text-center p-2 border rounded-md">
                        <p className="text-xs text-muted-foreground">Likes</p>
                        <p className="font-medium">{totalLikes}</p>
                      </div>
                    </div>

                    {album.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                        {album.description}
                      </p>
                    )}

                    {album.genres && album.genres.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {album.genres.map((genre: string, index: number) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs"
                          >
                            {genre}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/studio/albums/${album._id}`)}
                    >
                      <Music className="mr-2 h-4 w-4" /> Manage Songs
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        router.push(`/studio/analytics?albumId=${album._id}`)
                      }
                    >
                      <BarChart2 className="mr-2 h-4 w-4" /> Stats
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
