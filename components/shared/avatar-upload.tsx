"use client";

import { useState } from "react";
import Image from "next/image";
import { Camera, Loader2 } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing-helpers";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/string-utils";

export function AvatarUpload({
  currentUrl,
  name,
  onUploaded,
  onUploadingChange,
}: {
  currentUrl?: string | null;
  name: string;
  onUploaded: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);

  const { startUpload, isUploading } = useUploadThing("avatar", {
    onUploadBegin: () => {
      onUploadingChange?.(true);
    },
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        setPreview(res[0].ufsUrl);
        onUploaded(res[0].ufsUrl);
      }
      onUploadingChange?.(false);
    },
    onUploadError: () => {
      alert("Upload failed. Please try again.");
      onUploadingChange?.(false);
    },
  });

  const initials = getInitials(name);

  function handleFile(file: File) {
    if (file.size > 2 * 1024 * 1024) {
      alert("File must be under 2MB");
      return;
    }
    startUpload([file]);
  }

  return (
    <label
      className={cn(
        "group relative flex size-24 cursor-pointer items-center justify-center overflow-hidden rounded-full border-4 border-card shadow-md transition-all hover:shadow-lg",
        isUploading && "pointer-events-none",
      )}
    >
      {preview ? (
        <Image
          src={preview}
          alt={name}
          width={96}
          height={96}
          className="size-full object-cover"
        />
      ) : (
        <div className="flex size-full items-center justify-center bg-neo-teal/10">
          <span className="text-2xl font-bold text-neo-teal">
            {initials}
          </span>
        </div>
      )}

      {/* Hover / uploading overlay */}
      <div
        className={cn(
          "absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/50 transition-opacity",
          isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="size-5 animate-spin text-white" />
            <span className="text-[10px] font-medium text-white/80">Uploading...</span>
          </>
        ) : (
          <>
            <Camera className="size-5 text-white" />
            <span className="text-[10px] font-medium text-white/80">Change</span>
          </>
        )}
      </div>

      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
    </label>
  );
}
