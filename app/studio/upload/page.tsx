"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Upload,
  FileAudio,
  CheckCircle2,
  AlertOctagon,
} from "lucide-react";
import { FileUploader } from "@/components/file-uploader";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

// Define the form schema for single track uploads
const singleTrackSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artistName: z.string().optional(),
  releaseYear: z.string().optional(),
  genres: z.string().optional(),
  tags: z.string().optional(),
  description: z.string().optional(),
  audioUrl: z.string().min(1, "Audio file is required"),
  coverArt: z.string().optional(),
  isPublic: z.boolean(),
});

// Define schema for album creation
const albumSchema = z.object({
  title: z.string().min(1, "Album title is required"),
  description: z.string().optional(),
  genres: z.string().optional(),
  coverArt: z.string().optional(),
  isPublic: z.boolean(),
});

type SingleTrackFormValues = z.infer<typeof singleTrackSchema>;
type AlbumFormValues = z.infer<typeof albumSchema>;

type SongToAdd = {
  title: string;
  audioUrl: string;
  trackNumber: number;
};

export default function UploadPage() {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [uploadStatus, setUploadStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const [uploadStep, setUploadStep] = useState<"form" | "processing" | "complete">("form");

  // Single track form
  const singleTrackForm = useForm<SingleTrackFormValues>({
    resolver: zodResolver(singleTrackSchema),
    defaultValues: {
      title: "",
      releaseYear: new Date().getFullYear().toString(),
      genres: "",
      tags: "",
      description: "",
      audioUrl: "",
      coverArt: "",
      isPublic: true,
    },
  });

  // Album form
  const albumForm = useForm<AlbumFormValues>({
    resolver: zodResolver(albumSchema),
    defaultValues: {
      title: "",
      description: "",
      genres: "",
      coverArt: "",
      isPublic: true,
    },
  });

  // Album songs management
  const [songs, setSongs] = useState<SongToAdd[]>([]);
  const [currentSong, setCurrentSong] = useState<{
    title: string;
    audioUrl: string;
  }>({
    title: "",
    audioUrl: "",
  });
  const [addingSong, setAddingSong] = useState(false);
  const [songError, setSongError] = useState("");

  // Mutations
  const createSong = useMutation(api.music.createSong);
  const createAlbum = useMutation(api.music.createAlbum);

  // Handle single track submission
  const onSingleTrackSubmit = async (values: SingleTrackFormValues) => {
    if (!isSignedIn || !user) return;

    setUploadStep("processing");
    setUploadStatus("loading");

    try {
      // Parse genres and tags
      const genresArray = values.genres
        ? values.genres.split(",").map((genre) => genre.trim())
        : [];
        
      const tagsArray = values.tags
        ? values.tags.split(",").map((tag) => tag.trim())
        : [];

      // Submit the song
      await createSong({
        title: values.title,
        artistId: user.id,
        artistName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        audioUrl: values.audioUrl,
        coverArt: values.coverArt || undefined,
        genres: genresArray.length > 0 ? genresArray : undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        description: values.description || undefined,
        releaseYear: values.releaseYear || undefined,
        isPublic: values.isPublic,
      });

      setUploadStatus("success");
      setUploadMessage("Your song has been uploaded successfully!");
      setUploadStep("complete");
      
      // Reset the form
      singleTrackForm.reset();
      
    } catch (error) {
      console.error("Error uploading song:", error);
      setUploadStatus("error");
      setUploadMessage("An error occurred while uploading your song. Please try again.");
      setUploadStep("form");
    }
  };

  // Add a song to the album
  const addSongToAlbum = () => {
    setSongError("");
    
    if (!currentSong.title) {
      setSongError("Please enter a song title.");
      return;
    }
    
    if (!currentSong.audioUrl) {
      setSongError("Please upload an audio file.");
      return;
    }
    
    setAddingSong(true);
    
    try {
      const newSong = {
        title: currentSong.title,
        audioUrl: currentSong.audioUrl,
        trackNumber: songs.length + 1,
      };
      
      setSongs([...songs, newSong]);
      setCurrentSong({ title: "", audioUrl: "" });
      
    } catch (error) {
      console.error("Error adding song:", error);
      setSongError("Failed to add song. Please try again.");
    } finally {
      setAddingSong(false);
    }
  };

  // Remove a song from the album
  const removeSongFromAlbum = (index: number) => {
    const updatedSongs = songs.filter((_, i) => i !== index);
    
    // Update track numbers
    const reorderedSongs = updatedSongs.map((song, i) => ({
      ...song,
      trackNumber: i + 1,
    }));
    
    setSongs(reorderedSongs);
  };

  // Handle album submission
  const onAlbumSubmit = async (values: AlbumFormValues) => {
    if (!isSignedIn || !user) return;

    if (songs.length === 0) {
      albumForm.setError("title", {
        type: "manual",
        message: "Please add at least one song to your album",
      });
      return;
    }

    setUploadStep("processing");
    setUploadStatus("loading");

    try {
      // Parse genres
      const genresArray = values.genres
        ? values.genres.split(",").map((genre) => genre.trim())
        : [];

      // Create the album
      const albumId = await createAlbum({
        title: values.title,
        artistId: user.id,
        artistName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        coverArt: values.coverArt || undefined,
        genres: genresArray.length > 0 ? genresArray : undefined,
        description: values.description || undefined,
        isPublic: values.isPublic,
      });

      // Add songs to the album
      for (const song of songs) {
        await createSong({
          title: song.title,
          artistId: user.id,
          artistName: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
          albumId,
          audioUrl: song.audioUrl,
          coverArt: values.coverArt || undefined, // Use album cover by default
          isPublic: values.isPublic,
        });
      }

      setUploadStatus("success");
      setUploadMessage("Your album has been created successfully!");
      setUploadStep("complete");
      
      // Reset forms
      albumForm.reset();
      setSongs([]);
      setCurrentSong({ title: "", audioUrl: "" });
      
    } catch (error) {
      console.error("Error creating album:", error);
      setUploadStatus("error");
      setUploadMessage("An error occurred while creating your album. Please try again.");
      setUploadStep("form");
    }
  };

  // Redirect if not signed in
  if (isLoaded && !isSignedIn) {
    router.push("/");
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Upload Music</h1>
      </div>

      {uploadStep === "form" ? (
        <Tabs defaultValue="single" className="w-full">
          <TabsList className="grid grid-cols-2 w-full sm:w-[400px]">
            <TabsTrigger value="single">Single Track</TabsTrigger>
            <TabsTrigger value="album">Album</TabsTrigger>
          </TabsList>
          
          {/* Single Track Upload */}
          <TabsContent value="single">
            <Card>
              <CardHeader>
                <CardTitle>Upload a Single Track</CardTitle>
                <CardDescription>
                  Share your music with the world, one song at a time.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...singleTrackForm}>
                  <form onSubmit={singleTrackForm.handleSubmit(onSingleTrackSubmit)} className="space-y-6">
                    {/* Audio File Upload */}
                    <FormField
                      control={singleTrackForm.control}
                      name="audioUrl"
                      render={({ field }) => (
                        <FormItem className="mb-8">
                          <FormLabel>Audio File*</FormLabel>
                          <FormControl>
                            <FileUploader
                              endpoint="audioUploader"
                              value={field.value}
                              onChange={field.onChange}
                              className="bg-muted"
                            />
                          </FormControl>
                          <FormDescription>
                            Upload MP3, WAV, or FLAC. 32MB max.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Basic Info */}
                    <div className="grid gap-6">
                      <FormField
                        control={singleTrackForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Track Title*</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter track title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={singleTrackForm.control}
                          name="artistName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Artist Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder={`${user?.firstName || ""} ${user?.lastName || ""}`}
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Leave blank to use your profile name
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={singleTrackForm.control}
                          name="releaseYear"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Release Year</FormLabel>
                              <FormControl>
                                <Input
                                  type="text"
                                  placeholder={new Date().getFullYear().toString()}
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {/* Cover Art */}
                    <div className="pt-4">
                      <h3 className="text-lg font-medium mb-4">Cover Art</h3>
                      <FormField
                        control={singleTrackForm.control}
                        name="coverArt"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <FileUploader
                                endpoint="imageUploader"
                                value={field.value}
                                onChange={field.onChange}
                                fileType="image"
                                className="bg-muted h-48"
                              />
                            </FormControl>
                            <FormDescription>
                              Upload a square image, at least 500x500 pixels. 8MB max.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Additional Details */}
                    <div className="pt-4">
                      <h3 className="text-lg font-medium mb-4">Additional Details</h3>
                      <div className="grid gap-6">
                        <FormField
                          control={singleTrackForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Describe your track..."
                                  className="min-h-[100px]"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={singleTrackForm.control}
                            name="genres"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Genres</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Pop, Rock, Hip-Hop..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Separate genres with commas
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={singleTrackForm.control}
                            name="tags"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tags</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="chill, summer, dance..."
                                    {...field}
                                  />
                                </FormControl>
                                <FormDescription>
                                  Separate tags with commas
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Publishing Options */}
                    <div className="pt-4">
                      <h3 className="text-lg font-medium mb-4">Publishing Options</h3>
                      <FormField
                        control={singleTrackForm.control}
                        name="isPublic"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Publish immediately
                              </FormLabel>
                              <FormDescription>
                                When disabled, your track will be saved as a draft
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
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 flex justify-end">
                      <Button type="submit" size="lg">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Track
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Album Upload */}
          <TabsContent value="album">
            <Card>
              <CardHeader>
                <CardTitle>Create an Album</CardTitle>
                <CardDescription>
                  Compile multiple songs into a cohesive album experience.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...albumForm}>
                  <form onSubmit={albumForm.handleSubmit(onAlbumSubmit)} className="space-y-6">
                    {/* Album Details */}
                    <div className="grid gap-6">
                      <FormField
                        control={albumForm.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Album Title*</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter album title" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={albumForm.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Album Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your album..."
                                className="min-h-[100px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={albumForm.control}
                        name="genres"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Genres</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Pop, Rock, Hip-Hop..."
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Separate genres with commas
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Album Cover */}
                    <div className="pt-4">
                      <h3 className="text-lg font-medium mb-4">Album Cover</h3>
                      <FormField
                        control={albumForm.control}
                        name="coverArt"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <FileUploader
                                endpoint="imageUploader"
                                value={field.value}
                                onChange={field.onChange}
                                fileType="image"
                                className="bg-muted h-48"
                              />
                            </FormControl>
                            <FormDescription>
                              Upload a square image, at least 500x500 pixels. 8MB max.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Add Tracks */}
                    <div className="pt-4">
                      <h3 className="text-lg font-medium mb-4">Album Tracks</h3>
                      
                      {/* Current tracks */}
                      {songs.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-medium text-muted-foreground mb-2">
                            Added Tracks ({songs.length})
                          </h4>
                          <div className="border rounded-lg overflow-hidden">
                            <table className="w-full">
                              <thead className="bg-muted">
                                <tr>
                                  <th className="py-3 px-4 text-left text-xs font-medium">#</th>
                                  <th className="py-3 px-4 text-left text-xs font-medium">Title</th>
                                  <th className="py-3 px-4 text-right text-xs font-medium">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {songs.map((song, index) => (
                                  <tr key={index} className="bg-card">
                                    <td className="py-3 px-4 text-sm">{song.trackNumber}</td>
                                    <td className="py-3 px-4 text-sm">{song.title}</td>
                                    <td className="py-3 px-4 text-right">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeSongFromAlbum(index)}
                                      >
                                        Remove
                                      </Button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                      
                      {/* Add new track */}
                      <Card className="border border-dashed">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Add Track</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="text-sm font-medium">Track Title*</label>
                              <Input
                                placeholder="Enter track title"
                                value={currentSong.title}
                                onChange={(e) => setCurrentSong({ ...currentSong, title: e.target.value })}
                              />
                            </div>
                            
                            <div>
                              <label className="text-sm font-medium">Audio File*</label>
                              <FileUploader
                                endpoint="audioUploader"
                                value={currentSong.audioUrl}
                                onChange={(url) => setCurrentSong({ ...currentSong, audioUrl: url || "" })}
                                className="bg-muted"
                              />
                            </div>
                          </div>
                          
                          {songError && (
                            <p className="text-sm text-red-500">{songError}</p>
                          )}
                          
                          <div className="flex justify-end">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={addSongToAlbum}
                              disabled={addingSong}
                            >
                              <FileAudio className="mr-2 h-4 w-4" />
                              Add to Album
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Publishing Options */}
                    <div className="pt-4">
                      <h3 className="text-lg font-medium mb-4">Publishing Options</h3>
                      <FormField
                        control={albumForm.control}
                        name="isPublic"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">
                                Publish immediately
                              </FormLabel>
                              <FormDescription>
                                When disabled, your album will be saved as a draft
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
                    </div>

                    {/* Submit Button */}
                    <div className="pt-4 flex justify-end">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={songs.length === 0}
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Create Album
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {uploadStatus === "loading" && "Uploading Music..."}
              {uploadStatus === "success" && "Upload Complete!"}
              {uploadStatus === "error" && "Upload Failed"}
            </CardTitle>
            <CardDescription>
              {uploadStatus === "loading" && "Please wait while we process your upload."}
              {uploadStatus === "success" && "Your music has been successfully uploaded."}
              {uploadStatus === "error" && "There was a problem with your upload."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12">
            {uploadStatus === "loading" && (
              <div className="flex flex-col items-center text-center">
                <div className="relative h-16 w-16 mb-4">
                  <div className="absolute inset-0 rounded-full border-4 border-muted-foreground/20 border-t-4 border-t-primary animate-spin"></div>
                </div>
                <p className="text-lg font-medium">Processing your upload...</p>
                <p className="text-muted-foreground mt-2">This may take a moment.</p>
              </div>
            )}
            
            {uploadStatus === "success" && (
              <div className="flex flex-col items-center text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
                <p className="text-lg font-medium">{uploadMessage}</p>
                <p className="text-muted-foreground mt-2">
                  Your music is now available in your studio.
                </p>
              </div>
            )}
            
            {uploadStatus === "error" && (
              <div className="flex flex-col items-center text-center">
                <AlertOctagon className="h-16 w-16 text-red-500 mb-4" />
                <p className="text-lg font-medium">{uploadMessage}</p>
                <p className="text-muted-foreground mt-2">
                  Please try again or contact support if the problem persists.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            {uploadStatus === "success" && (
              <div className="flex gap-4">
                <Button onClick={() => router.push('/studio/songs')}>
                  View My Songs
                </Button>
                <Button variant="outline" onClick={() => setUploadStep("form")}>
                  Upload Another
                </Button>
              </div>
            )}
            
            {uploadStatus === "error" && (
              <Button onClick={() => setUploadStep("form")}>
                Try Again
              </Button>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
