"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { MoreHorizontal, Pencil, Trash, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ImageViewerDialog from "./image-viewer-dialog";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { toast } from "sonner";
import type { ImageAttachment, Note } from "@/app/types/note";
import { useAuth } from "@/app/context/AuthContext";

import SentimentDisplay from "./sentiment-display";
import EditNoteDialog from "../edit-note-dialog";
import DeleteNoteDialog from "../delete-note-dialog";

interface NoteCardProps extends Note {
  onDeleteSuccess: (noteId: string) => void;
  onEditSuccess: (noteId: string, updatedNote: Note) => void;
  onFavouriteChange: (noteId: string, isFavourite: boolean) => void;
}

const NoteCard = (props: NoteCardProps) => {
  const {
    id,
    message,
    timestamp,
    updatedAt,
    authorId,
    isFavourite,
    attachments,
    sentimentScore,
    sentimentMagnitude,
    onDeleteSuccess,
    onEditSuccess,
    onFavouriteChange,
  } = props;

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [favourite, setFavourite] = useState(isFavourite);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageAttachment | null>(
    null
  );

  const authContext = useAuth();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (!authContext.user) {
        toast.error("Authentication Required", {
          description: "You must be logged in to delete a note.",
        });
        throw new Error("User not authenticated.");
      }

      const response = await fetch(`/api/messages/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await authContext.user.getIdToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete the note.");
      }

      console.log(`Note with ID ${id} deleted successfully.`);
      setIsDeleteDialogOpen(false);
      onDeleteSuccess(id);
      toast.success("Note Deleted!", {
        description: `Note "${message.substring(0, 30)}..." has been removed.`,
      });
    } catch (error: any) {
      console.error("Error deleting note:", error);
      toast.error("Failed to Delete Note", {
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async (updatedMessage: string) => {
    setIsSaving(true);
    try {
      if (!authContext.user) {
        toast.error("Authentication Required", {
          description: "You must be logged in to edit a note.",
        });
        throw new Error("User not authenticated.");
      }

      const response = await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await authContext.user.getIdToken()}`,
        },
        body: JSON.stringify({ message: updatedMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update the note.");
      }

      const { updatedNote } = await response.json();

      console.log(`Note with ID ${id} updated successfully.`);
      setIsEditDialogOpen(false);
      onEditSuccess(id, updatedNote);
      toast.success("Note Updated!", {
        description: "Your note has been successfully updated.",
      });
    } catch (error: any) {
      console.error("Error updating note:", error);
      toast.error("Failed to Update Note", {
        description: error.message || "An unexpected error occurred.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFavourite = async () => {
    try {
      if (!authContext.user) {
        toast.error("Authentication Required", {
          description: "You must be logged in to favourite a note.",
        });
        throw new Error("User not authenticated.");
      }

      const newFavouriteStatus = !favourite;
      const response = await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await authContext.user.getIdToken()}`,
        },
        body: JSON.stringify({ isFavourite: newFavouriteStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to update favourite status."
        );
      }

      const { updatedNote } = await response.json();

      console.log(
        `Note with ID ${id} favourite status updated to ${newFavouriteStatus}.`
      );
      setFavourite(newFavouriteStatus);
      onFavouriteChange(id, newFavouriteStatus);
      onEditSuccess(id, updatedNote);
      toast.success("Favourite Status Updated!", {
        description: `Note marked as ${
          newFavouriteStatus ? "favourite" : "unfavourite"
        }.`,
      });
    } catch (error: any) {
      console.error("Error updating favourite status:", error);
      toast.error("Failed to Update Favourite", {
        description: error.message || "An unexpected error occurred.",
      });
    }
  };

  const handleImageClick = (attachment: ImageAttachment) => {
    setSelectedImage(attachment);
    setIsImageViewerOpen(true);
  };

  const canEditOrDelete = authContext.user && authContext.user.uid === authorId;
  const hasImages = Array.isArray(attachments) && attachments.length > 0;

  return (
    <Card className="border rounded-lg shadow-md p-4 relative">
      <div className="flex flex-col items-start space-y-3">
        {updatedAt && (
          <p className="text-xs text-muted-foreground italic">Edited</p>
        )}

        {message && message.trim() !== "" && (
          <div
            className="prose dark:prose-invert max-w-none w-full"
            style={{
              paddingRight: "1rem",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              overflowWrap: "break-word",
            }}
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {message}
            </ReactMarkdown>
          </div>
        )}

        {hasImages && (
          <div className="flex flex-wrap gap-2 mt-3 mb-2">
            {attachments!.map((attachment, index) => (
              <div
                key={attachment.url}
                className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-md overflow-hidden cursor-pointer border border-gray-200 dark:border-gray-700 group"
                onClick={() => handleImageClick(attachment)}
              >
                <Image
                  src={attachment.url || "/placeholder.svg"}
                  alt={attachment.name || `Attachment ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-200 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white text-sm font-medium">
                  View
                </div>
              </div>
            ))}
          </div>
        )}

        {typeof sentimentScore === "number" &&
          typeof sentimentMagnitude === "number" && (
            <div className="w-full">
              <SentimentDisplay
                score={sentimentScore}
                magnitude={sentimentMagnitude}
                compact={false}
              />
            </div>
          )}

        <p className="text-xs mt-2 text-muted-foreground">
          {timestamp ?? "No timestamp available"}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted">
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {canEditOrDelete && (
            <>
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                <span>Edit</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleFavourite}>
                <Star
                  className={`h-4 w-4 mr-2 ${
                    favourite
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
                <span>{favourite ? "Unfavourite" : "Favourite"}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
                <Trash className="h-4 w-4 mr-2 text-red-400" />
                <span className="text-red-400">Delete</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteNoteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        noteMessage={message}
        isDeleting={isDeleting}
      />

      <EditNoteDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSave={handleSaveEdit}
        initialMessage={message ?? ""}
        isSaving={isSaving}
      />

      {isImageViewerOpen && selectedImage && (
        <ImageViewerDialog
          isOpen={isImageViewerOpen}
          onClose={() => setIsImageViewerOpen(false)}
          imageUrl={selectedImage.url}
          imageName={selectedImage.name}
        />
      )}
    </Card>
  );
};

export default NoteCard;
