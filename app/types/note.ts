// app/types/note.ts
// Define the specific type for an image attachment
export interface ImageAttachment {
  url: string;
  name: string;
  type: string; // e.g., "image/jpeg", "important for filtering later if needed, but for now we expect 'image/'"
}

export interface Note {
  id: string;
  message: string;
  authorId: string;
  timestamp: string; // Or Date, depending on how you deserialize from Firestore
  isFavourite: boolean;
  updatedAt?: string; // Optional field for when the note was last updated
  attachments?: ImageAttachment[];
  sentimentScore?: number; // <-- ADD THIS
  sentimentMagnitude?: number; // <-- ADD THIS
}
