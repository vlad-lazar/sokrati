// src/components/NotesFeed.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import NoteCard from "./note-card";
import dayjs from "dayjs";
import { Note } from "../types/note";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { db } from "@/lib/firebaseClient"; // Make sure db is imported for onSnapshot
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";

interface NotesFeedProps {
  onAddNote: (newNote: Note) => void;
}

const NotesFeed = ({ onAddNote }: NotesFeedProps) => {
  const { user, loading: authLoading } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;

    if (!authLoading) {
      if (!user) {
        setNotes([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const notesCollectionRef = collection(db, "notes");
        const q = query(
          notesCollectionRef,
          where("userId", "==", user.uid),
          orderBy("timestamp", "desc")
        );

        unsubscribe = onSnapshot(
          q,
          (querySnapshot) => {
            const fetchedNotes: Note[] = [];
            querySnapshot.forEach((doc) => {
              const data = doc.data() as {
                userId: string;
                message: string;
                timestamp: Timestamp;
                attachements: string[];
              };
              fetchedNotes.push({
                id: doc.id,
                message: data.message,
                authorId: data.userId,
                timestamp: dayjs(data.timestamp.toDate()).format(
                  "MMMM D, h:mm A"
                ),
              });
            });
            setNotes(fetchedNotes);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching notes:", err);
            setError("Failed to load notes. Please try again.");
            setLoading(false);
          }
        );
      } catch (err: any) {
        console.error("Error setting up notes listener:", err);
        setError(
          err.message || "An unexpected error occurred while fetching notes."
        );
        setLoading(false);
      }
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user, authLoading]);

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
        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {notes.length > 0 ? (
            notes.map((note: Note) => (
              <React.Fragment key={note.id}>
                <div className="p-4">
                  <p className="text-sm text-foreground mb-1 break-words">
                    {note.message}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {note.timestamp}
                  </p>
                </div>
                {notes.indexOf(note) < notes.length - 1 && (
                  <Separator className="mx-4" />
                )}
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
