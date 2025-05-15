"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { FileWithPath } from "@uploadthing/react";
import { useDropzone } from "@uploadthing/react/hooks";
import { generateClientDropzoneAccept } from "uploadthing/client";

import { useUploadThing } from "@/lib/uploadthing";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Music, Upload } from "lucide-react";

interface FileUploaderProps {
  onChange: (url?: string) => void;
  endpoint: "audioUploader" | "imageUploader";
  value?: string;
  className?: string;
}

export function FileUploader({
  onChange,
  endpoint,
  value,
  className,
}: FileUploaderProps) {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { startUpload } = useUploadThing(endpoint, {
    onClientUploadComplete: (res) => {
      onChange(res?.[0].url);
      setIsUploading(false);
      router.refresh();
    },
    onUploadError: (error: Error) => {
      console.log(error);
      setIsUploading(false);
    },
    onUploadProgress: (progress) => {
      setUploadProgress(progress);
    },
  });

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      setIsUploading(true);
      startUpload(acceptedFiles);
    },
    [startUpload]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept:
      endpoint === "audioUploader"
        ? generateClientDropzoneAccept(["audio/*"])
        : generateClientDropzoneAccept(["image/*"]),
  });

  const fileType = endpoint === "audioUploader" ? "audio" : "image";
  const fileIcon =
    endpoint === "audioUploader" ? (
      <Music className="h-10 w-10 text-gray-400" />
    ) : (
      <Upload className="h-10 w-10 text-gray-400" />
    );

  return (
    <div className={cn("w-full", className)}>
      {value ? (
        <div className="flex flex-col items-center justify-center space-y-2">
          {endpoint === "audioUploader" ? (
            <audio src={value} controls className="w-full mt-2" />
          ) : (
            <div className="relative h-20 w-20 overflow-hidden rounded-md">
              <img
                src={value}
                alt="Uploaded file"
                className="w-full h-full object-cover"
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
          className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer"
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center text-center">
            {fileIcon}
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Drag &apos;n&apos; drop {fileType} file here, or click to select
              file
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {endpoint === "audioUploader"
                ? "MP3, AAC (max 32MB)"
                : "PNG, JPG, WEBP (max 8MB)"}
            </p>
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
