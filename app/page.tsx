// src/app/welcome/page.tsx
"use client"; // This component needs to be a client component because it uses hooks and client components

import { useState, useCallback } from "react"; // Import useState for the key
import { NoteBox } from "./components/note-box";
import NotesFeed from "./components/notes-feed";
import ProtectedRoute from "./components/protected-route";
import { ModeToggle } from "./components/theme-switcher";
import UserAvatar from "./components/userAvatar";
import WelcomeCard from "./components/welcome-card";
import { Note } from "./types/note";

export default function WelcomePage() {
  // State to force NotesFeed to re-fetch/re-mount
  const [notesFeedKey, setNotesFeedKey] = useState(0);

  // This callback is triggered by NoteBox after a successful note creation.
  // It increments notesFeedKey, which forces NotesFeed to re-render and re-fetch its data.
  const handleNoteAdded = useCallback((newNote: Note) => {
    console.log(
      "Note added successfully. Triggering NotesFeed re-fetch:",
      newNote
    );
    setNotesFeedKey((prevKey) => prevKey + 1); // Increment key to force NotesFeed re-render/re-fetch
  }, []); // Empty dependency array means this function reference is stable

  return (
    <ProtectedRoute>
      <div className="w-full">
        <div className="w-full items-center justify-center">
          <div className="flex justify-end w-full p-5 gap-3">
            <ModeToggle /> <UserAvatar />
          </div>
          <div className="flex w-full flex-col gap-15 items-center justify-center p-3">
            <WelcomeCard />
            <div className="w-full max-w-screen-md mx-auto">
              <NoteBox
                className="w-full"
                characterLimit={200}
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
    </ProtectedRoute>
  );
}
