// src/components/forgot-password-dialog.tsx
"use client";

import React from "react"; // React is implicitly imported by Next.js in client components, but good practice to explicitly import
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ForgotPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // State values
  email: string; // Passed from parent
  loading: boolean; // Passed from parent
  success: string | null; // Passed from parent
  error: string | null; // Passed from parent
  // Event handlers
  onEmailChange: (email: string) => void; // Callback to update email in parent
  onSendResetEmailConfirm: (email: string) => void; // Callback when user confirms sending reset email
}

export default function ForgotPasswordDialog({
  isOpen,
  onClose,
  email,
  loading,
  success,
  error,
  onEmailChange,
  onSendResetEmailConfirm,
}: ForgotPasswordDialogProps) {
  // No internal state for email, loading, success, error.
  // The React.useEffect for resetting state on isOpen is also no longer needed here,
  // as the parent will manage the state lifecycle for the dialog's content.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation is done locally before notifying parent
    if (!email.trim()) {
      // The parent would usually handle setting the error state,
      // but for immediate input validation feedback, this can be done locally temporarily.
      // However, since `error` is controlled by the parent, we must call a parent handler.
      // For this pattern, it's often cleaner for the parent's `onSendResetEmailConfirm`
      // to handle *all* validation errors and set the `error` prop it passes down.
      // For now, let's assume parent will set error if email is empty.
      return;
    }
    // Call the parent's callback with the current email
    onSendResetEmailConfirm(email);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Forgot Password?</DialogTitle>
          <DialogDescription>
            Enter your email address and we'll send you a link to reset your
            password.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)} // Call parent's callback
                required
                disabled={loading}
              />
            </div>
            {/* Display success/error messages passed from parent */}
            {success && (
              <Alert className="mt-2">
                <AlertDescription className="text-green-500">
                  {success}
                </AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
