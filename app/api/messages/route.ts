// app/api/messages/route.ts
// This route will run on the server (Node.js runtime)
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin"; // Import the admin Firestore instance
import { Timestamp } from "firebase-admin/firestore"; // Import Timestamp from admin SDK

export const runtime = "nodejs"; // Ensure this route runs in the Node.js runtime

export async function POST(request: Request) {
  // Check if adminDb is initialized
  if (!adminDb) {
    console.error("API: Firebase Admin Firestore not initialized.");
    return NextResponse.json(
      { error: "Server configuration error: Database service not available." },
      { status: 500 }
    );
  }

  try {
    // 1. Correctly parse the request body
    // Use request.text() first to inspect if it's empty,
    // then try to parse as JSON if it's not.
    const requestBodyText = await request.text();
    if (!requestBodyText) {
      console.error("API: Request body is empty.");
      return NextResponse.json(
        { error: "Request body is empty" },
        { status: 400 }
      );
    }

    let data;
    try {
      data = JSON.parse(requestBodyText);
    } catch (parseError) {
      console.error("API: Failed to parse request body as JSON:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { userId, message, attachements } = data; // Destructure all expected fields

    console.log("API: Data received:", { userId, message });

    if (!userId || typeof userId !== "string") {
      console.error("API: Missing or invalid userId");
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }
    if (!message || typeof message !== "string" || message.trim() === "") {
      console.error("API: Message content is empty or invalid");
      return NextResponse.json(
        { error: "Message content is required" },
        { status: 400 }
      );
    }

    // 2. Use adminDb for Firestore operations
    const messagesCollection = adminDb.collection("messages");
    const docRef = await messagesCollection.add({
      userId: userId,
      message: message,
      timestamp: Timestamp.now(), // Use admin SDK's Timestamp
      attachements: attachements || [], // Ensure attachments is an array, even if empty
    });

    console.log("API: Message added successfully with ID:", docRef.id);
    return NextResponse.json({ id: docRef.id }, { status: 200 });
  } catch (error: any) {
    console.error("API: Error adding message:", error);
    return NextResponse.json(
      { error: error.message || "Failed to add message to Firestore" },
      { status: 500 }
    );
  }
}
