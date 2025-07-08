// src/components/note-card.tsx
"use client"; // This component uses client-side hooks and features

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Note } from "../types/note";
import {
  MoreHorizontal,
  Pencil,
  Trash,
  BookHeart,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteNoteDialog from "./delete-note-dialog";
import EditNoteDialog from "./edit-note-dialog";
import { useAuth } from "../context/AuthContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import updateLocale from "dayjs/plugin/updateLocale";

dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "a few seconds",
    m: "a minute",
    mm: "%d minutes",
    h: "an hour",
    hh: "%d hours",
    d: "a day",
    dd: "%d days",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years",
  },
});

interface NoteCardProps extends Note {
  onDeleteSuccess: (noteId: string) => void;
  onEditSuccess: (
    noteId: string,
    updatedMessage: string,
    newUpdatedAt: string
  ) => void;
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
    onDeleteSuccess,
    onEditSuccess,
    onFavouriteChange,
  } = props;

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [favourite, setFavourite] = useState(isFavourite);
  const authContext = useAuth();

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (!authContext.user) {
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
    } catch (error: any) {
      console.error("Error deleting note:", error);
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveEdit = async (updatedMessage: string) => {
    setIsSaving(true);
    try {
      if (!authContext.user) {
        throw new Error("User not authenticated.");
      }

      if (updatedMessage === message) {
        setIsSaving(false);
        setIsEditDialogOpen(false);
        return;
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

      const responseData = await response.json();
      const newUpdatedAt = responseData.updatedAt
        ? dayjs(
            responseData.updatedAt._seconds * 1000 +
              responseData.updatedAt._nanoseconds / 1000000
          ).format("MMMM D, h:mm A")
        : dayjs().format("MMMM D, h:mm A");

      console.log(`Note with ID ${id} updated successfully.`);
      setIsEditDialogOpen(false);
      onEditSuccess(id, updatedMessage, newUpdatedAt);
    } catch (error: any) {
      console.error("Error updating note:", error);
      alert(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleFavourite = async () => {
    try {
      if (!authContext.user) {
        throw new Error("User not authenticated.");
      }

      const newFavouriteStatus = !favourite;
      setFavourite(newFavouriteStatus);

      const response = await fetch(`/api/messages/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await authContext.user.getIdToken()}`,
        },
        body: JSON.stringify({ isFavourite: newFavouriteStatus }),
      });

      if (!response.ok) {
        setFavourite(!newFavouriteStatus);
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to update favourite status."
        );
      }

      console.log(
        `Note with ID ${id} favourite status updated to ${newFavouriteStatus}.`
      );
      onFavouriteChange(id, newFavouriteStatus);
    } catch (error: any) {
      console.error("Error updating favourite status:", error);
      alert(error.message);
    }
  };

  const canEditOrDelete = authContext.user && authContext.user.uid === authorId;

  const displayTimestamp = () => {
    if (updatedAt) {
      return `Edited: ${updatedAt}`;
    }
    return timestamp ?? "No timestamp available";
  };

  // Type assertion for ReactMarkdown component if TypeScript complains
  const MarkdownRenderer = ReactMarkdown as any;

  return (
    <Card className="border rounded-lg shadow-md p-4 relative">
      <div className="flex flex-col items-start">
        {/*
          Apply white-space: pre-wrap directly to the container holding ReactMarkdown output.
          This is the most robust way to force line breaks and preserve all whitespace,
          overriding any collapsing behavior from 'prose' or other CSS.
        */}
        <div
          className="prose dark:prose-invert max-w-none w-full"
          style={{ whiteSpace: "pre-wrap" }} // <--- ADD THIS LINE
        >
          <MarkdownRenderer
            remarkPlugins={[remarkGfm]}
            breaks={true}
            components={{
              //@ts-ignore
              p: ({ node, ...pProps }) => (
                <p
                  className="mb-0"
                  style={{ whiteSpace: "pre-wrap" }}
                  {...pProps}
                />
              ),
            }}
          >
            {message}
          </MarkdownRenderer>
        </div>

        <p className="text-xs mt-2 text-muted-foreground">
          {displayTimestamp()}
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
                <BookHeart
                  className={`h-4 w-4 mr-2 ${
                    favourite
                      ? "text-pink-300 fill-pink-300"
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
        initialMessage={message}
        isSaving={isSaving}
      />
    </Card>
  );
};

export default NoteCard;
