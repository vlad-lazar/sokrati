"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  noteMessage?: string;
}
const DeleteNoteDialog: React.FC<DeleteNoteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  noteMessage,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>Delete Note</DialogTitle>
        </DialogHeader>
        <div className="text-sm space-y-2">
          <p>
            Are you sure you want to delete this note? This action cannot be
            undone.
          </p>
        </div>
        <DialogFooter>
          <Button
            variant="secondary"
            onClick={onClose}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            className="cursor-pointer"
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteNoteDialog;
