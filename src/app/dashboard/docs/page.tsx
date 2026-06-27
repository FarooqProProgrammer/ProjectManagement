"use client";

import { useState, useEffect, useCallback } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { auth } from "@/lib/firebase";
import {
  Doc,
  createDoc,
  getWorkspaceDocs,
  updateDocContent,
  deleteDoc as deleteDocEntry,
} from "@/lib/doc";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Edit3,
  Calendar,
  Clock,
  Eye,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(value: any): string {
  if (!value) return "—";
  try {
    const date =
      typeof value.toDate === "function" ? value.toDate() : new Date(value);
    return date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatTime(value: any): string {
  if (!value) return "—";
  try {
    const date =
      typeof value.toDate === "function" ? value.toDate() : new Date(value);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export default function DocsPage() {
  const { activeWorkspace } = useWorkspace();
  const currentUser = auth.currentUser;

  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);

  // Editor state
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [mobileViewOpen, setMobileViewOpen] = useState(false);

  // New doc dialog
  const [newDocOpen, setNewDocOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchDocs = useCallback(async () => {
    if (!activeWorkspace) return;
    setLoading(true);
    try {
      const data = await getWorkspaceDocs(activeWorkspace.id);
      setDocs(data);
    } catch (err) {
      console.error("Error fetching docs:", err);
    } finally {
      setLoading(false);
    }
  }, [activeWorkspace]);

  useEffect(() => {
    fetchDocs();
  }, [fetchDocs]);

  const filteredDocs = docs.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) || d.content.toLowerCase().includes(q)
    );
  });

  function selectDoc(doc: Doc) {
    setSelectedDoc(doc);
    setEditTitle(doc.title);
    setEditContent(doc.content);
    setMobileViewOpen(true);
  }

  async function handleSave() {
    if (!selectedDoc) return;
    setSaving(true);
    try {
      await updateDocContent(selectedDoc.id, {
        title: editTitle,
        content: editContent,
        lastEditedBy: currentUser?.uid,
      });
      setDocs((prev) =>
        prev.map((d) =>
          d.id === selectedDoc.id
            ? { ...d, title: editTitle, content: editContent }
            : d
        )
      );
      setSelectedDoc((prev) =>
        prev ? { ...prev, title: editTitle, content: editContent } : prev
      );
    } catch (err) {
      console.error("Error saving doc:", err);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(doc: Doc) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${doc.title}"? This action cannot be undone.`
    );
    if (!confirmed) return;
    try {
      await deleteDocEntry(doc.id);
      setDocs((prev) => prev.filter((d) => d.id !== doc.id));
      if (selectedDoc?.id === doc.id) {
        setSelectedDoc(null);
        setMobileViewOpen(false);
      }
    } catch (err) {
      console.error("Error deleting doc:", err);
    }
  }

  async function handleCreateDoc() {
    if (!activeWorkspace || !currentUser || !newTitle.trim()) return;
    setCreating(true);
    try {
      const created = await createDoc(
        activeWorkspace.id,
        newTitle.trim(),
        currentUser.uid,
        undefined,
        newContent.trim()
      );
      setDocs((prev) => [created, ...prev]);
      setNewTitle("");
      setNewContent("");
      setNewDocOpen(false);
      selectDoc(created);
    } catch (err) {
      console.error("Error creating doc:", err);
    } finally {
      setCreating(false);
    }
  }

  const DocEditor = () => (
    <div className="flex flex-col h-full gap-4">
      {selectedDoc ? (
        <>
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>Updated {formatDate(selectedDoc.updatedAt)}</span>
              <Clock className="w-3.5 h-3.5 ml-2" />
              <span>{formatTime(selectedDoc.updatedAt)}</span>
            </div>
            <Button
              size="sm"
              onClick={handleSave}
              disabled={saving}
              className="ml-auto"
            >
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>

          <div>
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="Untitled Document"
              className="w-full text-2xl font-bold bg-transparent border-none outline-none focus:ring-0 placeholder:text-muted-foreground/50 text-foreground"
              aria-label="Document title"
            />
          </div>

          <Separator />

          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            placeholder="Start writing your document here..."
            className="flex-1 min-h-[320px] resize-none text-sm leading-relaxed border-none focus-visible:ring-0 bg-transparent p-0"
            aria-label="Document content"
          />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-full py-24 gap-4 text-center">
          <Eye className="w-12 h-12 text-muted-foreground/30" />
          <p className="text-muted-foreground text-sm">
            Select a document to view and edit it here.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full px-4 py-8 flex flex-col gap-6">
      <title>Docs | Projectify</title>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <FileText className="w-7 h-7 text-blue-500" />
            Team Docs
          </h1>
          <p className="text-muted-foreground mt-1">
            Shared knowledge base for your workspace.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Dialog open={newDocOpen} onOpenChange={setNewDocOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Doc
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Document</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 py-2">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="new-doc-title">Title</Label>
                  <Input
                    id="new-doc-title"
                    placeholder="Document title"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    autoFocus
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="new-doc-content">
                    Content{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    id="new-doc-content"
                    placeholder="Start writing..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    rows={5}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setNewDocOpen(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateDoc}
                  disabled={!newTitle.trim() || creating}
                >
                  {creating ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4 items-start">
        {/* Doc List */}
        <div className="flex flex-col gap-2">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="cursor-pointer">
                <CardContent className="p-4 flex flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : filteredDocs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm font-medium">
                {searchQuery
                  ? "No docs match your search."
                  : "No docs yet. Create your first document."}
              </p>
            </div>
          ) : (
            filteredDocs.map((doc) => {
              const isSelected = selectedDoc?.id === doc.id;
              const snippet =
                doc.content.slice(0, 80) + (doc.content.length > 80 ? "…" : "");
              const initials = getInitials(
                currentUser?.uid === doc.authorId
                  ? (currentUser?.displayName ?? currentUser?.email)
                  : doc.authorId
              );

              return (
                <Card
                  key={doc.id}
                  onClick={() => selectDoc(doc)}
                  className={[
                    "cursor-pointer transition-colors group",
                    isSelected
                      ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                      : "hover:border-muted-foreground/30 hover:bg-muted/40",
                  ].join(" ")}
                >
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={[
                            "flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold flex-shrink-0",
                            isSelected
                              ? "bg-blue-500 text-white"
                              : "bg-muted text-muted-foreground",
                          ].join(" ")}
                          title={`Author: ${doc.authorId}`}
                        >
                          {initials}
                        </div>
                        <span className="font-semibold text-sm truncate">
                          {doc.title || "Untitled"}
                        </span>
                      </div>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(doc);
                        }}
                        aria-label="Delete document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    {snippet && (
                      <p className="text-xs text-muted-foreground line-clamp-2 pl-9">
                        {snippet}
                      </p>
                    )}

                    <div className="flex items-center gap-3 pl-9 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(doc.updatedAt ?? doc.createdAt)}
                      </span>
                      {isSelected && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] px-1.5 py-0"
                        >
                          <Edit3 className="w-2.5 h-2.5 mr-1" />
                          Editing
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Right panel — desktop only */}
        <Card className="hidden lg:flex flex-col min-h-[520px] p-6">
          <DocEditor />
        </Card>
      </div>

      {/* Mobile viewer dialog */}
      <Dialog open={mobileViewOpen} onOpenChange={setMobileViewOpen}>
        <DialogContent className="lg:hidden max-w-full sm:max-w-2xl h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="sr-only">Edit Document</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <DocEditor />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
