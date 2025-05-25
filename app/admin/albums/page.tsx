import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";

// Albums management page for admin
export default function AdminAlbumsPage() {
  // TODO: Fetch albums from backend
  const albums = [];
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Albums</h1>
        <Button>Add New Album</Button>
      </div>
      <Table>
        {/* TODO: Render album rows */}
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
              No albums yet.
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}
