"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Music, Search, PlayIcon, PlusCircle } from "lucide-react";

import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { usePlayerStore } from "@/lib/player-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { playSong, playQueue } = usePlayerStore();
  
  // Fetch latest songs
  const latestSongs = useQuery(api.music.getSongs) || [];
  
  // Fetch popular songs
  const popularSongs = useQuery(api.music.getPopularSongs, { limit: 10 }) || [];
  
  // Search songs
  const searchResults = useQuery(
    api.music.searchSongs, 
    searchQuery ? { query: searchQuery } : "skip"
  );
  
  // Play song
  const playSong = (song: any) => {
    setCurrentSong(song);
  };

  return (
    <>
      <Navbar />
      <div className="container max-w-7xl mx-auto pt-24 pb-16 px-4 sm:px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Music Library</h1>
          <div className="relative w-full max-w-md flex items-center">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search songs, artists, genres..."
              className="pl-10 bg-secondary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {searchQuery ? (
          <div className="mb-10">
            <h2 className="text-2xl font-semibold mb-4">Search Results</h2>
            {searchResults === undefined ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {searchResults.map((song) => (
                  <SongCard key={song._id} song={song} onPlay={() => playSong(song)} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground mb-4">
                  No results found for "{searchQuery}".
                </p>
              </div>
            )}
          </div>
        ) : (
          <Tabs defaultValue="latest" className="mb-10">
            <TabsList className="mb-6">
              <TabsTrigger value="latest">Latest Releases</TabsTrigger>
              <TabsTrigger value="popular">Popular</TabsTrigger>
              <TabsTrigger value="genres">Genres</TabsTrigger>
            </TabsList>
            
            <TabsContent value="latest">
              <h2 className="text-2xl font-semibold mb-4">Latest Releases</h2>
              {latestSongs.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {latestSongs.map((song) => (
                    <SongCard key={song._id} song={song} onPlay={() => playSong(song)} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="popular">
              <h2 className="text-2xl font-semibold mb-4">Popular Songs</h2>
              {popularSongs.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {popularSongs.map((song) => (
                    <SongCard key={song._id} song={song} onPlay={() => playSong(song)} />
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center py-10">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="genres">
              <h2 className="text-2xl font-semibold mb-4">Browse by Genre</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {["Hip Hop", "Pop", "Rock", "R&B", "Electronic", "Jazz", "Classical", "Indie"].map((genre) => (
                  <Card key={genre} className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow">
                    <div className={`h-32 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center`}>
                      <h3 className="text-xl font-bold text-white">{genre}</h3>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
        
        {currentSong && (
          <div className="sticky bottom-0 left-0 right-0 z-40">
            <AudioPlayer
              src={currentSong.audioUrl}
              title={currentSong.title}
              artist={currentSong.artistName}
              coverArt={currentSong.coverArt}
            />
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

function SongCard({ song, onPlay }: { song: any, onPlay: () => void }) {
  return (
    <Card className="overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
      <div className="relative aspect-square bg-secondary">
        {song.coverArt ? (
          <img 
            src={song.coverArt} 
            alt={song.title}
            className="h-full w-full object-cover" 
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-indigo-500/30 to-purple-600/30">
            <Music className="h-12 w-12 text-muted-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Button 
            size="icon" 
            variant="ghost" 
            className="rounded-full bg-white/20 text-white hover:bg-white/30"
            onClick={onPlay}
          >
            <PlayIcon className="h-8 w-8" />
          </Button>
        </div>
      </div>
      <CardContent className="p-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium line-clamp-1">{song.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-1">{song.artistName}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <PlusCircle className="h-4 w-4" />
          </Button>
        </div>
        {song.genres && song.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {song.genres.slice(0, 2).map((genre: string, index: number) => (
              <Badge key={index} variant="outline" className="text-xs">{genre}</Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
