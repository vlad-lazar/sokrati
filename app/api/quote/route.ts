// app/api/quotes/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Ensure this runs in the Node.js environment

export async function GET() {
  const API_KEY = process.env.API_NINJAS_QUOTES_API_KEY;

  if (!API_KEY) {
    console.error(
      "API_NINJAS_QUOTES_API_KEY is not set in environment variables."
    );
    return NextResponse.json(
      { error: "Server configuration error: API key missing." },
      { status: 500 }
    );
  }

  try {
    const response = await fetch("https://api.api-ninjas.com/v1/quotes", {
      method: "GET",
      headers: {
        "X-Api-Key": API_KEY,
        "Content-Type": "application/json", // API-Ninjas often expects this
      },
    });

    if (!response.ok) {
      const errorBody = await response.text(); // Get raw body for more info
      console.error(
        `Error fetching quote from API-Ninjas: Status ${response.status}, Body: ${errorBody}`
      );
      return NextResponse.json(
        {
          error: `Failed to fetch quote from external API. Status: ${response.status}`,
        },
        { status: response.status } // Pass through external API status
      );
    }

    const data = await response.json(); // API-Ninjas returns an array of quotes
    // e.g., [{ "quote": "...", "author": "...", "category": "..." }]

    // Assuming you just want one quote for display
    if (data && data.length > 0) {
      return NextResponse.json(data[0], { status: 200 }); // Return the first quote
    } else {
      return NextResponse.json(
        { error: "No quotes found from external API." },
        { status: 404 }
      );
    }
  } catch (error: any) {
    console.error("Caught error fetching quote:", error);
    return NextResponse.json(
      { error: "Internal server error while fetching quote." },
      { status: 500 }
    );
  }
}
