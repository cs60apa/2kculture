"use client";

import { AdminDashboardLayout } from "@/components/admin-dashboard-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useState } from "react";
import { EditSongDialog } from "@/components/edit-song-dialog";
import { toast } from "sonner";
import {
  ArrowUpDown,
  Edit,
  Eye,
  EyeOff,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Song } from "@/types/song";

export default function AllSongsPage() {
  const { user } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingSong, setEditingSong] = useState<Song | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  // Get all songs
  const allSongs = useQuery(
    api.music.getSongsByArtist,
    user?.id ? { artistId: user.id } : "skip"
  );

  // Get published songs
  const publishedSongs = useQuery(
    api.music.getPublishedSongsByArtist,
    user?.id ? { artistId: user.id } : "skip"
  );

  // Get draft songs
  const draftSongs = useQuery(
    api.music.getDraftSongsByArtist,
    user?.id ? { artistId: user.id } : "skip"
  );

  // Mutations
  const togglePublication = useMutation(api.music.toggleSongPublicationStatus);
  const deleteSong = useMutation(api.music.deleteSong);

  // Filter songs based on search query
  const filterSongs = (songs: Song[] | undefined) => {
    if (!songs) return [];
    if (!searchQuery) return songs;

    const query = searchQuery.toLowerCase();
    return songs.filter(
      (song) =>
        song.title.toLowerCase().includes(query) ||
        song.genres?.some((genre) => genre.toLowerCase().includes(query)) ||
        song.tags?.some((tag) => tag.toLowerCase().includes(query))
    );
  };

  // Handle toggle publication status
  const handleTogglePublication = async (
    songId: string,
    currentStatus: boolean
  ) => {
    try {
      await togglePublication({
        id: songId as Id<"songs">,
        artistId: user?.id || "",
        isPublic: !currentStatus,
      });

      toast.success(
        currentStatus
          ? "Song unpublished and moved to drafts"
          : "Song published successfully!"
      );
    } catch (error) {
      toast.error("Failed to update song status");
      console.error(error);
    }
  };

  // Handle delete song
  const handleDeleteSong = async (songId: string) => {
    try {
      await deleteSong({
        id: songId as Id<"songs">,
        artistId: user?.id || "",
      });

      toast.success("Song deleted successfully");
    } catch (error) {
      toast.error("Failed to delete song");
      console.error(error);
    }
  };

  // Get songs based on active tab
  const getSongs = () => {
    switch (activeTab) {
      case "published":
        return filterSongs(publishedSongs);
      case "drafts":
        return filterSongs(draftSongs);
      default:
        return filterSongs(allSongs);
    }
  };

  const songs = getSongs();

  return (
    <AdminDashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">All Songs</h2>
          <p className="text-muted-foreground">
            Manage and organize your music catalog
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/content-studio">
            <Plus className="mr-2 h-4 w-4" /> Upload New Song
          </Link>
        </Button>
      </div>

      <div className="flex items-center py-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, genre, or tag..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Songs</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <SongsTable
            songs={songs}
            onEdit={setEditingSong}
            onTogglePublication={handleTogglePublication}
            onDelete={handleDeleteSong}
          />
        </TabsContent>

        <TabsContent value="published" className="mt-6">
          <SongsTable
            songs={songs}
            onEdit={setEditingSong}
            onTogglePublication={handleTogglePublication}
            onDelete={handleDeleteSong}
          />
        </TabsContent>

        <TabsContent value="drafts" className="mt-6">
          <SongsTable
            songs={songs}
            onEdit={setEditingSong}
            onTogglePublication={handleTogglePublication}
            onDelete={handleDeleteSong}
          />
        </TabsContent>
      </Tabs>

      {editingSong && (
        <EditSongDialog
          song={editingSong}
          onClose={() => setEditingSong(null)}
        />
      )}
    </AdminDashboardLayout>
  );
}

interface SongsTableProps {
  songs: Song[];
  onEdit: (song: Song) => void;
  onTogglePublication: (songId: string, currentStatus: boolean) => void;
  onDelete: (songId: string) => void;
}

function SongsTable({
  songs,
  onEdit,
  onTogglePublication,
  onDelete,
}: SongsTableProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">
              <div className="flex items-center gap-1">
                Song Title <ArrowUpDown className="h-3 w-3" />
              </div>
            </TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Genre</TableHead>
            <TableHead className="text-right">Plays</TableHead>
            <TableHead className="text-right">Added On</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {songs.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center py-6 text-muted-foreground"
              >
                No songs found. Try adjusting your search or upload a new song.
              </TableCell>
            </TableRow>
          )}

          {songs.map((song) => (
            <TableRow key={song._id}>
              <TableCell className="font-medium">{song.title}</TableCell>
              <TableCell>
                {song.isPublic ? (
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800"
                  >
                    Published
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800"
                  >
                    Draft
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {song.genres ? (
                  <div className="flex flex-wrap gap-1">
                    {song.genres.slice(0, 2).map((genre, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="text-xs"
                      >
                        {genre}
                      </Badge>
                    ))}
                    {song.genres.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{song.genres.length - 2}
                      </Badge>
                    )}
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">-</span>
                )}
              </TableCell>
              <TableCell className="text-right">{song.plays || 0}</TableCell>
              <TableCell className="text-right">
                {new Date(song._creationTime || 0).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => onEdit(song)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        onTogglePublication(song._id, song.isPublic)
                      }
                    >
                      {song.isPublic ? (
                        <>
                          <EyeOff className="mr-2 h-4 w-4" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="mr-2 h-4 w-4" />
                          Publish
                        </>
                      )}
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete the song &quot;
                            {song.title}
                            &quot;. This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(song._id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}
