"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import NoteCard from "./note-card";
import dayjs from "dayjs";
import React from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { useAuth } from "../context/AuthContext";
import { Note } from "../types/note";

const NotesFeed = () => {
  const { user, loading: authLoading } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "favourites">("all"); // Track active tab

  // Callback to remove a note from state after successful deletion
  const handleNoteDeleted = useCallback((deletedNoteId: string) => {
    setNotes((prevNotes) =>
      prevNotes.filter((note) => note.id !== deletedNoteId)
    );
  }, []);

  // Callback to update a note in state after successful edit
  const handleNoteEdited = useCallback(
    (editedNoteId: string, updatedMessage: string) => {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === editedNoteId
            ? {
                ...note,
                message: updatedMessage, // Update the message
                updatedAt: dayjs().toISOString(), // Add or update the updatedAt timestamp
              }
            : note
        )
      );
    },
    []
  );

  // Callback to update the favourite status of a note
  const handleFavouriteChange = useCallback(
    (noteId: string, isFavourite: boolean) => {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId
            ? {
                ...note,
                isFavourite, // Update the favourite status
              }
            : note
        )
      );
    },
    []
  );

  const fetchNotes = useCallback(async () => {
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
        updatedAt: note.updatedAt || null, // Include updatedAt if available
        isFavourite: note.isFavourite || false, // Include isFavourite flag
      }));

      setNotes(formattedNotes);
    } catch (err: any) {
      console.error("Error fetching notes via API:", err);
      setError(err.message || "Failed to fetch notes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchNotes();
    }
  }, [authLoading, fetchNotes]);

  // Memoize filtered notes to avoid recalculating on every render
  const filteredNotes = useMemo(() => {
    return activeTab === "all"
      ? notes
      : notes.filter((note) => note.isFavourite);
  }, [activeTab, notes]);

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
    <Card className="mt-8 w-full">
      <CardHeader>
        <CardTitle className="text-center">Your Notes</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Tabs for switching between All Notes and Favourite Notes */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "all" | "favourites")}
        >
          <TabsList className="flex justify-center w-full">
            <TabsTrigger value="all">All Notes</TabsTrigger>
            <TabsTrigger value="favourites">Favourite Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar gap-2 flex flex-col w-full">
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note: Note) => (
                  <React.Fragment key={note.id}>
                    <NoteCard
                      isFavourite={note.isFavourite}
                      id={note.id}
                      message={note.message}
                      authorId={note.authorId}
                      timestamp={note.timestamp}
                      updatedAt={note.updatedAt} // Pass updatedAt to NoteCard
                      onDeleteSuccess={handleNoteDeleted} // Pass delete callback
                      onEditSuccess={handleNoteEdited} // Pass edit callback
                      onFavouriteChange={handleFavouriteChange} // Pass favourite change callback
                    />
                  </React.Fragment>
                ))
              ) : (
                <div className="p-4 flex flex-col items-center justify-center min-h-[150px] w-full">
                  <p className="text-muted-foreground text-center">
                    No notes available. Start creating some thoughts!
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="favourites">
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar gap-2 flex flex-col w-full">
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note: Note) => (
                  <React.Fragment key={note.id}>
                    <NoteCard
                      isFavourite={note.isFavourite}
                      id={note.id}
                      message={note.message}
                      authorId={note.authorId}
                      timestamp={note.timestamp}
                      updatedAt={note.updatedAt}
                      onDeleteSuccess={handleNoteDeleted}
                      onEditSuccess={handleNoteEdited}
                      onFavouriteChange={handleFavouriteChange} // Pass favourite change callback
                    />
                  </React.Fragment>
                ))
              ) : (
                <div className="p-4 flex flex-col items-center justify-center min-h-[150px] w-full">
                  <p className="text-muted-foreground text-center">
                    No favourite notes available.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NotesFeed;
