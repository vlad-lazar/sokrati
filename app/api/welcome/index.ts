// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const quotesApiUrl = "https://your-quotes-api.com/random";
  try {
    const response = await fetch(quotesApiUrl);
    const data = await response.json();

    const modifiedRequestHeaders = new Headers(request.headers);
    modifiedRequestHeaders.set(
      "x-quote",
      data.quote || "Default fallback quote"
    );

    return NextResponse.next({
      request: {
        headers: modifiedRequestHeaders,
      },
    });
  } catch (error) {
    console.error("Failed to fetch quote:", error);

    // Add a fallback quote if the API fails
    const modifiedRequestHeaders = new Headers(request.headers);
    modifiedRequestHeaders.set("x-quote", "Default fallback quote");

    return NextResponse.next({
      request: {
        headers: modifiedRequestHeaders,
      },
    });
  }
}
