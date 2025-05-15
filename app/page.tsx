import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import Link from "next/link"
import { Play } from "lucide-react"
import { featuredPlaylists, newReleases, popularArtists } from "@/lib/data"

export default function Home() {
  return (
    <div className="container px-4 py-6 space-y-8">
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-purple-900 to-indigo-900 dark:from-purple-950 dark:to-indigo-950 rounded-3xl">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-white">
                  Discover Your Sound
                </h1>
                <p className="max-w-[600px] text-gray-200 md:text-xl">
                  Stream millions of tracks from your favorite artists. Find new music and build your perfect playlist.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
                  <Link href="/signup">Sign Up Free</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-white border-white hover:bg-white/10">
                  <Link href="/explore">Explore Music</Link>
                </Button>
              </div>
            </div>
            <Image
              src="/placeholder.svg?height=400&width=600"
              alt="Music Visualization"
              width={600}
              height={400}
              className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
            />
          </div>
        </div>
      </section>

      <Tabs defaultValue="featured" className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="new">New Releases</TabsTrigger>
            <TabsTrigger value="artists">Popular Artists</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="featured" className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredPlaylists.map((playlist) => (
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
        <TabsContent value="new" className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {newReleases.map((release) => (
              <Card key={release.id} className="overflow-hidden">
                <div className="relative group">
                  <Image
                    src={release.cover || "/placeholder.svg"}
                    alt={release.title}
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
                  <h3 className="font-semibold truncate">{release.title}</h3>
                  <p className="text-sm text-muted-foreground">{release.artist}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="artists" className="pt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {popularArtists.map((artist) => (
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
