"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EditSongDialog } from "@/components/edit-song-dialog";
import { 
  MoreHorizontal, 
  Play, 
  Edit, 
  Trash, 
  Music, 
  Search, 
  Filter, 
  Check,
  EyeOff,
  Download,
  Upload,
  ExternalLink,
  BarChart2
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Song } from "@/types/song";

export default function AllSongsPage() {
  const { user } = useUser();
  const userId = user?.id || "";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPlayDialogOpen, setIsPlayDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("all");
  
  // Fetch songs from the database
  const allSongs = useQuery(api.music.getSongs) || [];
  
  // Apply sorting and filtering
  const sortAndFilterSongs = () => {
    let filteredSongs = [...allSongs];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredSongs = filteredSongs.filter(
        song => song.title.toLowerCase().includes(query) || 
               song.artistName.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (filterBy === "public") {
      filteredSongs = filteredSongs.filter(song => song.isPublic);
    } else if (filterBy === "private") {
      filteredSongs = filteredSongs.filter(song => !song.isPublic);
    }
    
    // Apply sorting
    switch (sortBy) {
      case "popular":
        filteredSongs.sort((a, b) => (b.plays || 0) - (a.plays || 0));
        break;
      case "alphabetical":
        filteredSongs.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "recent":
      default:
        filteredSongs.sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0));
        break;
    }
    
    return filteredSongs;
  };
  
  const songs = sortAndFilterSongs();
  
  const handleSongAction = (action: string, song: Song) => {
    setSelectedSong(song);
    
    switch (action) {
      case "edit":
        setIsEditDialogOpen(true);
        break;
      case "delete":
        setIsDeleteDialogOpen(true);
        break;
      case "play":
        setIsPlayDialogOpen(true);
        break;
      default:
        break;
    }
  };
  
  const handleDeleteSong = async () => {
    if (selectedSong) {
      try {
        // Call the mutation to delete the song
        await api.music.deleteSong({ songId: selectedSong._id });
        setIsDeleteDialogOpen(false);
        setSelectedSong(null);
      } catch (error) {
        console.error("Error deleting song:", error);
      }
    }
  };
  
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">All Songs</h2>
          <p className="text-muted-foreground">
            Manage and organize your music library
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/admin/upload">
              <Upload className="mr-2 h-4 w-4" />
              Upload New
            </Link>
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle>Song Library</CardTitle>
            
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full sm:w-[240px]">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search songs or artists..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Status</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setFilterBy("all")}>
                    {filterBy === "all" && <Check className="mr-2 h-4 w-4" />}
                    All Songs
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterBy("public")}>
                    {filterBy === "public" && <Check className="mr-2 h-4 w-4" />}
                    Public Only
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterBy("private")}>
                    {filterBy === "private" && <Check className="mr-2 h-4 w-4" />}
                    Private Only
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setSortBy("recent")}>
                    {sortBy === "recent" && <Check className="mr-2 h-4 w-4" />}
                    Most Recent
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("popular")}>
                    {sortBy === "popular" && <Check className="mr-2 h-4 w-4" />}
                    Most Popular
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy("alphabetical")}>
                    {sortBy === "alphabetical" && <Check className="mr-2 h-4 w-4" />}
                    Alphabetical
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {songs.length > 0 ? (
            <ScrollArea className="h-[calc(100vh-320px)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Song</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date Added</TableHead>
                    <TableHead className="text-right">Plays</TableHead>
                    <TableHead className="text-right">Likes</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {songs.map((song) => (
                    <TableRow key={song._id}>
                      <TableCell>
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
                          <div className="space-y-1">
                            <p className="font-medium">{song.title}</p>
                            <p className="text-xs text-muted-foreground">{song.artistName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {song.isPublic ? (
                          <Badge variant="default">Public</Badge>
                        ) : (
                          <Badge variant="secondary">Private</Badge>
                        )}
                      </TableCell>
                      <TableCell>{formatDate(song._creationTime)}</TableCell>
                      <TableCell className="text-right">{song.plays || 0}</TableCell>
                      <TableCell className="text-right">{song.likes || 0}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleSongAction("play", song)}>
                              <Play className="mr-2 h-4 w-4" />
                              Play
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSongAction("edit", song)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/analytics?songId=${song._id}`}>
                                <BarChart2 className="mr-2 h-4 w-4" />
                                Analytics
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleSongAction("delete", song)}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Music className="h-10 w-10 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">No songs found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? "No songs match your search query" 
                  : "Upload your first song to get started"}
              </p>
              {!searchQuery && (
                <Button asChild>
                  <Link href="/admin/upload">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Song
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Song</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedSong?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteSong}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Song Dialog */}
      {selectedSong && (
        <EditSongDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          song={selectedSong}
        />
      )}
      
      {/* Play Song Dialog */}
      <Dialog open={isPlayDialogOpen} onOpenChange={setIsPlayDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Preview Song</DialogTitle>
            <DialogDescription>
              Listen to "{selectedSong?.title}" by {selectedSong?.artistName}
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col items-center py-4">
            <div className="h-48 w-48 rounded-md bg-secondary overflow-hidden mb-4">
              {selectedSong?.coverArt ? (
                <Image 
                  src={selectedSong.coverArt} 
                  alt={selectedSong.title} 
                  width={192} 
                  height={192} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full w-full">
                  <Music className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <audio 
              src={selectedSong?.audioUrl} 
              controls 
              className="w-full max-w-[400px] mt-4"
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPlayDialogOpen(false)}>
              Close
            </Button>
            <Button asChild>
              <Link href={`/admin/analytics?songId=${selectedSong?._id}`}>
                <BarChart2 className="mr-2 h-4 w-4" />
                View Analytics
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
