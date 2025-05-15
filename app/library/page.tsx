import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Play } from "lucide-react"
import { userLibrary } from "@/lib/data"

export default function LibraryPage() {
  return (
    <div className="container px-4 py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Your Library</h1>
          <p className="text-muted-foreground">Access your saved music, playlists, and more</p>
        </div>
      </div>

      <Tabs defaultValue="songs" className="w-full">
        <TabsList>
          <TabsTrigger value="songs">Songs</TabsTrigger>
          <TabsTrigger value="albums">Albums</TabsTrigger>
          <TabsTrigger value="playlists">Playlists</TabsTrigger>
          <TabsTrigger value="artists">Artists</TabsTrigger>
        </TabsList>
        <TabsContent value="songs" className="pt-6">
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
                  {userLibrary.songs.map((song, index) => (
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
        </TabsContent>
        <TabsContent value="albums" className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {userLibrary.albums.map((album) => (
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
        </TabsContent>
        <TabsContent value="playlists" className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {userLibrary.playlists.map((playlist) => (
              <Card key={playlist.id} className="overflow-hidden">
                <div className="relative group">
                  <Image
                    src={playlist.cover || "/placeholder.svg"}
                    alt={playlist.title}
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
                  <h3 className="font-semibold truncate">{playlist.title}</h3>
                  <p className="text-sm text-muted-foreground">{playlist.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="artists" className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {userLibrary.artists.map((artist) => (
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
