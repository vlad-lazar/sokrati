"use client";
import { MessageBox } from "../components/message-box";
import ProtectedRoute from "../components/protected-route";
import { ModeToggle } from "../components/theme-switcher";
import UserAvatar from "../components/userAvatar";
import WelcomeCard from "../components/welcome-card";

export default function Home() {
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
              onSend={() => {}}
              characterLimit={200}
              placeholder="What are you philosophising today?"
            />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
