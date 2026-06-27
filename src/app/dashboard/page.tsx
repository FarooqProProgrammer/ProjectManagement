"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getWorkspaceProjects, Project } from "@/lib/project";
import { getTasksByWorkspace, Task } from "@/lib/task";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Activity,
  CheckCircle2,
  Clock,
  ListTodo,
  CalendarDays,
  BarChart3,
  AlertTriangle,
  Layers,
} from "lucide-react";

function StatCardSkeleton() {
  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 mb-1" />
        <Skeleton className="h-3 w-24" />
      </CardContent>
    </Card>
  );
}

function DistributionSkeleton() {
  return (
    <div className="space-y-5">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-10 rounded-full" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

function DeadlineSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function getDueDateVariant(
  dueDateStr: string
): "destructive" | "secondary" | "outline" {
  const due = new Date(dueDateStr);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return "destructive";
  if (diffDays <= 2) return "destructive";
  if (diffDays <= 7) return "secondary";
  return "outline";
}

function formatDueDate(dueDateStr: string): string {
  const due = new Date(dueDateStr);
  const now = new Date();
  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `${Math.abs(diffDays)}d overdue`;
  if (diffDays === 0) return "Due today";
  if (diffDays === 1) return "Due tomorrow";
  return `Due ${due.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
}

const STATUS_CONFIG: Record<
  string,
  { color: string; dotColor: string; indicatorClass: string }
> = {
  "To Do": {
    color: "bg-slate-200 dark:bg-slate-700",
    dotColor: "bg-slate-400",
    indicatorClass: "bg-slate-500",
  },
  "In Progress": {
    color: "bg-violet-100 dark:bg-violet-900/30",
    dotColor: "bg-violet-500",
    indicatorClass: "bg-violet-500",
  },
  Review: {
    color: "bg-blue-100 dark:bg-blue-900/30",
    dotColor: "bg-blue-500",
    indicatorClass: "bg-blue-500",
  },
  Done: {
    color: "bg-emerald-100 dark:bg-emerald-900/30",
    dotColor: "bg-emerald-500",
    indicatorClass: "bg-emerald-500",
  },
};

const PRIORITY_CONFIG: Record<
  string,
  { label: string; barClass: string; bgClass: string; textClass: string }
> = {
  High: {
    label: "High",
    barClass: "bg-red-500",
    bgClass: "bg-red-50 dark:bg-red-950/30",
    textClass: "text-red-600 dark:text-red-400",
  },
  Medium: {
    label: "Medium",
    barClass: "bg-amber-500",
    bgClass: "bg-amber-50 dark:bg-amber-950/30",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  Low: {
    label: "Low",
    barClass: "bg-slate-400",
    bgClass: "bg-slate-50 dark:bg-slate-800/50",
    textClass: "text-slate-500 dark:text-slate-400",
  },
};

export default function DashboardOverview() {
  const [user, setUser] = useState<User | null>(null);
  const { activeWorkspace } = useWorkspace();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!activeWorkspace) {
      setProjects([]);
      setTasks([]);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      try {
        const [fetchedProjects, fetchedTasks] = await Promise.all([
          getWorkspaceProjects(activeWorkspace.id),
          getTasksByWorkspace(activeWorkspace.id),
        ]);
        setProjects(fetchedProjects);
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [activeWorkspace]);

  const totalTasks = tasks.length;
  const pendingTasks = tasks.filter((t) => t.status !== "Done").length;
  const completedTasks = tasks.filter((t) => t.status === "Done").length;
  const inProgressTasks = tasks.filter((t) => t.status === "In Progress").length;
  const reviewTasks = tasks.filter((t) => t.status === "Review").length;
  const todoTasks = tasks.filter((t) => t.status === "To Do").length;

  const highPriority = tasks.filter((t) => t.priority === "High").length;
  const medPriority = tasks.filter((t) => t.priority === "Medium").length;
  const lowPriority = tasks.filter((t) => t.priority === "Low").length;

  const upcomingTasks = [...tasks]
    .filter((t) => t.dueDate && t.status !== "Done")
    .sort(
      (a, b) =>
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
    )
    .slice(0, 5);

  const getProjectName = (projectId: string) => {
    if (!projectId) return "Workspace";
    return projects.find((p) => p.id === projectId)?.name || "Unknown Project";
  };

  const statusRows = [
    { label: "To Do", count: todoTasks },
    { label: "In Progress", count: inProgressTasks },
    { label: "Review", count: reviewTasks },
    { label: "Done", count: completedTasks },
  ];

  const priorityRows = [
    { label: "High", count: highPriority },
    { label: "Medium", count: medPriority },
    { label: "Low", count: lowPriority },
  ];

  const statCards = [
    {
      title: "Total Projects",
      value: projects.length,
      icon: Layers,
      iconBg: "bg-blue-100 dark:bg-blue-900/40",
      iconColor: "text-blue-600 dark:text-blue-400",
      sub: "active workspaces",
    },
    {
      title: "Tasks Pending",
      value: pendingTasks,
      icon: Clock,
      iconBg: "bg-amber-100 dark:bg-amber-900/40",
      iconColor: "text-amber-600 dark:text-amber-400",
      sub: "not yet complete",
    },
    {
      title: "Completed",
      value: completedTasks,
      icon: CheckCircle2,
      iconBg: "bg-emerald-100 dark:bg-emerald-900/40",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      sub: `of ${totalTasks} total tasks`,
    },
    {
      title: "In Progress",
      value: inProgressTasks,
      icon: ListTodo,
      iconBg: "bg-violet-100 dark:bg-violet-900/40",
      iconColor: "text-violet-600 dark:text-violet-400",
      sub: "actively worked on",
    },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <title>Overview | Projectify</title>

      {/* Greeting */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">
            {getGreeting()}
            {user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Here&apos;s an overview of your projects and tasks
            {activeWorkspace ? ` in ${activeWorkspace.name}` : ""}.
          </p>
        </div>
        <Badge
          variant="outline"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium"
        >
          <Activity className="w-3 h-3" />
          {new Date().toLocaleDateString(undefined, {
            weekday: "short",
            month: "short",
            day: "numeric",
          })}
        </Badge>
      </div>

      <Separator className="dark:bg-slate-800" />

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? [1, 2, 3, 4].map((i) => <StatCardSkeleton key={i} />)
          : statCards.map((stat, i) => (
              <Card
                key={i}
                className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
              >
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {stat.title}
                  </CardTitle>
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${stat.iconBg}`}
                  >
                    <stat.icon className={`h-4 w-4 ${stat.iconColor}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white leading-none mb-1">
                    {stat.value}
                  </div>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {stat.sub}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Distribution + Priority Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Task Distribution */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4 text-indigo-500" />
              Task Distribution
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">
              Breakdown of tasks by current status across your workspace.
            </CardDescription>
          </CardHeader>
          <Separator className="dark:bg-slate-800" />
          <CardContent className="pt-5">
            {loading ? (
              <DistributionSkeleton />
            ) : totalTasks === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">
                No tasks found in this workspace.
              </p>
            ) : (
              <div className="space-y-4">
                {statusRows.map(({ label, count }) => {
                  const cfg =
                    STATUS_CONFIG[label] ?? STATUS_CONFIG["To Do"];
                  const pct = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
                  return (
                    <div key={label} className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-block w-2 h-2 rounded-full ${cfg.dotColor}`}
                          />
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            {count}
                          </Badge>
                          <span className="text-xs text-slate-400 w-9 text-right">
                            {Math.round(pct)}%
                          </span>
                        </div>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Priority Breakdown */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-base">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Priority Breakdown
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs">
              Distribution of tasks across priority levels.
            </CardDescription>
          </CardHeader>
          <Separator className="dark:bg-slate-800" />
          <CardContent className="pt-5">
            {loading ? (
              <DistributionSkeleton />
            ) : totalTasks === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 py-4 text-center">
                No tasks found in this workspace.
              </p>
            ) : (
              <div className="space-y-4">
                {priorityRows.map(({ label, count }) => {
                  const cfg = PRIORITY_CONFIG[label];
                  const pct = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
                  return (
                    <div key={label} className={`rounded-lg p-3 ${cfg.bgClass}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={`text-sm font-semibold ${cfg.textClass}`}
                        >
                          {label} Priority
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs px-2 py-0.5">
                            {count} task{count !== 1 ? "s" : ""}
                          </Badge>
                          <span className="text-xs text-slate-400 w-9 text-right">
                            {Math.round(pct)}%
                          </span>
                        </div>
                      </div>
                      <Progress value={pct} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2 text-base">
              <CalendarDays className="w-4 h-4 text-rose-500" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400 text-xs mt-1">
              Your nearest pending task due dates, sorted by urgency.
            </CardDescription>
          </div>
          {!loading && upcomingTasks.length > 0 && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {upcomingTasks.length} task{upcomingTasks.length !== 1 ? "s" : ""}
            </Badge>
          )}
        </CardHeader>
        <Separator className="dark:bg-slate-800" />
        <CardContent className="pt-5">
          {loading ? (
            <DeadlineSkeleton />
          ) : upcomingTasks.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-70" />
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                All caught up!
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                No upcoming deadlines right now.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {upcomingTasks.map((task, idx) => {
                const statusCfg =
                  STATUS_CONFIG[task.status] ?? STATUS_CONFIG["To Do"];
                const initial = task.title.charAt(0).toUpperCase();
                const dueBadgeVariant = getDueDateVariant(task.dueDate);
                return (
                  <div key={task.id}>
                    <div className="flex items-center gap-3 py-3 px-1 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback
                          className={`text-white text-xs font-bold ${statusCfg.dotColor} bg-opacity-80`}
                          style={{ background: "transparent" }}
                        >
                          <span
                            className={`flex items-center justify-center w-full h-full rounded-full ${statusCfg.dotColor} text-white`}
                          >
                            {initial}
                          </span>
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {task.title}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                          {getProjectName(task.projectId)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="secondary" className="text-xs hidden sm:flex">
                          {task.status}
                        </Badge>
                        <Badge
                          variant={dueBadgeVariant}
                          className="text-xs"
                        >
                          {formatDueDate(task.dueDate)}
                        </Badge>
                      </div>
                    </div>
                    {idx < upcomingTasks.length - 1 && (
                      <Separator className="dark:bg-slate-800/60" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
