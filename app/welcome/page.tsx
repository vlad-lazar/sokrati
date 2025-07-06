// src/app/welcome/page.tsx
"use client"; // This component needs to be a client component because it uses hooks and client components

import { NoteBox } from "../components/note-box";
import NotesFeed from "../components/notes-feed"; // Changed from MessageFeed
import ProtectedRoute from "../components/protected-route";
import { ModeToggle } from "../components/theme-switcher";
import UserAvatar from "../components/userAvatar";
import WelcomeCard from "../components/welcome-card";
import { useCallback } from "react"; // Import useCallback
import { Note } from "../types/note"; // Import Note type

export default function WelcomePage() {
  // This callback will be passed to NoteBox
  // In a real-time system with onSnapshot in NotesFeed, this callback
  // can primarily be used for logging or other side effects in the parent.
  // The NotesFeed will update automatically via its onSnapshot listener.
  const handleNoteAdded = useCallback((newNote: Note) => {
    // This function will be called by NoteBox after a successful note creation.
    // Since NotesFeed uses onSnapshot, the new note will appear automatically in the feed.
    // You could add a toast notification here if you want immediate user feedback, e.g.:
    // toast.success("Note added successfully!");
    console.log(
      "Note added from NoteBox, onSnapshot will update NotesFeed:",
      newNote
    );
  }, []);

  return (
    <ProtectedRoute>
      <div className="w-full">
        <div className="w-full items-center justify-center">
          <div className="flex justify-end w-full p-3 gap-3">
            <ModeToggle /> <UserAvatar />
          </div>
          <div className="flex w-full flex-col gap-15 items-center justify-center">
            <WelcomeCard />
            <NoteBox
              className="w-xl"
              characterLimit={200}
              placeholder="What are you philosophising today?"
              onNoteAdded={handleNoteAdded} // Pass the callback to NoteBox
            />
            <div className="flex w-xl flex-col gap-5 items-center justify-center mt-5">
              <NotesFeed onAddNote={handleNoteAdded} />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
