import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  context: { params: { userId: string; filter?: string } }
) {
  try {
    const { params } = await context;
    const { userId, filter } = await params;

    console.log("Fetching notes for user:", userId, "Filter:", filter);

    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId parameter." },
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

    let query = adminDb.collection("notes").where("userId", "==", userId);

    // Apply filter for favourite notes if specified
    if (filter === "favourites") {
      query = query.where("isFavourite", "==", true);
    }

    // Order by timestamp in ascending order
    query = query.orderBy("timestamp", "desc");

    const notesSnapshot = await query.get();

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
