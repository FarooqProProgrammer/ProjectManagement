"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { WorkspaceProvider } from "@/contexts/WorkspaceContext";

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
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="w-8 h-8 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  return (
    <WorkspaceProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full bg-slate-950 font-sans text-slate-200">
          <AppSidebar />
          <main className="flex-1 overflow-y-auto flex flex-col relative w-full">
            {/* Top navigation / header area for the dashboard content */}
            <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-slate-800 bg-slate-950/80 px-6 backdrop-blur-xl">
              <SidebarTrigger className="text-slate-400 hover:text-white" />
              <div className="flex-1"></div>
              {/* Can add search or notifications here */}
            </header>
            
            <div className="p-6 md:p-8 flex-1">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </WorkspaceProvider>
  );
}
