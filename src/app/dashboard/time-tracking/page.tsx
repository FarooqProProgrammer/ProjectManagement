"use client";

import { useState, useEffect, useCallback } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query as fsQuery, where, getDocs, orderBy } from "firebase/firestore";
import { addTimeLog, deleteTimeLog, TimeLog } from "@/lib/time";
import { getTasksByWorkspace, Task } from "@/lib/task";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Clock, Plus, Trash2, Timer, Calendar, TrendingUp, BarChart3 } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeekBounds() {
  const now = new Date();
  const day = now.getDay();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - day);
  startOfWeek.setHours(0, 0, 0, 0);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6);
  endOfWeek.setHours(23, 59, 59, 999);
  return { startOfWeek, endOfWeek };
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function logDate(log: TimeLog): Date {
  if (log.createdAt instanceof Date) return log.createdAt;
  if (typeof log.createdAt === "string") return new Date(log.createdAt);
  if (log.createdAt && typeof log.createdAt.toDate === "function")
    return log.createdAt.toDate();
  return new Date();
}

async function getTimeLogsByUser(userId: string): Promise<TimeLog[]> {
  const q = fsQuery(
    collection(db, "time_logs"),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<TimeLog, "id">),
    createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? new Date().toISOString(),
  })) as TimeLog[];
}

