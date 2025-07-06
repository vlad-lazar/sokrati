import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin"; // Import Firestore Admin instance
import {
  CollectionReference,
  Query,
  DocumentData,
  Timestamp,
} from "firebase-admin/firestore";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

    if (!userId) {
      console.error("API: Missing userId parameter.");
      return NextResponse.json(
        { error: "Missing userId parameter." },
        { status: 400 }
      );
    }

    console.log("API: Fetching notes for userId:", userId);

    // Get the collection reference from adminDb
    if (adminDb === undefined) {
      console.error("API: Firebase Admin DB is not initialized.");
      return NextResponse.json(
        {
          error:
            "Server configuration error: Firebase Admin DB not initialized.",
        },
        { status: 500 }
      );
    }
    const messagesCollectionRef: CollectionReference<DocumentData> =
      adminDb.collection("notes");

    // Create the query using the correctly imported top-level functions
    const notesQuery: Query<DocumentData> = messagesCollectionRef.where(
      "userId",
      "==",
      userId
    );

    // Get documents using the Admin SDK
    const querySnapshot = await notesQuery.get();

    const notes = querySnapshot.docs.map((doc) => {
      const data = doc.data() as {
        userId: string;
        message: string;
        timestamp: Timestamp;
        attachments: string[];
      };
      return {
        id: doc.id,
        userId: data.userId,
        message: data.message,
        timestamp: data.timestamp,
        attachments: data.attachments || [],
      };
    });

    console.log(`API: Retrieved ${notes.length} notes for userId: ${userId}`);
    return NextResponse.json(notes);
  } catch (error: any) {
    console.error("API: Error retrieving notes:", error);
    return NextResponse.json(
      { error: error.message || "Failed to retrieve notes." },
      { status: 500 }
    );
  }
}
