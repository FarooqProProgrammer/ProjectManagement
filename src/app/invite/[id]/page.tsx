"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getInviteDetails, acceptInvite, WorkspaceInvite } from "@/lib/invite";
import { auth } from "@/lib/firebase";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { ShieldCheck, AlertCircle, Loader2, Link2Off } from "lucide-react";
import Link from "next/link";

export default function InvitePage() {
  const { id } = useParams();
  const router = useRouter();
  const { switchWorkspace } = useWorkspace();
  
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<WorkspaceInvite | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);
  
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchInvite = async () => {
      if (!id || typeof id !== "string") return;
      
      try {
        const details = await getInviteDetails(id);
        if (!details) {
          setError("This invite link is invalid or has been deleted.");
          return;
        }
        
        if (new Date(details.expiresAt) < new Date()) {
          setError("This invite link has expired.");
          return;
        }
        
        setInvite(details);
      } catch (err: any) {
        setError("Failed to load invite details.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvite();
  }, [id]);

  const handleAcceptInvite = async () => {
    if (!id || typeof id !== "string" || !currentUser) {
      router.push("/auth/login?redirect=/invite/" + id);
      return;
    }
    
    setIsAccepting(true);
    try {
      const workspaceId = await acceptInvite(id, currentUser.uid);
      // Switch to the newly joined workspace and redirect to dashboard
      await switchWorkspace(workspaceId);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to accept invite.");
      setIsAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-500">Checking invite link...</p>
      </div>
    );
  }

  if (error || !invite) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <Link2Off className="w-6 h-6 text-red-600 dark:text-red-500" />
            </div>
            <CardTitle className="text-xl">Invalid Invite Link</CardTitle>
            <CardDescription className="text-red-500 mt-2">{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link href="/">
              <Button variant="outline">Return to Home</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-32 h-32 rounded-full bg-purple-500/10 blur-2xl"></div>
        
        <CardHeader className="text-center relative z-10 pt-8">
          <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-6">
            <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
            Workspace Invitation
          </CardTitle>
          <CardDescription className="text-base mt-2 text-slate-600 dark:text-slate-400">
            You have been invited to join a workspace on Projectify as a <span className="font-semibold text-blue-600 dark:text-blue-400 capitalize">{invite.role}</span>.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="relative z-10 pb-8">
          {!currentUser ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6 flex gap-3 text-sm text-yellow-800 dark:text-yellow-500">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>You need to be logged in to accept this invite. If you don't have an account, you can create one first.</p>
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-4 mb-6 text-center text-sm">
              <p className="text-slate-500">You will join as</p>
              <p className="font-medium text-slate-900 dark:text-white">{currentUser.email}</p>
            </div>
          )}

          <Button 
            className="w-full h-11 text-base bg-blue-600 hover:bg-blue-700"
            onClick={handleAcceptInvite}
            disabled={isAccepting}
          >
            {isAccepting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Joining...
              </span>
            ) : !currentUser ? (
              "Sign in to Join"
            ) : (
              "Accept Invite"
            )}
          </Button>
          
          <div className="text-center mt-4">
            <span className="text-xs text-slate-400">
              Link expires on {new Date(invite.expiresAt).toLocaleDateString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
