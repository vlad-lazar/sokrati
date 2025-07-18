// src/app/layout.tsx
"use client";

import * as React from "react";
import { ThemeProvider } from "./components/theme-provider";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";
import { usePathname } from "next/navigation"; // <--- NEW IMPORT: usePathname for route checking
import CookieConsentBanner from "./components/cookie-consent-banner";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bodyClassName = `${geistSans.variable} ${geistMono.variable} antialiased`;
  const pathname = usePathname(); // <--- Get current pathname

  // Define routes where the cookie banner should NOT appear
  const noBannerRoutes = ["/login", "/signup"]; // Add any other public routes like '/about', '/privacy' etc.

  // Check if the current path is one where the banner should be suppressed
  const shouldShowBanner = !noBannerRoutes.includes(pathname);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={bodyClassName}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          forcedTheme={undefined}
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>

        {/* Conditionally render the CookieConsentBanner */}
        {shouldShowBanner && <CookieConsentBanner />}
      </body>
    </html>
  );
}
