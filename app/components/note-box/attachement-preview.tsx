"use client";
import { X, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AttachmentPreview {
  id: string;
  file: File;
  preview?: string; // For images
  type: "image" | "file";
}

// Export the type alias for easier importing
export type AttachmentPreviewType = AttachmentPreview;

interface AttachmentPreviewProps {
  attachments: AttachmentPreview[];
  onRemove: (id: string) => void;
  className?: string;
}
export function AttachmentPreview({
  attachments = [],
  onRemove,
  className,
}: AttachmentPreviewProps) {
  // Early return if no attachments
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2 p-2 border-t", className)}>
      {attachments.map((attachment) => {
        // Safety check for attachment object
        if (!attachment || !attachment.file) return null;

        return (
          <div
            key={attachment.id}
            className="relative group border rounded-lg overflow-hidden bg-muted/50"
          >
            {attachment.type === "image" && attachment.preview ? (
              <div className="relative">
                <img
                  src={attachment.preview || "/placeholder.svg"}
                  alt={attachment.file.name || "Attachment"}
                  className="w-20 h-20 object-cover"
                  onError={(e) => {
                    // Fallback if image fails to load
                    e.currentTarget.style.display = "none";
                  }}
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </div>
            ) : (
              <div className="w-20 h-20 flex flex-col items-center justify-center p-2">
                <FileIcon className="h-6 w-6 text-muted-foreground" />
                <span className="text-xs text-muted-foreground text-center truncate w-full mt-1">
                  {attachment.file.name || "Unknown file"}
                </span>
              </div>
            )}

            <Button
              className="cursor-pointer absolute top-5 right-5  rounded-full opacity-50 transition-opacity hover:opacity-100 "
              onClick={() => onRemove(attachment.id)}
            >
              <X className="h-2 w-2 " />
            </Button>

            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
              {attachment.file.name || "Unknown file"}
            </div>
          </div>
        );
      })}
    </div>
  );
}
