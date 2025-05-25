"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent 
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
import { 
  MoreHorizontal, 
  Edit, 
  Trash, 
  Music, 
  Search, 
  Filter,
  Plus,
  Disc,
  Eye,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Song } from "@/types/song";
import { Id } from "@/convex/_generated/dataModel";

export default function AdminDraftsPage() {
  const { user } = useUser();
  const userId = user?.id || "";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDraft, setSelectedDraft] = useState<Song | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("songs");
  
  // Fetch all drafts for admin
  const draftSongs = useQuery(api.music.getDraftSongsByArtist, { artistId: "" }) ?? [];
  // For albums, we'll filter published vs. unpublished
  const allAlbums = useQuery(api.music.getAlbumsByArtist, { artistId: "" }) ?? [];
  const draftAlbums = allAlbums.filter(album => !album.isPublic);
  
  // Mutations
  const deleteSongMutation = useMutation(api.music.deleteSong);
  const deleteAlbumMutation = useMutation(api.music.deleteAlbum);
  const publishSongMutation = useMutation(api.music.updateSong);
  const publishAlbumMutation = useMutation(api.music.updateAlbum);

  // Apply filtering
  const filteredSongs = searchQuery
    ? draftSongs.filter(
        song => song.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
               song.artistName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : draftSongs;
    
  const filteredAlbums = searchQuery
    ? draftAlbums.filter(
        album => album.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                album.artistName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : draftAlbums;
  
  const handleDraftAction = (action: string, draft: any, type: "song" | "album") => {
    setSelectedDraft(draft);
    
    switch (action) {
      case "edit":
        if (type === "song") {
          window.location.href = `/admin/songs?edit=${draft._id}`;
        } else {
          window.location.href = `/admin/albums?edit=${draft._id}`;
        }
        break;
      case "delete":
        setIsDeleteDialogOpen(true);
        break;
      case "preview":
        setIsPreviewDialogOpen(true);
        break;
      case "publish":
        handlePublish(draft, type);
        break;
      default:
        break;
    }
  };
  
  const handlePublish = async (draft: any, type: "song" | "album") => {
    try {
      if (type === "song") {
        await publishSongMutation({ 
          songId: draft._id, 
          isPublic: true 
        });
      } else {
        await publishAlbumMutation({
          albumId: draft._id,
          isPublic: true
        });
      }
    } catch (error) {
      console.error(`Error publishing ${type}:`, error);
    }
  };
  
  const handleDeleteDraft = async () => {
    if (!selectedDraft) return;
    
    try {
      if ('audioUrl' in selectedDraft) {
        // It's a song
        await deleteSongMutation({ songId: selectedDraft._id });
      } else {
        // It's an album
        await deleteAlbumMutation({ albumId: selectedDraft._id });
      }
      setIsDeleteDialogOpen(false);
      setSelectedDraft(null);
    } catch (error) {
      console.error("Error deleting draft:", error);
    }
  };
  
  const formatDate = (timestamp?: number) => {
    if (!timestamp) return "Unknown";
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Drafts</h1>
        <p className="text-muted-foreground mt-1">
          Manage unpublished songs and albums
        </p>
      </div>
      
      {/* Search and tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search drafts..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="songs">Songs ({draftSongs.length})</TabsTrigger>
            <TabsTrigger value="albums">Albums ({draftAlbums.length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Drafts tables */}
      <Card>
        <CardContent className="p-0">
          <TabsContent value="songs" className="mt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Song</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSongs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                      No draft songs found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSongs.map((song) => (
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
                            <p className="text-xs text-muted-foreground">
                              {song.genres && song.genres.length > 0 
                                ? song.genres.join(", ") 
                                : "No genres"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{song.artistName}</TableCell>
                      <TableCell>{formatDate(song._creationTime)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleDraftAction("edit", song, "song")}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDraftAction("preview", song, "song")}>
                              <Eye className="mr-2 h-4 w-4" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDraftAction("publish", song, "song")}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Publish
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDraftAction("delete", song, "song")}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="albums" className="mt-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Album</TableHead>
                  <TableHead>Artist</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAlbums.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-10">
                      No draft albums found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAlbums.map((album) => (
                    <TableRow key={album._id}>
                      <TableCell>
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
                          <div className="space-y-1">
                            <p className="font-medium">{album.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {album.genres && album.genres.length > 0 
                                ? album.genres.join(", ") 
                                : "No genres"}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{album.artistName}</TableCell>
                      <TableCell>{formatDate(album._creationTime)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleDraftAction("edit", album, "album")}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDraftAction("publish", album, "album")}>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              Publish
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDraftAction("delete", album, "album")}
                              className="text-destructive focus:text-destructive"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </CardContent>
      </Card>
      
      {/* Preview Song Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Preview Song</DialogTitle>
            <DialogDescription>
              Listen to your draft song before publishing.
            </DialogDescription>
          </DialogHeader>
          
          {selectedDraft && 'audioUrl' in selectedDraft && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-24 w-24 rounded bg-secondary overflow-hidden flex-shrink-0">
                  {selectedDraft.coverArt ? (
                    <Image 
                      src={selectedDraft.coverArt} 
                      alt={selectedDraft.title} 
                      width={96} 
                      height={96} 
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full w-full">
                      <Music className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedDraft.title}</h3>
                  <p className="text-muted-foreground">{selectedDraft.artistName}</p>
                </div>
              </div>
              
              <audio 
                src={selectedDraft.audioUrl} 
                controls 
                className="w-full"
              />
              
              <div className="flex justify-between pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => handleDraftAction("edit", selectedDraft, "song")}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Song
                </Button>
                <Button 
                  onClick={() => {
                    handleDraftAction("publish", selectedDraft, "song");
                    setIsPreviewDialogOpen(false);
                  }}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Publish Now
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Draft</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedDraft?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteDraft}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
                <td>Song</td>
                <td>{draft.title}</td>
                <td>Draft</td>
                <td>{/* TODO: Add edit/delete actions */}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
