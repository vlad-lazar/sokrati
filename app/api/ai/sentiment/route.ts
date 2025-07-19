// app/api/ai/sentiment/route.ts
import { NextResponse } from "next/server";
// Import the specific 'Type' enum for document type and other types
import {
  LanguageServiceClient,
  protos, // Contains the nested types like protos.google.cloud.language.v1.Document.Type
} from "@google-cloud/language";

export const runtime = "nodejs";

// Initialize client outside the handler to reuse connection (best practice for serverless)
// Handle client initialization using GOOGLE_APPLICATION_CREDENTIALS_JSON from env.
// This block should be carefully designed to initialize only once.
let client: LanguageServiceClient;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  console.log(
    "AI Init: Initializing Google Cloud Language client with JSON credentials."
  );
  try {
    const credentials = JSON.parse(
      process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON
    );
    client = new LanguageServiceClient({ credentials });
  } catch (initError) {
    console.error(
      "AI Init Error: Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON. Check format. Using default client.",
      initError
    );
    // Fallback to default client if JSON parsing fails, relies on GOOGLE_APPLICATION_CREDENTIALS file path
    client = new LanguageServiceClient();
  }
} else {
  // Fallback for local development if GOOGLE_APPLICATION_CREDENTIALS is set to a file path
  client = new LanguageServiceClient();
}

export async function POST(request: Request) {
  console.log("API: Sentiment Analysis Request Received");
  try {
    const { text } = await request.json();

    // Validate input
    if (!text || typeof text !== "string") {
      console.error("API Error: Invalid or missing 'text' input.");
      return NextResponse.json(
        { error: "Invalid input. 'text' must be a non-empty string." },
        { status: 400 }
      );
    }

    // --- FIX 3: Truncate to 200 characters to match NoteBox limit ---
    const maxTextLength = 500;
    const inputText = text.substring(0, maxTextLength); // Truncate if too long

    // Perform sentiment analysis
    const document = {
      content: inputText,
      // --- FIX 1: Use the specific enum for 'type' ---
      type: protos.google.cloud.language.v1.Document.Type.PLAIN_TEXT,
    };

    // --- FIX 2: Explicitly cast the promise result for destructuring ---
    const [result] = (await client.analyzeSentiment({ document })) as [
      protos.google.cloud.language.v1.IAnalyzeSentimentResponse, // Expected response type
      protos.google.cloud.language.v1.IAnalyzeSentimentRequest | undefined,
      {} | undefined
    ];

    const sentiment = result.documentSentiment; // This object contains score and magnitude

    if (!sentiment) {
      console.error("API Error: Sentiment analysis returned no result.");
      return NextResponse.json(
        { error: "Failed to analyze sentiment. No result returned." },
        { status: 500 }
      );
    }

    console.log("API: Sentiment Analysis Result:", sentiment);

    return NextResponse.json(
      {
        score: sentiment.score,
        magnitude: sentiment.magnitude,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("API Error: Error during sentiment analysis:", error);

    // Handle specific Google Cloud errors if available
    if (error.code && error.details) {
      return NextResponse.json(
        {
          error: `Google Cloud Error: ${error.details}`,
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to perform sentiment analysis." },
      { status: 500 }
    );
  }
}
