"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Bell, Shield, Key, Briefcase } from "lucide-react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";

export default function SettingsPage() {
  const { activeWorkspace, renameActiveWorkspace, removeActiveWorkspace } = useWorkspace();
  const [activeTab, setActiveTab] = useState("profile");
  
  // Workspace specific state
  const [workspaceName, setWorkspaceName] = useState("");
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (activeWorkspace) {
      setWorkspaceName(activeWorkspace.name);
    }
  }, [activeWorkspace]);

  const handleRename = async () => {
    if (!workspaceName.trim() || workspaceName === activeWorkspace?.name) return;
    setIsRenaming(true);
    try {
      await renameActiveWorkspace(workspaceName);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this workspace? This action cannot be undone.")) return;
    setIsDeleting(true);
    try {
      await removeActiveWorkspace();
    } catch (e) {
      console.error(e);
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <title>Settings | Projectify</title>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Settings</h1>
        <p className="text-slate-400">Manage your account preferences and application settings.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-left transition-colors ${activeTab === 'profile' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <User className="w-5 h-5" />
            Profile Settings
          </button>
          <button 
            onClick={() => setActiveTab('workspace')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-left transition-colors ${activeTab === 'workspace' ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
          >
            <Briefcase className="w-5 h-5" />
            Workspace
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 font-medium hover:bg-white/5 hover:text-white text-left transition-colors">
            <Bell className="w-5 h-5" />
            Notifications
          </button>
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 font-medium hover:bg-white/5 hover:text-white text-left transition-colors">
            <Shield className="w-5 h-5" />
            Security
          </button>
        </div>

        <div className="col-span-2 space-y-6">
          {activeTab === 'profile' && (
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Profile Information</CardTitle>
                <CardDescription className="text-slate-400">Update your personal details and public profile.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Display Name</label>
                  <input 
                    type="text" 
                    disabled
                    value={auth.currentUser?.displayName || ""}
                    placeholder="Loading..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-50"
                  />
                  <p className="text-xs text-slate-500">This is the name displayed to other users.</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email Address</label>
                  <input 
                    type="email" 
                    disabled
                    value={auth.currentUser?.email || ""}
                    placeholder="Loading..." 
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800">
                  <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors opacity-50 cursor-not-allowed">
                    Save Changes
                  </button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === 'workspace' && activeWorkspace && (
            <>
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Workspace General</CardTitle>
                  <CardDescription className="text-slate-400">Update your workspace details.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Workspace Name</label>
                    <input 
                      type="text" 
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="pt-4 border-t border-slate-800">
                    <button 
                      onClick={handleRename}
                      disabled={isRenaming || workspaceName === activeWorkspace.name}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      {isRenaming ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-slate-900 border-red-500/20">
                <CardHeader>
                  <CardTitle className="text-red-400 flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription className="text-slate-400">Irreversible actions for this workspace.</CardDescription>
                </CardHeader>
                <CardContent>
                  <button 
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="border border-red-500/50 text-red-400 hover:bg-red-500/10 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? "Deleting..." : "Delete Workspace"}
                  </button>
                </CardContent>
              </Card>
            </>
          )}

          {activeTab === 'workspace' && !activeWorkspace && (
            <div className="text-center py-12 text-slate-400">
              No active workspace selected.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
