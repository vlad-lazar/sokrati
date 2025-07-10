// components/note-card/image-viewer-dialog.tsx
"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// Updated props interface with definite types
interface ImageViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // These will now always be strings when the dialog is open,
  // as NoteCard will only open it if an image is selected.
  imageUrl: string;
  imageName: string;
}

const ImageViewerDialog: React.FC<ImageViewerDialogProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageName,
}) => {
  // We no longer need to check `!imageUrl` here as it's guaranteed to be a string
  // when `isOpen` is true based on how `NoteCard` will call it.

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = imageName; // Use the exact image name
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] h-auto max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle className="flex justify-between items-center pr-4">
            <span>{imageName || "Image Preview"}</span>{" "}
            {/* Fallback for display */}
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" /> Download
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-auto p-4 flex justify-center items-center">
          <div className="relative w-full h-full max-h-[calc(90vh-120px)]">
            <Image
              src={imageUrl}
              alt={imageName || "Full size image"}
              fill
              style={{ objectFit: "contain" }}
              className="rounded-md"
              unoptimized={imageUrl.startsWith("blob:")}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewerDialog;
