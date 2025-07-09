// src/components/NoteBox.tsx
"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import {
  PlaneIcon as PaperPlaneIcon,
  SmileIcon,
  PaperclipIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListIcon,
  LinkIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useAuth } from "../context/AuthContext";
import { Note } from "../types/note"; // Assuming Note type includes updatedAt?: string; and isFavourite: boolean;

// EMOJI PICKER IMPORTS
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
// END EMOJI PICKER IMPORTS

interface NoteBoxProps {
  placeholder?: string;
  characterLimit?: number;
  className?: string;
  onNoteAdded?: (note: Note) => void;
}

export function NoteBox({
  placeholder = "Type your message...",
  characterLimit = 500,
  className,
  onNoteAdded,
}: NoteBoxProps) {
  // --- ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP LEVEL ---
  const [message, setMessage] = useState("");
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null); // Ref to the emoji button
  const authContext = useAuth(); // Auth context hook

  const characterCount = message.length;
  const isOverLimit = characterCount > characterLimit;

  // --- End of Unconditional Hook Calls ---

  // Handle emoji picker click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside picker AND not on the emoji button
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  // Handle character limit warning auto-hide
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showLimitWarning) {
      timeout = setTimeout(() => {
        setShowLimitWarning(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [showLimitWarning]);

  // --- CONDITIONAL RENDERING OR LOGIC STARTS HERE (AFTER ALL HOOKS) ---
  // If user is not authenticated and auth state is loaded, simply don't render the NoteBox
  if (!authContext.user && !authContext.loading) {
    return null;
  }
  // If auth is still loading, you might want a placeholder or disabled state,
  // but returning null also works if the parent handles this.
  if (authContext.loading) {
    // You could return a skeleton loader here or simply null
    return null;
  }
  // --- END CONDITIONAL RENDERING ---

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);

    if (newValue.length > characterLimit) {
      setShowLimitWarning(true);
    } else {
      setShowLimitWarning(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pastedText = e.clipboardData.getData("text");
    if (message.length + pastedText.length > characterLimit) {
      e.preventDefault();
      setShowLimitWarning(true);

      if (characterLimit - message.length > 0) {
        const availableSpace = characterLimit - message.length;
        const truncatedPaste = pastedText.substring(0, availableSpace);
        setMessage((prev) => prev + truncatedPaste);
      }
    }
  };

  const handleSend = async () => {
    // These checks ensure authContext.user is valid before proceeding
    if (!authContext.user || !authContext.user.uid) {
      // Ensure uid is also present
      alert("You must be logged in to send a message.");
      return;
    }

    if (!isOverLimit && message.trim()) {
      setIsSending(true);
      try {
        const idToken = await authContext.user.getIdToken();

        const response = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            message,
            attachements: [], // Ensure this is consistently spelled as 'attachments' in Firestore
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to send the message");
        }

        const data = await response.json();
        console.log("Note created successfully with ID:", data.id);

        if (onNoteAdded) {
          // No need to check authContext.user again here, already checked above
          const newNote: Note = {
            id: data.id,
            message: message,
            authorId: authContext.user.uid,
            timestamp: new Date().toISOString(), // This will be formatted by dayjs in NotesFeed
            isFavourite: false,
            updatedAt: undefined, // New notes don't have updatedAt yet
          };
          onNoteAdded(newNote);
        }

        setMessage("");
      } catch (error: any) {
        // Use 'any' only as a last resort, prefer unknown and narrowing
        console.error("Error sending message:", error);
        let errorMessage = "Failed to send message.";
        if (error instanceof Error) {
          errorMessage = error.message;
        } else if (
          typeof error === "object" &&
          error !== null &&
          "error" in error &&
          typeof (error as any).error === "string"
        ) {
          errorMessage = (error as any).error; // For API response errors
        }
        alert(errorMessage);
      } finally {
        setIsSending(false);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatText = (type: string) => {
    if (!textareaRef.current) return;

    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selectedText = message.substring(start, end);

    let formattedText = "";
    let newCursorPosition = end;

    switch (type) {
      case "bold":
        formattedText = `**${selectedText}**`;
        newCursorPosition = end + 4;
        break;
      case "italic":
        formattedText = `_${selectedText}_`;
        newCursorPosition = end + 2;
        break;

      case "list":
        formattedText = `\n- ${selectedText}`;
        newCursorPosition = end + 3;
        break;
      case "link":
        formattedText = `[${selectedText}](url)`;
        newCursorPosition = end + 7;
        break;
      default:
        return;
    }

    const newMessage =
      message.substring(0, start) + formattedText + message.substring(end);
    setMessage(newMessage);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          newCursorPosition,
          newCursorPosition
        );
      }
    }, 0);
  };

  const handleEmojiClick = (emojiObject: { native: string }) => {
    // Type emojiObject
    const emoji = emojiObject.native;
    const textarea = textareaRef.current;

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      setMessage(message.substring(0, start) + emoji + message.substring(end));
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setMessage((prevMessage) => prevMessage + emoji);
    }
    setShowEmojiPicker(false); // Close picker on selection
  };

  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow",
        className
      )}
    >
      {showLimitWarning && (
        <Alert variant="destructive" className="mb-2 py-2">
          <AlertDescription>
            Text exceeds the {characterLimit} character limit
          </AlertDescription>
        </Alert>
      )}

      {isAdvancedMode && (
        <div className="flex items-center gap-1 p-2 border-b">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => formatText("bold")}
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
                  onClick={() => formatText("italic")}
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
                  onClick={() => formatText("list")}
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
                  onClick={() => formatText("link")}
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
                  onClick={() => setShowEmojiPicker((prev) => !prev)}
                >
                  <SmileIcon className="h-4 w-4" />
                  <span className="sr-only">Emoji</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Emoji</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <PaperclipIcon className="h-4 w-4" />
                  <span className="sr-only">Attach</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Attach file</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      <div className="flex flex-col">
        <div className="relative">
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

          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute z-10 bg-card border rounded-lg shadow-lg"
              style={{
                bottom: "100%",
                right: 0,
                width: "300px",
                height: "350px",
                overflow: "hidden",
              }}
            >
              <Picker
                data={data}
                onEmojiSelect={handleEmojiClick}
                theme="dark"
                previewPosition="none"
                navPosition="top"
                perLine={9}
              />
            </div>
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
            <Button
              size="sm"
              onClick={handleSend}
              disabled={
                isOverLimit || !message.trim() || isSending || !authContext.user
              }
            >
              {isSending ? (
                "Sending..."
              ) : (
                <div className="flex flex-row gap-1 items-center">
                  <span>Send</span> <PaperPlaneIcon className="h-4 w-4" />
                </div>
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between px-3 py-2 border-t">
          <div className="flex items-center space-x-2">
            <Switch
              id="advanced-mode"
              checked={isAdvancedMode}
              onCheckedChange={setIsAdvancedMode}
            />
            <Label htmlFor="advanced-mode" className="text-sm cursor-pointer">
              Advanced mode
            </Label>
          </div>
        </div>
      </div>
    </div>
  );
}
