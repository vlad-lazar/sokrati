import { LanguageServiceClient } from "@google-cloud/language";

// This is a singleton pattern to avoid re-initializing the client on every API call.
let languageClient: LanguageServiceClient | null = null;

function getLanguageClient(): LanguageServiceClient {
  if (languageClient) {
    return languageClient;
  }

  // Check if the new, simpler credentials are provided in the environment.
  if (
    !process.env.GCLOUD_PROJECT_ID ||
    !process.env.GCLOUD_CLIENT_EMAIL ||
    !process.env.GCLOUD_PRIVATE_KEY
  ) {
    throw new Error(
      "Google Cloud credentials are not fully set. Check GCLOUD_PROJECT_ID, GCLOUD_CLIENT_EMAIL, and GCLOUD_PRIVATE_KEY in your .env.local file."
    );
  }

  // Construct the credentials object programmatically.
  const credentials = {
    client_email: process.env.GCLOUD_CLIENT_EMAIL,
    // IMPORTANT: This replaces the escaped newlines with actual newlines,
    // which is what the authentication library needs.
    private_key: process.env.GCLOUD_PRIVATE_KEY.replace(/\\n/g, "\n"),
  };

  languageClient = new LanguageServiceClient({
    projectId: process.env.GCLOUD_PROJECT_ID,
    credentials,
  });

  console.log("Google Language Client initialized from separate env vars.");
  return languageClient;
}

interface SentimentResult {
  sentimentScore: number;
  sentimentMagnitude: number;
}

export async function analyzeSentiment(
  text: string
): Promise<SentimentResult | null> {
  // Don't analyze very short or empty strings.
  if (!text || text.trim().length < 10) {
    return null;
  }

  try {
    const client = getLanguageClient();
    const document = {
      content: text,
      type: "PLAIN_TEXT" as const, // Ensure type safety
    };

    const [result] = await client.analyzeSentiment({ document });
    const sentiment = result.documentSentiment;

    if (sentiment) {
      console.log(
        `Sentiment analysis complete. Score: ${sentiment.score}, Magnitude: ${sentiment.magnitude}`
      );
      return {
        sentimentScore: sentiment.score ?? 0,
        sentimentMagnitude: sentiment.magnitude ?? 0,
      };
    }
    return null;
  } catch (error) {
    console.error("Error in analyzeSentiment:", error);
    // Log the error but don't throw, so note creation doesn't fail if NLP does.
    return null;
  }
}
