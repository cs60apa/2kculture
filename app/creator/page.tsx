"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Music, Plus, Upload } from "lucide-react";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
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

// Define the form schema with required validation
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

type FormValues = z.infer<typeof formSchema>;

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
      isPublic: true,
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
                                    <FormLabel>Make public</FormLabel>
                                    <FormDescription>
                                      Your song will appear in search results
                                      and be available to all users
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
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="bg-primary/10 p-3 rounded-full mb-4">
                        <Plus className="h-6 w-6 text-primary" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">
                        Create an Album
                      </h3>
                      <p className="text-muted-foreground mb-4 max-w-md">
                        The album creation feature will be available soon. For
                        now, you can upload individual songs.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => router.push("?tab=single")}
                      >
                        Upload Single Tracks
                      </Button>
                    </div>
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
