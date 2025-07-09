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
  signInWithGoogle,
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
  const router = useRouter();
  const { loading: authLoading, user } = useAuth();

  // --- States for ForgotPasswordDialog ---
  const [isForgotPasswordDialogOpen, setIsForgotPasswordDialogOpen] =
    useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  // --- End States for ForgotPasswordDialog ---

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
    setIsLoading(true);
    setError("");
    try {
      await signInWithGoogle(router);
    } catch (err: any) {
      console.error("Google sign-in failed:", err);
      setError(
        err.message || "Failed to sign in with Google. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // --- New handler for sending password reset email (now manages its own state) ---
  const handleSendPasswordResetEmail = async (email: string) => {
    setResetLoading(true);
    setResetError(null); // Clear previous errors
    setResetSuccess(null); // Clear previous success messages

    if (!email.trim()) {
      setResetError("Please enter your email address.");
      setResetLoading(false);
      return;
    }

    try {
      await sendPasswordReset(email); // Call the auth utility function
      setResetSuccess(
        "If your email address is registered, a password reset link has been sent to it."
      );
      // Optionally, you can automatically close the dialog after a few seconds
      // setTimeout(() => setIsForgotPasswordDialogOpen(false), 3000);
    } catch (err: any) {
      console.error("Password reset email send failed:", err);
      setResetError(
        err.message || "Failed to send password reset email. Please try again."
      );
    } finally {
      setResetLoading(false);
    }
  };
  // --- End new handler ---

  // Reset dialog states when it's opened/closed
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
                    {/* Forgot Password Button */}
                    <Button
                      variant="link"
                      type="button"
                      className="w-full mt-2 text-sm text-muted-foreground"
                      onClick={() => setIsForgotPasswordDialogOpen(true)}
                      disabled={isLoading}
                    >
                      Forgot Password?
                    </Button>
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
        email={resetEmail} // Pass email state
        onEmailChange={setResetEmail} // Pass email setter
        loading={resetLoading} // Pass loading state
        success={resetSuccess} // Pass success state
        error={resetError} // Pass error state
        onSendResetEmailConfirm={handleSendPasswordResetEmail} // Pass send callback
      />
    </div>
  );
}
