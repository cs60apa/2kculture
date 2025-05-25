"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { FileUploader } from "@/components/file-uploader";
import {
  ArrowLeft,
  Info,
  Loader2,
  Music,
  Upload as UploadIcon,
  Image as ImageIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  audioUrl: z.string().min(1, "Audio file is required"),
  coverArt: z.string().optional(),
  genres: z.string().optional(),
  tags: z.string().optional(),
  isPublic: z.boolean(),
});

type UploadFormValues = z.infer<typeof uploadSchema>;

export default function UploadPage() {
  const { user } = useUser();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("upload");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const createSong = useMutation(api.music.createSong);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadSchema),
    defaultValues: {
      title: "",
      audioUrl: "",
      coverArt: "",
      genres: "",
      tags: "",
      isPublic: false,
    },
  });

  const handleAudioUpload = (url?: string) => {
    if (!url) return;

    form.setValue("audioUrl", url);
    form.clearErrors("audioUrl");

    // Extract title from filename if title is empty
    if (!form.getValues("title")) {
      const filename = url.split("/").pop();
      if (filename) {
        const title = filename
          .split(".")
          .slice(0, -1)
          .join(".")
          .replace(/-|_/g, " ");

        form.setValue("title", title);
      }
    }

    // Auto-navigate to details tab after upload
    setActiveTab("details");
  };

  const handleCoverArtUpload = (url?: string) => {
    if (!url) return;
    form.setValue("coverArt", url);
  };

  const onSubmit = async (data: UploadFormValues) => {
    if (!user) {
      toast.error("You must be logged in to upload music");
      return;
    }

    setIsSubmitting(true);

    try {
      // Format genres and tags as arrays
      const genres =
        data.genres && data.genres.length > 0
          ? data.genres.split(",").map((g) => g.trim())
          : [];
      const tags =
        data.tags && data.tags.length > 0
          ? data.tags.split(",").map((t) => t.trim())
          : [];

      // Create the song
      await createSong({
        title: data.title,
        artistId: user.id,
        artistName: user.fullName || user.username || "Anonymous",
        audioUrl: data.audioUrl,
        coverArt: data.coverArt || undefined,
        genres,
        tags,
        isPublic: data.isPublic,
      });

      toast.success("Song uploaded successfully!");

      // Reset the form
      form.reset();

      // Redirect to songs page
      router.push("/admin/songs");
    } catch (error) {
      console.error("Error creating song:", error);
      toast.error("Failed to upload song");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Upload Music</h2>
          <p className="text-muted-foreground">
            Share your music with the world
          </p>
        </div>

        <Button variant="outline" asChild>
          <Link href="/admin/songs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Songs
          </Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger
                value="details"
                disabled={!form.getValues("audioUrl")}
              >
                Details
              </TabsTrigger>
              <TabsTrigger
                value="preview"
                disabled={!form.getValues("audioUrl")}
              >
                Preview & Publish
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="upload">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload Audio</CardTitle>
                    <CardDescription>
                      Select an audio file to upload. Supported formats: MP3,
                      WAV
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <FormField
                      control={form.control}
                      name="audioUrl"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                            {!field.value ? (
                              <FileUploader
                                onChange={handleAudioUpload}
                                endpoint="audioUploader"
                                value={field.value}
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center gap-4 py-4">
                                <Music className="h-10 w-10 text-primary" />
                                <div className="text-center">
                                  <p className="font-medium">
                                    Upload Complete!
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Continue to the Details tab
                                  </p>
                                </div>
                                <audio
                                  src={field.value}
                                  controls
                                  className="w-full max-w-md"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => {
                                    form.setValue("audioUrl", "");
                                    setIsUploading(false);
                                    setUploadProgress(0);
                                  }}
                                >
                                  Remove & Upload New
                                </Button>
                              </div>
                            )}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/admin/songs")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveTab("details")}
                      disabled={!form.getValues("audioUrl")}
                    >
                      Continue to Details
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="details">
                <Card>
                  <CardHeader>
                    <CardTitle>Song Details</CardTitle>
                    <CardDescription>
                      Provide information about your track
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-6">
                        {/* Title */}
                        <FormField
                          control={form.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Title</FormLabel>
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

                        {/* Genres */}
                        <FormField
                          control={form.control}
                          name="genres"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Genres</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Pop, Hip-Hop, R&B (comma separated)"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Separate multiple genres with commas
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Tags */}
                        <FormField
                          control={form.control}
                          name="tags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tags</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="chill, summer, vibe (comma separated)"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription>
                                Tags help listeners discover your music
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Cover Art */}
                      <div>
                        <FormField
                          control={form.control}
                          name="coverArt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Cover Art</FormLabel>
                              <div className="flex flex-col items-center gap-4">
                                <div className="w-full aspect-square rounded-md border overflow-hidden">
                                  {field.value ? (
                                    <Image
                                      src={field.value}
                                      alt="Cover art preview"
                                      width={300}
                                      height={300}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-secondary">
                                      <ImageIcon className="h-12 w-12 text-muted-foreground" />
                                    </div>
                                  )}
                                </div>
                                <FileUploader
                                  endpoint="imageUploader"
                                  onChange={handleCoverArtUpload}
                                  value={field.value}
                                />
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("upload")}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveTab("preview")}
                    >
                      Continue to Preview
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="preview">
                <Card>
                  <CardHeader>
                    <CardTitle>Preview & Publish</CardTitle>
                    <CardDescription>
                      Review your track before publishing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold mb-2">
                            {form.getValues("title") || "Untitled Song"}
                          </h3>

                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <span>
                              {user?.fullName || user?.username || "Anonymous"}
                            </span>
                            <span>•</span>
                            <span>{new Date().toLocaleDateString()}</span>
                          </div>

                          <div className="mt-4">
                            <audio
                              src={form.getValues("audioUrl")}
                              controls
                              className="w-full"
                            />
                          </div>
                        </div>

                        <Separator />

                        <div className="space-y-2">
                          <h4 className="font-medium">Genres</h4>
                          <div className="flex flex-wrap gap-2">
                            {form.getValues("genres") ? (
                              form
                                .getValues("genres")!
                                .split(",")
                                .map((genre, i) => (
                                  <span
                                    key={i}
                                    className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                                  >
                                    {genre.trim()}
                                  </span>
                                ))
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                No genres specified
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-medium">Tags</h4>
                          <div className="flex flex-wrap gap-2">
                            {form.getValues("tags") ? (
                              form
                                .getValues("tags")!
                                .split(",")
                                .map((tag, i) => (
                                  <span
                                    key={i}
                                    className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs"
                                  >
                                    #{tag.trim()}
                                  </span>
                                ))
                            ) : (
                              <span className="text-muted-foreground text-sm">
                                No tags specified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="aspect-square rounded-md border overflow-hidden bg-secondary">
                          {form.getValues("coverArt") ? (
                            <Image
                              src={form.getValues("coverArt") || ""}
                              alt="Cover art preview"
                              width={300}
                              height={300}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <ImageIcon className="h-12 w-12 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        <div className="mt-4 p-4 border rounded-md bg-muted/50">
                          <div className="flex items-start gap-2">
                            <Info className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                            <div className="space-y-2">
                              <p className="text-sm font-medium">
                                Publishing Options
                              </p>
                              <FormField
                                control={form.control}
                                name="isPublic"
                                render={({ field }) => (
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <Switch
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                      />
                                    </FormControl>
                                    <div className="space-y-0.5">
                                      <FormLabel>
                                        {field.value ? "Public" : "Private"}
                                      </FormLabel>
                                      <FormDescription className="text-xs">
                                        {field.value
                                          ? "Your song will be publicly available"
                                          : "Only you can see this song"}
                                      </FormDescription>
                                    </div>
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("details")}
                    >
                      Back
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {form.getValues("isPublic")
                        ? "Publish Song"
                        : "Save as Private"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}
