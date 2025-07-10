"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthContext";
import type { Note } from "@/app/types/note";
import { NoteToolbar } from "./note-toolbar";
import { NoteInputControls } from "./note-input-controls";
import { EmojiPickerPopup } from "./emoji-picker-popup";
import { AdvancedModeToggle } from "./advanced-toggle-mode";
import { AttachmentPreview } from "./attachement-preview";
import {
  createFilePreview,
  generateFileId,
  isImageFile,
  validateFile,
} from "@/lib/file-utils";
import { uploadMultipleFiles } from "@/lib/firebase-upload";

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
  const [attachments, setAttachments] = useState<AttachmentPreview[]>([]);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({
    completed: 0,
    total: 0,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const authContext = useAuth();
  const characterCount = message.length;
  const isOverLimit = characterCount > characterLimit;

  // --- End of Unconditional Hook Calls ---

  // Handle emoji picker click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
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
  if (!authContext.user && !authContext.loading) {
    return null;
  }

  if (authContext.loading) {
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

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const newAttachments: AttachmentPreview[] = [];

    for (const file of fileArray) {
      const validation = validateFile(file);
      if (!validation.valid) {
        alert(validation.error);
        continue;
      }

      const id = generateFileId();
      const attachment: AttachmentPreview = {
        id,
        file,
        type: isImageFile(file) ? "image" : "file",
      };

      // Create preview for images
      if (isImageFile(file)) {
        try {
          attachment.preview = await createFilePreview(file);
        } catch (error) {
          console.error("Failed to create preview:", error);
        }
      }

      newAttachments.push(attachment);
    }

    setAttachments((prev) => [...prev, ...newAttachments]);
  };

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItems = items.filter((item) => item.type.startsWith("image/"));

    if (imageItems.length > 0) {
      e.preventDefault();
      const files: File[] = [];

      for (const item of imageItems) {
        const file = item.getAsFile();
        if (file) {
          files.push(file);
        }
      }

      if (files.length > 0) {
        await processFiles(files);
      }
      return;
    }

    // Handle text paste
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
  };

  const handleSend = async () => {
    if (!authContext.user || !authContext.user.uid) {
      alert("You must be logged in to send a message.");
      return;
    }

    if (!isOverLimit && (message.trim() || attachments.length > 0)) {
      setIsSending(true);

      try {
        let uploadedAttachmentUrls: any[] = [];

        // Upload attachments if any
        if (attachments.length > 0) {
          setIsUploading(true);
          const filesToUpload = attachments.map((att) => att.file);
          uploadedAttachmentUrls = await uploadMultipleFiles(
            filesToUpload,
            authContext.user.uid,
            (completed, total) => {
              setUploadProgress({ completed, total });
            }
          );
          setIsUploading(false);
        }

        const idToken = await authContext.user.getIdToken();
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({
            message,
            attachments: uploadedAttachmentUrls,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to send the message");
        }

        const data = await response.json();
        console.log("Note created successfully with ID:", data.id);

        if (onNoteAdded) {
          const newNote: Note = {
            id: data.id,
            message: message,
            authorId: authContext.user.uid,
            timestamp: new Date().toISOString(),
            isFavourite: false,
            updatedAt: undefined,
            attachements: uploadedAttachmentUrls,
          };
          onNoteAdded(newNote);
        }

        setMessage("");
        setAttachments([]);
        setUploadProgress({ completed: 0, total: 0 });
      } catch (error: any) {
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
          errorMessage = (error as any).error;
        }
        alert(errorMessage);
      } finally {
        setIsSending(false);
        setIsUploading(false);
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
  };

  // Drag and Drop Handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
  };

  const handleTriggerAttachmentInput = () => {
    fileInputRef.current?.click();
  };

  // Calculate disabled state for the send button
  const isSendButtonDisabled =
    isOverLimit ||
    (!message.trim() && attachments.length === 0) ||
    isSending ||
    isUploading ||
    !authContext.user;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow",
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDraggingOver && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
          <p className="text-primary font-medium">Drop files here to attach</p>
        </div>
      )}

      {showLimitWarning && (
        <Alert variant="destructive" className="mb-2 py-2">
          <AlertDescription>
            Text exceeds the {characterLimit} character limit
          </AlertDescription>
        </Alert>
      )}

      {isUploading && (
        <Alert className="mb-2 py-2">
          <AlertDescription>
            Uploading files... ({uploadProgress.completed}/
            {uploadProgress.total})
          </AlertDescription>
        </Alert>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* NoteToolbar Component */}
      {isAdvancedMode && (
        <NoteToolbar
          onFormatText={formatText}
          onToggleEmojiPicker={() => setShowEmojiPicker((prev) => !prev)}
          onTriggerAttachmentInput={handleTriggerAttachmentInput}
          isAttachmentDisabled={isUploading || isSending}
          emojiButtonRef={emojiButtonRef}
        />
      )}

      <div className="flex flex-col">
        <div className="relative">
          {/* NoteInputControls Component */}
          <NoteInputControls
            message={message}
            characterLimit={characterLimit}
            placeholder={placeholder}
            isOverLimit={isOverLimit}
            isSending={isSending}
            isUploading={isUploading}
            attachments={attachments}
            onMessageChange={handleMessageChange}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            onSend={handleSend}
            onRemoveAttachment={handleRemoveAttachment}
            isSendButtonDisabled={isSendButtonDisabled}
            textareaRef={textareaRef}
            isDraggingOver={isDraggingOver}
          />

          {/* EmojiPickerPopup Component */}
          {showEmojiPicker && (
            <EmojiPickerPopup
              onEmojiSelect={handleEmojiClick}
              emojiButtonRef={emojiButtonRef}
              emojiPickerRef={emojiPickerRef}
              onClose={() => setShowEmojiPicker(false)}
            />
          )}
        </div>

        {/* AdvancedModeToggle Component */}
        <AdvancedModeToggle
          isAdvancedMode={isAdvancedMode}
          onToggleAdvancedMode={setIsAdvancedMode}
        />
      </div>
    </div>
  );
}
