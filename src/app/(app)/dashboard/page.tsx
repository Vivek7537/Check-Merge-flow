"use client";

import { useAuth } from "@/context/AuthContext";
import TeamLeaderView from "@/components/app/dashboard/TeamLeaderView";
import EditorView from "@/components/app/dashboard/EditorView";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold font-headline tracking-tight">
          {user.role === "Team Leader" ? "Team Leader Dashboard" : "My Dashboard"}
        </h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}. Here's what's happening.
        </p>
      </header>
      {user.role === 'Team Leader' ? <TeamLeaderView /> : <EditorView />}
    </div>
  );
}
