"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { inviteMemberToWorkspace, updateMemberRole, removeMemberFromWorkspace, WorkspaceRole } from "@/lib/workspace";
import { getUserByEmail, getUsersByIds, UserProfile } from "@/lib/user";
import { auth } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserPlus, Shield, User, Trash2 } from "lucide-react";

export default function WorkspaceSettingsPage() {
  const { activeWorkspace, loading: wsLoading } = useWorkspace();
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<WorkspaceRole>("member");
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  const isAdmin = activeWorkspace?.roles?.[auth.currentUser?.uid || ""] === "admin";

  useEffect(() => {
    const fetchMembers = async () => {
      if (!activeWorkspace) return;
      setLoadingMembers(true);
      try {
        const users = await getUsersByIds(activeWorkspace.members);
        setMembers(users);
      } catch (err) {
        console.error("Error fetching members", err);
      } finally {
        setLoadingMembers(false);
      }
    };
    fetchMembers();
  }, [activeWorkspace?.members]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) return;
    setError("");
    setSuccess("");
    setIsInviting(true);

    try {
      const user = await getUserByEmail(inviteEmail);
      if (!user) {
        throw new Error(`No user found with email ${inviteEmail}. They must sign up for Projectify first.`);
      }
      
      if (activeWorkspace.members.includes(user.uid)) {
        throw new Error(`${user.displayName} is already a member of this workspace.`);
      }

      await inviteMemberToWorkspace(activeWorkspace.id, user.uid, inviteRole);
      setSuccess(`Successfully added ${user.displayName} to the workspace!`);
      setInviteEmail("");
      
      setMembers([...members, user]);
    } catch (err: any) {
      setError(err.message || "Failed to invite user.");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: WorkspaceRole) => {
    if (!activeWorkspace) return;
    try {
      await updateMemberRole(activeWorkspace.id, userId, newRole);
      setSuccess("Role updated successfully! Please refresh context to see changes globally.");
    } catch (err: any) {
      setError("Failed to update role: " + err.message);
    }
  };

  const handleRemoveMember = async (userId: string, name: string) => {
    if (!activeWorkspace) return;
    if (userId === activeWorkspace.ownerId) {
      setError("Cannot remove the workspace owner.");
      return;
    }
    if (!confirm(`Are you sure you want to remove ${name} from the workspace?`)) return;

    try {
      await removeMemberFromWorkspace(activeWorkspace.id, userId);
      setMembers(members.filter(m => m.uid !== userId));
      setSuccess(`${name} has been removed.`);
    } catch (err: any) {
      setError("Failed to remove member: " + err.message);
    }
  };

  if (wsLoading) {
    return <div className="p-8 text-slate-500">Loading settings...</div>;
  }

  if (!activeWorkspace) {
    return <div className="p-8 text-slate-500">No active workspace selected.</div>;
  }

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <title>Workspace Settings | Projectify</title>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Workspace Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Manage members and roles for {activeWorkspace.name}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Column: Invite */}
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 backdrop-blur-xl">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-500" />
                Invite Member
              </CardTitle>
              <CardDescription>Add someone to this workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              {!isAdmin ? (
                <div className="text-sm text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  Only Workspace Admins can invite new members.
                </div>
              ) : (
                <form onSubmit={handleInvite} className="space-y-4">
                  {error && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</div>}
                  {success && <div className="text-sm text-green-500 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">{success}</div>}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                    <Input
                      type="email"
                      required
                      placeholder="teammate@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className="bg-slate-50 dark:bg-slate-950"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                    <Select value={inviteRole} onValueChange={(val) => setInviteRole(val as WorkspaceRole)}>
                      <SelectTrigger className="bg-slate-50 dark:bg-slate-950">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="viewer">Viewer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" disabled={isInviting} className="w-full bg-blue-600 hover:bg-blue-700">
                    {isInviting ? "Inviting..." : "Send Invite"}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Members List */}
        <div className="md:col-span-2">
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 backdrop-blur-xl h-full">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-500" />
                Workspace Members
              </CardTitle>
              <CardDescription>{members.length} member(s) in this workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingMembers ? (
                <div className="text-sm text-slate-500">Loading members...</div>
              ) : (
                <div className="space-y-4">
                  {members.map((member) => {
                    const role = activeWorkspace.roles?.[member.uid] || "member";
                    const isOwner = member.uid === activeWorkspace.ownerId;
                    
                    return (
                      <div key={member.uid} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                        <div className="flex items-center gap-3">
                          {member.photoURL ? (
                            <img src={member.photoURL} alt={member.displayName} className="w-10 h-10 rounded-full bg-slate-200 object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                              {member.displayName.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white flex items-center gap-2">
                              {member.displayName}
                              {isOwner && <span className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 px-2 py-0.5 rounded-full">Owner</span>}
                            </p>
                            <p className="text-xs text-slate-500">{member.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Select
                            disabled={!isAdmin || isOwner || member.uid === auth.currentUser?.uid}
                            value={role}
                            onValueChange={(val) => handleRoleChange(member.uid, val as WorkspaceRole)}
                          >
                            <SelectTrigger className="w-[110px] bg-white dark:bg-slate-900">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>

                          {isAdmin && !isOwner && member.uid !== auth.currentUser?.uid && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
                              onClick={() => handleRemoveMember(member.uid, member.displayName)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
