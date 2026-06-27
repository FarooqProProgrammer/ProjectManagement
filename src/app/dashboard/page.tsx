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
import { Activity, CheckCircle2, Clock, ListTodo } from "lucide-react";

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
          getTasksByWorkspace(activeWorkspace.id)
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

  const pendingTasks = tasks.filter(t => t.status !== "Done").length;
  const completedTasks = tasks.filter(t => t.status === "Done").length;
  const inProgressTasks = tasks.filter(t => t.status === "In Progress").length;

  const upcomingTasks = [...tasks]
    .filter(t => t.dueDate && t.status !== "Done")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 5);

  const getProjectName = (projectId: string) => {
    if (!projectId) return "Workspace";
    return projects.find(p => p.id === projectId)?.name || "Unknown Project";
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <title>Overview | Projectify</title>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
          Good morning{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ""}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Here's an overview of your projects and tasks.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Projects", value: projects.length.toString(), icon: Activity, color: "text-blue-500" },
          { title: "Tasks Pending", value: pendingTasks.toString(), icon: Clock, color: "text-yellow-500" },
          { title: "Completed", value: completedTasks.toString(), icon: CheckCircle2, color: "text-green-500" },
          { title: "In Progress", value: inProgressTasks.toString(), icon: ListTodo, color: "text-purple-500" },
        ].map((stat, i) => (
          <Card key={i} className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-500 dark:text-slate-400">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Recent Activity</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Your team's activity over the past 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-slate-100 dark:border-slate-800/50 mt-2">
             {/* Placeholder for a chart */}
             <div className="flex flex-col items-center gap-2">
               <Activity className="w-8 h-8 text-slate-300 dark:text-slate-700" />
               <p className="text-slate-400 dark:text-slate-500 text-sm">Activity chart will appear here</p>
             </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Upcoming Deadlines</CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Tasks due in the next 48 hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="border-t border-slate-100 dark:border-slate-800/50 pt-6">
            <div className="space-y-6">
              {loading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">Loading deadlines...</p>
              ) : upcomingTasks.length > 0 ? (
                upcomingTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4">
                    <div className="w-2 h-2 mt-1 rounded-full bg-blue-500 shrink-0"></div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium leading-none text-slate-900 dark:text-white">{task.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {getProjectName(task.projectId)} • Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming deadlines! Great job.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
