import { Card } from "@/components/ui/card";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Dashboard page for admin
export default function AdminDashboardPage() {
  const songs = useQuery(api.music.getSongs) ?? [];
  const albums =
    useQuery(api.music.getAlbumsByArtist, { artistId: "admin" }) ?? [];
  const drafts =
    useQuery(api.music.getDraftSongsByArtist, { artistId: "admin" }) ?? [];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-4">Total Songs: {songs.length}</Card>
      <Card className="p-4">Total Albums: {albums.length}</Card>
      <Card className="p-4">Drafts: {drafts.length}</Card>
      <Card className="p-4 col-span-1 md:col-span-3">
        Analytics Summary: {/* TODO: summary chart */}
      </Card>
    </div>
  );
}
