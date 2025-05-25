"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { SongId, Song } from "@/types/song";
import { useRouter } from "next/navigation";
import {
  Music,
  Edit,
  Trash2,
  Eye,
  Play,
  FileAudio,
  MoreHorizontal,
  Plus,
} from "lucide-react";
import Image from "next/image";

import { usePlayerStore } from "@/lib/player-store";
import { EditSongDialog } from "@/components/edit-song-dialog";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DraftsPage() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const { playSong } = usePlayerStore();

  // Edit dialog state
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);

  // Status message state
  const [statusMessage, setStatusMessage] = useState<{
    type: "success" | "error";
    message: string;
    songId?: string;
  } | null>(null);

  // Delete song state
  const [deletingSongId, setDeletingSongId] = useState<string | null>(null);
  const deleteSong = useMutation(api.music.deleteSong);
  const toggleSongPublicationStatus = useMutation(
    api.music.toggleSongPublicationStatus
  );

  // Fetch songs by the current artist
  const allSongs =
    useQuery(
      api.music.getSongsByArtist,
      isLoaded && isSignedIn ? { artistId: user?.id } : "skip"
    ) || [];

  // Filter for draft songs only
  const draftSongs = allSongs.filter((song) => !song.isPublic);

  // Handle edit song
  const handleEditSong = (song: Song) => {
    setSelectedSong(song);
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

      setStatusMessage({
        type: "success",
        message: "Song deleted successfully",
      });

      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Failed to delete song:", error);

      setStatusMessage({
        type: "error",
        message: "Failed to delete song",
        songId: songId,
      });

      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } finally {
      setDeletingSongId(null);
    }
  };

  // Handle publish song
  const handlePublishSong = async (song: Song) => {
    if (!user || !song._id) return;

    try {
      await toggleSongPublicationStatus({
        id: song._id as SongId,
        artistId: user.id,
        isPublic: true,
      });

      setStatusMessage({
        type: "success",
        message: "Song published successfully",
      });

      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Failed to publish song:", error);

      setStatusMessage({
        type: "error",
        message: "Failed to publish song",
        songId: song._id,
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
          <h1 className="text-3xl font-bold">Draft Songs</h1>
          <Button onClick={() => router.push("/studio/upload")}>
            <Plus className="mr-2 h-4 w-4" /> New Upload
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Draft Songs ({draftSongs.length})</CardTitle>
            <CardDescription>
              Songs that are not yet published and visible only to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {draftSongs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <FileAudio className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No draft songs</h3>
                <p className="text-muted-foreground mb-4">
                  All your songs are published or you haven&apos;t created any
                  drafts yet.
                </p>
                <Button onClick={() => router.push("/studio/upload")}>
                  Create New Draft
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {draftSongs.map((song) => (
                  <Card key={song._id} className="overflow-hidden">
                    <div className="h-48 relative bg-muted">
                      {song.coverArt ? (
                        <Image
                          src={song.coverArt}
                          alt={song.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full bg-secondary">
                          <Music className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
                        onClick={() => playSong(song)}
                      >
                        <Play className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">
                            {song.title}
                          </CardTitle>
                          <CardDescription>{song.artistName}</CardDescription>
                        </div>
                        <Badge variant="outline" className="mb-2">
                          Draft
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-xs text-muted-foreground mb-4">
                        Created: {formatDate(song._creationTime)}
                      </div>
                      <div className="flex justify-between gap-2">
                        <Button
                          size="sm"
                          onClick={() => handlePublishSong(song)}
                          className="flex-grow"
                        >
                          <Eye className="mr-2 h-4 w-4" /> Publish
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => handleEditSong(song)}
                            >
                              <Edit className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600 focus:text-red-600"
                              onClick={() => handleDeleteSong(song._id)}
                              disabled={deletingSongId === song._id}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Edit song dialog */}
      {selectedSong && (
        <EditSongDialog
          song={selectedSong}
          onClose={() => {
            setSelectedSong(null);
          }}
          onSuccess={() => {
            setSelectedSong(null);
            setStatusMessage({
              type: "success",
              message: "Song updated successfully",
            });
            setTimeout(() => {
              setStatusMessage(null);
            }, 3000);
          }}
        />
      )}
    </>
  );
}
