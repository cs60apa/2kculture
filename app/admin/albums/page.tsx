"use client";

import { useEffect, useState } from "react";
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
  LayoutGrid
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Id } from "@/convex/_generated/dataModel";

// Define type for Album
interface Album {
  _id: Id<"albums">;
  title: string;
  artistId: string;
  artistName: string;
  coverArt?: string;
  releaseDate: number;
  genres?: string[];
  description?: string;
  isPublic: boolean;
  _creationTime?: number;
}

// Albums management page for admin
export default function AdminAlbumsPage() {
  const { user } = useUser();
  const userId = user?.id || "";
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState("recent");
  const [filterBy, setFilterBy] = useState("all");
  
  // Form values
  const [createFormValues, setCreateFormValues] = useState({
    title: "",
    artistName: user?.fullName || "",
    description: "",
    coverArt: "",
    isPublic: false
  });
  
  const [editFormValues, setEditFormValues] = useState({
    title: "",
    artistName: "",
    description: "",
    coverArt: "",
    isPublic: false
  });
  
  // Fetch albums from the database - in admin mode, fetch all albums
  const allAlbums = useQuery(api.music.getAlbumsByArtist, { artistId: "" }) ?? [];
  
  // Mutations
  const createAlbumMutation = useMutation(api.music.createAlbum);
  const updateAlbumMutation = useMutation(api.music.updateAlbum);
  const deleteAlbumMutation = useMutation(api.music.deleteAlbum);
  
  // Apply sorting and filtering
  const sortAndFilterAlbums = () => {
    let filteredAlbums = [...allAlbums];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredAlbums = filteredAlbums.filter(
        album => album.title.toLowerCase().includes(query) || 
                album.artistName.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (filterBy === "public") {
      filteredAlbums = filteredAlbums.filter(album => album.isPublic);
    } else if (filterBy === "private") {
      filteredAlbums = filteredAlbums.filter(album => !album.isPublic);
    }
    
    // Apply sorting
    switch (sortBy) {
      case "alphabetical":
        filteredAlbums.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "recent":
      default:
        filteredAlbums.sort((a, b) => (b._creationTime || 0) - (a._creationTime || 0));
        break;
    }
    
    return filteredAlbums;
  };
  
  const albums = sortAndFilterAlbums();
  
  // Reset and populate forms when selectedAlbum changes
  useEffect(() => {
    if (selectedAlbum) {
      setEditFormValues({
        title: selectedAlbum.title,
        artistName: selectedAlbum.artistName,
        description: selectedAlbum.description || "",
        coverArt: selectedAlbum.coverArt || "",
        isPublic: selectedAlbum.isPublic
      });
    }
  }, [selectedAlbum]);
  
  const handleAlbumAction = (action: string, album: Album) => {
    setSelectedAlbum(album);
    
    switch (action) {
      case "edit":
        setIsEditDialogOpen(true);
        break;
      case "delete":
        setIsDeleteDialogOpen(true);
        break;
      default:
        break;
    }
  };
  
  const handleDeleteAlbum = async () => {
    if (selectedAlbum) {
      try {
        await deleteAlbumMutation({ albumId: selectedAlbum._id });
        setIsDeleteDialogOpen(false);
        setSelectedAlbum(null);
      } catch (error) {
        console.error("Error deleting album:", error);
      }
    }
  };
  
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAlbumMutation({
        title: createFormValues.title,
        artistId: userId,
        artistName: createFormValues.artistName,
        coverArt: createFormValues.coverArt || undefined,
        description: createFormValues.description || undefined,
        isPublic: createFormValues.isPublic,
      });
      
      setIsCreateDialogOpen(false);
      setCreateFormValues({
        title: "",
        artistName: user?.fullName || "",
        description: "",
        coverArt: "",
        isPublic: false
      });
    } catch (error) {
      console.error("Error creating album:", error);
    }
  };
  
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAlbum) return;
    
    try {
      await updateAlbumMutation({
        albumId: selectedAlbum._id,
        title: editFormValues.title,
        artistName: editFormValues.artistName,
        coverArt: editFormValues.coverArt || undefined,
        description: editFormValues.description || undefined,
        isPublic: editFormValues.isPublic,
      });
      
      setIsEditDialogOpen(false);
      setSelectedAlbum(null);
    } catch (error) {
      console.error("Error updating album:", error);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Albums</h1>
          <p className="text-muted-foreground mt-1">
            Manage your albums and their songs
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Album
        </Button>
      </div>
      
      {/* Filters and search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search albums..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                {filterBy === "all" ? "All" : filterBy === "public" ? "Public" : "Private"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFilterBy("all")}>
                All
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy("public")}>
                Public
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterBy("private")}>
                Private
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <LayoutGrid className="mr-2 h-4 w-4" />
                {sortBy === "recent" ? "Recent" : "A-Z"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSortBy("recent")}>
                Recent
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("alphabetical")}>
                Alphabetical
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Albums table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Album</TableHead>
                <TableHead>Artist</TableHead>
                <TableHead>Release Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {albums.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    No albums found.
                  </TableCell>
                </TableRow>
              ) : (
                albums.map((album) => (
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
                    <TableCell>{formatDate(album.releaseDate)}</TableCell>
                    <TableCell>
                      {album.isPublic ? (
                        <Badge variant="default">Public</Badge>
                      ) : (
                        <Badge variant="secondary">Private</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleAlbumAction("edit", album)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/songs?albumId=${album._id}`}>
                              <Music className="mr-2 h-4 w-4" />
                              View Songs
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleAlbumAction("delete", album)}
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
        </CardContent>
      </Card>
      
      {/* Create Album Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Album</DialogTitle>
            <DialogDescription>
              Add a new album to your collection. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Album Title</Label>
              <Input 
                id="title"
                placeholder="Enter album title" 
                value={createFormValues.title}
                onChange={(e) => setCreateFormValues({...createFormValues, title: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="artistName">Artist</Label>
              <Input 
                id="artistName"
                placeholder="Artist name" 
                value={createFormValues.artistName}
                onChange={(e) => setCreateFormValues({...createFormValues, artistName: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                placeholder="Album description" 
                value={createFormValues.description}
                onChange={(e) => setCreateFormValues({...createFormValues, description: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="coverArt">Cover Art URL</Label>
              <Input 
                id="coverArt"
                placeholder="URL to album cover" 
                value={createFormValues.coverArt}
                onChange={(e) => setCreateFormValues({...createFormValues, coverArt: e.target.value})}
              />
              <p className="text-sm text-muted-foreground">
                Enter the URL of the album cover image
              </p>
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Publish Album</Label>
                <p className="text-sm text-muted-foreground">
                  Make this album visible to all users
                </p>
              </div>
              <Switch
                checked={createFormValues.isPublic}
                onCheckedChange={(checked) => setCreateFormValues({...createFormValues, isPublic: checked})}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Album</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Album Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Album</DialogTitle>
            <DialogDescription>
              Update the album details below.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Album Title</Label>
              <Input 
                id="edit-title"
                placeholder="Enter album title" 
                value={editFormValues.title}
                onChange={(e) => setEditFormValues({...editFormValues, title: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-artistName">Artist</Label>
              <Input 
                id="edit-artistName"
                placeholder="Artist name" 
                value={editFormValues.artistName}
                onChange={(e) => setEditFormValues({...editFormValues, artistName: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description"
                placeholder="Album description" 
                value={editFormValues.description}
                onChange={(e) => setEditFormValues({...editFormValues, description: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-coverArt">Cover Art URL</Label>
              <Input 
                id="edit-coverArt"
                placeholder="URL to album cover" 
                value={editFormValues.coverArt}
                onChange={(e) => setEditFormValues({...editFormValues, coverArt: e.target.value})}
              />
              <p className="text-sm text-muted-foreground">
                Enter the URL of the album cover image
              </p>
            </div>
            
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label className="text-base">Publish Album</Label>
                <p className="text-sm text-muted-foreground">
                  Make this album visible to all users
                </p>
              </div>
              <Switch
                checked={editFormValues.isPublic}
                onCheckedChange={(checked) => setEditFormValues({...editFormValues, isPublic: checked})}
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Album</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedAlbum?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAlbum}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
                  </TableCell>
                </TableRow>
              ) : (
                albums.map((album) => (
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
                    <TableCell>{formatDate(album.releaseDate)}</TableCell>
                    <TableCell>
                      {album.isPublic ? (
                        <Badge variant="default">Public</Badge>
                      ) : (
                        <Badge variant="secondary">Private</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => handleAlbumAction("edit", album)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/songs?albumId=${album._id}`}>
                              <Music className="mr-2 h-4 w-4" />
                              View Songs
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleAlbumAction("delete", album)}
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
        </CardContent>
      </Card>
      
      {/* Create Album Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Album</DialogTitle>
            <DialogDescription>
              Add a new album to your collection. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Album Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter album title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="artistName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artist</FormLabel>
                    <FormControl>
                      <Input placeholder="Artist name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Album description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="coverArt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Art URL</FormLabel>
                    <FormControl>
                      <Input placeholder="URL to album cover" {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Enter the URL of the album cover image
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Publish Album
                      </FormLabel>
                      <FormDescription>
                        Make this album visible to all users
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Album</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Album Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Album</DialogTitle>
            <DialogDescription>
              Update the album details below.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Album Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter album title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="artistName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Artist</FormLabel>
                    <FormControl>
                      <Input placeholder="Artist name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Album description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="coverArt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Art URL</FormLabel>
                    <FormControl>
                      <Input placeholder="URL to album cover" {...field} />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Enter the URL of the album cover image
                    </FormDescription>
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">
                        Publish Album
                      </FormLabel>
                      <FormDescription>
                        Make this album visible to all users
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Album</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{selectedAlbum?.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAlbum}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
