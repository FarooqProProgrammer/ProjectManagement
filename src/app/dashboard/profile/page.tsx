"use client";

import { useState, useEffect, useRef } from "react";
import { auth } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getUserByEmail, updateUserProfile, UserProfile } from "@/lib/user";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import {
  User,
  Upload,
  Briefcase,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function ProfilePage() {
  const { workspaces } = useWorkspace();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [displayName, setDisplayName] = useState("");
  const [defaultWorkspaceId, setDefaultWorkspaceId] = useState<string>("none");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!auth.currentUser?.email) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await getUserByEmail(auth.currentUser.email);
        if (profile) {
          setUserProfile(profile);
          setDisplayName(profile.displayName || "");
          setDefaultWorkspaceId(profile.defaultWorkspaceId || "none");
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const currentAvatarUrl = imagePreview || userProfile?.photoURL || null;
  const currentDisplayName =
    displayName || auth.currentUser?.displayName || "User";

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
          throw new Error(
            "You must sign in with Google to upload images to Drive."
          );
        }

        const metadata = {
          name: `avatar_${auth.currentUser.uid}_${Date.now()}_${imageFile.name}`,
          mimeType: imageFile.type,
        };

        const form = new FormData();
        form.append(
          "metadata",
          new Blob([JSON.stringify(metadata)], { type: "application/json" })
        );
        form.append("file", imageFile);

        const res = await fetch(
          "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            body: form,
          }
        );

        if (!res.ok) {
          const errText = await res.text();
          throw new Error("Failed to upload to Google Drive: " + errText);
        }

        const data = await res.json();
        const fileId = data.id;

        // Make the file publicly accessible
        await fetch(
          `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              type: "anyone",
              role: "reader",
            }),
          }
        );

        photoURL = data.webContentLink || data.webViewLink || "";
      }

      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: displayName || null,
        photoURL: photoURL || null,
      });

      // Update Firestore user document
      const updates: Partial<UserProfile> = {
        displayName,
        photoURL: photoURL || null,
        defaultWorkspaceId: defaultWorkspaceId !== "none" ? defaultWorkspaceId : "",
      };

      await updateUserProfile(auth.currentUser.uid, updates);

      setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
      setSuccess("Profile updated successfully!");
      setImageFile(null);
      setImagePreview(null);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile.";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <title>Profile Settings | Projectify</title>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
          My Profile
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Manage your personal settings and preferences.
        </p>
      </div>

      {/* Identity Summary Card */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardContent className="pt-6">
          <div className="flex items-center gap-5">
            {isLoading ? (
              <>
                <Skeleton className="size-16 rounded-full shrink-0" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </>
            ) : (
              <>
                <Avatar className="size-16 shrink-0">
                  <AvatarImage
                    src={currentAvatarUrl ?? undefined}
                    alt={currentDisplayName}
                  />
                  <AvatarFallback className="text-lg bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                    {getInitials(currentDisplayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col gap-1">
                  <p className="text-lg font-semibold text-slate-900 dark:text-white leading-tight">
                    {currentDisplayName}
                  </p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {auth.currentUser?.email || ""}
                  </p>
                  <Badge
                    variant="secondary"
                    className="w-fit mt-1 capitalize"
                  >
                    {(userProfile as (UserProfile & { role?: string }) | null)?.role || "Member"}
                  </Badge>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      <form onSubmit={handleSave} className="flex flex-col gap-6">
        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300">
            <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Profile Info Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-base">
              <User className="size-4 text-blue-500" />
              Profile Info
            </CardTitle>
            <CardDescription>Update your name and email details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {isLoading ? (
              <>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    value={auth.currentUser?.email || ""}
                    disabled
                    className="bg-slate-100 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-500 cursor-not-allowed"
                  />
                  <p className="text-xs text-slate-500">
                    Email addresses cannot be changed.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="displayName"
                    className="text-slate-700 dark:text-slate-300"
                  >
                    Display Name
                  </Label>
                  <Input
                    id="displayName"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Jane Doe"
                    className="bg-transparent dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Avatar Upload Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-base">
              <Upload className="size-4 text-blue-500" />
              Avatar
            </CardTitle>
            <CardDescription>
              Upload a profile photo from Google Drive.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-4">
                <Skeleton className="size-20 rounded-full shrink-0" />
                <div className="space-y-2">
                  <Skeleton className="h-9 w-32 rounded-md" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                <Avatar className="size-20 shrink-0">
                  <AvatarImage
                    src={currentAvatarUrl ?? undefined}
                    alt={currentDisplayName}
                  />
                  <AvatarFallback className="text-2xl bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400">
                    {getInitials(currentDisplayName)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="size-4" />
                      {imageFile ? "Change Photo" : "Select Photo"}
                    </Button>
                    {imageFile && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  {imageFile ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                      Selected: {imageFile.name}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Uploads are stored via Google Drive. Sign in with Google to
                      enable uploads.
                    </p>
                  )}

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Default Workspace Card */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-base">
              <Briefcase className="size-4 text-blue-500" />
              Default Workspace
            </CardTitle>
            <CardDescription>
              Choose which workspace opens automatically when you sign in.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-10 w-full rounded-md" />
            ) : (
              <div className="space-y-2">
                <Label
                  htmlFor="defaultWorkspace"
                  className="text-slate-700 dark:text-slate-300"
                >
                  Workspace
                </Label>
                <Select
                  value={defaultWorkspaceId}
                  onValueChange={setDefaultWorkspaceId}
                >
                  <SelectTrigger
                    id="defaultWorkspace"
                    className="bg-transparent dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <SelectValue placeholder="Select a default workspace" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <SelectItem value="none">No Default (Last Used)</SelectItem>
                    {workspaces.map((ws) => (
                      <SelectItem key={ws.id} value={ws.id}>
                        {ws.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  This workspace will load automatically when you sign in.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end pb-4">
          <Button
            type="submit"
            disabled={isSaving || isLoading}
            className="bg-blue-600 hover:bg-blue-500 text-white px-8"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
