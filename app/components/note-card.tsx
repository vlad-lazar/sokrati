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

const NoteCard = (note: Note) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const authContext = useAuth();
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/messages/${note.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${await authContext.user?.getIdToken()}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete the note.");
      }

      console.log(`Note with ID ${note.id} deleted successfully.`);
      setIsDeleteDialogOpen(false);
      // Optionally, trigger a parent callback to remove the note from the UI
    } catch (error: any) {
      console.error("Error deleting note:", error);
      alert(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="border rounded-lg shadow-md p-4 relative">
      <div className="flex flex-col items-start">
        <p className="text-sm">{note.message}</p>

        <p className="text-xs mt-2 text-muted-foreground">
          {note.timestamp
            ? dayjs(note.timestamp).format("MMMM D, YYYY h:mm A")
            : "No timestamp available"}
        </p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted">
            <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => console.log("Edit note:", note.id)}>
            <Pencil className="h-4 w-4 mr-2" />
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => console.log("Favorite note:", note.id)}
          >
            <BookHeart className="h-4 w-4 mr-2" />
            <span>Favorite</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash className="h-4 w-4 mr-2 text-red-400" />
            <span className="text-red-400">Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DeleteNoteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        noteMessage={note.message}
      />
    </Card>
  );
};

export default NoteCard;
