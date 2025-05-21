"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Music, Image as ImageIcon, Tags } from "lucide-react";
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
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";

interface EditSongDialogProps {
  song: Song | null;
  onClose: () => void;
  onSuccess?: () => void;
  isOpen?: boolean;
}

export function EditSongDialog({
  song,
  onClose,
  onSuccess,
  isOpen,
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
      onSuccess?.();
      onClose();
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
