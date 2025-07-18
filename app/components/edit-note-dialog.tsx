import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface EditNoteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMessage: string) => void;
  initialMessage: string;
  isSaving: boolean;
}

export default function EditNoteDialog({
  isOpen,
  onClose,
  onSave,
  initialMessage,
  isSaving,
}: EditNoteDialogProps) {
  const [message, setMessage] = useState(initialMessage);

  useEffect(() => {
    if (isOpen) {
      setMessage(initialMessage);
    }
  }, [isOpen, initialMessage]);

  const handleSave = () => {
    if (message.trim() && !isSaving) {
      onSave(message.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Note</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <div className="grid gap-4 py-4">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  // Enter submits the form, Shift+Enter creates new line
                  e.preventDefault();
                  handleSave();
                }
              }}
              placeholder="Edit your note..."
              className="min-h-[100px] resize-none"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              disabled={isSaving || !message.trim()}
            >
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
