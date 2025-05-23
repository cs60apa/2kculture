"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Music, Upload } from "lucide-react";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the form schema with required validation for single tracks
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  artistName: z.string().optional(), // This will be displayed but populated from user data
  releaseYear: z.string().optional(),
  genres: z.string().optional(),
  tags: z.string().optional(),
  audioUrl: z.string().min(1, "Audio file is required"),
  coverArt: z.string().optional(),
  isPublic: z.boolean(), // Non-optional with default value handled in defaultValues
});

// Define schema for album creation
const albumFormSchema = z.object({
  title: z.string().min(1, "Album title is required"),
  description: z.string().optional(),
  genres: z.string().optional(),
  coverArt: z.string().optional(),
  songs: z
    .array(
      z.object({
        title: z.string().min(1, "Song title is required"),
        audioUrl: z.string().min(1, "Audio file is required"),
        trackNumber: z.number().min(1, "Track number must be at least 1"),
      })
    )
    .optional(),
});

type FormValues = z.infer<typeof formSchema>;
type AlbumFormValues = z.infer<typeof albumFormSchema>;

// Define a type for Clerk User properties we need
interface ClerkUser {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
}

// Album creation form component
function AlbumCreationForm({ user }: { user: ClerkUser | null }) {
  const router = useRouter();
  const createAlbum = useMutation(api.music.createAlbum);
  const createSong = useMutation(api.music.createSong);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [songs, setSongs] = useState<
    Array<{
      title: string;
      audioUrl: string;
      trackNumber: number;
    }>
  >([]);

  // Form for album details
  const form = useForm<AlbumFormValues>({
    resolver: zodResolver(albumFormSchema),
    defaultValues: {
      title: "",
      description: "",
      genres: "",
      coverArt: "",
      songs: [],
    },
  });

  // Form for adding a new song to the album
  const songForm = useForm({
    defaultValues: {
      title: "",
      audioUrl: "",
    },
  });

  const [isAddingSong, setIsAddingSong] = useState(false);
  const [addSongError, setAddSongError] = useState<string | null>(null);

  const addSong = () => {
    const { title, audioUrl } = songForm.getValues();

    setAddSongError(null);

    if (!title) {
      setAddSongError("Please enter a song title");
      return;
    }

    if (!audioUrl) {
      setAddSongError("Please upload an audio file");
      return;
    }

    setIsAddingSong(true);

    try {
      const newSong = {
        title,
        audioUrl,
        trackNumber: songs.length + 1,
      };

      setSongs([...songs, newSong]);
      songForm.reset();

      // Clear any form-level errors since we now have songs
      if (songs.length === 0) {
        form.clearErrors("title");
      }
    } catch (error) {
      console.error("Error adding song:", error);
      setAddSongError("Failed to add song. Please try again.");
    } finally {
      setIsAddingSong(false);
    }
  };

  const [removingSongIndex, setRemovingSongIndex] = useState<number | null>(
    null
  );

  const removeSong = (index: number) => {
    setRemovingSongIndex(index);

    try {
      setSongs(songs.filter((_, i) => i !== index));

      // Update track numbers
      setTimeout(() => {
        setSongs((prev) =>
          prev.map((song, i) => ({
            ...song,
            trackNumber: i + 1,
          }))
        );
      }, 0);
    } finally {
      setRemovingSongIndex(null);
    }
  };

  const onSubmit = async (values: AlbumFormValues) => {
    if (!user) return;

    // Validate that at least one song has been added
    if (songs.length === 0) {
      form.setError("title", {
        type: "manual",
        message: "Please add at least one song to your album before submitting",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      const genresArray = values.genres
        ? values.genres.split(",").map((genre) => genre.trim())
        : [];

      // Create the album
      const albumId = await createAlbum({
        title: values.title,
        artistId: user.id,
        artistName: `${user.firstName} ${user.lastName}`,
        coverArt: values.coverArt,
        genres: genresArray.length > 0 ? genresArray : undefined,
        description: values.description || undefined,
      });

      // Add songs to the album
      for (const song of songs) {
        await createSong({
          title: song.title,
          artistId: user.id,
          artistName: `${user.firstName} ${user.lastName}`,
          albumId,
          audioUrl: song.audioUrl,
          coverArt: values.coverArt, // Use album cover art for all songs
          isPublic: true,
          releaseDate: Date.now(),
        });
      }

      form.reset();
      setSongs([]);
      router.push("/creator/songs");
    } catch (error) {
      console.error("Error creating album:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <FormField
                control={form.control}
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
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe your album" {...field} />
                    </FormControl>
                    <FormDescription>
                      Tell your audience about this album
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="genres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genres</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Pop, Hip Hop, R&B (comma separated)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Add genres separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-6">
              <FormField
                control={form.control}
                name="coverArt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Album Cover Art</FormLabel>
                    <FormControl>
                      <FileUploader
                        endpoint="imageUploader"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription>
                      Upload cover art for your album (recommended size: 500x500
                      pixels)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator className="my-8" />

          <div>
            <h3 className="text-lg font-medium mb-4">Album Songs</h3>

            {songs.length === 0 ? (
              <div className="text-center py-8 border border-dashed rounded-md bg-muted/50">
                <p className="text-muted-foreground">
                  No songs added yet. Add tracks to your album below.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {songs.map((song, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-md"
                  >
                    <div className="flex items-center">
                      <div className="bg-primary/10 w-8 h-8 rounded-full flex items-center justify-center mr-4">
                        <span className="font-medium">{song.trackNumber}</span>
                      </div>
                      <div>
                        <p className="font-medium">{song.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Audio file uploaded
                        </p>
                        <audio
                          src={song.audioUrl}
                          className="mt-2 w-full max-w-[200px] h-8"
                          controls
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Edit song functionality
                          songForm.setValue("title", song.title);
                          songForm.setValue("audioUrl", song.audioUrl);
                          removeSong(index);
                          // Scroll to the add song form
                          setTimeout(() => {
                            document
                              .getElementById("add-song-section")
                              ?.scrollIntoView({ behavior: "smooth" });
                          }, 100);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                        disabled={removingSongIndex === index}
                        onClick={() => {
                          if (
                            window.confirm(
                              `Remove "${song.title}" from the album?`
                            )
                          ) {
                            removeSong(index);
                          }
                        }}
                      >
                        {removingSongIndex === index ? "Removing..." : "Remove"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div id="add-song-section" className="mt-6 p-4 border rounded-md">
              <h4 className="font-medium mb-4">Add Song</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Song Title"
                  {...songForm.register("title")}
                  className={
                    addSongError && !songForm.watch("title")
                      ? "border-red-500"
                      : ""
                  }
                />
                <div className="md:col-span-2">
                  <FileUploader
                    endpoint="audioUploader"
                    value={songForm.watch("audioUrl")}
                    onChange={(url) => songForm.setValue("audioUrl", url || "")}
                    className={
                      addSongError && !songForm.watch("audioUrl")
                        ? "border-red-500"
                        : ""
                    }
                  />
                </div>
                {addSongError && (
                  <div className="md:col-span-2 text-sm text-red-500">
                    {addSongError}
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  onClick={addSong}
                  className="md:col-span-2 w-full"
                  disabled={
                    isAddingSong ||
                    (!songForm.watch("title") && !songForm.watch("audioUrl"))
                  }
                >
                  {isAddingSong ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 mr-1"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Adding Song...
                    </span>
                  ) : (
                    "Add Song to Album"
                  )}
                </Button>
                <div className="md:col-span-2 text-sm text-muted-foreground">
                  Songs added: <strong>{songs.length}</strong>
                  {songs.length === 0 && (
                    <span className="text-amber-500 ml-2">
                      (Add at least one song to create an album)
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center md:items-end gap-4 mt-8">
            {form.formState.errors.title &&
              typeof form.formState.errors.title.message === "string" && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.title.message}
                </p>
              )}
            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (
                    window.confirm(
                      "Are you sure you want to discard this album?"
                    )
                  ) {
                    form.reset();
                    setSongs([]);
                  }
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || songs.length === 0}
                className="relative"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 mr-2"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Album...
                  </>
                ) : (
                  "Create Album"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default function CreatorPage() {
  const router = useRouter();
  const { user, isSignedIn, isLoaded } = useUser();
  const [activeTab, setActiveTab] = useState("upload");
  const createSong = useMutation(api.music.createSong);

  // Form configuration with validation
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      artistName: "",
      releaseYear: new Date().getFullYear().toString(),
      genres: "",
      tags: "",
      audioUrl: "",
      coverArt: "",
      isPublic: false, // Default to draft mode
    },
  });

  const { isSubmitting } = form.formState;

  // Update artist name when user data is loaded
  useEffect(() => {
    if (isLoaded && user) {
      form.setValue("artistName", `${user.firstName} ${user.lastName}`);
    }
  }, [isLoaded, user, form]);

  const onSubmit = async (values: FormValues) => {
    if (!isSignedIn || !user) {
      return;
    }

    try {
      const genresArray = values.genres
        ? values.genres.split(",").map((genre) => genre.trim())
        : [];
      const tagsArray = values.tags
        ? values.tags.split(",").map((tag) => tag.trim())
        : [];

      // Convert release year to a timestamp if provided
      const releaseTimestamp = values.releaseYear
        ? new Date(parseInt(values.releaseYear), 0, 1).getTime()
        : Date.now();

      await createSong({
        title: values.title,
        artistId: user.id,
        artistName: `${user.firstName} ${user.lastName}`,
        audioUrl: values.audioUrl,
        coverArt: values.coverArt || undefined,
        genres: genresArray.length > 0 ? genresArray : undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
        isPublic: values.isPublic,
        releaseDate: releaseTimestamp, // Use the converted timestamp
      });

      form.reset();
      router.push("/creator/songs");
    } catch (error) {
      console.error("Error uploading song:", error);
    }
  };

  // Redirect if not signed in
  if (isLoaded && !isSignedIn) {
    return router.push("/");
  }

  return (
    <>
      <Navbar />
      <div className="container max-w-7xl mx-auto pt-24 pb-16 px-4 sm:px-6">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
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
                    onClick={() => setActiveTab("upload")}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Music
                  </Button>
                  <Button
                    variant={activeTab === "songs" ? "default" : "ghost"}
                    className="justify-start"
                    onClick={() => router.push("/creator/songs")}
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
                <CardTitle>Upload New Music</CardTitle>
                <CardDescription>
                  Share your music with the world. Upload songs one by one or
                  create albums.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="single">
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="single">Single Track</TabsTrigger>
                    <TabsTrigger value="album">Album</TabsTrigger>
                  </TabsList>

                  <TabsContent value="single">
                    <Form {...form}>
                      <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-6">
                            <FormField
                              control={form.control}
                              name="title"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Song Title</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter song title"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="artistName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Artist Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Artist name"
                                      {...field}
                                      disabled
                                      readOnly
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    This is automatically set from your profile
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="releaseYear"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Release Year</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter release year"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="genres"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Genres</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Pop, Hip Hop, R&B (comma separated)"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Add genres separated by commas
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="tags"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Tags</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="chill, summer, dance (comma separated)"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Add tags to help listeners find your music
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="isPublic"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                  <div className="space-y-1 leading-none">
                                    <FormLabel>Publish immediately</FormLabel>
                                    <FormDescription>
                                      If checked, your song will be public and
                                      available to all users. If unchecked, it
                                      will be saved as a draft and only visible
                                      to you.
                                    </FormDescription>
                                  </div>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <div className="space-y-6">
                            <FormField
                              control={form.control}
                              name="audioUrl"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Audio File</FormLabel>
                                  <FormControl>
                                    <FileUploader
                                      endpoint="audioUploader"
                                      value={field.value}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="coverArt"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Cover Art</FormLabel>
                                  <FormControl>
                                    <FileUploader
                                      endpoint="imageUploader"
                                      value={field.value}
                                      onChange={field.onChange}
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Upload cover art for your song (recommended
                                    size: 500x500 pixels)
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end">
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Uploading..." : "Upload Song"}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </TabsContent>

                  <TabsContent value="album">
                    <AlbumCreationForm user={user as ClerkUser | null} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
