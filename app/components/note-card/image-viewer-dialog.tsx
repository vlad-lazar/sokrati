// components/note-card/image-viewer-dialog.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Download, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner"; // Assuming you have sonner for toasts

interface ImageViewerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  imageName: string;
}

const ImageViewerDialog: React.FC<ImageViewerDialogProps> = ({
  isOpen,
  onClose,
  imageUrl,
  imageName,
}) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // --- MODIFIED handleDownload FUNCTION ---
  const handleDownload = async () => {
    if (!imageUrl) {
      toast.error("Download Error", { description: "No image URL available." });
      return;
    }

    try {
      // Step 1: Fetch the image data
      const response = await fetch(imageUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Step 2: Get the image data as a Blob
      const blob = await response.blob();

      // Step 3: Create a temporary object URL for the Blob
      const url = URL.createObjectURL(blob);

      // Step 4: Create a temporary anchor element
      const link = document.createElement("a");
      link.href = url;
      link.download = imageName || "downloaded_image.jpg"; // Suggest filename
      link.target = "_blank"; // Open in new tab, but download attribute should override

      // Step 5: Programmatically click the link to trigger download
      document.body.appendChild(link); // Temporarily append to DOM
      link.click();
      document.body.removeChild(link); // Remove from DOM

      // Step 6: Clean up the object URL to free memory
      // Use a timeout to ensure the download is initiated before revoking
      setTimeout(() => URL.revokeObjectURL(url), 100);

      toast.success("Download Started", {
        description: `Downloading "${imageName || "image"}".`,
      });
    } catch (error) {
      console.error("Error downloading image:", error);
      toast.error("Download Failed", {
        description: "Could not download image. Please try again.",
      });
    }
  };
  // --- END MODIFIED handleDownload FUNCTION ---

  // Reset loading and error states when dialog opens or image URL changes
  useEffect(() => {
    if (isOpen) {
      setImageLoading(true); // Assume image will load
      setImageError(false); // Clear previous image errors
    }
  }, [isOpen, imageUrl]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[700px] h-auto max-h-[90vh] flex flex-col p-0"
        aria-describedby="image-viewer-description"
      >
        <DialogHeader className="p-5">
          <DialogTitle>Image Viewer</DialogTitle>
        </DialogHeader>

        <div className="relative flex-1 flex items-center justify-center bg-muted">
          {imageLoading && !imageError && (
            <div className="absolute">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {!imageError ? (
            // Consider using fill prop for next/image if you want it to fill the parent div
            // Make sure the parent div has defined width/height if using fill
            <Image
              src={imageUrl}
              alt={imageName}
              layout="responsive" // Or 'fill' with parent sizing
              width={500} // These are treated as aspect ratio if layout="responsive"
              height={500}
              className={`transition-opacity duration-300 ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoadingComplete={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-center">
              <XCircle className="h-10 w-10 text-red-500 mb-2" />
              <p className="text-sm text-muted-foreground">
                Failed to load the image.
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center p-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="default"
            onClick={handleDownload}
            // Add disabled state if you want to prevent multiple clicks during download
            // disabled={isDownloading} // You might add a state for this if needed
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageViewerDialog;
