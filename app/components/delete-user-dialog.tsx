"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteAccountDialogProps {
  isOpen: boolean; // Whether the dialog is open
  onClose: () => void; // Function to close the dialog
  onConfirm: () => void; // Function to call when the user confirms deletion
}

const DeleteAccountDialog: React.FC<DeleteAccountDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="backdrop-blur-md">
        <DialogHeader>
          <DialogTitle>Delete Account</DialogTitle>
        </DialogHeader>
        <p className="text-sm ">
          Are you sure you want to delete your account? This action cannot be
          undone.
        </p>
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

export default DeleteAccountDialog;
