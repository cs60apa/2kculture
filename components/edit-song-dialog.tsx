"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Music } from "lucide-react";
import Image from "next/image";
import { Song, SongId } from "@/types/song";

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

// Define the form schema
const editSongSchema = z.object({
  title: z.string().min(1, "Title is required"),
  genres: z.string().optional(),
  tags: z.string().optional(),
  coverArt: z.string().optional(),
  isPublic: z.boolean(),
});

type EditSongFormValues = z.infer<typeof editSongSchema>;

interface EditSongDialogProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditSongDialog({
  song,
  isOpen,
  onClose,
  onSuccess,
}: EditSongDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const updateSong = useMutation(api.music.updateSong);

  // Initialize form with song data
  const form = useForm<EditSongFormValues>({
    resolver: zodResolver(editSongSchema),
    defaultValues: {
      title: song?.title || "",
      genres: song?.genres ? song.genres.join(", ") : "",
      tags: song?.tags ? song.tags.join(", ") : "",
      coverArt: song?.coverArt || "",
      isPublic: Boolean(song?.isPublic),
    },
  });

  // Update form values when song changes
  useEffect(() => {
    if (song) {
      form.reset({
        title: song.title || "",
        genres: song.genres ? song.genres.join(", ") : "",
        tags: song.tags ? song.tags.join(", ") : "",
        coverArt: song.coverArt || "",
        isPublic: Boolean(song.isPublic),
      });
    }
  }, [song, form]);

  const onSubmit = async (values: EditSongFormValues) => {
    if (!song) return;

    setIsSubmitting(true);

    try {
      // Convert comma-separated genres and tags to arrays
      const genres = values.genres
        ? values.genres
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : undefined;

      const tags = values.tags
        ? values.tags
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean)
        : undefined;

      // Update song in database
      await updateSong({
        id: song._id as SongId,
        artistId: song.artistId,
        title: values.title,
        genres,
        tags,
        coverArt: values.coverArt,
        isPublic: values.isPublic,
      });

      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Close the dialog
      onClose();
    } catch (error) {
      console.error("Failed to update song:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Song Details</DialogTitle>
          <DialogDescription>
            Update the details of your song. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>

        {song && (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

              <div className="space-y-1">
                <FormLabel>Artwork</FormLabel>
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-md bg-secondary flex items-center justify-center overflow-hidden">
                    {form.watch("coverArt") ? (
                      <div className="relative h-full w-full">
                        <Image
                          src={form.watch("coverArt") || ""}
                          alt="Song cover"
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <Music className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <FileUploader
                      endpoint="imageUploader"
                      value={form.watch("coverArt") ?? ""}
                      onChange={(url) => form.setValue("coverArt", url ?? "")}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Recommended: Square image, at least 500x500px
                    </p>
                  </div>
                </div>
              </div>

              <FormField
                control={form.control}
                name="genres"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Genres</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Pop, Hip Hop, Rock, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter genres separated by commas
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
                        placeholder="Chill, Energetic, Acoustic, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Enter tags separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Visibility</FormLabel>
                      <FormDescription>
                        Make this song public or private
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
