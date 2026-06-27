"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Bell, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <Skeleton className="h-10 w-10 rounded-full" />
        <Skeleton className="h-4 w-40 rounded" />
        <p className="text-sm text-muted-foreground">Loading your workspace…</p>
      </div>
    );
  }

  return (
    <WorkspaceProvider>
      <SidebarProvider>
        <div
          className={cn(
            "flex min-h-screen w-full font-sans",
            "text-foreground"
          )}
        >
          <AppSidebar />
          <main className="flex flex-1 flex-col overflow-y-auto relative w-full bg-muted/20">
            <header
              className={cn(
                "sticky top-0 z-10 flex h-16 items-center gap-4",
                "border-b border-border",
                "bg-background/80 backdrop-blur",
                "px-6"
              )}
            >
              <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

              <div className="flex-1" />

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" aria-label="Search">
                  <Search className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" aria-label="Notifications">
                  <Bell className="h-5 w-5" />
                </Button>
              </div>
            </header>

            <div className="p-6 md:p-8 flex-1">{children}</div>
          </main>
        </div>
      </SidebarProvider>
    </WorkspaceProvider>
  );
}
