// components/note-box/use-note-attachments.ts
import { useState, useRef, useMemo } from "react";
import {
  createFilePreview,
  generateFileId,
  isImageFile,
  validateFile,
} from "@/lib/file-utils";
import { toast } from "sonner"; // <--- Changed import from "@/components/ui/use-toast" to "sonner"

export interface AttachmentPreview {
  id: string;
  file: File;
  type: "image" | "file";
  preview?: string;
}

const MAX_ATTACHMENT_SIZE_MB = 5;
const MAX_ATTACHMENT_SIZE_BYTES = MAX_ATTACHMENT_SIZE_MB * 1024 * 1024;

export function useNoteAttachments() {
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // No need to initialize useToast() anymore, `toast` is directly callable from sonner

  const currentTotalAttachmentSize = useMemo(() => {
    return attachments.reduce(
      (total, attachment) => total + attachment.file.size,
      0
    );
  }, [attachments]);

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newAttachments: AttachmentPreview[] = [];
    let newFilesSize = 0;

    for (const file of fileArray) {
      const validation = validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error, {
          // <--- Using toast.error() for destructive variant
          description: "Please select a valid file type or size.",
          duration: 4000,
        });
        continue;
      }

      if (
        currentTotalAttachmentSize + newFilesSize + file.size >
        MAX_ATTACHMENT_SIZE_BYTES
      ) {
        toast.error(`Attachment Limit Exceeded`, {
          // <--- Using toast.error()
          description: `Adding "${file.name}" would exceed the total attachment limit of ${MAX_ATTACHMENT_SIZE_MB}MB. Please remove some existing attachments or choose smaller files.`,
          duration: 5000,
        });
        continue;
      }

      const id = generateFileId();
      const attachment: AttachmentPreview = {
        id,
        file,
        type: isImageFile(file) ? "image" : "file",
      };

      if (isImageFile(file)) {
        try {
          attachment.preview = await createFilePreview(file);
        } catch (error) {
          console.error("Failed to create preview:", error);
          toast.warning(`Preview Error`, {
            // <--- Using toast.warning()
            description: `Could not generate preview for "${file.name}". File will still be attached.`,
            duration: 3000,
          });
        }
      }
      newAttachments.push(attachment);
      newFilesSize += file.size;
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    e.target.value = "";
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
  };

  const handleTriggerAttachmentInput = () => {
    fileInputRef.current?.click();
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter((item) => item.type.startsWith("image/"));

    if (imageItems.length > 0) {
      e.preventDefault();
      const files: File[] = [];
      for (const item of imageItems) {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }
      if (files.length > 0) {
        await processFiles(files);
      }
    }
  };

  return {
    attachments,
    setAttachments,
    isDraggingOver,
    fileInputRef,
    handleFileSelect,
    handleRemoveAttachment,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleTriggerAttachmentInput,
    handlePaste,
    currentTotalAttachmentSize,
    MAX_ATTACHMENT_SIZE_BYTES,
    MAX_ATTACHMENT_SIZE_MB,
  };
}
