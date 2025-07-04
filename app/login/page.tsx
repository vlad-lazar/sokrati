"use client";

import { useState } from "react";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, Lock, User } from "lucide-react";
import { signIn, signInWithGoogle, signUp } from "@/lib/auth";
import { ModeToggle } from "../components/theme-switcher";

const signUpSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function AuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const {
    register: registerSignUp,
    handleSubmit: handleSignUpSubmit,
    formState: { errors: signUpErrors },
  } = useForm({
    resolver: zodResolver(signUpSchema),
  });

  const {
    register: registerSignIn,
    handleSubmit: handleSignInSubmit,
    formState: { errors: signInErrors },
  } = useForm({
    resolver: zodResolver(signInSchema),
  });

  const handleSignUp = async (data: z.infer<typeof signUpSchema>) => {
    setIsLoading(true);
    setError("");

    try {
      await signUp(data.email, data.password, data.name, router);
      router.push("/welcome");
    } catch (err: any) {
      setError(err.message || "Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (data: z.infer<typeof signInSchema>) => {
    setIsLoading(true);
    setError("");

    try {
      await signIn(data.email, data.password, router);
      router.push("/welcome");
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      await signInWithGoogle(router);
      router.push("/welcome");
    } catch (err: any) {
      setError(err.message || "Failed to sign in with Google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>

      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold">Welcome</h2>
          <p className="mt-2 text-sm">
            Sign in to your account or create a new one
          </p>
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
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="signin" className="space-y-4">
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
                        adornment={<Mail className="h-4 w-4" />}
                        placeholder="Enter your email"
                        {...registerSignIn("email")}
                      />
                      {signInErrors.email && (
                        <p className="text-sm text-red-500">
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
                        adornment={<Lock className="h-4 w-4" />}
                        placeholder="Enter your password"
                        {...registerSignIn("password")}
                      />
                      {signInErrors.password && (
                        <p className="text-sm text-red-500">
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
                </form>
              </TabsContent>

              <TabsContent value="signup" className="space-y-4">
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
                        adornment={<User className="h-4 w-4" />}
                        placeholder="Enter your full name"
                        {...registerSignUp("name")}
                      />
                      {signUpErrors.name && (
                        <p className="text-sm text-red-500">
                          {signUpErrors.name.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Input
                        adornment={<Mail className="h-4 w-4" />}
                        adornmentPlacement="start"
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        {...registerSignUp("email")}
                      />
                      {signUpErrors.email && (
                        <p className="text-sm text-red-500">
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
                        adornment={<Lock className="h-4 w-4" />}
                        placeholder="Create a password"
                        {...registerSignUp("password")}
                      />
                      {signUpErrors.password && (
                        <p className="text-sm text-red-500">
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
                        adornment={<Lock className="h-4 w-4" />}
                        id="signup-confirm-password"
                        type="password"
                        placeholder="Confirm your password"
                        {...registerSignUp("confirmPassword")}
                      />
                      {signUpErrors.confirmPassword && (
                        <p className="text-sm text-red-500">
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

            <div className="relative my-4"></div>

            <Button
              variant="outline"
              type="button"
              className="w-full bg-transparent"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
            >
              Continue with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
