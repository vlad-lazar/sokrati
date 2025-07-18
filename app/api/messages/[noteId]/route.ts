// app/api/messages/[noteId]/route.ts
import { NextResponse } from "next/server";
import { adminDb, admin } from "@/lib/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";
import { analyzeSentiment } from "@/lib/google-npl";

export const runtime = "nodejs";

export async function DELETE(request: Request, context: any) {
  const { noteId } = (await context.params) as { noteId: string };

  if (!adminDb || !admin || !admin.auth()) {
    console.error("API: Firebase services not available (DELETE).");
    return NextResponse.json(
      { error: "Server configuration error: Firebase services not available." },
      { status: 500 }
    );
  }

  try {
    if (!noteId) {
      console.error("API: Missing noteId parameter for DELETE.");
      return NextResponse.json(
        { error: "Missing noteId parameter." },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("API: Unauthorized: Missing or invalid token for DELETE.");
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid token." },
        { status: 401 }
      );
    }

    const idToken = authHeader.split("Bearer ")[1];

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken, true);
    } catch (error: any) {
      console.error(
        "API: Unauthorized: Invalid or expired token for DELETE.",
        error
      );
      return NextResponse.json(
        { error: "Unauthorized: Invalid or expired token." },
        { status: 401 }
      );
    }

    const userIdFromToken = decodedToken.uid;

    const noteRef = adminDb.collection("notes").doc(noteId);
    const noteDoc = await noteRef.get();

    if (!noteDoc.exists) {
      console.error(`API: Note with ID ${noteId} not found for DELETE.`);
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    const noteData = noteDoc.data();
    if (noteData?.userId !== userIdFromToken) {
      console.error(
        `API: Unauthorized: User ${userIdFromToken} tried to delete note ${noteId} not belonging to them.`
      );
      return NextResponse.json(
        {
          error:
            "Unauthorized: You do not have permission to delete this note.",
        },
        { status: 403 }
      );
    }

    await noteRef.delete();

    console.log(
      `API: Note with ID ${noteId} deleted successfully by user ${userIdFromToken}.`
    );
    return NextResponse.json(
      { message: "Note deleted successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API: Server error deleting note:", error);
    return NextResponse.json(
      { error: "Failed to delete note. Please try again." },
      { status: 500 }
    );
  }
}

// --- UPDATED PATCH FUNCTION ---
export async function PATCH(request: Request, context: any) {
  const { noteId } = (await context.params) as { noteId: string };

  if (!adminDb || !admin || !admin.auth()) {
    console.error("API: Firebase services not available (PATCH).");
    return NextResponse.json(
      {
        error: "Server configuration error: Firebase services not available.",
      },
      { status: 500 }
    );
  }

  try {
    if (!noteId) {
      console.error("API: Missing noteId parameter for PATCH.");
      return NextResponse.json(
        { error: "Missing noteId parameter." },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("API: Unauthorized: Missing or invalid token for PATCH.");
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid token." },
        { status: 401 }
      );
    }

    const idToken = authHeader.split("Bearer ")[1];

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken, true);
    } catch (error: any) {
      console.error(
        "API: Unauthorized: Invalid or expired token for PATCH.",
        error
      );
      return NextResponse.json(
        { error: "Unauthorized: Invalid or expired token." },
        { status: 401 }
      );
    }

    const userIdFromToken = decodedToken.uid;

    const body = await request.json();
    const { message, isFavourite } = body;

    if (
      message !== undefined &&
      (typeof message !== "string" || message.trim() === "")
    ) {
      console.error("API: Invalid message content provided for PATCH.");
      return NextResponse.json(
        { error: "Message content must be a non-empty string if provided." },
        { status: 400 }
      );
    }
    if (isFavourite !== undefined && typeof isFavourite !== "boolean") {
      console.error("API: Invalid isFavourite status provided for PATCH.");
      return NextResponse.json(
        { error: "isFavourite must be a boolean if provided." },
        { status: 400 }
      );
    }

    const noteRef = adminDb.collection("notes").doc(noteId);
    const noteDoc = await noteRef.get();

    if (!noteDoc.exists) {
      console.error(`API: Note with ID ${noteId} not found for PATCH.`);
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    const noteData = noteDoc.data();
    if (noteData?.userId !== userIdFromToken) {
      console.error(
        `API: Unauthorized: User ${userIdFromToken} tried to edit note ${noteId} not belonging to them.`
      );
      return NextResponse.json(
        {
          error: "Unauthorized: You do not have permission to edit this note.",
        },
        { status: 403 }
      );
    }

    const updates: { [key: string]: any } = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    if (message !== undefined) {
      updates.message = message;
      const sentimentResult = await analyzeSentiment(message);
      if (sentimentResult) {
        updates.sentimentScore = sentimentResult.sentimentScore;
        updates.sentimentMagnitude = sentimentResult.sentimentMagnitude;
      } else {
        updates.sentimentScore = FieldValue.delete();
        updates.sentimentMagnitude = FieldValue.delete();
      }
    }

    if (isFavourite !== undefined) {
      updates.isFavourite = isFavourite;
    }

    if (Object.keys(updates).length === 1 && "updatedAt" in updates) {
      console.warn(
        "API: PATCH request received with no valid update fields other than timestamp. No action taken."
      );
      const currentNote = await noteRef.get();
      return NextResponse.json(
        {
          message: "No relevant fields provided for update.",
          updatedNote: currentNote.data(),
        },
        { status: 200 }
      );
    }

    await noteRef.update(updates);

    const updatedDoc = await noteRef.get();
    const updatedNoteData = updatedDoc.data();

    console.log(
      `API: Note with ID ${noteId} updated successfully by user ${userIdFromToken}.`
    );
    return NextResponse.json(
      {
        message: "Note updated successfully.",
        updatedNote: updatedNoteData,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API: Server error updating note:", error);
    return NextResponse.json(
      { error: "Failed to update note. Please try again." },
      { status: 500 }
    );
  }
}
