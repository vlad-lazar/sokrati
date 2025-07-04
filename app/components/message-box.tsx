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

interface MessageBoxProps {
  onSend: (message: string) => void;
  placeholder?: string;
  characterLimit?: number;
  className?: string;
}

export function MessageBox({
  onSend,
  placeholder = "Type your message...",
  characterLimit = 500,
  className,
}: MessageBoxProps) {
  const [message, setMessage] = useState("");
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const characterCount = message.length;
  const isOverLimit = characterCount > characterLimit;

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

      // If there's room for a truncated version, paste that instead
      if (characterLimit - message.length > 0) {
        const availableSpace = characterLimit - message.length;
        const truncatedPaste = pastedText.substring(0, availableSpace);
        setMessage((prev) => prev + truncatedPaste);
      }
    }
  };

  const handleSend = () => {
    if (!isOverLimit && message.trim()) {
      onSend(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-hide the warning after 3 seconds
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (showLimitWarning) {
      timeout = setTimeout(() => {
        setShowLimitWarning(false);
      }, 3000);
    }
    return () => clearTimeout(timeout);
  }, [showLimitWarning]);

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
      case "underline":
        formattedText = `__${selectedText}__`;
        newCursorPosition = end + 4;
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

    // Set cursor position after the formatting is applied
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
                  onClick={() => formatText("underline")}
                >
                  <UnderlineIcon className="h-4 w-4" />
                  <span className="sr-only">Underline</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Underline</TooltipContent>
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
                <Button variant="ghost" size="icon">
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
              disabled={isOverLimit || !message.trim()}
            >
              <PaperPlaneIcon className="h-4 w-4 mr-2" />
              Send
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
