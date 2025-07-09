// app/api/messages/route.ts
import { NextResponse } from "next/server";
import { adminDb, admin } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!adminDb || !admin || !admin.auth()) {
    return NextResponse.json(
      { error: "Server configuration error: Firebase services not available." },
      { status: 500 }
    );
  }

  let userIdFromToken: string; // Declare userIdFromToken outside the specific try/catch for broader scope

  try {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized: Missing or invalid token." },
        { status: 401 }
      );
    }
    const idToken = authHeader.split("Bearer ")[1];

    let decodedToken; // Declare decodedToken here as well
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken, true);

      userIdFromToken = decodedToken.uid; // Assign it here upon success
    } catch (tokenError: any) {
      if (tokenError.code === "auth/id-token-expired") {
        return NextResponse.json(
          { error: "Unauthorized: Token expired. Please re-authenticate." },
          { status: 401 }
        );
      } else if (tokenError.code === "auth/id-token-revoked") {
        return NextResponse.json(
          { error: "Unauthorized: Token revoked. Please re-authenticate." },
          { status: 401 }
        );
      } else if (tokenError.code === "auth/argument-error") {
        return NextResponse.json(
          { error: "Unauthorized: Invalid token format." },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: `Unauthorized: ${tokenError.message || "Invalid token"}.` },
        { status: 401 }
      );
    }

    // Now, userIdFromToken is guaranteed to be defined if execution reaches this point
    // because any verification error would have caused an early return above.

    const body = await request.json();
    const { message, attachments } = body;

    if (!message || typeof message !== "string" || message.trim() === "") {
      console.error("API: Message content is empty or invalid.");
      return NextResponse.json(
        {
          error: "Message content is required and must be a non-empty string.",
        },
        { status: 400 }
      );
    }

    const messagesCollection = adminDb.collection("notes");
    const docRef = await messagesCollection.add({
      userId: userIdFromToken, // This is now guaranteed to be defined
      message,
      timestamp: Timestamp.now(),
      attachments: attachments || [],
    });

    await docRef.update({ id: docRef.id }); // Keep this if you want the ID as a field in the document

    return NextResponse.json(
      { id: docRef.id, message: "Note created successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    // This outer catch now only catches errors from request.json(), docRef.add(), or docRef.update()
    console.error("API: Server error adding note:", error);
    return NextResponse.json(
      { error: "Failed to add note to Firestore. Please try again." },
      { status: 500 }
    );
  }
}
