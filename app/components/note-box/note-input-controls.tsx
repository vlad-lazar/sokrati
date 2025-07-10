"use client";

import type * as React from "react";
import { PlaneIcon as PaperPlaneIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  AttachmentPreview,
  AttachmentPreviewType,
} from "./attachement-preview";

interface NoteInputControlsProps {
  message: string;
  characterLimit: number;
  placeholder?: string;
  isOverLimit: boolean;
  isSending: boolean;
  isUploading?: boolean;
  attachments?: AttachmentPreviewType[];
  onMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void;
  onRemoveAttachment?: (id: string) => void;
  isSendButtonDisabled: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  isDraggingOver?: boolean;
}

export function NoteInputControls({
  message = "",
  characterLimit = 500,
  placeholder = "Type your message...",
  isOverLimit = false,
  isSending = false,
  isUploading = false,
  attachments = [],
  onMessageChange,
  onPaste,
  onKeyDown,
  onSend,
  onRemoveAttachment,
  isSendButtonDisabled = false,
  textareaRef,
  isDraggingOver = false,
}: NoteInputControlsProps) {
  const characterCount = message?.length || 0;

  // Provide default handlers if not provided
  const handleMessageChange = onMessageChange || (() => {});
  const handlePaste = onPaste || (() => {});
  const handleKeyDown = onKeyDown || (() => {});
  const handleSend = onSend || (() => {});
  const handleRemoveAttachment = onRemoveAttachment || (() => {});

  return (
    <div className="relative">
      <div
        className={cn(
          "relative",
          isDraggingOver && "ring-2 ring-primary ring-offset-2 rounded-lg"
        )}
      >
        <Textarea
          ref={textareaRef}
          value={message}
          onChange={handleMessageChange}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(
            "min-h-[100px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
            isOverLimit && "border-red-500"
          )}
        />

        {isDraggingOver && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
            <p className="text-primary font-medium">
              Drop files here to attach
            </p>
          </div>
        )}
      </div>

      {/* Attachment Previews */}
      {attachments && attachments.length > 0 && (
        <AttachmentPreview
          attachments={attachments}
          onRemove={handleRemoveAttachment}
        />
      )}

      <div className="absolute bottom-2 right-2 flex items-center gap-2">
        <span
          className={cn(
            "text-xs",
            isOverLimit ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {characterCount}/{characterLimit}
        </span>
        <Button size="sm" onClick={handleSend} disabled={isSendButtonDisabled}>
          {isSending || isUploading ? (
            <div className="flex items-center gap-1">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{isSending ? "Sending..." : "Uploading..."}</span>
            </div>
          ) : (
            <div className="flex flex-row gap-1 items-center">
              <span>Send</span>
              <PaperPlaneIcon className="h-4 w-4" />
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
