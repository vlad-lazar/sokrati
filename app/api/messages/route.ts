// app/api/messages/route.ts
import { NextResponse } from "next/server";
import { adminDb, admin } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import { analyzeSentiment } from "@/lib/google-npl";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!adminDb || !admin || !admin.auth()) {
    return NextResponse.json(
      { error: "Server configuration error: Firebase services not available." },
      { status: 500 }
    );
  }

  let userIdFromToken: string;

  try {
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
      userIdFromToken = decodedToken.uid;
    } catch (tokenError: any) {
      console.error("API: Token verification failed:", tokenError);
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

    const body = await request.json();
    const { message, attachments } = body;

    const hasMessageContent =
      typeof message === "string" && message.trim() !== "";
    const hasAttachments = Array.isArray(attachments) && attachments.length > 0;

    if (!hasMessageContent && !hasAttachments) {
      console.error(
        "API: Note content is empty. Requires either message or attachments."
      );
      return NextResponse.json(
        {
          error:
            "Note must contain either text content or at least one attachment.",
        },
        { status: 400 }
      );
    }

    // --- Sentiment Analysis ---
    const sentimentResult = await analyzeSentiment(message);

    const noteData: { [key: string]: any } = {
      userId: userIdFromToken,
      message: hasMessageContent ? message.trim() : "",
      timestamp: Timestamp.now(),
      attachments: hasAttachments ? attachments : [],
    };

    if (sentimentResult) {
      noteData.sentimentScore = sentimentResult.sentimentScore;
      noteData.sentimentMagnitude = sentimentResult.sentimentMagnitude;
    }

    const messagesCollection = adminDb.collection("notes");
    const docRef = await messagesCollection.add(noteData);

    await docRef.update({ id: docRef.id });

    return NextResponse.json(
      { id: docRef.id, message: "Note created successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API: Server error adding note:", error);
    return NextResponse.json(
      { error: "Failed to add note to Firestore. Please try again." },
      { status: 500 }
    );
  }
}
