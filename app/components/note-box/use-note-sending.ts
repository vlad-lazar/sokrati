// components/note-box/use-note-sending.ts
import { useState } from "react";
import { useAuth } from "@/app/context/AuthContext";
import { uploadMultipleFiles } from "@/lib/firebase-upload";
import type { Note } from "@/app/types/note";
import { toast } from "sonner"; // <--- Changed import from "@/components/ui/use-toast" to "sonner"
import { AttachmentPreview } from "./attachement-preview";

interface UseNoteSendingProps {
  message: string;
  attachments: AttachmentPreview[];
  onNoteAdded?: (note: Note) => void;
  onClear: () => void;
}

export function useNoteSending({
  message,
  attachments,
  onNoteAdded,
  onClear,
}: UseNoteSendingProps) {
  const [isSending, setIsSending] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    completed: 0,
    total: 0,
  });

  const authContext = useAuth();
  // No need to initialize useToast() anymore, `toast` is directly callable from sonner

  const handleSend = async () => {
    if (!authContext.user || !authContext.user.uid) {
      toast.error("Authentication Required", {
        // <--- Using toast.error()
        description: "You must be logged in to send a message.",
        duration: 3000,
      });
      return;
    }

    if (!message.trim() && attachments.length === 0) {
      toast.warning("Empty Note", {
        // <--- Using toast.warning()
        description: "Please type a message or attach files to send.",
        duration: 3000,
      });
      return;
    }

    setIsSending(true);

    try {
      let uploadedAttachmentUrls: any[] = [];

      if (attachments.length > 0) {
        setIsUploading(true);
        const filesToUpload = attachments.map((att) => att.file);
        uploadedAttachmentUrls = await uploadMultipleFiles(
          filesToUpload,
          authContext.user.uid,
          (completed, total) => {
            setUploadProgress({ completed, total });
          }
        );
        setIsUploading(false);
      }

      const idToken = await authContext.user.getIdToken();
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          message,
          attachments: uploadedAttachmentUrls,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send the message");
      }

      const data = await response.json();
      console.log("Note created successfully with ID:", data.id);

      if (onNoteAdded) {
        const newNote: Note = {
          id: data.id,
          message: message,
          authorId: authContext.user.uid,
          timestamp: new Date().toISOString(),
          isFavourite: false,
          updatedAt: undefined,
          attachments: uploadedAttachmentUrls,
        };
        onNoteAdded(newNote);
      }

      toast.success("Note Sent!", {
        // <--- Using toast.success()
        description: "Your note has been successfully added.",
        duration: 2000,
      });

      onClear();
    } catch (error: any) {
      console.error("Error sending message:", error);
      let errorMessage = "Failed to send note."; // Generic message
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "error" in error &&
        typeof (error as any).error === "string"
      ) {
        errorMessage = (error as any).error;
      }
      toast.error("Error Sending Note", {
        // <--- Using toast.error()
        description: errorMessage,
        duration: 5000,
      });
    } finally {
      setIsSending(false);
      setIsUploading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return {
    isSending,
    isUploading,
    uploadProgress,
    handleSend,
    handleKeyDown,
  };
}
