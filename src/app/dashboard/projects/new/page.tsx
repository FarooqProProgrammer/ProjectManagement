"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { createProject, ProjectStatus } from "@/lib/project";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Image as ImageIcon, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewProjectPage() {
  const router = useRouter();
  const { activeWorkspace } = useWorkspace();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("Planning");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !activeWorkspace) return;

    setIsCreating(true);
    try {
      let imageUrl = "";

      if (imageFile) {
        const accessToken = sessionStorage.getItem("googleAccessToken");
        if (!accessToken) {
          throw new Error("You must sign in with Google to upload images to Drive.");
        }

        const metadata = {
          name: `${activeWorkspace.id}_${Date.now()}_${imageFile.name}`,
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

        imageUrl = data.webContentLink || data.webViewLink || "";
      }

      await createProject(activeWorkspace.id, name, status, description, deadline, imageUrl);
      router.push("/dashboard/projects");
    } catch (error: any) {
      console.error(error);
      alert(error.message);
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full  animate-in fade-in slide-in-from-bottom-4 duration-700">
      <title>New Project | Projectify</title>

      <div>
        <Link href="/dashboard/projects" className="inline-flex items-center text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Projects
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">Create New Project</h1>
        <p className="text-slate-500 dark:text-slate-400">Set up a new project in {activeWorkspace?.name || "your workspace"}.</p>
      </div>

      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white">Project Details</CardTitle>
          <CardDescription className="text-slate-500 dark:text-slate-400">
            .</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-slate-700 dark:text-slate-300">Project Cover Image (Google Drive)</Label>
              <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950/50 rounded-lg p-6 flex flex-col items-center justify-center transition-colors hover:bg-slate-100 dark:hover:bg-slate-950">
                {imageFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-16 h-16 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <span className="text-sm text-slate-700 dark:text-slate-300">{imageFile.name}</span>
                    <button type="button" onClick={() => setImageFile(null)} className="text-xs text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300">Remove</button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" />
                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 text-center">Drag and drop an image, or click to browse</p>
                    <Label className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors cursor-pointer text-sm">
                      Select Image
                      <Input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </Label>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">Project Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Website Redesign"
                  className="bg-transparent dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  autoFocus
                  required
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="status" className="text-slate-700 dark:text-slate-300">Initial Status</Label>
                <Select value={status} onValueChange={(val) => setStatus(val as ProjectStatus)}>
                  <SelectTrigger className="bg-transparent dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-200">
                    <SelectItem value="Planning">Planning</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="deadline" className="text-slate-700 dark:text-slate-300">Deadline (Optional)</Label>
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-transparent dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="space-y-3">
              <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe what this project is about..."
                rows={3}
                className="bg-transparent dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
              <Button
                type="button"
                variant="ghost"
                className="text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={() => router.push("/dashboard/projects")}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isCreating || !name.trim()}
                className="bg-blue-600 hover:bg-blue-500 text-white"
              >
                {isCreating ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
