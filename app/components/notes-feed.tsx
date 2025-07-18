"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import NoteCard from "./note-card/note-card";
import dayjs from "dayjs"; // Make sure dayjs is installed: `pnpm add dayjs`
import React from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import { useAuth } from "../context/AuthContext";
import { Note, ImageAttachment } from "../types/note"; // <-- Import ImageAttachment here too!

const NotesFeed = () => {
  const { user, loading: authLoading } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "favourites">("all");

  const handleNoteDeleted = useCallback((deletedNoteId: string) => {
    setNotes((prevNotes) =>
      prevNotes.filter((note) => note.id !== deletedNoteId)
    );
  }, []);

  const handleNoteEdited = useCallback(
    (editedNoteId: string, updatedNoteData: any) => {
      // Helper to convert Firestore Timestamps from the API response
      const convertTimestamp = (ts: any): string | undefined => {
        if (ts && ts._seconds !== undefined && ts._nanoseconds !== undefined) {
          return dayjs(
            ts._seconds * 1000 + ts._nanoseconds / 1000000
          ).toISOString();
        }
        return undefined;
      };

      setNotes((prevNotes) =>
        prevNotes.map((note) => {
          if (note.id === editedNoteId) {
            // Merge the new data, ensuring timestamps are correctly formatted for display
            return {
              ...note,
              ...updatedNoteData,
              timestamp: convertTimestamp(updatedNoteData.timestamp)
                ? dayjs(convertTimestamp(updatedNoteData.timestamp)).format(
                    "MMMM D, h:mm A"
                  )
                : note.timestamp,
              updatedAt: convertTimestamp(updatedNoteData.updatedAt),
            };
          }
          return note;
        })
      );
    },
    []
  );

  const handleFavouriteChange = useCallback(
    (noteId: string, isFavourite: boolean) => {
      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id === noteId
            ? {
                ...note,
                isFavourite,
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

      const formattedNotes = data.map((note: any) => {
        // Function to safely convert Firestore Timestamp to string
        const convertTimestamp = (ts: any): string | undefined => {
          if (
            ts &&
            ts._seconds !== undefined &&
            ts._nanoseconds !== undefined
          ) {
            return dayjs(
              ts._seconds * 1000 + ts._nanoseconds / 1000000
            ).toISOString();
          }
          return undefined; // Return undefined if invalid or not present
        };

        const convertedTimestamp = convertTimestamp(note.timestamp);
        const convertedUpdatedAt = convertTimestamp(note.updatedAt);

        // --- CRITICAL FIX: Explicitly map and type attachments ---
        const mappedAttachments: ImageAttachment[] = Array.isArray(
          note.attachments
        )
          ? note.attachments
              .map((att: any) => ({
                url: att.url || "", // Ensure url is a string
                name: att.name || "untitled-image", // Ensure name is a string
                type: att.type || "image/unknown", // Ensure type is a string
              }))
              .filter(
                (att: ImageAttachment) =>
                  att.url && att.name && att.type.startsWith("image/")
              ) // Filter for valid image types
          : []; // Default to empty array if no attachments or not an array

        return {
          id: note.id,
          message: note.message,
          authorId: note.userId,
          timestamp: convertedTimestamp
            ? dayjs(convertedTimestamp).format("MMMM D, h:mm A") // Format for display
            : "No timestamp available",
          updatedAt: convertedUpdatedAt, // Use the converted timestamp
          isFavourite: note.isFavourite || false,
          attachments: mappedAttachments,
          sentimentScore: note.sentimentScore || undefined, // Optional field
          sentimentMagnitude: note.sentimentMagnitude || undefined, // Optional field
        };
      });

      setNotes(formattedNotes);
    } catch (err: any) {
      console.error("Error fetching notes via API:", err);
      setError(err.message || "Failed to fetch notes. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [user]); // Removed fetchNotes from dependencies as it's useCallback

  useEffect(() => {
    if (!authLoading) {
      fetchNotes();
    }
  }, [authLoading, fetchNotes]);

  const filteredNotes = useMemo(() => {
    return activeTab === "all"
      ? notes
      : notes.filter((note) => note.isFavourite);
  }, [activeTab, notes]);

  if (authLoading || loading) {
    return (
      <Card className="mt-8">
        <CardContent className="flex flex-col items-center justify-center min-h-[150px]">
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

  console.log("Notes in state:", notes); // Full notes state for debugging
  console.log("Filtered Notes:", filteredNotes); // Debugging line to check filtered notes

  return (
    <Card className="mt-8 w-full">
      <CardHeader>
        <CardTitle className="text-center">Your Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "all" | "favourites")}
        >
          <TabsList className="flex justify-center w-full">
            <TabsTrigger value="all">All Notes</TabsTrigger>
            <TabsTrigger value="favourites">Favourite Notes</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar gap-2 flex flex-col w-full">
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note: Note) => (
                  <React.Fragment key={note.id}>
                    <NoteCard
                      isFavourite={note.isFavourite}
                      id={note.id}
                      message={note.message}
                      authorId={note.authorId}
                      timestamp={note.timestamp}
                      attachments={note.attachments} // <-- Property name is now correct
                      updatedAt={note.updatedAt}
                      sentimentScore={note.sentimentScore} // Optional: if you have sentiment data
                      sentimentMagnitude={note.sentimentMagnitude} // Optional: if you have sentiment data
                      onDeleteSuccess={handleNoteDeleted}
                      onEditSuccess={handleNoteEdited}
                      onFavouriteChange={handleFavouriteChange}
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
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar gap-2 flex flex-col w-full">
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
                      attachments={note.attachments} // <-- Property name is now correct
                      onDeleteSuccess={handleNoteDeleted}
                      onEditSuccess={handleNoteEdited}
                      onFavouriteChange={handleFavouriteChange}
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
