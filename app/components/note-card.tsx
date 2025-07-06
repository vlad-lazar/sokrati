import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Note } from "../types/note";
import dayjs from "dayjs";
import { MoreHorizontal, Pencil, Trash, BookHeart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DeleteNoteDialog from "./delete-note-dialog";
import { useAuth } from "../context/AuthContext";

interface NoteCardProps extends Note {
  onDeleteSuccess: (noteId: string) => void; // Callback after successful deletion
}

const NoteCard = (props: NoteCardProps) => {
  const { id, message, timestamp, authorId, onDeleteSuccess } = props;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  // Only show delete option if the logged-in user is the author
  const canDelete = authContext.user && authContext.user.uid === authorId;

  return (
    <Card className="border rounded-lg shadow-md p-4 relative">
      <div className="flex flex-col items-start">
        {/* Note message */}
        <p className="text-lg">{message}</p>

        {/* Timestamp */}
        <p className="text-sm mt-2 text-muted-foreground">
          {timestamp
            ? dayjs(timestamp).format("MMMM D, YYYY h:mm A")
            : "No timestamp available"}
        </p>
      </div>

      {/* Dropdown menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted">
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => console.log("Edit note:", id)}>
            <Pencil className="h-4 w-4 mr-2" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => console.log("Favorite note:", id)}>
            <BookHeart className="h-4 w-4 mr-2" />
            <span>Favorite</span>
          </DropdownMenuItem>
          {canDelete && ( // Fixed conditional rendering for delete option
            <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash className="h-4 w-4 mr-2 text-red-400" />
              <span className="text-red-400">Delete</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Note Dialog */}
      <DeleteNoteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        noteMessage={message} // Pass the note's message for context
        isDeleting={isDeleting} // Pass isDeleting to show loading state
      />
    </Card>
  );
};

export default NoteCard;
