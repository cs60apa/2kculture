import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";

// Songs management page for admin
export default function AdminSongsPage() {
  // TODO: Fetch songs from backend
  const songs = [];
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Songs</h1>
        <Button>Add New Song</Button>
      </div>
      <Table>
        {/* TODO: Render song rows */}
        <thead>
          <tr>
            <th>Title</th>
            <th>Artist</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Example row */}
          <tr>
            <td colSpan={4} className="text-center text-gray-400">
              No songs yet.
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}