export default function TimeTrackingPage() {
  const { activeWorkspace, loading: wsLoading } = useWorkspace();
  const currentUser = auth.currentUser;

  const [logs, setLogs] = useState<TimeLog[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form state
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [logDate_, setLogDate_] = useState(() => new Date().toISOString().split("T")[0]);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchData = useCallback(async () => {
    if (!currentUser || !activeWorkspace) return;
    setLoadingData(true);
    try {
      const [fetchedLogs, fetchedTasks] = await Promise.all([
        getTimeLogsByUser(currentUser.uid),
        getTasksByWorkspace(activeWorkspace.id),
      ]);
      setLogs(fetchedLogs);
      setTasks(fetchedTasks);
    } catch (err) {
      console.error("Error loading time tracking data:", err);
    } finally {
      setLoadingData(false);
    }
  }, [currentUser, activeWorkspace]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Stats ---
  const { startOfWeek, endOfWeek } = getWeekBounds();

  const weekLogs = logs.filter((l) => {
    const d = logDate(l);
    return d >= startOfWeek && d <= endOfWeek;
  });

  const totalHoursWeek = weekLogs.reduce((s, l) => s + (l.hours ?? 0), 0);
  const totalHoursAll = logs.reduce((s, l) => s + (l.hours ?? 0), 0);

  const taskHoursMap: Record<string, number> = {};
  logs.forEach((l) => {
    taskHoursMap[l.taskId] = (taskHoursMap[l.taskId] ?? 0) + l.hours;
  });
  const mostLoggedTaskId = Object.entries(taskHoursMap).sort((a, b) => b[1] - a[1])[0]?.[0];
  const mostLoggedTask = tasks.find((t) => t.id === mostLoggedTaskId);

  // --- Weekly bar data (Sun–Sat) ---
  const weekDayHours: number[] = Array(7).fill(0);
  weekLogs.forEach((l) => {
    const d = logDate(l);
    weekDayHours[d.getDay()] += l.hours ?? 0;
  });
  const maxDayHours = Math.max(...weekDayHours, 1);

  // --- Group logs by date ---
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const grouped: { label: string; items: TimeLog[] }[] = [];
  const todayItems = logs.filter((l) => isSameDay(logDate(l), today));
  const yesterdayItems = logs.filter((l) => isSameDay(logDate(l), yesterday));
  const olderItems = logs.filter(
    (l) => !isSameDay(logDate(l), today) && !isSameDay(logDate(l), yesterday)
  );
  if (todayItems.length) grouped.push({ label: "Today", items: todayItems });
  if (yesterdayItems.length) grouped.push({ label: "Yesterday", items: yesterdayItems });
  if (olderItems.length) grouped.push({ label: "Older", items: olderItems });

  // --- Handlers ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!currentUser) return;
    if (!selectedTaskId) { setFormError("Please select a task."); return; }
    const h = parseFloat(hours);
    if (isNaN(h) || h <= 0) { setFormError("Enter a valid number of hours."); return; }
    if (!description.trim()) { setFormError("Please enter a description."); return; }
    setSubmitting(true);
    try {
      const newLog = await addTimeLog(selectedTaskId, currentUser.uid, h, description.trim());
      setLogs((prev) => [newLog, ...prev]);
      setHours("");
      setDescription("");
      setSelectedTaskId("");
      setLogDate_(new Date().toISOString().split("T")[0]);
    } catch (err) {
      console.error(err);
      setFormError("Failed to log time. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (logId: string) => {
    try {
      setLogs((prev) => prev.filter((l) => l.id !== logId));
      await deleteTimeLog(logId);
    } catch (err) {
      console.error(err);
    }
  };

  const taskName = (taskId: string) =>
    tasks.find((t) => t.id === taskId)?.title ?? "Unknown Task";

  // --- Guard states ---
  if (!currentUser) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Please sign in to use Time Tracking.</p>
      </div>
    );
  }

  if (wsLoading) {
    return (
      <div className="w-full px-4 py-8 flex flex-col gap-6">
        <Skeleton className="h-9 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (!activeWorkspace) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">No workspace selected. Please select or create a workspace.</p>
      </div>
    );
  }

  return (
    <div className="w-full px-4 py-8 flex flex-col gap-6">
      <title>Time Tracking | Projectify</title>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Clock className="w-7 h-7 text-blue-500" />
          Time Tracking
        </h1>
        <p className="text-muted-foreground mt-1">
          Log and review time spent across your workspace tasks.
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <Timer className="w-4 h-4" /> This Week
            </CardDescription>
            <CardTitle className="text-3xl font-bold">
              {totalHoursWeek.toFixed(1)}
              <span className="text-base font-normal text-muted-foreground ml-1">hrs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {weekLogs.length} log{weekLogs.length !== 1 ? "s" : ""} this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4" /> All Time
            </CardDescription>
            <CardTitle className="text-3xl font-bold">
              {totalHoursAll.toFixed(1)}
              <span className="text-base font-normal text-muted-foreground ml-1">hrs</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {logs.length} total log{logs.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4" /> Most Logged Task
            </CardDescription>
            <CardTitle className="text-base font-semibold truncate">
              {mostLoggedTask ? mostLoggedTask.title : "—"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mostLoggedTask && mostLoggedTaskId ? (
              <p className="text-xs text-muted-foreground">
                {(taskHoursMap[mostLoggedTaskId] ?? 0).toFixed(1)} hrs logged
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">No logs yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Log Time Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-500" />
            Log Time
          </CardTitle>
          <CardDescription>Record time spent on a task.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Task selector */}
              <div className="flex flex-col gap-1.5 lg:col-span-2">
                <Label htmlFor="task-select">Task</Label>
                <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                  <SelectTrigger id="task-select">
                    <SelectValue placeholder="Select a task…" />
                  </SelectTrigger>
                  <SelectContent>
                    {tasks.length === 0 ? (
                      <SelectItem value="__none__" disabled>
                        No tasks in workspace
                      </SelectItem>
                    ) : (
                      tasks.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Hours */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="hours-input">Hours</Label>
                <Input
                  id="hours-input"
                  type="number"
                  step="0.5"
                  min="0.5"
                  placeholder="e.g. 1.5"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                />
              </div>

              {/* Date */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="date-input">Date</Label>
                <Input
                  id="date-input"
                  type="date"
                  value={logDate_}
                  onChange={(e) => setLogDate_(e.target.value)}
                />
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="desc-input">Description</Label>
              <Input
                id="desc-input"
                placeholder="What did you work on?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {formError && (
              <p className="text-sm text-destructive">{formError}</p>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={submitting} className="gap-2">
                <Plus className="w-4 h-4" />
                {submitting ? "Logging…" : "Log Time"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Weekly Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Weekly Summary
          </CardTitle>
          <CardDescription>Hours logged per day this week.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-3 h-24">
            {DAYS.map((day, idx) => {
              const h = weekDayHours[idx];
              const pct = Math.round((h / maxDayHours) * 100);
              const isToday = idx === today.getDay();
              return (
                <div key={day} className="flex flex-col items-center gap-1 flex-1">
                  <span className="text-xs text-muted-foreground">{h > 0 ? `${h.toFixed(1)}h` : ""}</span>
                  <div className="w-full flex items-end" style={{ height: "60px" }}>
                    <div
                      className={`w-full rounded-t transition-all ${isToday ? "bg-blue-500" : "bg-blue-200 dark:bg-blue-900"}`}
                      style={{ height: `${Math.max(pct, h > 0 ? 8 : 2)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${isToday ? "text-blue-600 dark:text-blue-400" : "text-muted-foreground"}`}>
                    {day}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Time Log Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Time Logs
          </CardTitle>
          <CardDescription>All time entries logged by you.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loadingData ? (
            <div className="flex flex-col gap-3 p-6">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Clock className="w-12 h-12 text-muted-foreground/30" />
              <p className="text-muted-foreground text-sm font-medium">No time logged yet.</p>
              <p className="text-muted-foreground text-xs">Use the form above to log your first entry.</p>
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[1fr_2fr_3fr_80px_48px] gap-4 px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b">
                <span>Date</span>
                <span>Task</span>
                <span>Description</span>
                <span className="text-right">Hours</span>
                <span />
              </div>

              {grouped.map((group) => (
                <div key={group.label}>
                  {/* Group label */}
                  <div className="flex items-center gap-3 px-6 py-2 bg-muted/40 border-b">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {group.label}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {group.items.reduce((s, l) => s + l.hours, 0).toFixed(1)} hrs
                    </Badge>
                  </div>

                  {group.items.map((log, idx) => {
                    const d = logDate(log);
                    const dateStr = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                    const timeStr = d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
                    const isLast = idx === group.items.length - 1;
                    return (
                      <div
                        key={log.id}
                        className={`flex flex-col sm:grid sm:grid-cols-[1fr_2fr_3fr_80px_48px] gap-2 sm:gap-4 px-6 py-4 items-start sm:items-center hover:bg-muted/30 transition-colors ${!isLast ? "border-b" : ""}`}
                      >
                        {/* Date */}
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{dateStr}</span>
                          <span className="text-xs text-muted-foreground">{timeStr}</span>
                        </div>

                        {/* Task */}
                        <div className="min-w-0">
                          <span className="text-sm font-medium truncate block">{taskName(log.taskId)}</span>
                        </div>

                        {/* Description */}
                        <div className="min-w-0">
                          <span className="text-sm text-muted-foreground truncate block">{log.description || "—"}</span>
                        </div>

                        {/* Hours */}
                        <div className="sm:text-right">
                          <Badge variant="outline" className="text-sm font-semibold tabular-nums">
                            {log.hours.toFixed(1)}h
                          </Badge>
                        </div>

                        {/* Delete */}
                        <div className="sm:flex sm:justify-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(log.id)}
                            aria-label="Delete log"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
