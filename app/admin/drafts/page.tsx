import { Table } from "@/components/ui/table";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Drafts management page for admin
export default function AdminDraftsPage() {
  // TODO: Replace with actual admin logic to fetch all drafts if available
  const drafts =
    useQuery(api.music.getDraftSongsByArtist, { artistId: "admin" }) ?? [];
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Drafts</h1>
      <Table>
        <thead>
          <tr>
            <th>Type</th>
            <th>Title</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {drafts.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-gray-400">
                No drafts yet.
              </td>
            </tr>
          ) : (
            drafts.map((draft) => (
              <tr key={draft._id}>
                <td>Song</td>
                <td>{draft.title}</td>
                <td>Draft</td>
                <td>{/* TODO: Add edit/delete actions */}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
