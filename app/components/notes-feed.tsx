// src/components/NotesFeed.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import NoteCard from "./note-card";
import dayjs from "dayjs";
import React from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { useAuth } from "../context/AuthContext";
import { Note } from "../types/note";

// Remove onAddNote from props since it's not directly used for NotesFeed's internal state
// interface NotesFeedProps {
//   onAddNote: (newNote: Note) => void;
// }

const NotesFeed = ({}: /* no props */ {}) => {
  // Changed props to empty object
  const { user, loading: authLoading } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // No longer need useCallback here, as fetchNotes will be a dependency of useEffect itself.
  // The fetchNotes function
  const fetchNotes = async () => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/messages/user/${user.uid}`, {
        method: "GET",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch notes");
      }

      const data = await response.json();

      const formattedNotes = data.map((note: any) => ({
        id: note.id,
        message: note.message,
        authorId: note.userId,
        timestamp: note.timestamp
          ? dayjs(
              note.timestamp._seconds * 1000 +
                note.timestamp._nanoseconds / 1000000
            ).format("MMMM D, h:mm A")
          : "No timestamp available",
      }));

      setNotes(formattedNotes);
    } catch (err: any) {
      console.error("Error fetching notes via API:", err);
      setError(err.message || "Failed to fetch notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Trigger fetch when user is authenticated or authLoading state changes, or when the `key` prop changes.
  useEffect(() => {
    // This useEffect will run when `notesFeedKey` (from WelcomePage) changes,
    // forcing a re-fetch.
    if (!authLoading) {
      fetchNotes();
    }
  }, [user, authLoading]); // Removed fetchNotes from dependencies, as it's defined inside and called only when needed.

  if (authLoading || loading) {
    return (
      <Card className="mt-8">
        <CardContent className="p-4 flex flex-col items-center justify-center min-h-[150px]">
          <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
          <span className="text-muted-foreground">Loading your notes...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mt-8">
        <CardContent className="p-4">
          <Alert variant="destructive">
            <AlertTitle>Error!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="text-center">Your Notes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar gap-2 flex flex-col">
          {notes.length > 0 ? (
            notes.map((note: Note) => (
              <React.Fragment key={note.id}>
                <NoteCard
                  id={note.id}
                  message={note.message}
                  authorId={note.authorId}
                  timestamp={note.timestamp}
                />
              </React.Fragment>
            ))
          ) : (
            <div className="p-4 flex flex-col items-center justify-center min-h-[150px]">
              <p className="text-muted-foreground text-center">
                No notes available. Start creating some thoughts!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotesFeed;
