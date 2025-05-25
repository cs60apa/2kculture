"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Music, Image as ImageIcon, Tags, Loader2 } from "lucide-react";
import Image from "next/image";
import { Song } from "@/types/song";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { FileUploader } from "@/components/file-uploader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

interface EditSongDialogProps {
  song: Song;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditSongDialog({
  song,
  open,
  onOpenChange,
}: EditSongDialogProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("details");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateSong = useMutation(api.music.updateSong);

  // Define the form schema
  const editSongSchema = z.object({
    title: z.string().min(1, "Title is required"),
    genres: z.string().optional(),
    tags: z.string().optional(),
    coverArt: z.string().optional(),
    isPublic: z.boolean(),
  });

  type EditSongFormValues = z.infer<typeof editSongSchema>;

  // Create form
  const form = useForm<EditSongFormValues>({
    resolver: zodResolver(editSongSchema),
    defaultValues: {
      title: song?.title || "",
      genres: song?.genres?.join(", ") || "",
      tags: song?.tags?.join(", ") || "",
      coverArt: song?.coverArt || "",
      isPublic: song?.isPublic || false,
    },
  });

  // Handle form submit
  const onSubmit = async (data: EditSongFormValues) => {
    if (!song || !user) return;

    setIsSubmitting(true);

    try {
      await updateSong({
        id: song._id as Id<"songs">,
        title: data.title,
        coverArt: data.coverArt || undefined,
        genres: data.genres
          ? data.genres.split(",").map((g) => g.trim())
          : undefined,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : undefined,
        isPublic: data.isPublic,
        artistId: user.id,
      });

      toast.success("Song updated successfully");
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating song:", error);
      toast.error("Failed to update song");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cover art upload
  const handleCoverArtUpload = (url: string) => {
    form.setValue("coverArt", url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Song</DialogTitle>
          <DialogDescription>
            Update the details for "{song?.title}"
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Song Details</TabsTrigger>
            <TabsTrigger value="media">Media</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-4">
              <TabsContent value="details" className="space-y-4">
                {/* Title */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Song title" {...field} />
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

                {/* Public/Private Switch */}
                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Public
                        </FormLabel>
                        <FormDescription>
                          {field.value
                            ? "Song is publicly available to all listeners"
                            : "Song is private and only visible to you"}
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
              </TabsContent>

              <TabsContent value="media" className="space-y-4">
                {/* Cover Art */}
                <FormField
                  control={form.control}
                  name="coverArt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Art</FormLabel>
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-48 h-48 rounded-md border overflow-hidden">
                          {field.value ? (
                            <Image
                              src={field.value}
                              alt="Cover art preview"
                              width={192}
                              height={192}
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
                          onUploadComplete={(url) => {
                            handleCoverArtUpload(url);
                          }}
                        >
                          <Button type="button" variant="outline" className="w-full">
                            {field.value ? "Change Cover Art" : "Upload Cover Art"}
                          </Button>
                        </FileUploader>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Audio Preview */}
                <div className="space-y-2 pt-4">
                  <h3 className="text-sm font-medium">Audio Preview</h3>
                  <div className="flex flex-col items-center p-4 border rounded-md">
                    <Music className="h-8 w-8 text-primary mb-2" />
                    <p className="text-sm font-medium">{song.title}</p>
                    <audio 
                      src={song.audioUrl} 
                      controls 
                      className="w-full max-w-[400px] mt-4" 
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    To replace the audio file, you'll need to upload a new song
                  </p>
                </div>
              </TabsContent>

              <DialogFooter className="mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Save Changes
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
    } catch (error) {
      console.error("Failed to update song:", error);
      toast.error("An error occurred while updating the song");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!song) {
    return null;
  }

  return (
    <Dialog open={isOpen !== undefined ? isOpen : true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Edit Song</DialogTitle>
          <DialogDescription>
            Update the details for your song
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="pt-2"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">
                  <Music className="mr-2 h-4 w-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="tags">
                  <Tags className="mr-2 h-4 w-4" />
                  Tags
                </TabsTrigger>
                <TabsTrigger value="artwork">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Artwork
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="py-4 space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Song Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter song title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between space-y-0 rounded-md border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Publication Status</FormLabel>
                        <FormDescription>
                          {field.value
                            ? "Published - Visible to everyone"
                            : "Draft - Only visible to you"}
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
              </TabsContent>

              <TabsContent value="tags" className="py-4 space-y-4">
                <FormField
                  control={form.control}
                  name="genres"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Genres</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter genres (comma separated)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Example: Hip Hop, Rap, Soul
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
                          placeholder="Enter tags (comma separated)"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Example: chill, summer, vibes
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="artwork" className="py-4 space-y-4">
                <FormField
                  control={form.control}
                  name="coverArt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Art</FormLabel>
                      {field.value && (
                        <div className="relative w-32 h-32 mb-4">
                          <Image
                            src={field.value}
                            alt="Cover art"
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                      )}
                      <FormControl>
                        <FileUploader
                          endpoint="imageUploader"
                          value={field.value}
                          onChange={field.onChange}
                          fileType="image"
                        />
                      </FormControl>
                      <FormDescription>
                        Recommended size: 1400 x 1400 pixels (square)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
            </Tabs>

            <DialogFooter className="mt-6">
              <Button variant="outline" type="button" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
