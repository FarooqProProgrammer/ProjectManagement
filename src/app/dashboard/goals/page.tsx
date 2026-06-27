"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  Goal,
  createGoal,
  getWorkspaceGoals,
  updateGoalProgress,
  deleteGoal,
} from "@/lib/goal";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Target,
  Plus,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Building2,
  Users,
  User,
} from "lucide-react";

function getStatusBadgeClass(status: Goal["status"]): string {
  switch (status) {
    case "On Track":
      return "bg-green-100 text-green-700 border-green-200";
    case "At Risk":
      return "bg-amber-100 text-amber-700 border-amber-200";
    case "Completed":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "Off Track":
      return "bg-red-100 text-red-700 border-red-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function getTypeBadgeClass(type: Goal["type"]): string {
  switch (type) {
    case "company":
      return "bg-purple-100 text-purple-700 border-purple-200";
    case "team":
      return "bg-blue-100 text-blue-700 border-blue-200";
    case "personal":
      return "bg-slate-100 text-slate-700 border-slate-200";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200";
  }
}

function TypeIcon({ type }: { type: Goal["type"] }) {
  if (type === "company") return <Building2 className="w-3 h-3" />;
  if (type === "team") return <Users className="w-3 h-3" />;
  return <User className="w-3 h-3" />;
}

function GoalCard({
  goal,
  onProgressChange,
  onDelete,
}: {
  goal: Goal;
  onProgressChange: (id: string, value: number) => void;
  onDelete: (id: string) => void;
}) {
  const [localProgress, setLocalProgress] = useState(goal.progress);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalProgress(goal.progress);
  }, [goal.progress]);

  async function handleProgressBlur() {
    if (localProgress === goal.progress) return;
    setSaving(true);
    await onProgressChange(goal.id, localProgress);
    setSaving(false);
  }

  return (
    <Card className="flex flex-col gap-0 overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base leading-snug">{goal.title}</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-red-600"
            onClick={() => onDelete(goal.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 flex-wrap mt-1">
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${getTypeBadgeClass(goal.type)}`}
          >
            <TypeIcon type={goal.type} />
            {goal.type.charAt(0).toUpperCase() + goal.type.slice(1)}
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusBadgeClass(goal.status)}`}
          >
            {goal.status}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {goal.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {goal.description}
          </p>
        )}
        <div className="text-xs text-muted-foreground">
          Target:{" "}
          <span className="font-medium text-foreground">
            {goal.targetDate
              ? new Date(goal.targetDate).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "—"}
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} className="h-2" />
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor={`progress-${goal.id}`} className="text-xs shrink-0">
            Update %
          </Label>
          <Input
            id={`progress-${goal.id}`}
            type="number"
            min={0}
            max={100}
            value={localProgress}
            onChange={(e) =>
              setLocalProgress(Math.min(100, Math.max(0, Number(e.target.value))))
            }
            onBlur={handleProgressBlur}
            className="h-7 text-xs w-20"
            disabled={saving}
          />
          {saving && (
            <span className="text-xs text-muted-foreground">Saving…</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function GoalSection({
  title,
  goals,
  icon,
  onProgressChange,
  onDelete,
}: {
  title: string;
  goals: Goal[];
  icon: React.ReactNode;
  onProgressChange: (id: string, value: number) => void;
  onDelete: (id: string) => void;
}) {
  if (goals.length === 0) return null;
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {icon}
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-sm text-muted-foreground">({goals.length})</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => (
          <GoalCard
            key={goal.id}
            goal={goal}
            onProgressChange={onProgressChange}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}

export default function GoalsPage() {
  const { activeWorkspace, loading: workspaceLoading } = useWorkspace();
  const user = auth.currentUser;

  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState<Goal["type"]>("company");
  const [newTargetDate, setNewTargetDate] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!activeWorkspace) {
      setLoading(false);
      return;
    }
    setLoading(true);
    getWorkspaceGoals(activeWorkspace.id)
      .then((data) => setGoals(data))
      .finally(() => setLoading(false));
  }, [activeWorkspace]);

  async function handleCreate() {
    if (!newTitle.trim() || !newTargetDate || !activeWorkspace || !user) return;
    setCreating(true);
    try {
      const created = await createGoal(
        activeWorkspace.id,
        newTitle.trim(),
        newType,
        user.uid,
        newTargetDate,
        newDescription.trim() || undefined
      );
      setGoals((prev) => [created, ...prev]);
      setNewTitle("");
      setNewDescription("");
      setNewType("company");
      setNewTargetDate("");
      setDialogOpen(false);
    } finally {
      setCreating(false);
    }
  }

  async function handleProgressChange(id: string, value: number) {
    await updateGoalProgress(id, value);
    setGoals((prev) =>
      prev.map((g) => {
        if (g.id !== id) return g;
        const progress = Math.min(100, Math.max(0, value));
        let status: Goal["status"] = "Off Track";
        if (progress >= 100) status = "Completed";
        else if (progress >= 70) status = "On Track";
        else if (progress >= 40) status = "At Risk";
        return { ...g, progress, status };
      })
    );
  }

  async function handleDelete(id: string) {
    await deleteGoal(id);
    setGoals((prev) => prev.filter((g) => g.id !== id));
  }

  const onTrackCount = goals.filter((g) => g.status === "On Track").length;
  const atRiskCount = goals.filter((g) => g.status === "At Risk").length;
  const completedCount = goals.filter((g) => g.status === "Completed").length;
  const totalCount = goals.length;

  const companyGoals = goals.filter((g) => g.type === "company");
  const teamGoals = goals.filter((g) => g.type === "team");
  const personalGoals = goals.filter((g) => g.type === "personal");

  if (!workspaceLoading && !activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
        <Target className="w-12 h-12 opacity-30" />
        <p className="text-lg font-medium">No workspace selected</p>
        <p className="text-sm">Select or create a workspace to manage goals.</p>
      </div>
    );
  }

  return (
    <>
      <title>Goals | Projectify</title>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Goals</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Track OKRs and key results across your workspace
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="goal-title">Title</Label>
                  <Input
                    id="goal-title"
                    placeholder="e.g. Increase user retention by 20%"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="goal-description">Description</Label>
                  <Textarea
                    id="goal-description"
                    placeholder="Optional description or key results…"
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="goal-type">Type</Label>
                  <Select
                    value={newType}
                    onValueChange={(v) => setNewType(v as Goal["type"])}
                  >
                    <SelectTrigger id="goal-type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="company">Company</SelectItem>
                      <SelectItem value="team">Team</SelectItem>
                      <SelectItem value="personal">Personal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="goal-date">Target Date</Label>
                  <Input
                    id="goal-date"
                    type="date"
                    value={newTargetDate}
                    onChange={(e) => setNewTargetDate(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={creating || !newTitle.trim() || !newTargetDate}
                >
                  {creating ? "Creating…" : "Create Goal"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  {loading ? (
                    <Skeleton className="h-6 w-8" />
                  ) : (
                    <p className="text-2xl font-bold">{onTrackCount}</p>
                  )}
                  <p className="text-xs text-muted-foreground">On Track</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-100">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  {loading ? (
                    <Skeleton className="h-6 w-8" />
                  ) : (
                    <p className="text-2xl font-bold">{atRiskCount}</p>
                  )}
                  <p className="text-xs text-muted-foreground">At Risk</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  {loading ? (
                    <Skeleton className="h-6 w-8" />
                  ) : (
                    <p className="text-2xl font-bold">{completedCount}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-100">
                  <Target className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  {loading ? (
                    <Skeleton className="h-6 w-8" />
                  ) : (
                    <p className="text-2xl font-bold">{totalCount}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Total Goals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Goal sections */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2 mt-1" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : totalCount === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
            <Target className="w-12 h-12 opacity-30" />
            <p className="text-lg font-medium">No goals yet</p>
            <p className="text-sm">
              Create your first goal to start tracking OKRs.
            </p>
            <Button
              variant="outline"
              className="mt-2 gap-2"
              onClick={() => setDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              New Goal
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            <GoalSection
              title="Company Goals"
              goals={companyGoals}
              icon={<Building2 className="w-5 h-5 text-purple-600" />}
              onProgressChange={handleProgressChange}
              onDelete={handleDelete}
            />
            <GoalSection
              title="Team Goals"
              goals={teamGoals}
              icon={<Users className="w-5 h-5 text-blue-600" />}
              onProgressChange={handleProgressChange}
              onDelete={handleDelete}
            />
            <GoalSection
              title="Personal Goals"
              goals={personalGoals}
              icon={<User className="w-5 h-5 text-slate-600" />}
              onProgressChange={handleProgressChange}
              onDelete={handleDelete}
            />
          </div>
        )}
      </div>
    </>
  );
}
