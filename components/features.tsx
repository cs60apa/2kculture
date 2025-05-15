import {
  Music,
  Upload,
  Library,
  Search,
  Repeat,
  Heart,
  Mic,
  Layout,
  Users,
} from "lucide-react";

const features = [
  {
    icon: <Music className="h-8 w-8 text-indigo-500" />,
    title: "Audio Streaming",
    description:
      "High-quality audio streaming of MP3 and AAC formats for the best listening experience.",
  },
  {
    icon: <Upload className="h-8 w-8 text-indigo-500" />,
    title: "Easy Uploads",
    description:
      "Artists can quickly upload songs, albums and cover art with our streamlined process.",
  },
  {
    icon: <Library className="h-8 w-8 text-indigo-500" />,
    title: "Organized Library",
    description:
      "Keep your music organized with albums, genres, and custom playlists.",
  },
  {
    icon: <Search className="h-8 w-8 text-indigo-500" />,
    title: "Powerful Search",
    description:
      "Find music by track name, artist, genre, or tags with our comprehensive search.",
  },
  {
    icon: <Repeat className="h-8 w-8 text-indigo-500" />,
    title: "Advanced Player",
    description:
      "Enjoy a feature-rich player with play/pause, skip, repeat, and volume controls.",
  },
  {
    icon: <Heart className="h-8 w-8 text-indigo-500" />,
    title: "Favorites",
    description:
      "Save your favorite songs and create personalized playlists for any mood.",
  },
  {
    icon: <Mic className="h-8 w-8 text-indigo-500" />,
    title: "Artist Profiles",
    description:
      "Artists get their own profile pages to showcase their music and connect with fans.",
  },
  {
    icon: <Layout className="h-8 w-8 text-indigo-500" />,
    title: "Creator Studio",
    description:
      "A dedicated dashboard for artists to upload, manage, and track their music.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need for your music
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            2kCulture provides all the tools you need to enjoy and share music
            that matters to you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-card border rounded-xl p-6 transition-all duration-200 hover:shadow-md hover:border-primary/50"
            >
              <div className="mb-4 bg-primary/5 p-3 rounded-lg inline-block">
                {feature.icon}
              </div>
              <h3 className="font-semibold text-xl mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
