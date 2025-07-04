"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation"; // Import useRouter from next/navigation
import { signOut } from "firebase/auth"; // Import signOut from Firebase
import { auth } from "@/lib/firebase"; // Import your Firebase auth instance

const UserAvatar = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      router.push("/login"); // Navigate to the login page
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <div className="flex flex-row flex-wrap items-center cursor-pointer">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar>
            <AvatarFallback>VL</AvatarFallback>
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
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserAvatar;
