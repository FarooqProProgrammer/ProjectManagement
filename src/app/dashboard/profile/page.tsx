"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getUserByEmail, updateUserProfile, UserProfile } from "@/lib/user";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Image as ImageIcon, Upload } from "lucide-react";

export default function ProfilePage() {
  const { workspaces } = useWorkspace();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [displayName, setDisplayName] = useState("");
  const [defaultWorkspaceId, setDefaultWorkspaceId] = useState<string>("none");
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser?.email) return;
      try {
        const profile = await getUserByEmail(auth.currentUser.email);
        if (profile) {
          setUserProfile(profile);
          setDisplayName(profile.displayName || "");
          setDefaultWorkspaceId(profile.defaultWorkspaceId || "none");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    
    setError("");
    setSuccess("");
    setIsSaving(true);

    try {
      let photoURL = userProfile?.photoURL || "";

      if (imageFile) {
        const accessToken = sessionStorage.getItem("googleAccessToken");
        if (!accessToken) {
          throw new Error("You must sign in with Google to upload images to Drive.");
        }

        const metadata = {
          name: `avatar_${auth.currentUser.uid}_${Date.now()}_${imageFile.name}`,
          mimeType: imageFile.type,
        };

        const form = new FormData();
        form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
        form.append("file", imageFile);

        const res = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: form,
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error("Failed to upload to Google Drive: " + errText);
        }

        const data = await res.json();
        const fileId = data.id;

        // Make the file publicly accessible
        await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "anyone",
            role: "reader"
          }),
        });

        photoURL = data.webContentLink || data.webViewLink || "";
      }

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, { 
        displayName: displayName || null,
        photoURL: photoURL || null
      });

      // Update Firestore user document
      const updates: Partial<UserProfile> = {
        displayName,
        photoURL: photoURL || null,
      };
      
      if (defaultWorkspaceId !== "none") {
        updates.defaultWorkspaceId = defaultWorkspaceId;
      } else {
        updates.defaultWorkspaceId = ""; // Or some empty value
      }

      await updateUserProfile(auth.currentUser.uid, updates);
      
      setUserProfile(prev => prev ? { ...prev, ...updates } : null);
      setSuccess("Profile updated successfully!");
      setImageFile(null); // Clear the file input
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <title>Profile Settings | Projectify</title>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">My Profile</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your personal settings and preferences.</p>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            Profile Details
          </CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">Update your photo, name, and preferences.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            {error && <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">{error}</div>}
            {success && <div className="text-sm text-green-500 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">{success}</div>}
            
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar Upload */}
              <div className="space-y-3 w-full md:w-1/3">
                <Label className="text-slate-700 dark:text-slate-300">Profile Photo</Label>
                <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 rounded-lg p-6 flex flex-col items-center justify-center transition-colors hover:bg-slate-100 dark:hover:bg-slate-950 text-center relative overflow-hidden group">
                  {imageFile || userProfile?.photoURL ? (
                    <div className="flex flex-col items-center gap-2">
                      {imageFile ? (
                        <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden">
                          <ImageIcon className="w-8 h-8" />
                        </div>
                      ) : (
                        <img src={userProfile?.photoURL!} alt="Avatar" className="w-20 h-20 rounded-full object-cover" />
                      )}
                      
                      {imageFile && <span className="text-xs text-slate-500 truncate max-w-[120px]">{imageFile.name}</span>}
                      
                      <Label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity">
                        <span className="text-xs font-medium">Change</span>
                        <Input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </Label>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Google Drive Upload</p>
                      <Label className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer text-xs">
                        Select Photo
                        <Input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                      </Label>
                    </>
                  )}
                </div>
              </div>

              {/* Text Fields */}
              <div className="flex-1 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">Email Address</Label>
                  <Input
                    id="email"
                    value={auth.currentUser?.email || ""}
                    disabled
                    className="bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500">Email addresses cannot be changed.</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="displayName" className="text-slate-700 dark:text-slate-300">Display Name</Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Jane Doe"
                    className="bg-transparent dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultWorkspace" className="text-slate-700 dark:text-slate-300">Default Workspace</Label>
                  <Select value={defaultWorkspaceId} onValueChange={setDefaultWorkspaceId}>
                    <SelectTrigger className="bg-transparent dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                      <SelectValue placeholder="Select a default workspace" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                      <SelectItem value="none">No Default (Last Used)</SelectItem>
                      {workspaces.map((ws) => (
                        <SelectItem key={ws.id} value={ws.id}>{ws.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">This workspace will load automatically when you sign in.</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <Button
                type="submit"
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-500 text-white px-8"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
