"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, UserRoundX } from "lucide-react";
import { useRouter } from "next/navigation"; // Import useRouter from next/navigation
import { signOut, deleteUser } from "firebase/auth"; // Import deleteUser from Firebase
import { auth } from "@/lib/firebaseClient";
import { useState } from "react";
import DeleteAccountDialog from "./delete-user-dialog";
import { deleteUserAccount } from "@/lib/auth";
import { useAuth } from "../context/AuthContext";

const UserAvatar = () => {
  const authContext = useAuth(); // Assuming you have an AuthContext to get the current user
  const router = useRouter();
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false); // State for dialog visibility

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      router.push("/login"); // Navigate to the login page
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await deleteUserAccount(router); // Delete the user account
        console.log("User account deleted successfully.");
        router.push("/login"); // Navigate to the signup page after deletion
      } else {
        console.error("No user is currently signed in.");
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
    } finally {
      setDeleteDialogOpen(false); // Close the dialog
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase(); // Return first letter if single name
    }
    return parts[0].charAt(0).toUpperCase() + parts[1].charAt(0).toUpperCase(); // Return initials for first and last name
  };
  return (
    <div className="flex flex-row flex-wrap items-center cursor-pointer">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar>
            <img
              src={authContext.user?.photoURL || "/default-avatar.png"} // Fallback image if no photoURL
              alt="User Avatar"
              className="w-8 h-8 rounded-full"
            ></img>
            <AvatarFallback>
              {getInitials(authContext.user?.displayName ?? "User")}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-fit">
          <DropdownMenuItem
            onClick={handleLogout}
            className="flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteDialogOpen(true)} // Open the delete dialog
            className="flex items-center gap-2 cursor-pointer"
          >
            <UserRoundX className="w-4 h-4 text-red-400" />
            <span className="text-red-400">Delete account</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Account Dialog */}
      <DeleteAccountDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)} // Close the dialog
        onConfirm={handleDeleteAccount} // Confirm deletion
      />
    </div>
  );
};

export default UserAvatar;
