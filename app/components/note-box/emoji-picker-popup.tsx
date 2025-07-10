// src/components/note-box/EmojiPickerPopup.tsx
"use client";

import * as React from "react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

interface EmojiPickerPopupProps {
  onEmojiSelect: (emoji: { native: string }) => void;
  emojiButtonRef: React.RefObject<HTMLButtonElement | null>; // Ref for the trigger button
  emojiPickerRef: React.RefObject<HTMLDivElement | null>; // Ref for the picker container itself
  onClose: () => void; // Callback to close the picker
}

export function EmojiPickerPopup({
  onEmojiSelect,
  emojiButtonRef,
  emojiPickerRef,
  onClose,
}: EmojiPickerPopupProps) {
  const { theme } = useTheme();
  // Close emoji picker when clicking outside, but not when clicking the emoji button itself
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        onClose(); // Call parent's close handler
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose, emojiButtonRef, emojiPickerRef]); // Dependencies for useEffect

  return (
    <div
      ref={emojiPickerRef}
      className={cn("absolute z-10 bg-card border rounded-lg shadow-lg")}
    >
      <Picker
        data={data}
        onEmojiSelect={onEmojiSelect}
        theme={theme}
        previewPosition="none"
        navPosition="top"
        perLine={9}
      />
    </div>
  );
}
