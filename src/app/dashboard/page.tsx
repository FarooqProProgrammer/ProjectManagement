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
import { Activity, CheckCircle2, Clock, ListTodo, PieChart as PieChartIcon } from "lucide-react";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Doughnut, Pie, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

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

  const reviewTasks = tasks.filter(t => t.status === "Review").length;
  const todoTasks = tasks.filter(t => t.status === "To Do").length;

  const statusData = {
    labels: ['To Do', 'In Progress', 'Review', 'Done'],
    datasets: [
      {
        data: [todoTasks, inProgressTasks, reviewTasks, completedTasks],
        backgroundColor: [
          'rgba(203, 213, 225, 0.8)', // slate-300
          'rgba(167, 139, 250, 0.8)', // purple-400
          'rgba(96, 165, 250, 0.8)', // blue-400
          'rgba(52, 211, 153, 0.8)', // emerald-400
        ],
        borderColor: [
          'rgba(203, 213, 225, 1)',
          'rgba(167, 139, 250, 1)',
          'rgba(96, 165, 250, 1)',
          'rgba(52, 211, 153, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const highPriority = tasks.filter(t => t.priority === "High").length;
  const medPriority = tasks.filter(t => t.priority === "Medium").length;
  const lowPriority = tasks.filter(t => t.priority === "Low").length;

  const priorityData = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        data: [highPriority, medPriority, lowPriority],
        backgroundColor: [
          'rgba(248, 113, 113, 0.8)', // red-400
          'rgba(251, 191, 36, 0.8)', // amber-400
          'rgba(148, 163, 184, 0.8)', // slate-400
        ],
        borderWidth: 0,
      },
    ],
  };

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
            <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-indigo-500" />
              Task Breakdown
            </CardTitle>
            <CardDescription className="text-slate-500 dark:text-slate-400">
              Visualize your workspace's current task distribution.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row items-center justify-around border-t border-slate-100 dark:border-slate-800/50 pt-6">
             <div className="w-48 h-48 flex flex-col items-center">
                <h3 className="text-sm font-medium text-slate-500 mb-2">By Status</h3>
                <Pie data={statusData} options={{ plugins: { legend: { display: false } } }} />
             </div>
             <div className="w-48 h-48 flex flex-col items-center mt-8 md:mt-0">
                <h3 className="text-sm font-medium text-slate-500 mb-2">By Priority</h3>
                <Doughnut data={priorityData} options={{ plugins: { legend: { display: false } }, cutout: '70%' }} />
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
