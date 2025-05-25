import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Songs management page for admin
export default function AdminSongsPage() {
  const songs = useQuery(api.music.getSongs) ?? [];
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Songs</h1>
        <Button>Add New Song</Button>
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
          {songs.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-gray-400">
                No songs yet.
              </td>
            </tr>
          ) : (
            songs.map((song) => (
              <tr key={song._id}>
                <td>{song.title}</td>
                <td>{song.artistName}</td>
                <td>{song.isPublic ? "Published" : "Draft"}</td>
                <td>{/* TODO: Add edit/delete actions */}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
