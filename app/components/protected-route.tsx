// src/components/ProtectedRoute.tsx
"use client"; // This directive is crucial for Next.js to treat this as a client component

import { useEffect } from "react";
import { useRouter } from "next/navigation"; // For App Router navigation
import { Loader2 } from "lucide-react"; // Import a loader icon (assuming lucide-react is installed)
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode; // Content to be rendered if authenticated
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth(); // Destructure user and loading from your AuthContext
  const router = useRouter();

  useEffect(() => {
    // Only perform redirect logic once the authentication state has been determined (i.e., not loading)
    if (!loading) {
      // If there is no authenticated user, redirect to the login page
      if (!user) {
        console.log(
          "ProtectedRoute: User not authenticated. Redirecting to login."
        );
        // Encode the current path to pass as a redirect parameter to the login page.
        // This allows the login page to redirect the user back to the originally intended protected page.
        const currentPath = window.location.pathname + window.location.search;
        router.replace(`/login?redirect=${encodeURIComponent(currentPath)}`);
      } else {
        console.log("ProtectedRoute: User authenticated. Access granted.");
      }
    }
  }, [user, loading, router]); // Dependencies: Effect runs when user, loading state, or router instance changes

  // 1. Show a loading indicator while the authentication state is being determined.
  // This prevents flickering of content before the redirect occurs or content is shown.
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-lg">Loading authentication...</span>
      </div>
    );
  }

  // 2. If authentication state is known and there's no user, return null.
  // The useEffect hook above will handle the actual redirection. Returning null prevents
  // the protected content from briefly rendering before the redirect takes effect.
  if (!user) {
    return null;
  }

  // 3. If authentication state is known and there is a user, render the children.
  return <>{children}</>;
}
