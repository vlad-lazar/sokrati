import { NextResponse } from "next/server";
import { adminDb, admin } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function DELETE(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  if (!adminDb || !admin || !admin.auth()) {
    return NextResponse.json(
      { error: "Server configuration error: Firebase services not available." },
      { status: 500 }
    );
  }

  try {
    const { noteId } = params;

    if (!noteId) {
      return NextResponse.json(
        { error: "Missing noteId parameter." },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
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
      return NextResponse.json(
        { error: "Unauthorized: Invalid or expired token." },
        { status: 401 }
      );
    }

    const userIdFromToken = decodedToken.uid;

    // Fetch the note to ensure it belongs to the authenticated user
    const noteDoc = await adminDb.collection("notes").doc(noteId).get();

    if (!noteDoc.exists) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    const noteData = noteDoc.data();
    if (noteData?.userId !== userIdFromToken) {
      return NextResponse.json(
        {
          error:
            "Unauthorized: You do not have permission to delete this note.",
        },
        { status: 403 }
      );
    }

    // Delete the note
    await adminDb.collection("notes").doc(noteId).delete();

    console.log(`API: Note with ID ${noteId} deleted successfully.`);
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

// PATCH endpoint to edit a note
export async function PATCH(
  request: Request,
  { params }: { params: { noteId: string } }
) {
  try {
    const { noteId } = params;

    if (!noteId) {
      return NextResponse.json(
        { error: "Missing noteId parameter." },
        { status: 400 }
      );
    }

    if (!adminDb) {
      return NextResponse.json(
        {
          error: "Server configuration error: Firebase services not available.",
        },
        { status: 500 }
      );
    }

    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
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
      return NextResponse.json(
        { error: "Unauthorized: Invalid or expired token." },
        { status: 401 }
      );
    }

    const userIdFromToken = decodedToken.uid;

    // Parse the request body
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      return NextResponse.json(
        {
          error: "Message content is required and must be a non-empty string.",
        },
        { status: 400 }
      );
    }

    // Fetch the note to ensure it exists and belongs to the authenticated user
    const noteDoc = await adminDb.collection("notes").doc(noteId).get();

    if (!noteDoc.exists) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    const noteData = noteDoc.data();
    if (noteData?.userId !== userIdFromToken) {
      return NextResponse.json(
        {
          error: "Unauthorized: You do not have permission to edit this note.",
        },
        { status: 403 }
      );
    }

    // Update the note content and set the updatedAt timestamp
    await adminDb.collection("notes").doc(noteId).update({
      message,
      updatedAt: new Date().toISOString(), // Add updatedAt timestamp
    });

    console.log(`API: Note with ID ${noteId} updated successfully.`);
    return NextResponse.json(
      { message: "Note updated successfully." },
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
