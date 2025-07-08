import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Note } from "../types/note";
import { MoreHorizontal, Pencil, Trash, BookHeart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteNoteDialog from "./delete-note-dialog";
import EditNoteDialog from "./edit-note-dialog";
import { useAuth } from "../context/AuthContext";

interface NoteCardProps extends Note {
  onDeleteSuccess: (noteId: string) => void;
  onEditSuccess: (noteId: string, updatedMessage: string) => void;
}

const NoteCard = (props: NoteCardProps) => {
  const {
    id,
    message,
    timestamp,
    updatedAt,
    authorId,
    onDeleteSuccess,
    onEditSuccess,
  } = props;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
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
      setIsDeleteDialogOpen(false); // Close the dialog
      onDeleteSuccess(id); // Notify parent component to update the UI
    } catch (error: any) {
      console.error("Error deleting note:", error);
      alert(error.message); // Display the specific error
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

      const response = await fetch(`/api/messages/${id}`, {
        method: "PATCH", // Use PATCH for updating the note
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

      console.log(`Note with ID ${id} updated successfully.`);
      setIsEditDialogOpen(false); // Close the edit dialog
      onEditSuccess(id, updatedMessage); // Notify parent component to update the UI
    } catch (error: any) {
      console.error("Error updating note:", error);
      alert(error.message); // Display the specific error
    } finally {
      setIsSaving(false);
    }
  };

  // Only show delete and edit options if the logged-in user is the author
  const canEditOrDelete = authContext.user && authContext.user.uid === authorId;

  return (
    <Card className="border rounded-lg shadow-md p-4 relative">
      <div className="flex flex-col items-start">
        {updatedAt && (
          <p className="text-xs text-muted-foreground italic">Edited</p>
        )}
        <p className="text-sm">{message}</p>
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
              <DropdownMenuItem
                onClick={() => console.log("Favorite note:", id)}
              >
                <BookHeart className="h-4 w-4 mr-2" />
                <span>Favorite</span>
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
