// src/components/note-box/NoteToolbar.tsx
"use client";

import * as React from "react";
import {
  BoldIcon,
  ItalicIcon,
  ListIcon,
  LinkIcon,
  SmileIcon,
  PaperclipIcon, // Keep PaperclipIcon for future media upload integration
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NoteToolbarProps {
  onFormatText: (type: string) => void;
  onToggleEmojiPicker: () => void;
  emojiButtonRef: React.RefObject<HTMLButtonElement | null>;
  onTriggerAttachmentInput: () => void; // Placeholder for future media upload
  isAttachmentDisabled: boolean; // Placeholder for future media upload
}

export function NoteToolbar({
  onFormatText,
  onToggleEmojiPicker,
  emojiButtonRef,
  onTriggerAttachmentInput,
  isAttachmentDisabled,
}: NoteToolbarProps) {
  return (
    <div className="flex items-center gap-1 p-2 border-b">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFormatText("bold")}
            >
              <BoldIcon className="h-4 w-4" />
              <span className="sr-only">Bold</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Bold</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFormatText("italic")}
            >
              <ItalicIcon className="h-4 w-4" />
              <span className="sr-only">Italic</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Italic</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFormatText("list")}
            >
              <ListIcon className="h-4 w-4" />
              <span className="sr-only">List</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>List</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onFormatText("link")}
            >
              <LinkIcon className="h-4 w-4" />
              <span className="sr-only">Link</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Link</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="h-4 w-px bg-border mx-1" />

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              ref={emojiButtonRef}
              variant="ghost"
              size="icon"
              onClick={onToggleEmojiPicker}
            >
              <SmileIcon className="h-4 w-4" />
              <span className="sr-only">Emoji</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Emoji</TooltipContent>
        </Tooltip>

        {/* Attach File Button (placeholder for future media upload) */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={onTriggerAttachmentInput} // No-op for now
              disabled={isAttachmentDisabled} // Always false for now
            >
              <PaperclipIcon className="h-4 w-4" />
              <span className="sr-only">Attach</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Attach file</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
