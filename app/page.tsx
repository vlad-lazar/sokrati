"use client";

import { useState, useCallback } from "react";
import { NoteBox } from "./components/note-box/note-box";
import NotesFeed from "./components/notes-feed";
import ProtectedRoute from "./components/protected-route";
import { ModeToggle } from "./components/theme-switcher";
import UserAvatar from "./components/userAvatar";
import WelcomeCard from "./components/welcome-card";
import { Note } from "./types/note";
import AboutDrawer from "./components/about-drawer";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function WelcomePage() {
  // State to force NotesFeed to re-fetch/re-mount
  const [notesFeedKey, setNotesFeedKey] = useState(0);

  // State to manage the AboutDrawer visibility
  const [isAboutDrawerOpen, setIsAboutDrawerOpen] = useState(false);

  // This callback is triggered by NoteBox after a successful note creation.
  const handleNoteAdded = useCallback((newNote: Note) => {
    console.log(
      "Note added successfully. Triggering NotesFeed re-fetch:",
      newNote
    );
    setNotesFeedKey((prevKey) => prevKey + 1); // Increment key to force NotesFeed re-render/re-fetch
  }, []);

  return (
    <ProtectedRoute>
      <TooltipProvider>
        <div className="w-full">
          <div className="w-full items-center justify-center">
            <div className="flex justify-end w-full p-5 gap-3">
              {/* Pass state and handlers to AboutDrawer */}
              <AboutDrawer />
              <ModeToggle />
              <UserAvatar />
            </div>
            <div className="flex w-full flex-col gap-15 items-center justify-center p-3">
              <WelcomeCard />
              <div className="w-full max-w-screen-md mx-auto">
                <NoteBox
                  className="w-full"
                  characterLimit={500}
                  placeholder="What are you philosophising today?"
                  onNoteAdded={handleNoteAdded}
                />
                <div className="w-full items-center justify-center mt-5 mb-25">
                  <NotesFeed key={notesFeedKey} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </TooltipProvider>
    </ProtectedRoute>
  );
}
