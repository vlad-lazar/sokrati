// src/components/note-box/NoteInputControls.tsx
"use client";

import * as React from "react";
import { PlaneIcon as PaperPlaneIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface NoteInputControlsProps {
  message: string;
  characterLimit: number;
  placeholder?: string;
  isOverLimit: boolean;
  isSending: boolean;
  onMessageChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSend: () => void; // Callback to send message
  isSendButtonDisabled: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  // Props for attachments will be added here later (attachments, handleRemoveAttachment, isUploading)
}

export function NoteInputControls({
  message,
  characterLimit,
  placeholder,
  isOverLimit,
  isSending,
  onMessageChange,
  onPaste,
  onKeyDown,
  onSend,
  isSendButtonDisabled,
  textareaRef,
}: NoteInputControlsProps) {
  const characterCount = message.length;

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={message}
        onChange={onMessageChange}
        onPaste={onPaste}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={cn(
          "min-h-[100px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
          isOverLimit && "border-red-500"
        )}
      />

      {/* Attachment Previews will go here later */}

      <div className="absolute bottom-2 right-2 flex items-center gap-2">
        <span
          className={cn(
            "text-xs",
            isOverLimit ? "text-destructive" : "text-muted-foreground"
          )}
        >
          {characterCount}/{characterLimit}
        </span>
        <Button size="sm" onClick={onSend} disabled={isSendButtonDisabled}>
          {isSending /* or isUploading later */ ? (
            <div className="flex items-center gap-1">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{isSending ? "Sending..." : "Uploading..."}</span>
            </div>
          ) : (
            <div className="flex flex-row gap-1 items-center">
              <span>Send</span> <PaperPlaneIcon className="h-4 w-4" />
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
