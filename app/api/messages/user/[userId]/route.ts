import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebaseAdmin";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const { userId } = params;

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

    const notesSnapshot = await adminDb
      .collection("notes")
      .where("userId", "==", userId)
      .orderBy("timestamp", "desc")
      .get();

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
