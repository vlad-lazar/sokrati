// src/components/CookieConsentBanner.tsx
"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button"; // Use Shadcn's Button component directly
import { initializeFirebaseAnalytics, firebaseApp } from "@/lib/firebaseClient"; // Import analytics initializer

const COOKIE_CONSENT_KEY = "sokrati_cookie_consent_status"; // A unique key for localStorage

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  // Effect to check consent status on component mount
  useEffect(() => {
    // Only run this logic in the browser
    if (typeof window !== "undefined") {
      const consentStatus = localStorage.getItem(COOKIE_CONSENT_KEY);
      // If consent hasn't been given or declined, show the banner
      if (consentStatus !== "accepted" && consentStatus !== "declined") {
        setShowBanner(true);
      }
      // If it was accepted previously, initialize analytics immediately
      else if (consentStatus === "accepted") {
        initializeFirebaseAnalytics(firebaseApp);
      }
    }
  }, []); // Empty dependency array means this runs once on mount

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "accepted");
    initializeFirebaseAnalytics(firebaseApp); // Initialize analytics on accept
    setShowBanner(false); // Hide the banner
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "declined");
    // No analytics initialization on decline
    setShowBanner(false); // Hide the banner
  };

  if (!showBanner) {
    return null; // Don't render anything if banner should not be shown
  }

  return (
    // Outer wrapper for positioning, sizing, border, shadow
    <div
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50
                 max-w-xl w-[calc(100vw-2rem)] // Max width for larger screens, responsive for small
                 border border-border rounded-md shadow-md
                 bg-card text-foreground" // Shadcn styling for background and text
    >
      {/* Inner container for responsive flex layout and padding */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-4 sm:gap-6">
        {/* Text content */}
        <p className="flex-1 text-left text-sm m-0">
          Hi! We use a few friendly cookies here at Sokrati. They're just tiny
          helpers that whisper anonymous insights so we can make this app even
          better for you. And don't worry, your data stays with us – we're
          definitely not in the selling business. All good?
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button
            variant="outline" // Use outline for "Decline" typically
            onClick={handleDecline}
            className="w-full sm:w-auto" // Full width on mobile, auto on sm+
          >
            Decline
          </Button>
          <Button
            onClick={handleAccept}
            className="w-full sm:w-auto" // Full width on mobile, auto on sm+
          >
            Accept All
          </Button>
        </div>
      </div>
    </div>
  );
}
