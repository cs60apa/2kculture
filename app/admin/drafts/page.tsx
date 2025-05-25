import { Table } from "@/components/ui/table";

// Drafts management page for admin
export default function AdminDraftsPage() {
  // TODO: Fetch drafts from backend
  const drafts = [];
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Drafts</h1>
      <Table>
        {/* TODO: Render draft rows */}
        <thead>
          <tr>
            <th>Type</th>
            <th>Title</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Example row */}
          <tr>
            <td colSpan={4} className="text-center text-gray-400">
              No drafts yet.
            </td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}
