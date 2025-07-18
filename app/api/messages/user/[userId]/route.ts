// app/api/messages/user/[userId]/route.ts
import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin"; // DO NOT MODIFY IMPORTS (as per request)

export const runtime = "nodejs";

type UserNotesParams = {
  userId: string;
  filter?: string;
};

export async function GET(
  request: Request,

  context: any
) {
  try {
    // Cast context.params to ensure internal type safety for your logic.
    // We assume context.params will have the UserNotesParams shape at runtime.
    const { userId, filter } = (await context.params) as UserNotesParams; // <--- CASTING HERE FOR TYPE SAFETY

    if (!userId) {
      console.error("API: Missing userId parameter.");
      return NextResponse.json(
        { error: "User ID parameter is required." },
        { status: 400 }
      );
    }

    if (!adminDb) {
      console.error(
        "API: Server configuration error: Firebase services not available."
      );
      return NextResponse.json(
        {
          error: "Server configuration error: Firebase services not available.",
        },
        { status: 500 }
      );
    }

    // Your query logic (assuming adminDb.collection, .where, .orderBy are available)
    // The previous error about 'params should be awaited' was misleading; context.params is generally synchronous.
    let queryRef = adminDb.collection("notes").where("userId", "==", userId);

    if (filter === "favourites") {
      queryRef = queryRef.where("isFavourite", "==", true);
    }

    queryRef = queryRef.orderBy("timestamp", "desc");

    const notesSnapshot = await queryRef.get();

    const notes = notesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(notes, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching notes:", error);
    return NextResponse.json(
      { error: "Failed to fetch notes." },
      { status: 500 }
    );
  }
}
