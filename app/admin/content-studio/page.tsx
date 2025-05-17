"use client";

import { AdminDashboardLayout } from "@/components/admin-dashboard-layout";
import { FileUploader } from "@/components/file-uploader";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  Music,
  Image as ImageIcon,
  Tags,
  ArrowLeft,
  InfoIcon,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

// Common music genres
const GENRE_OPTIONS = [
  "Hip Hop",
  "R&B",
  "Trap",
  "Afrobeats",
  "Pop",
  "Rap",
  "Soul",
  "Jazz",
  "Reggae",
  "Dance",
  "Electronic",
  "House",
  "Gospel",
  "Amapiano",
  "Drill",
  "Alternative",
  "Indie",
  "Rock",
  "Folk",
  "Country",
];

export default function ContentStudioPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [tags, setTags] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [coverArt, setCoverArt] = useState("");
  const [lyrics, setLyrics] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [explicit, setExplicit] = useState(false);
  const [featuredArtists, setFeaturedArtists] = useState("");
  const [activeTab, setActiveTab] = useState("audio");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user } = useUser();
  const router = useRouter();

  const createSong = useMutation(api.music.createSong);

  // Get existing tags for suggestions
  const allSongs = useQuery(
    api.music.getSongsByArtist,
    user?.id ? { artistId: user.id } : "skip"
  );

  // Extract all unique tags from user's existing songs
  const uniqueTagSuggestions = Array.from(
    new Set(allSongs?.flatMap((song) => song.tags || []).filter(Boolean) || [])
  ).slice(0, 10); // Limit to 10 tags

  const handleAddGenre = (genre: string) => {
    if (!selectedGenres.includes(genre)) {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleRemoveGenre = (genre: string) => {
    setSelectedGenres(selectedGenres.filter((g) => g !== genre));
  };

  const handleSubmit = async (isPublic: boolean) => {
    if (!title || !audioUrl) {
      toast.error("Please provide a title and upload an audio file");
      return;
    }

    setIsSubmitting(true);

    try {
      await createSong({
        title,
        artistId: user?.id || "",
        artistName: user?.fullName || "",
        audioUrl,
        coverArt: coverArt || undefined,
        genres: selectedGenres.length > 0 ? selectedGenres : undefined,
        tags: tags ? tags.split(",").map((t) => t.trim()) : undefined,
        releaseDate: releaseDate ? new Date(releaseDate).getTime() : undefined,
        isPublic,
      });

      toast.success(
        isPublic ? "Song published successfully!" : "Song saved as draft!"
      );

      // Reset form
      setTitle("");
      setDescription("");
      setSelectedGenres([]);
      setTags("");
      setAudioUrl("");
      setCoverArt("");
      setLyrics("");
      setReleaseDate("");
      setExplicit(false);
      setFeaturedArtists("");
      setActiveTab("audio");

      // Redirect to all songs
      router.push("/admin/all-songs");
    } catch (error) {
      toast.error("Failed to create song");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Content Studio</h2>
          <p className="text-muted-foreground">
            Create and manage your music content
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/all-songs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to All Songs
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Upload New Song</CardTitle>
            <CardDescription>
              Fill in the details and upload your audio file to create a new
              song
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="audio">
                  <Music className="mr-2 h-4 w-4" />
                  Audio
                </TabsTrigger>
                <TabsTrigger value="basics">
                  <InfoIcon className="mr-2 h-4 w-4" />
                  Basic Info
                </TabsTrigger>
                <TabsTrigger value="details">
                  <Tags className="mr-2 h-4 w-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="artwork">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Artwork
                </TabsTrigger>
              </TabsList>

              <TabsContent value="audio" className="pt-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">
                      Song Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="Enter song title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label>
                      Audio File <span className="text-red-500">*</span>
                    </Label>
                    <FileUploader
                      endpoint="audioUploader"
                      value={audioUrl}
                      onChange={(url) => url !== undefined && setAudioUrl(url)}
                      fileType="audio"
                    />
                    <p className="text-xs text-muted-foreground">
                      MP3, WAV, or AAC format (max 32MB)
                    </p>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button onClick={() => setActiveTab("basics")}>
                      Next: Basic Info
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="basics" className="pt-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter a description for your song"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="featured">Featured Artists</Label>
                    <Input
                      id="featured"
                      placeholder="Enter featured artists (comma separated)"
                      value={featuredArtists}
                      onChange={(e) => setFeaturedArtists(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="release">Release Date</Label>
                    <Input
                      id="release"
                      type="date"
                      value={releaseDate}
                      onChange={(e) => setReleaseDate(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center justify-between space-y-0 pt-2">
                    <div className="flex flex-col space-y-1">
                      <Label htmlFor="explicit-content">Explicit Content</Label>
                      <p className="text-[0.8rem] text-muted-foreground">
                        Flag this song as containing explicit content
                      </p>
                    </div>
                    <Switch
                      id="explicit-content"
                      checked={explicit}
                      onCheckedChange={setExplicit}
                    />
                  </div>

                  <div className="flex justify-between gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("audio")}
                    >
                      Back: Audio
                    </Button>
                    <Button onClick={() => setActiveTab("details")}>
                      Next: Details
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="pt-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Genres</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {selectedGenres.map((genre) => (
                        <Badge
                          key={genre}
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80"
                          onClick={() => handleRemoveGenre(genre)}
                        >
                          {genre} ×
                        </Badge>
                      ))}
                      {selectedGenres.length === 0 && (
                        <span className="text-sm text-muted-foreground">
                          No genres selected
                        </span>
                      )}
                    </div>
                    <Select onValueChange={handleAddGenre}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a genre to add" />
                      </SelectTrigger>
                      <SelectContent>
                        {GENRE_OPTIONS.filter(
                          (g) => !selectedGenres.includes(g)
                        ).map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="tags">Tags</Label>
                    <Input
                      id="tags"
                      placeholder="Enter tags (comma separated)"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                    <p className="text-sm text-muted-foreground">
                      Example: chill, summer, vibes
                    </p>
                    {uniqueTagSuggestions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-muted-foreground mb-1">
                          Your common tags:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {uniqueTagSuggestions.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="cursor-pointer hover:bg-accent"
                              onClick={() => {
                                const currentTags = tags
                                  .split(",")
                                  .map((t) => t.trim())
                                  .filter(Boolean);
                                if (!currentTags.includes(tag)) {
                                  const newTags = [...currentTags, tag].join(
                                    ", "
                                  );
                                  setTags(newTags);
                                }
                              }}
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="lyrics">Lyrics</Label>
                    <Textarea
                      id="lyrics"
                      placeholder="Enter lyrics for your song"
                      value={lyrics}
                      onChange={(e) => setLyrics(e.target.value)}
                      rows={5}
                    />
                  </div>

                  <div className="flex justify-between gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("basics")}
                    >
                      Back: Basic Info
                    </Button>
                    <Button onClick={() => setActiveTab("artwork")}>
                      Next: Artwork
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="artwork" className="pt-6">
                <div className="space-y-4">
                  <div className="grid gap-2">
                    <Label>Cover Art</Label>
                    <FileUploader
                      endpoint="imageUploader"
                      value={coverArt}
                      onChange={(url) => url !== undefined && setCoverArt(url)}
                      fileType="image"
                    />
                    <p className="text-sm text-muted-foreground">
                      Recommended size: 1400 x 1400 pixels (square)
                    </p>
                  </div>

                  <div className="flex justify-between gap-2 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("details")}
                    >
                      Back: Details
                    </Button>
                    <div className="space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => handleSubmit(false)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Save as Draft
                      </Button>
                      <Button
                        onClick={() => handleSubmit(true)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Publish Song
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload Tips</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">High Quality Audio</p>
                    <p className="text-sm text-muted-foreground">
                      Use 320kbps MP3 files for best audio quality.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Cover Art</p>
                    <p className="text-sm text-muted-foreground">
                      Use a 1400×1400 pixel JPG or PNG for best results.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Copyright</p>
                    <p className="text-sm text-muted-foreground">
                      Ensure you have rights to all content you upload.
                    </p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Need help?</h4>
                <p className="text-xs text-muted-foreground">
                  Check our{" "}
                  <Link
                    href="/resources/help"
                    className="text-primary underline underline-offset-4"
                  >
                    help center
                  </Link>{" "}
                  for more tips on creating the best uploads.
                </p>
              </div>
            </CardContent>
          </Card>

          {title && audioUrl && (
            <Card>
              <CardHeader>
                <CardTitle>Upload Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="aspect-square bg-secondary rounded-md relative">
                    {coverArt ? (
                      <Image
                        src={coverArt}
                        alt={title}
                        fill
                        className="object-cover rounded-md"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold truncate">{title}</h3>
                    {featuredArtists && (
                      <p className="text-sm text-muted-foreground">
                        feat. {featuredArtists}
                      </p>
                    )}
                  </div>

                  {audioUrl && (
                    <audio src={audioUrl} controls className="w-full" />
                  )}

                  {selectedGenres.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {selectedGenres.map((genre) => (
                        <Badge
                          key={genre}
                          variant="secondary"
                          className="text-xs"
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </AdminDashboardLayout>
  );
}
