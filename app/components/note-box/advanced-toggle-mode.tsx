// src/components/note-box/AdvancedModeToggle.tsx
"use client";

import * as React from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AdvancedModeToggleProps {
  isAdvancedMode: boolean;
  onToggleAdvancedMode: (checked: boolean) => void;
}

export function AdvancedModeToggle({
  isAdvancedMode,
  onToggleAdvancedMode,
}: AdvancedModeToggleProps) {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-t">
      <div className="flex items-center space-x-2">
        <Switch
          id="advanced-mode"
          checked={isAdvancedMode}
          onCheckedChange={onToggleAdvancedMode}
        />
        <Label htmlFor="advanced-mode" className="text-sm cursor-pointer">
          Advanced mode
        </Label>
      </div>
    </div>
  );
}
