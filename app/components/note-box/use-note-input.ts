// components/note-box/use-note-input.ts
import { useState, useRef, useEffect, useCallback } from "react";

interface UseNoteInputProps {
  characterLimit: number;
  onPasteFiles: (e: React.ClipboardEvent) => Promise<void>;
}

export function useNoteInput({
  characterLimit,
  onPasteFiles,
}: UseNoteInputProps) {
  const [message, setMessage] = useState("");
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const characterCount = message.length;
  const isOverLimit = characterCount > characterLimit;

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showLimitWarning) {
      timeout = setTimeout(() => {
        setShowLimitWarning(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [showLimitWarning]);

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    if (newValue.length > characterLimit) {
      setShowLimitWarning(true);
    } else {
      setShowLimitWarning(false);
    }
  };

  const handlePaste = useCallback(
    async (e: React.ClipboardEvent) => {
      // First, let the attachment handler try to process image pastes
      await onPasteFiles(e);

      // If no image was pasted, handle text paste
      if (!e.defaultPrevented) {
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
      }
    },
    [message, characterLimit, onPasteFiles]
  );

  const formatText = useCallback(
    (type: string) => {
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
    },
    [message]
  );

  const handleEmojiInsert = (emoji: { native: string }) => {
    const emojiChar = emoji.native; // Extract the native emoji character
    const textarea = textareaRef.current;

    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert the emoji at the cursor position
      const newMessage =
        message.substring(0, start) + emojiChar + message.substring(end);

      setMessage(newMessage);

      // Move the cursor after the inserted emoji
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + emojiChar.length,
          start + emojiChar.length
        );
      }, 0);
    } else {
      // Fallback: Append the emoji to the message
      setMessage((prevMessage) => prevMessage + emojiChar);
    }
  };
  return {
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
  };
}
