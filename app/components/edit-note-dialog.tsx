"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

interface EditNoteDialogProps {
  isOpen: boolean; // Whether the dialog is open
  onClose: () => void; // Function to close the dialog
  onSave: (updatedMessage: string) => void; // Function to handle saving the updated note
  initialMessage: string; // The current message of the note
  isSaving: boolean; // Whether the save operation is in progress
}

const EditNoteDialog: React.FC<EditNoteDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  initialMessage,
  isSaving,
}) => {
  const [message, setMessage] = useState(initialMessage);

  const handleSave = () => {
    onSave(message); // Pass the updated message to the parent
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Edit your note..."
            className="min-h-[100px] resize-none"
          />
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={isSaving} // Disable cancel button while saving
          >
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={handleSave}
            disabled={isSaving || !message.trim()} // Disable save button if empty or saving
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditNoteDialog;
