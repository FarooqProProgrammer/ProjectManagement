"use client";

import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getTasksByWorkspace, Task } from "@/lib/task";
import { getWorkspaceProjects, Project } from "@/lib/project";
import { getUsersByIds, UserProfile } from "@/lib/user";
import {
  getTaskMetrics,
  getMemberWorkload,
  getProjectMetrics,
  getWeeklyVelocity,
  getOverdueTasks,
  TaskMetrics,
  MemberWorkload,
  ProjectMetrics,
  WeeklyVelocity,
} from "@/lib/report";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  BarChart3,
  Target,
} from "lucide-react";

const PIE_COLORS = ["#3b82f6", "#f59e0b", "#22c55e"];

export default function ReportsPage() {
  const { activeWorkspace, loading: workspaceLoading } = useWorkspace();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [metrics, setMetrics] = useState<TaskMetrics | null>(null);
  const [workload, setWorkload] = useState<MemberWorkload[]>([]);
  const [projectMetrics, setProjectMetrics] = useState<ProjectMetrics[]>([]);
  const [velocity, setVelocity] = useState<WeeklyVelocity[]>([]);
  const [overdueTasks, setOverdueTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!activeWorkspace) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedTasks, fetchedProjects] = await Promise.all([
          getTasksByWorkspace(activeWorkspace.id),
          getWorkspaceProjects(activeWorkspace.id),
        ]);

        const memberIds = activeWorkspace.members ?? [];
        const fetchedMembers = memberIds.length > 0 ? await getUsersByIds(memberIds) : [];

        setTasks(fetchedTasks);
        setProjects(fetchedProjects);
        setMembers(fetchedMembers);

        setMetrics(getTaskMetrics(fetchedTasks));
        setWorkload(getMemberWorkload(fetchedTasks, fetchedMembers));
        setProjectMetrics(getProjectMetrics(fetchedTasks, fetchedProjects));
        setVelocity(getWeeklyVelocity(fetchedTasks, 8));
        setOverdueTasks(getOverdueTasks(fetchedTasks));
      } catch (err) {
        console.error("Failed to load report data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeWorkspace]);

  if (workspaceLoading) {
    return <ReportsSkeleton />;
  }

  if (!activeWorkspace) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3 text-center">
        <BarChart3 className="w-12 h-12 text-slate-300 dark:text-slate-600" />
        <p className="text-slate-500 dark:text-slate-400 font-medium">
          No workspace selected. Please select or create a workspace to view reports.
        </p>
      </div>
    );
  }

  const pieData = metrics
    ? [
        { name: "To Do", value: metrics.todo },
        { name: "In Progress", value: metrics.inProgress },
        { name: "Done", value: metrics.completed },
      ]
    : [];

  return (
    <div className="flex flex-col gap-8 w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <title>Reports | Projectify</title>

      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1 flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-blue-500" />
          Analytics &amp; Reports
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Insights and metrics for <span className="font-medium text-slate-700 dark:text-slate-300">{activeWorkspace.name}</span>
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 bg-slate-100 dark:bg-slate-800">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="workload" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Workload
          </TabsTrigger>
          <TabsTrigger value="projects" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Projects
          </TabsTrigger>
          <TabsTrigger value="velocity" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Velocity
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-6">
          {loading ? (
            <OverviewSkeleton />
          ) : (
            <>
              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard
                  icon={<BarChart3 className="w-5 h-5 text-blue-500" />}
                  label="Total Tasks"
                  value={metrics?.total ?? 0}
                  accent="blue"
                />
                <StatCard
                  icon={<CheckCircle2 className="w-5 h-5 text-green-500" />}
                  label="Completed"
                  value={metrics?.completed ?? 0}
                  accent="green"
                />
                <StatCard
                  icon={<Clock className="w-5 h-5 text-amber-500" />}
                  label="In Progress"
                  value={metrics?.inProgress ?? 0}
                  accent="amber"
                />
                <StatCard
                  icon={<TrendingUp className="w-5 h-5 text-violet-500" />}
                  label="Completion Rate"
                  value={`${metrics?.completionRate ?? 0}%`}
                  accent="violet"
                />
              </div>

              {/* Overdue alert */}
              {overdueTasks.length > 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4">
                  <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <div>
                    <p className="font-semibold text-red-700 dark:text-red-400 text-sm">
                      {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-red-600 dark:text-red-500 text-xs mt-0.5">
                      These tasks are past their due date and not yet completed.
                    </p>
                  </div>
                  <Badge variant="destructive" className="ml-auto text-sm font-bold">
                    {overdueTasks.length}
                  </Badge>
                </div>
              )}

              {/* Pie chart */}
              <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                <CardHeader>
                  <CardTitle className="text-slate-900 dark:text-white text-base">Task Status Distribution</CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    Breakdown of all tasks by current status
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {metrics && metrics.total > 0 ? (
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <ResponsiveContainer width={220} height={220}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={55}
                            outerRadius={95}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "var(--card)",
                              border: "1px solid var(--border)",
                              borderRadius: "8px",
                              fontSize: "13px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="flex flex-col gap-3">
                        {pieData.map((entry, index) => (
                          <div key={entry.name} className="flex items-center gap-3">
                            <span
                              className="w-3 h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: PIE_COLORS[index] }}
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-400 w-24">{entry.name}</span>
                            <span className="text-sm font-semibold text-slate-900 dark:text-white">
                              {entry.value}
                            </span>
                            <span className="text-xs text-slate-400">
                              ({metrics.total > 0 ? Math.round((entry.value / metrics.total) * 100) : 0}%)
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <EmptyState icon={<BarChart3 className="w-10 h-10" />} message="No tasks found in this workspace." />
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* WORKLOAD TAB */}
        <TabsContent value="workload" className="space-y-6">
          {loading ? (
            <WorkloadSkeleton />
          ) : (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white text-base">Member Workload</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Task distribution and completion across team members
                </CardDescription>
              </CardHeader>
              <CardContent>
                {workload.length === 0 ? (
                  <EmptyState icon={<Users className="w-10 h-10" />} message="No members or tasks found." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-700">
                          <th className="text-left py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">Member</th>
                          <th className="text-center py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">Assigned</th>
                          <th className="text-center py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">Completed</th>
                          <th className="text-center py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">In Progress</th>
                          <th className="text-center py-3 px-3 font-semibold text-slate-600 dark:text-slate-400">Overdue</th>
                          <th className="text-left py-3 px-3 font-semibold text-slate-600 dark:text-slate-400 min-w-[120px]">Completion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {workload.map((member) => {
                          const completionPct = member.total === 0 ? 0 : Math.round((member.completed / member.total) * 100);
                          return (
                            <tr key={member.memberId} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-semibold text-xs flex-shrink-0">
                                    {(member.displayName || "?")[0].toUpperCase()}
                                  </div>
                                  <span className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[160px]">
                                    {member.displayName || "Unknown"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <span className="font-medium text-slate-700 dark:text-slate-300">{member.total}</span>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-0 font-medium">
                                  {member.completed}
                                </Badge>
                              </td>
                              <td className="py-3 px-3 text-center">
                                <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-0 font-medium">
                                  {member.inProgress}
                                </Badge>
                              </td>
                              <td className="py-3 px-3 text-center">
                                {member.overdue > 0 ? (
                                  <Badge variant="destructive" className="font-medium">
                                    {member.overdue}
                                  </Badge>
                                ) : (
                                  <span className="text-slate-400 dark:text-slate-600">—</span>
                                )}
                              </td>
                              <td className="py-3 px-3">
                                <div className="flex items-center gap-2">
                                  <Progress value={completionPct} className="h-2 flex-1" />
                                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 w-9 text-right">
                                    {completionPct}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* PROJECTS TAB */}
        <TabsContent value="projects" className="space-y-6">
          {loading ? (
            <ProjectsSkeleton />
          ) : projectMetrics.length === 0 ? (
            <EmptyState icon={<Target className="w-10 h-10" />} message="No projects found in this workspace." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {projectMetrics.map((pm) => (
                <Card
                  key={pm.projectId}
                  className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-slate-900 dark:text-white text-base leading-snug">
                      {pm.name}
                    </CardTitle>
                    <CardDescription className="text-slate-500 dark:text-slate-400">
                      {pm.completed} of {pm.total} task{pm.total !== 1 ? "s" : ""} completed
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Progress value={pm.progress} className="h-2" />
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Progress</span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {pm.progress}%
                      </span>
                    </div>
                    <div className="flex gap-2 flex-wrap">
                      <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-0 text-xs">
                        {pm.total} total
                      </Badge>
                      <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-0 text-xs">
                        {pm.completed} done
                      </Badge>
                      {pm.total - pm.completed > 0 && (
                        <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border-0 text-xs">
                          {pm.total - pm.completed} remaining
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* VELOCITY TAB */}
        <TabsContent value="velocity" className="space-y-6">
          {loading ? (
            <VelocitySkeleton />
          ) : (
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-900 dark:text-white text-base">Weekly Velocity</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">
                  Number of tasks completed per week over the last 8 weeks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {velocity.every((v) => v.completed === 0) ? (
                  <EmptyState icon={<TrendingUp className="w-10 h-10" />} message="No completed tasks found in the last 8 weeks." />
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <BarChart data={velocity} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                      <XAxis
                        dataKey="week"
                        tick={{ fontSize: 11, fill: "currentColor" }}
                        tickLine={false}
                        axisLine={false}
                        className="text-slate-500 dark:text-slate-400"
                      />
                      <YAxis
                        allowDecimals={false}
                        tick={{ fontSize: 11, fill: "currentColor" }}
                        tickLine={false}
                        axisLine={false}
                        className="text-slate-500 dark:text-slate-400"
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          fontSize: "13px",
                        }}
                        cursor={{ fill: "rgba(59,130,246,0.07)" }}
                        formatter={(value: number) => [value, "Tasks Completed"]}
                      />
                      <Bar
                        dataKey="completed"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                        name="Completed"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---- Sub-components ----

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: "blue" | "green" | "amber" | "violet";
}) {
  const accentMap: Record<string, string> = {
    blue: "bg-blue-50 dark:bg-blue-950/30",
    green: "bg-green-50 dark:bg-green-950/30",
    amber: "bg-amber-50 dark:bg-amber-950/30",
    violet: "bg-violet-50 dark:bg-violet-950/30",
  };

  return (
    <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
      <CardContent className="pt-6 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{label}</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          </div>
          <div className={`p-2.5 rounded-lg ${accentMap[accent]}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState({ icon, message }: { icon: React.ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 dark:text-slate-600">
      {icon}
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 text-center max-w-xs">{message}</p>
    </div>
  );
}

// ---- Skeleton loaders ----

function ReportsSkeleton() {
  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="space-y-2">
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-64 rounded-xl" />
    </div>
  );
}

function WorkloadSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-12 rounded-lg" />
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-12 rounded-lg" />
      ))}
    </div>
  );
}

function ProjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-40 rounded-xl" />
      ))}
    </div>
  );
}

function VelocitySkeleton() {
  return <Skeleton className="h-80 rounded-xl" />;
}
