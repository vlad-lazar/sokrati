// components/note-box/NoteBox.tsx (Relevant sections only)
"use client";

import type React from "react";
import { useState, Suspense } from "react"; // Removed useEffect as it's now in hooks
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useAuth } from "@/app/context/AuthContext";
import type { Note } from "@/app/types/note";

// Import core components
import { NoteInputControls } from "./note-input-controls";
import { AdvancedModeToggle } from "./advanced-toggle-mode";
import { NoteToolbar } from "./note-toolbar"; // Re-imported directly now that lazy loading is removed
import { EmojiPickerPopup } from "./emoji-picker-popup"; // Re-imported directly

// Import custom hooks
import { useNoteInput } from "./use-note-input";
import { useEmojiLogic } from "./use-emoji-logic";
import { useNoteSending } from "./use-note-sending";
import { useNoteAttachments } from "./use-note-attachements";

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
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  // Use custom hooks
  const {
    attachments,
    setAttachments,
    isDraggingOver,
    fileInputRef,
    handleFileSelect,
    handleRemoveAttachment,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleTriggerAttachmentInput,
    handlePaste: handlePasteForAttachments,
    currentTotalAttachmentSize, // New: Get current total size
    MAX_ATTACHMENT_SIZE_BYTES, // New: Get max bytes
    MAX_ATTACHMENT_SIZE_MB, // New: Get max MB
  } = useNoteAttachments();

  const {
    message,
    setMessage,
    characterCount,
    isOverLimit,
    showLimitWarning,
    textareaRef,
    handleMessageChange,
    handlePaste,
    formatText,
    handleEmojiInsert,
  } = useNoteInput({
    characterLimit,
    onPasteFiles: handlePasteForAttachments,
  });

  const {
    showEmojiPicker,
    setShowEmojiPicker,
    emojiButtonRef,
    emojiPickerRef,
    toggleEmojiPicker,
  } = useEmojiLogic();

  const handleClearNote = () => {
    setMessage("");
    setAttachments([]);
  };

  const { isSending, isUploading, uploadProgress, handleSend, handleKeyDown } =
    useNoteSending({
      message,
      attachments,
      onNoteAdded,
      onClear: handleClearNote,
    });

  const authContext = useAuth();

  // Calculate disabled state for the send button
  const isSendButtonDisabled =
    isOverLimit ||
    (!message.trim() && attachments.length === 0) ||
    isSending ||
    isUploading ||
    !authContext.user;

  // New: Check if attachment input should be disabled due to size limit
  const isAttachmentInputDisabled =
    currentTotalAttachmentSize >= MAX_ATTACHMENT_SIZE_BYTES;

  // --- CONDITIONAL RENDERING OR LOGIC STARTS HERE (AFTER ALL HOOKS) ---
  if (!authContext.user && !authContext.loading) {
    return null;
  }

  if (authContext.loading) {
    return null;
  }

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
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/10">
          <p className="font-medium text-primary">Drop files here to attach</p>
        </div>
      )}

      {showLimitWarning && (
        <Alert variant="destructive" className="mb-2 py-2">
          <AlertDescription>
            Text exceeds the {characterLimit} character limit
          </AlertDescription>
        </Alert>
      )}

      {/* New: Warning for attachment size limit */}
      {currentTotalAttachmentSize > 0 &&
        currentTotalAttachmentSize >= MAX_ATTACHMENT_SIZE_BYTES * 0.9 && ( // Show warning at 90%
          <Alert
            variant={
              currentTotalAttachmentSize >= MAX_ATTACHMENT_SIZE_BYTES
                ? "destructive"
                : "default"
            }
            className="mb-2 py-2"
          >
            <AlertDescription>
              Attachment size:{" "}
              {(currentTotalAttachmentSize / (1024 * 1024)).toFixed(2)}MB /{" "}
              {MAX_ATTACHMENT_SIZE_MB}MB
              {currentTotalAttachmentSize >= MAX_ATTACHMENT_SIZE_BYTES &&
                " (Maximum reached)"}
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
        disabled={isAttachmentInputDisabled} // Disable if max size reached
      />

      {/* NoteToolbar Component */}
      {isAdvancedMode && (
        <NoteToolbar
          onFormatText={formatText}
          onToggleEmojiPicker={toggleEmojiPicker}
          onTriggerAttachmentInput={handleTriggerAttachmentInput}
          isAttachmentDisabled={
            isUploading || isSending || isAttachmentInputDisabled
          } // Pass disabled state
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
            // You might also want to pass isAttachmentInputDisabled to NoteInputControls
            // if it has an internal attachment button that needs disabling.
          />

          {/* EmojiPickerPopup Component */}
          {showEmojiPicker && (
            <EmojiPickerPopup
              onEmojiSelect={handleEmojiInsert}
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
