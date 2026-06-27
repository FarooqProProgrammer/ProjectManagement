"use client";

import { useEffect, useState, useMemo } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getUsersByIds, UserProfile } from "@/lib/user";
import { Task } from "@/lib/task";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Briefcase, CheckSquare, Clock, User, Zap, BarChart } from "lucide-react";

interface MemberWorkload {
  user: UserProfile;
  activeTasks: number;
  completedTasks: number;
  totalEstimatedHours: number;
}

export default function TeamWorkloadPage() {
  const { activeWorkspace, loading: wsLoading } = useWorkspace();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeWorkspace) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const fetchedMembers = await getUsersByIds(activeWorkspace.members);
        setMembers(fetchedMembers);

        const tasksRef = collection(db, "tasks");
        const q = query(tasksRef, where("workspaceId", "==", activeWorkspace.id));
        const snapshot = await getDocs(q);
        const fetchedTasks = snapshot.docs.map(
          (doc) => ({ id: doc.id, ...doc.data() } as Task)
        );
        setTasks(fetchedTasks);
      } catch (error) {
        console.error("Failed to fetch workload data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeWorkspace]);

  const workloadData = useMemo(() => {
    const data: Record<string, MemberWorkload> = {};

    // Initialize
    members.forEach((m) => {
      data[m.uid] = {
        user: m,
        activeTasks: 0,
        completedTasks: 0,
        totalEstimatedHours: 0,
      };
    });

    // Aggregate tasks
    tasks.forEach((t) => {
      if (t.assigneeId && data[t.assigneeId]) {
        if (t.status === "Done") {
          data[t.assigneeId].completedTasks++;
        } else {
          data[t.assigneeId].activeTasks++;
          if (t.estimatedHours) {
            data[t.assigneeId].totalEstimatedHours += t.estimatedHours;
          }
        }
      }
    });

    return Object.values(data).sort(
      (a, b) => b.totalEstimatedHours - a.totalEstimatedHours
    );
  }, [members, tasks]);

  if (wsLoading || loading) {
    return (
      <div className="flex flex-col gap-8 w-full p-8">
        <title>Team Workload | Projectify</title>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-center justify-between pb-2">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
                <Skeleton className="h-9 w-16 mt-1" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Separator />
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-72" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                  <div className="flex-1 flex flex-col gap-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activeWorkspace) {
    return <div className="p-8 text-slate-500">No active workspace selected.</div>;
  }

  // Calculate highest hours to scale the progress bars
  const maxHours = Math.max(
    ...workloadData.map((w) => w.totalEstimatedHours),
    40 // Base scale of 40h week
  );

  const activeTasks = tasks.filter((t) => t.status !== "Done");
  const totalEstimatedHours = activeTasks.reduce(
    (acc, t) => acc + (t.estimatedHours || 0),
    0
  );
  const avgHoursPerMember =
    members.length > 0
      ? Math.round((totalEstimatedHours / members.length) * 10) / 10
      : 0;

  const statCards = [
    {
      label: "Total Members",
      value: members.length,
      icon: <User className="h-4 w-4 text-slate-400" />,
      suffix: "",
    },
    {
      label: "Active Tasks",
      value: activeTasks.length,
      icon: <CheckSquare className="h-4 w-4 text-indigo-500" />,
      suffix: "",
    },
    {
      label: "Total Est. Hours",
      value: totalEstimatedHours,
      icon: <Clock className="h-4 w-4 text-amber-500" />,
      suffix: "h",
    },
    {
      label: "Avg Hours / Member",
      value: avgHoursPerMember,
      icon: <BarChart className="h-4 w-4 text-emerald-500" />,
      suffix: "h",
    },
  ];

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <title>Team Workload | Projectify</title>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-indigo-500" />
            Team Workload
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Monitor your team&apos;s capacity and resource allocation in{" "}
            {activeWorkspace.name}.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <Card
              key={stat.label}
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between pb-2">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                  {stat.suffix}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Separator />

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle>Member Capacity</CardTitle>
            <CardDescription>
              Estimated hours required for active tasks across the team.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {workloadData.map((data) => {
                const overloadThreshold = 40;
                const isOverloaded = data.totalEstimatedHours > overloadThreshold;
                const progressPercentage = Math.min(
                  (data.totalEstimatedHours / maxHours) * 100,
                  100
                );
                const fallbackInitial = data.user.displayName
                  .charAt(0)
                  .toUpperCase();

                return (
                  <Card
                    key={data.user.uid}
                    className="flex flex-col md:flex-row md:items-center gap-4 p-4 border-slate-100 dark:border-slate-800 shadow-none"
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <Avatar size="lg">
                        <AvatarImage
                          src={data.user.photoURL ?? undefined}
                          alt={data.user.displayName}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold">
                          {fallbackInitial}
                        </AvatarFallback>
                      </Avatar>
                    </div>

                    {/* Name + task counts */}
                    <div className="w-full md:w-56 flex-shrink-0">
                      <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        {data.user.displayName}
                        {isOverloaded && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Zap className="w-3.5 h-3.5 text-red-500 cursor-default" />
                            </TooltipTrigger>
                            <TooltipContent>
                              Over capacity — exceeds 40h threshold
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <Badge variant="secondary">{data.activeTasks} active</Badge>
                        <Badge variant="secondary">{data.completedTasks} done</Badge>
                      </p>
                    </div>

                    {/* Progress + hours */}
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex items-center justify-between text-sm">
                        <span
                          className={
                            isOverloaded
                              ? "text-red-500 font-medium"
                              : "text-slate-600 dark:text-slate-400"
                          }
                        >
                          {data.totalEstimatedHours}h estimated
                        </span>
                        {isOverloaded && (
                          <Badge variant="destructive">Overloaded</Badge>
                        )}
                      </div>
                      <Progress
                        value={progressPercentage}
                        className={
                          isOverloaded
                            ? "h-3 bg-red-100 dark:bg-red-900/30 [&_[data-slot=progress-indicator]]:bg-red-500"
                            : "h-3 bg-slate-100 dark:bg-slate-800 [&_[data-slot=progress-indicator]]:bg-indigo-500"
                        }
                      />
                    </div>
                  </Card>
                );
              })}

              {workloadData.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-8">
                  No team members found in this workspace.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
