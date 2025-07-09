// src/components/AboutDrawer.tsx
"use client";

import * as React from "react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AboutDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 cursor-pointer">
          <InfoIcon className="h-5 w-5" />
          <span className="sr-only">About App</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full flex flex-col justify-center items-center text-center">
          <DrawerHeader>
            <DrawerTitle className="text-xl font-bold">About us</DrawerTitle>
          </DrawerHeader>
          <div className="flex-1 overflow-y-auto px-4 sm:px-20 pb-8">
            <p className="mb-4 text-sm text-muted-foreground">
              Sokrati is designed to be your personal space for deep thought and
              self-discovery. Capture your ideas, draw inspiration from timeless
              quotes, and in the future, gain unique AI-powered insights into
              your mood and writing patterns with the power of AI.
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              It's a journey to understand yourself better.
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              <strong>Future Vision:</strong> AI will analyze your notes,
              understand your emotional tone, and even suggest insights that
              help you grow and find what truly resonates with you.
            </p>
            <div className="flex flex-col justify-center items-center w-full">
              <span className="font-bold">Fǎcut în Moldova</span>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/EuroMoldova.svg/640px-EuroMoldova.svg.png"
                alt="Sokrati Logo"
                className="flex h-10 w-10 mx-auto"
              />
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Version 1.0.0 (Alpha)
            </p>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="mb-10">
                Close
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
