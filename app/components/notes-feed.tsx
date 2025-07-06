"use client";

import { useEffect, useState } from "react";
import NoteCard from "./note-card";
import dayjs from "dayjs";
import { Note } from "../types/note";
import { useAuth } from "../context/AuthContext";

const MessageFeed = () => {
  // Changed to a non-prop version
  const { user, loading: authLoading } = useAuth(); // Get user and authLoading from context
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      // Only fetch if user is authenticated and not still loading auth
      if (!user && !authLoading) {
        setNotes([]);
        setLoading(false);
        return;
      }
      if (!user) {
        // Wait for user object to be available if authLoading is false
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Use user.uid from useAuth context for the API call
        const response = await fetch(`/api/messages/${user.uid}`, {
          // <--- Use user.uid here
          method: "GET",
        });

        if (!response.ok) {
          const errorData = await response.json(); // Get more specific error from API
          throw new Error(errorData.error || "Failed to fetch notes");
        }

        const data = await response.json();

        const formattedNotes = data.map((note: any) => ({
          id: note.id,
          message: note.message,
          authorId: note.userId, // Match 'userId' field from Firestore
          timestamp: note.timestamp // This will be a Firestore Timestamp object from API
            ? dayjs(
                note.timestamp._seconds * 1000 +
                  note.timestamp._nanoseconds / 1000000
              ).format("MMMM D, YYYY h:mm A") // Correctly convert Firestore Timestamp object
            : "No timestamp",
        }));

        setNotes(formattedNotes);
      } catch (err: any) {
        // Use 'any' for err
        console.error("Error fetching notes:", err);
        setError(err.message || "Failed to fetch notes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Trigger fetch when user or authLoading changes (i.e., user logs in/out)
    if (user || !authLoading) {
      // Run if user is available or auth has finished loading
      fetchNotes();
    }
  }, [user, authLoading]); // Dependency array: Re-run when user or authLoading changes

  if (authLoading || loading) {
    // Show loading if auth is loading or notes are loading
    return <div>Loading notes...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      {notes.length > 0 ? (
        notes.map((note: Note) => (
          <NoteCard
            key={note.id}
            id={note.id}
            message={note.message}
            authorId={note.authorId}
            timestamp={note.timestamp}
          />
        ))
      ) : (
        <div>*Cricket sounds*</div>
      )}
    </div>
  );
};

export default MessageFeed;
