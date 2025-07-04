import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId, message } = await request.json();

    if (!userId || !message) {
      return NextResponse.json(
        { error: "Missing userId or message" },
        { status: 400 }
      );
    }

    const docRef = await addDoc(collection(db, "messages"), {
      userId,
      message,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      id: docRef.id,
      message: "Message stored successfully",
    });
  } catch (error) {
    console.error("Error storing message:", error);
    return NextResponse.json(
      { error: "Failed to store message" },
      { status: 500 }
    );
  }
}
