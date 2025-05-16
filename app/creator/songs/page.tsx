"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Music, Edit, Trash2, Upload, Play } from "lucide-react";
import Image from "next/image";
import { EditSongDialog } from "@/components/edit-song-dialog";
import { Song, SongId } from "@/types/song";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { usePlayerStore } from "@/lib/player-store";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SongsPage() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState("songs");
  const { playSong } = usePlayerStore();

  // State for edit song dialog
  const [editSongDialogOpen, setEditSongDialogOpen] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
    songId?: string;
  } | null>(null);

  // Delete song functionality
  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);
  const deleteSong = useMutation(api.music.deleteSong);

  // Fetch songs by the current artist
  const songs = useQuery(
    api.music.getSongsByArtist,
    isSignedIn && user ? { artistId: user.id } : "skip"
  );

  // Format date
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "N/A";
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Handle song deletion
  const handleDeleteSong = async (songId: string) => {
    if (!user || !songId) return;

    // Confirmation dialog
    if (
      !window.confirm(
        "Are you sure you want to delete this song? This action cannot be undone."
      )
    ) {
      return;
    }

    setDeletingSongId(songId);

    try {
      await deleteSong({
        id: songId as SongId,
        artistId: user.id,
      });

      // Show success message
      setStatusMessage({
        type: "success",
        message: "Song deleted successfully",
      });

      // Clear the status message after 3 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Failed to delete song:", error);

      // Show error message
      setStatusMessage({
        type: "error",
        message: "Failed to delete song",
        songId: songId,
      });

      // Clear the error message after 3 seconds
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } finally {
      setDeletingSongId(null);
    }
  };

  // Since we're using playSong directly in our onClick handlers,
  // we don't need a separate handlePlaySong function

  // Redirect if not signed in
  if (isLoaded && !isSignedIn) {
    return router.push("/");
  }

  return (
    <>
      <Navbar />
      <div className="container max-w-7xl mx-auto pt-24 pb-16 px-4 sm:px-6">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/4">
            <Card>
              <CardHeader>
                <CardTitle>Creator Studio</CardTitle>
                <CardDescription>Upload and manage your music</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col space-y-2">
                  <Button
                    variant={activeTab === "upload" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => router.push("/creator")}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Music
                  </Button>
                  <Button
                    variant={activeTab === "songs" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => setActiveTab("songs")}
                  >
                    <Music className="mr-2 h-4 w-4" />
                    My Songs
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="w-full md:w-3/4">
            <Card className="mb-8">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>My Songs</CardTitle>
                    <CardDescription>
                      Manage and monitor all your uploaded music
                    </CardDescription>
                  </div>
                  <Button onClick={() => router.push("/creator")}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload New
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {statusMessage && !statusMessage.songId && (
                  <div
                    className={`mb-4 p-4 rounded-md ${
                      statusMessage.type === "success"
                        ? "bg-green-50 text-green-800 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900"
                        : "bg-red-50 text-red-800 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900"
                    }`}
                  >
                    {statusMessage.message}
                  </div>
                )}

                {songs === undefined ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : songs && songs.length > 0 ? (
                  <div className="space-y-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[100px]">Cover</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Genres</TableHead>
                          <TableHead>Uploaded</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                          <TableHead className="text-center">Stats</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {songs.map((song: Song) => (
                          <TableRow
                            key={song._id}
                            className={
                              statusMessage?.songId === song._id
                                ? statusMessage.type === "success"
                                  ? "bg-green-50 dark:bg-green-900/10"
                                  : "bg-red-50 dark:bg-red-900/10"
                                : ""
                            }
                          >
                            <TableCell>
                              <div className="h-12 w-12 rounded-md bg-secondary flex items-center justify-center overflow-hidden">
                                {song.coverArt && song.coverArt.length > 0 ? (
                                  <div className="relative h-full w-full">
                                    <Image
                                      src={song.coverArt as string}
                                      alt={song.title}
                                      fill
                                      sizes="48px"
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <Music className="h-6 w-6 text-muted-foreground" />
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span>{song.title}</span>
                                <span className="text-xs text-muted-foreground">
                                  {song.artistName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {song.genres
                                  ?.slice(0, 2)
                                  .map((genre: string, index: number) => (
                                    <Badge key={index} variant="outline">
                                      {genre}
                                    </Badge>
                                  ))}
                                {song.genres && song.genres.length > 2 && (
                                  <Badge variant="outline">
                                    +{song.genres.length - 2}
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              {formatDate(song.releaseDate)}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={song.isPublic ? "default" : "outline"}
                              >
                                {song.isPublic ? "Public" : "Private"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex flex-col items-center">
                                <span className="font-medium">
                                  {song.plays || 0}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  plays
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => playSong(song)}
                                >
                                  <Play className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => {
                                    setSelectedSong(song);
                                    setEditSongDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="text-destructive"
                                  onClick={() => handleDeleteSong(song._id)}
                                  disabled={deletingSongId === song._id}
                                >
                                  {deletingSongId === song._id ? (
                                    <span className="animate-spin h-4 w-4 border-2 border-destructive border-t-transparent rounded-full" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-primary/10 p-3 rounded-full mb-4">
                      <Music className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">No songs yet</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven&apos;t uploaded any songs yet. Start sharing
                      your music with the world!
                    </p>
                    <Button onClick={() => router.push("/creator")}>
                      <Upload className="mr-2 h-4 w-4" />
                      Upload Your First Song
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Player is now handled globally */}
          </div>
        </div>
      </div>
      <Footer />

      {/* Edit Song Dialog */}
      <EditSongDialog
        song={selectedSong}
        isOpen={editSongDialogOpen}
        onClose={() => {
          setEditSongDialogOpen(false);
          setSelectedSong(null);
        }}
        onSuccess={() => {
          // Show success message
          if (selectedSong) {
            setStatusMessage({
              type: "success",
              message: "Song updated successfully",
              songId: selectedSong._id,
            });

            // Clear the status message after 3 seconds
            setTimeout(() => {
              setStatusMessage(null);
            }, 3000);
          }
        }}
      />
    </>
  );
}
