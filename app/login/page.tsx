// src/app/login/page.tsx (or src/app/auth/page.tsx)
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, Mail, Lock, User as UserIcon } from "lucide-react";
import {
  signIn,
  signInWithGoogle, // Your custom wrapper
  signUp,
  sendPasswordReset,
} from "@/lib/auth";
import { useAuth } from "../context/AuthContext";
import { ModeToggle } from "../components/theme-switcher";
import ForgotPasswordDialog from "../components/forgot-password-dialog";

// Schemas (unchanged)
const signUpSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  // --- NEW STATE: Track if Google sign-in popup flow has been initiated ---
  const [isGoogleAuthFlowActive, setIsGoogleAuthFlowActive] = useState(false);
  // --- END NEW STATE ---

  const router = useRouter();
  const { loading: authLoading, user } = useAuth();

  // States for ForgotPasswordDialog (unchanged)
  const [isForgotPasswordDialogOpen, setIsForgotPasswordDialogOpen] =
    useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const {
    register: registerSignUp,
    handleSubmit: handleSignUpSubmit,
    formState: { errors: signUpErrors },
    reset: resetSignUpForm,
  } = useForm({
    resolver: zodResolver(signUpSchema),
  });

  const {
    register: registerSignIn,
    handleSubmit: handleSignInSubmit,
    formState: { errors: signInErrors },
    reset: resetSignInForm,
  } = useForm({
    resolver: zodResolver(signInSchema),
  });

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/");
    }
  }, [user, authLoading, router]);

  // --- NEW useEffect to handle focus/blur for Google popup ---
  useEffect(() => {
    // Only set up listeners if a Google auth flow might be active
    if (!isGoogleAuthFlowActive || typeof window === "undefined") {
      return;
    }

    const handleFocus = () => {
      // This runs when the window regains focus (e.g., popup closes)
      if (isGoogleAuthFlowActive && isLoading) {
        setIsLoading(false); // <--- Reset loading immediately
        setIsGoogleAuthFlowActive(false); // Reset flow active status
        // Optionally provide a message if user is still not logged in
        if (!user && !authLoading) {
          // Check user after auth state determined
          setError("Google sign-in cancelled or failed.");
        }
      }
    };

    // 'visibilitychange' is more robust than 'focus' for detecting tab/window switching
    document.addEventListener("visibilitychange", handleFocus);
    window.addEventListener("focus", handleFocus); // Fallback for some browser/OS behaviors

    return () => {
      document.removeEventListener("visibilitychange", handleFocus);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isGoogleAuthFlowActive, isLoading, user, authLoading]); // Dependencies

  // --- End NEW useEffect ---

  const handleSignUp = async (data: z.infer<typeof signUpSchema>) => {
    setIsLoading(true);
    setError("");
    try {
      await signUp(data.email, data.password, data.name, router);
      resetSignUpForm();
    } catch (err: any) {
      console.error("Sign-up failed:", err);
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (data: z.infer<typeof signInSchema>) => {
    setIsLoading(true);
    setError("");
    try {
      await signIn(data.email, data.password, router);
      resetSignInForm();
    } catch (err: any) {
      console.error("Sign-in failed:", err);
      setError(
        err.message || "Failed to sign in. Please check your credentials."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true); // Start loading immediately
    setError(""); // Clear previous errors
    setIsGoogleAuthFlowActive(true); // <--- Set flow active when initiating

    try {
      await signInWithGoogle(router);
      // If successful, router.push will handle unmounting, resetting state.
      // If it reaches here, auth was successful, so we don't need to explicitly setIsLoading(false) here.
    } catch (err: any) {
      // This catches errors thrown by signInWithGoogle (e.g., 'auth/popup-closed-by-user', timeout)
      console.error("Google sign-in failed:", err);
      setError(err.message || "Failed to sign in with Google.");
    } finally {
      // Ensure this block always resets active state, even if 'isLoading' is reset by focus listener
      setIsGoogleAuthFlowActive(false); // <--- Reset flow active state
      // If auth was successful, isLoading will be reset by router.push
      // If auth failed/cancelled, the focus listener already reset isLoading.
    }
  };

  // handleSendPasswordResetEmail (unchanged)
  const handleSendPasswordResetEmail = async (email: string) => {
    setResetLoading(true);
    setResetError(null);
    setResetSuccess(null);

    if (!email.trim()) {
      setResetError("Please enter your email address.");
      setResetLoading(false);
      return;
    }

    try {
      await sendPasswordReset(email);
      setResetSuccess(
        "If your email address is registered, a password reset link has been sent to it."
      );
    } catch (err: any) {
      console.error("Password reset email send failed:", err);
      setResetError(
        err.message || "Failed to send password reset email. Please try again."
      );
    } finally {
      setResetLoading(false);
    }
  };

  // Reset dialog states when it's opened/closed (unchanged)
  useEffect(() => {
    if (!isForgotPasswordDialogOpen) {
      setResetEmail("");
      setResetLoading(false);
      setResetSuccess(null);
      setResetError(null);
    }
  }, [isForgotPasswordDialogOpen]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2 text-lg">Loading authentication...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold">Welcome to Sokrati</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account or create a new one
          </p>
        </div>

        <div className="flex flex-col justify-center align-center w-full max-w-md text-center">
          <span className="font-bold">Fǎcut în Moldova</span>
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/EuroMoldova.svg/640px-EuroMoldova.svg.png"
            alt="Sokrati Logo"
            className="flex h-10 w-10 mx-auto "
          />
        </div>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">
              Authentication
            </CardTitle>
            <CardDescription className="text-center">
              Choose your preferred sign in method
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4" variant="destructive">
                <AlertTitle>Authentication Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4 pt-4">
                <form
                  onSubmit={handleSignInSubmit(handleSignIn)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <div className="relative">
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="name@example.com"
                        {...registerSignIn("email")}
                      />
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      {signInErrors.email && (
                        <p className="text-sm text-red-500 mt-1">
                          {signInErrors.email.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="********"
                        {...registerSignIn("password")}
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      {signInErrors.password && (
                        <p className="text-sm text-red-500 mt-1">
                          {signInErrors.password.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                  {/* Forgot Password Button */}
                  <Button
                    type="button"
                    variant="link"
                    className="w-full mt-2 text-sm text-muted-foreground"
                    onClick={() => setIsForgotPasswordDialogOpen(true)}
                    disabled={isLoading}
                  >
                    Forgot Password?
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4 pt-4">
                <form
                  onSubmit={handleSignUpSubmit(handleSignUp)}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <div className="relative">
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Your full name"
                        {...registerSignUp("name")}
                      />
                      <UserIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      {signUpErrors.name && (
                        <p className="text-sm text-red-500 mt-1">
                          {signUpErrors.name.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="name@example.com"
                        {...registerSignUp("email")}
                      />
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      {signUpErrors.email && (
                        <p className="text-sm text-red-500 mt-1">
                          {signUpErrors.email.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password"
                        {...registerSignUp("password")}
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      {signUpErrors.password && (
                        <p className="text-sm text-red-500 mt-1">
                          {signUpErrors.password.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-confirm-password">
                      Confirm Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="signup-confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        {...registerSignUp("confirmPassword")}
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      {signUpErrors.confirmPassword && (
                        <p className="text-sm text-red-500 mt-1">
                          {signUpErrors.confirmPassword.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      "Create Account"
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-4 flex items-center justify-center">
              <span className="absolute bg-card px-2 text-sm text-muted-foreground">
                OR
              </span>
              <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border z-[-1]" />
            </div>

            <Button
              variant="outline"
              type="button"
              className="w-full bg-transparent"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Continuing with Google...
                </>
              ) : (
                "Continue with Google"
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Forgot Password Dialog */}
      <ForgotPasswordDialog
        isOpen={isForgotPasswordDialogOpen}
        onClose={() => setIsForgotPasswordDialogOpen(false)}
        email={resetEmail}
        onEmailChange={setResetEmail}
        loading={resetLoading}
        success={resetSuccess}
        error={resetError}
        onSendResetEmailConfirm={handleSendPasswordResetEmail}
      />
    </div>
  );
}
