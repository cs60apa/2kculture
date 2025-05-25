import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Albums management page for admin
export default function AdminAlbumsPage() {
  // TODO: Replace with actual admin logic to fetch all albums if available
  // For now, use a placeholder artistId or fetch all albums if you have such a query
  const albums =
    useQuery(api.music.getAlbumsByArtist, { artistId: "admin" }) ?? [];
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Albums</h1>
        <Button>Add New Album</Button>
      </div>
      <Table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Artist</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {albums.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-gray-400">
                No albums yet.
              </td>
            </tr>
          ) : (
            albums.map((album) => (
              <tr key={album._id}>
                <td>{album.title}</td>
                <td>{album.artistName}</td>
                <td>{album.isPublic ? "Published" : "Draft"}</td>
                <td>{/* TODO: Add edit/delete actions */}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
