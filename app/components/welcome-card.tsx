import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import dayjs from "dayjs";
import { Loader2 } from "lucide-react";

interface QuoteData {
  quote: string;
  author: string;
}

const WelcomeCard = () => {
  const authContext = useAuth(); // To get the user's display name
  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Ref to track if the fetch has already been called
  const hasFetched = useRef(false);

  // Memoized fetchQuote function
  const fetchQuote = useCallback(async () => {
    if (hasFetched.current) return; // Prevent duplicate fetches
    hasFetched.current = true; // Mark as fetched

    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/quote");

      if (!response.ok) {
        const errorBody = await response.json();
        throw new Error(
          errorBody.error || `Failed to fetch quote: ${response.status}`
        );
      }

      const data: QuoteData = await response.json();
      setQuoteData(data);
    } catch (err: any) {
      console.error("Failed to fetch quote:", err);
      setError(err.message || "Failed to load quote.");
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array ensures this function is stable

  // Fetch the quote only once on mount
  useEffect(() => {
    fetchQuote();
  }, [fetchQuote]);

  const getFirstName = (name: string | undefined | null) => {
    if (!name) return "User"; // Accept null for safety
    const parts = name.split(" ");
    return parts[0];
  };

  const formattedDate = dayjs().format("ddd, D MMM YYYY"); // e.g., "Tue, 8 Jul 2025"

  return (
    <div className="w-full max-w-lg mx-auto text-center space-y-4">
      <div>
        <h1 className="text-2xl font-bold">
          Welcome {getFirstName(authContext.user?.displayName)}!
        </h1>
        <p className="text-sm text-muted-foreground">{formattedDate}</p>
      </div>
      <div>
        {loading ? (
          <div className="flex justify-center items-center h-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : quoteData ? (
          <>
            <p className="text-md italic text-foreground">
              "{quoteData.quote}"
            </p>
            <p className="text-sm text-muted-foreground">
              - {quoteData.author || "Unknown"}
            </p>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default WelcomeCard;
