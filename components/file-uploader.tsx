"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useDropzone } from "react-dropzone";
import { generateClientDropzoneAccept } from "uploadthing/client";

import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, Music, Upload } from "lucide-react";

interface FileUploaderProps {
  onChange: (url?: string) => void;
  endpoint: "audioUploader" | "imageUploader";
  value?: string;
  className?: string;
  fileType?: "audio" | "image";
}

export function FileUploader({
  onChange,
  endpoint,
  value,
  className,
  fileType = endpoint === "audioUploader" ? "audio" : "image",
}: FileUploaderProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { startUpload } = useUploadThing(endpoint, {
    onClientUploadComplete: (res: Array<{ url: string }> | undefined) => {
      onChange(res?.[0]?.url);
      setIsUploading(false);
      setUploadError(null);
      router.refresh();
    },
    onUploadError: (error: Error) => {
      console.log(error);
      setIsUploading(false);
      setUploadError(
        error.message || "Failed to upload file. Please try again."
      );
    },
    onUploadProgress: (progress: number) => {
      setUploadProgress(progress);
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setUploadError(null);
        setIsUploading(true);
        startUpload(acceptedFiles);
      }
    },
    [startUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept:
      endpoint === "audioUploader"
        ? generateClientDropzoneAccept(["audio/*"])
        : generateClientDropzoneAccept(["image/*"]),
    maxFiles: 1,
    maxSize: endpoint === "audioUploader" ? 32 * 1024 * 1024 : 8 * 1024 * 1024, // 32MB for audio, 8MB for images
    onError: (err) => {
      setUploadError(err.message);
    },
  });

  const fileIcon =
    fileType === "audio" ? (
      <Music
        className={cn(
          "h-10 w-10",
          isDragActive ? "text-primary" : "text-gray-400"
        )}
      />
    ) : (
      <Upload
        className={cn(
          "h-10 w-10",
          isDragActive ? "text-primary" : "text-gray-400"
        )}
      />
    );

  return (
    <div className={cn("w-full", className)}>
      {value ? (
        <div className="flex flex-col items-center justify-center space-y-2">
          {fileType === "audio" ? (
            <audio src={value} controls className="w-full mt-2" />
          ) : (
            <div className="relative h-20 w-20 overflow-hidden rounded-md">
              <Image
                src={value}
                alt="Uploaded file"
                fill
                sizes="80px"
                className="object-cover"
              />
            </div>
          )}
          <Button variant="outline" onClick={() => onChange("")} size="sm">
            Change {fileType}
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-gray-300 dark:border-gray-700",
            uploadError
              ? "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
              : ""
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-center">
            {uploadError ? (
              <AlertCircle className="h-10 w-10 text-red-500" />
            ) : (
              fileIcon
            )}
            <p
              className={cn(
                "mt-2 text-sm",
                uploadError
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              {uploadError
                ? uploadError
                : isDragActive
                  ? `Drop the ${fileType} file here...`
                  : `Drag 'n' drop ${fileType} file here, or click to select file`}
            </p>
            {!uploadError && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {endpoint === "audioUploader"
                  ? "MP3, AAC (max 32MB)"
                  : "PNG, JPG, WEBP (max 8MB)"}
              </p>
            )}
          </div>
        </div>
      )}

      {isUploading && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <p>Uploading...</p>
            <p>{uploadProgress}%</p>
          </div>
          <Progress value={uploadProgress} className="h-1" />
        </div>
      )}
    </div>
  );
}
