"use client";

import { useEffect, useState, useMemo } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  Sprint,
  createSprint,
  getWorkspaceSprints,
  deleteSprint,
  completeSprint,
} from "@/lib/sprint";
import { getTasksByWorkspace, Task } from "@/lib/task";
import { getWorkspaceProjects, Project } from "@/lib/project";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Zap,
  Plus,
  Calendar,
  CheckCircle2,
  Trash2,
  Target,
  Clock,
  ArrowRight,
} from "lucide-react";

function SprintStatusBadge({ status }: { status: Sprint["status"] }) {
  if (status === "Active") {
    return (
      <Badge className="bg-blue-500/15 text-blue-400 border-blue-500/20 hover:bg-blue-500/20">
        Active
      </Badge>
    );
  }
  if (status === "Completed") {
    return (
      <Badge className="bg-green-500/15 text-green-400 border-green-500/20 hover:bg-green-500/20">
        Completed
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="text-slate-400">
      Planning
    </Badge>
  );
}

function formatDate(dateStr: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export default function SprintsPage() {
  const { activeWorkspace } = useWorkspace();

  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // New sprint dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [sprintName, setSprintName] = useState("");
  const [sprintGoal, setSprintGoal] = useState("");
  const [sprintProjectId, setSprintProjectId] = useState("none");
  const [sprintStartDate, setSprintStartDate] = useState("");
  const [sprintEndDate, setSprintEndDate] = useState("");

  // Delete confirmation state
  const [deletingSprintId, setDeletingSprintId] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Completing state
  const [completingSprintId, setCompletingSprintId] = useState<string | null>(null);

  useEffect(() => {
    if (!activeWorkspace) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedSprints, fetchedTasks, fetchedProjects] = await Promise.all([
          getWorkspaceSprints(activeWorkspace.id),
          getTasksByWorkspace(activeWorkspace.id),
          getWorkspaceProjects(activeWorkspace.id),
        ]);
        setSprints(fetchedSprints);
        setTasks(fetchedTasks);
        setProjects(fetchedProjects);
      } catch (err) {
        console.error("Error fetching sprints data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeWorkspace]);

  const projectMap = useMemo(() => {
    const map = new Map<string, Project>();
    projects.forEach((p) => map.set(p.id, p));
    return map;
  }, [projects]);

  const taskMap = useMemo(() => {
    const map = new Map<string, Task>();
    tasks.forEach((t) => map.set(t.id, t));
    return map;
  }, [tasks]);

  function getSprintProgress(sprint: Sprint) {
    const total = sprint.taskIds.length;
    if (total === 0) return { total: 0, completed: 0, percent: 0 };
    const completed = sprint.taskIds.filter((id) => {
      const t = taskMap.get(id);
      return t && t.status === "Done";
    }).length;
    return { total, completed, percent: Math.round((completed / total) * 100) };
  }

  const handleCreateSprint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !sprintName.trim() || !sprintStartDate || !sprintEndDate) return;

    setIsCreating(true);
    try {
      const projectId = sprintProjectId === "none" ? "" : sprintProjectId;
      const newSprint = await createSprint(
        activeWorkspace.id,
        projectId,
        sprintName.trim(),
        sprintStartDate,
        sprintEndDate,
        sprintGoal.trim() || undefined
      );
      setSprints((prev) => [newSprint, ...prev]);
      setIsDialogOpen(false);
      setSprintName("");
      setSprintGoal("");
      setSprintProjectId("none");
      setSprintStartDate("");
      setSprintEndDate("");
    } catch (err) {
      console.error("Error creating sprint:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteSprint = async () => {
    if (!deletingSprintId) return;
    setIsDeleting(true);
    try {
      await deleteSprint(deletingSprintId);
      setSprints((prev) => prev.filter((s) => s.id !== deletingSprintId));
    } catch (err) {
      console.error("Error deleting sprint:", err);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeletingSprintId(null);
    }
  };

  const handleCompleteSprint = async (sprintId: string) => {
    setCompletingSprintId(sprintId);
    try {
      await completeSprint(sprintId);
      setSprints((prev) =>
        prev.map((s) => (s.id === sprintId ? { ...s, status: "Completed" } : s))
      );
    } catch (err) {
      console.error("Error completing sprint:", err);
    } finally {
      setCompletingSprintId(null);
    }
  };

  if (!activeWorkspace) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Please select a workspace to view sprints.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <title>Sprints | Projectify</title>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">Sprints</h1>
          <p className="text-muted-foreground">
            Plan and track sprint milestones across your projects.
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4 mr-2" />
              New Sprint
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Sprint</DialogTitle>
              <DialogDescription>
                Define a sprint to plan and track a focused iteration of work.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSprint} className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="sprint-name">Sprint Name</Label>
                <Input
                  id="sprint-name"
                  value={sprintName}
                  onChange={(e) => setSprintName(e.target.value)}
                  placeholder="e.g. Sprint 1 — MVP Launch"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sprint-goal">Goal (Optional)</Label>
                <Textarea
                  id="sprint-goal"
                  value={sprintGoal}
                  onChange={(e) => setSprintGoal(e.target.value)}
                  placeholder="What should this sprint achieve?"
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sprint-project">Project</Label>
                <Select value={sprintProjectId} onValueChange={setSprintProjectId}>
                  <SelectTrigger id="sprint-project">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48">
                    <SelectItem value="none">No specific project</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="sprint-start">Start Date</Label>
                  <Input
                    id="sprint-start"
                    type="date"
                    value={sprintStartDate}
                    onChange={(e) => setSprintStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sprint-end">End Date</Label>
                  <Input
                    id="sprint-end"
                    type="date"
                    value={sprintEndDate}
                    onChange={(e) => setSprintEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <DialogFooter className="pt-2 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isCreating ||
                    !sprintName.trim() ||
                    !sprintStartDate ||
                    !sprintEndDate
                  }
                  className="bg-blue-600 hover:bg-blue-500 text-white"
                >
                  {isCreating ? "Creating..." : "Create Sprint"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Separator />

      {/* Sprint List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <Card key={i} className="border-border bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-28 mt-1" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : sprints.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center">
            <Zap className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-1">No sprints yet</h2>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              Create your first sprint to start planning focused iterations of work for your team.
            </p>
          </div>
          <Button
            onClick={() => setIsDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white mt-2"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create First Sprint
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {sprints.map((sprint) => {
            const { total, completed, percent } = getSprintProgress(sprint);
            const project = sprint.projectId ? projectMap.get(sprint.projectId) : null;
            const isCompleting = completingSprintId === sprint.id;

            return (
              <Card
                key={sprint.id}
                className="border-border bg-card hover:border-blue-400/40 transition-all shadow-sm hover:shadow-md group"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base font-semibold text-foreground leading-snug">
                      {sprint.name}
                    </CardTitle>
                    <SprintStatusBadge status={sprint.status} />
                  </div>

                  {/* Date range */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>{formatDate(sprint.startDate)}</span>
                    <ArrowRight className="w-3 h-3 shrink-0" />
                    <span>{formatDate(sprint.endDate)}</span>
                  </div>

                  {/* Project label */}
                  {project && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <div
                        className={`w-2 h-2 rounded-full shrink-0 ${project.color || "bg-slate-500"}`}
                      />
                      <span className="text-xs text-muted-foreground truncate">
                        {project.name}
                      </span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Goal */}
                  {sprint.goal && (
                    <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
                      <Target className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {sprint.goal}
                      </p>
                    </div>
                  )}

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {completed}/{total} tasks
                        </span>
                      </div>
                      <span className="font-semibold text-foreground tabular-nums">
                        {percent}%
                      </span>
                    </div>
                    <Progress
                      value={percent}
                      className="h-1.5"
                    />
                  </div>

                  {total === 0 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      No tasks assigned to this sprint yet.
                    </p>
                  )}

                  <Separator />

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    {sprint.status === "Active" ? (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-green-500/40 text-green-400 hover:bg-green-500/10 hover:border-green-500/60 text-xs"
                        onClick={() => handleCompleteSprint(sprint.id)}
                        disabled={isCompleting}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                        {isCompleting ? "Completing..." : "Complete Sprint"}
                      </Button>
                    ) : (
                      <div />
                    )}

                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 ml-auto"
                      onClick={() => {
                        setDeletingSprintId(sprint.id);
                        setIsDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Sprint</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this sprint? This action cannot be undone. Tasks
              assigned to this sprint will not be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="pt-2">
            <Button
              variant="ghost"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setDeletingSprintId(null);
              }}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSprint}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Sprint"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
