"use client";
import { MessageBox } from "../components/note-box";
import MessageFeed from "../components/notes-feed";
import ProtectedRoute from "../components/protected-route";
import { ModeToggle } from "../components/theme-switcher";
import UserAvatar from "../components/userAvatar";
import WelcomeCard from "../components/welcome-card";
import { useAuth } from "../context/AuthContext";

export default function Home() {
  const authContext = useAuth();
  return (
    <ProtectedRoute>
      <div className="w-full">
        <div className="w-full">
          <div className="flex justify-end w-full p-3 gap-3">
            <ModeToggle /> <UserAvatar />
          </div>
          <div className="flex w-full flex-col gap-15 items-center justify-center">
            <WelcomeCard />
            <MessageBox
              className="w-xl"
              characterLimit={200}
              placeholder="What are you philosophising today?"
            />
          </div>
          <div className="flex w-full flex-col gap-15 items-center justify-center mt-15">
            <MessageFeed />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
