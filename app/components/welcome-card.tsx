import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function WelcomeCard() {
  const [quote, setQuote] = useState("Loading...");
  const authContext = useAuth();
  useEffect(() => {
    async function fetchQuote() {
      try {
        const response = await fetch("/welcome"); // Middleware modifies this route
        const quote = response.headers.get("x-quote");
        setQuote(quote || "No quote available");
      } catch (error) {
        console.error("Failed to fetch quote:", error);
        setQuote("Failed to load quote");
      }
    }
    fetchQuote();
  }, []);

  const getFirstName = (name: string | undefined) => {
    if (!name) return "User";
    const parts = name.split(" ");
    return parts[0]; // Return the first part of the name
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4">
      <h1 className="text-2xl font-bold">
        Welcome {getFirstName(authContext.user?.displayName ?? "")}!
      </h1>
      <p className="mt-2 text-gray-600">{quote}</p>
      <p className="mt-2 text-gray-600">{dayjs().format("ddd, D MMM YYYY")}</p>
    </div>
  );
}
