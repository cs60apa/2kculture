import { useState } from "react";
import { FileUploader } from "@/components/file-uploader";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

// Upload page for admin
export default function AdminUploadPage() {
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Upload New Song or Album</h1>
      <FileUploader
        onChange={setAudioUrl}
        endpoint="audioUploader"
        value={audioUrl}
      />
    </div>
  );
}
