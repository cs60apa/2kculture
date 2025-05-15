"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Play, Search } from "lucide-react"
import { allSongs, allArtists, allAlbums, allGenres } from "@/lib/data"

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredSongs = allSongs.filter(
    (song) =>
      song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredArtists = allArtists.filter((artist) => artist.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const filteredAlbums = allAlbums.filter(
    (album) =>
      album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      album.artist.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container px-4 py-6 space-y-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Search</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for songs, artists, or albums..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {searchQuery ? (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Songs</h2>
            {filteredSongs.length > 0 ? (
              <div className="rounded-md border">
                <div className="relative w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium">#</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Title</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Artist</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Album</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Duration</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {filteredSongs.map((song, index) => (
                        <tr
                          key={song.id}
                          className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                          <td className="p-4 align-middle">{index + 1}</td>
                          <td className="p-4 align-middle">
                            <div className="flex items-center gap-3">
                              <Image
                                src={song.cover || "/placeholder.svg"}
                                alt={song.title}
                                width={40}
                                height={40}
                                className="rounded object-cover"
                              />
                              <span>{song.title}</span>
                            </div>
                          </td>
                          <td className="p-4 align-middle">{song.artist}</td>
                          <td className="p-4 align-middle">{song.album}</td>
                          <td className="p-4 align-middle">{song.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No songs found matching &quot;{searchQuery}&quot;</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Artists</h2>
            {filteredArtists.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {filteredArtists.map((artist) => (
                  <div key={artist.id} className="text-center">
                    <div className="relative mx-auto w-32 h-32 md:w-40 md:h-40 group">
                      <Image
                        src={artist.image || "/placeholder.svg"}
                        alt={artist.name}
                        width={160}
                        height={160}
                        className="w-full h-full rounded-full object-cover transition-all group-hover:brightness-75"
                      />
                    </div>
                    <h3 className="mt-2 font-medium">{artist.name}</h3>
                    <p className="text-sm text-muted-foreground">{artist.genre}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No artists found matching &quot;{searchQuery}&quot;</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Albums</h2>
            {filteredAlbums.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredAlbums.map((album) => (
                  <Card key={album.id} className="overflow-hidden">
                    <div className="relative group">
                      <Image
                        src={album.cover || "/placeholder.svg"}
                        alt={album.title}
                        width={300}
                        height={300}
                        className="w-full aspect-square object-cover transition-all group-hover:brightness-75"
                      />
                      <Button
                        size="icon"
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-purple-600 hover:bg-purple-700"
                      >
                        <Play className="h-4 w-4" />
                        <span className="sr-only">Play</span>
                      </Button>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold truncate">{album.title}</h3>
                      <p className="text-sm text-muted-foreground">{album.artist}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No albums found matching &quot;{searchQuery}&quot;</p>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Browse Genres</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {allGenres.map((genre) => (
                <Card key={genre.id} className="overflow-hidden">
                  <div
                    className="h-32 bg-gradient-to-r from-purple-700 to-indigo-700 flex items-center justify-center p-4 text-white font-bold text-xl"
                    style={{
                      backgroundImage: `linear-gradient(to right, ${genre.color1}, ${genre.color2})`,
                    }}
                  >
                    {genre.name}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Popular Searches</h2>
            <div className="flex flex-wrap gap-2">
              {["Hip Hop", "R&B", "Pop", "Drake", "Kendrick Lamar", "Summer Vibes", "Workout Mix", "Chill"].map(
                (term) => (
                  <Button key={term} variant="outline" onClick={() => setSearchQuery(term)} className="rounded-full">
                    {term}
                  </Button>
                ),
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
