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
  EyeOff,
  Eye,
  Play,
  Search,
  ArrowUpDown,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

import { usePlayerStore } from "@/lib/player-store";
import { EditSongDialog } from "@/components/edit-song-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SongsPage() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("releaseDate");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Player state
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

  // Fetch songs
  const allSongs =
    useQuery(
      api.music.getSongsByArtist,
      isLoaded && isSignedIn ? { artistId: user?.id } : "skip"
    ) || [];

  // Filter and sort songs
  const filteredSongs = allSongs
    .filter(
      (song) =>
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.artistName.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let valueA = a[sortField as keyof typeof a];
      let valueB = b[sortField as keyof typeof b];

      if (valueA === undefined) valueA = 0;
      if (valueB === undefined) valueB = 0;

      const comparison = valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
      return sortDirection === "desc" ? -comparison : comparison;
    });

  // Pagination
  const totalPages = Math.ceil(filteredSongs.length / itemsPerPage);
  const paginatedSongs = filteredSongs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

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

  // Handle toggle publication status
  const handleTogglePublicationStatus = async (song: Song) => {
    if (!user || !song._id) return;

    try {
      await toggleSongPublicationStatus({
        id: song._id as SongId,
        artistId: user.id,
        isPublic: !song.isPublic,
      });

      setStatusMessage({
        type: "success",
        message: song.isPublic
          ? "Song moved to drafts"
          : "Song published successfully",
      });

      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (error) {
      console.error("Failed to update song status:", error);

      setStatusMessage({
        type: "error",
        message: "Failed to update song status",
        songId: song._id,
      });

      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    }
  };

  // Handle sort change
  const handleSortChange = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      setSortField(field);
      setSortDirection("desc");
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
          <h1 className="text-3xl font-bold">All Songs</h1>
          <Button onClick={() => router.push("/studio/upload")}>
            <Music className="mr-2 h-4 w-4" /> Upload New Song
          </Button>
        </div>

        {/* Filters and search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search songs by title or artist..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={sortField}
                  onValueChange={(value) => handleSortChange(value)}
                >
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="title">Title</SelectItem>
                    <SelectItem value="releaseDate">Release Date</SelectItem>
                    <SelectItem value="plays">Plays</SelectItem>
                    <SelectItem value="likes">Likes</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() =>
                    setSortDirection(sortDirection === "desc" ? "asc" : "desc")
                  }
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Songs table */}
        <Card>
          <CardHeader>
            <CardTitle>Your Songs ({filteredSongs.length})</CardTitle>
            <CardDescription>Manage your music catalog</CardDescription>
          </CardHeader>
          <CardContent>
            {filteredSongs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <Music className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No songs found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery
                    ? "No songs match your search query."
                    : "You haven't uploaded any songs yet."}
                </p>
                <Button onClick={() => router.push("/studio/upload")}>
                  Upload Your First Song
                </Button>
              </div>
            ) : (
              <>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10"></TableHead>
                        <TableHead>Title & Cover</TableHead>
                        <TableHead className="hidden sm:table-cell">
                          Status
                        </TableHead>
                        <TableHead className="hidden md:table-cell">
                          Release Date
                        </TableHead>
                        <TableHead className="hidden md:table-cell text-right">
                          Plays
                        </TableHead>
                        <TableHead className="hidden md:table-cell text-right">
                          Likes
                        </TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedSongs.map((song) => (
                        <TableRow key={song._id}>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="rounded-full p-0 w-8 h-8"
                              onClick={() => playSong(song)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded overflow-hidden relative bg-muted">
                                {song.coverArt ? (
                                  <Image
                                    src={song.coverArt}
                                    alt={song.title}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full w-full bg-secondary">
                                    <Music className="h-4 w-4 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium">{song.title}</div>
                                <div className="text-xs text-muted-foreground">
                                  {song.artistName}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <Badge
                              variant={song.isPublic ? "default" : "outline"}
                              className={
                                song.isPublic
                                  ? "bg-green-500 hover:bg-green-600"
                                  : ""
                              }
                            >
                              {song.isPublic ? "Published" : "Draft"}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatDate(song.releaseDate)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-right">
                            {song.plays || 0}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-right">
                            {song.likes || 0}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                  onClick={() => playSong(song)}
                                >
                                  <Play className="mr-2 h-4 w-4" /> Play
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEditSong(song)}
                                >
                                  <Edit className="mr-2 h-4 w-4" /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleTogglePublicationStatus(song)
                                  }
                                >
                                  {song.isPublic ? (
                                    <>
                                      <EyeOff className="mr-2 h-4 w-4" />{" "}
                                      Unpublish
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
                                  onClick={() => handleDeleteSong(song._id)}
                                  disabled={deletingSongId === song._id}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-end items-center mt-4 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
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
