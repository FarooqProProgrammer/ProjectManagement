"use client";

import { useEffect, useState, use } from "react";
import { getProject, Project } from "@/lib/project";
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Construction,
  Folder,
  LayoutList,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

function statusVariant(
  status: string
): "default" | "secondary" | "outline" | "destructive" {
  switch (status?.toLowerCase()) {
    case "active":
    case "in progress":
      return "default";
    case "completed":
      return "secondary";
    case "on hold":
      return "destructive";
    default:
      return "outline";
  }
}

export default function ProjectDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const data = await getProject(id);
        setProject(data);
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col w-full h-full gap-8">
        {/* Banner skeleton */}
        <Skeleton className="w-full h-48 rounded-2xl" />
        {/* Tabs skeleton */}
        <Skeleton className="w-72 h-10 rounded-xl" />
        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="md:col-span-2 h-40 rounded-xl" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Project not found
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          The project you&apos;re looking for doesn&apos;t exist or you
          don&apos;t have access.
        </p>
        <Button variant="ghost" asChild>
          <Link href="/dashboard/projects">Return to Projects</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <title>{`${project.name} | Projectify`}</title>

      {/* Header Banner */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 mb-8 shadow-xl">
        {project.imageUrl ? (
          <div
            className="h-48 w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${project.imageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 to-transparent opacity-80 dark:opacity-100" />
          </div>
        ) : (
          <div className="h-48 w-full bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-slate-800 dark:via-blue-900/30 dark:to-indigo-900/40 flex items-center justify-center">
            <Folder
              className={`w-24 h-24 ${project.color.replace(
                "bg-",
                "text-"
              )} opacity-20`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 to-transparent opacity-80 dark:opacity-100" />
          </div>
        )}

        {/* Back button */}
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="bg-white/60 dark:bg-black/40 backdrop-blur-md border border-slate-200/50 dark:border-white/10 hover:bg-white/80 dark:hover:bg-black/60 rounded-full"
          >
            <Link href="/dashboard/projects">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Projects
            </Link>
          </Button>
        </div>

        {/* Project info overlay */}
        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-4 z-10">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <Badge
                variant={statusVariant(project.status)}
                className="uppercase tracking-wider text-xs"
              >
                {project.status}
              </Badge>
              {project.deadline && (
                <Badge variant="outline" className="gap-1.5 text-xs">
                  <Calendar className="w-3 h-3" />
                  Due: {new Date(project.deadline).toLocaleDateString()}
                </Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 drop-shadow-md">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-slate-700 dark:text-slate-300 max-w-2xl text-sm md:text-base drop-shadow-md">
                {project.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 rounded-xl mb-6">
          <TabsTrigger
            value="overview"
            className="rounded-lg data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-slate-500 dark:text-slate-400"
          >
            <LayoutList className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="tasks"
            className="rounded-lg data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-slate-500 dark:text-slate-400"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-lg data-[state=active]:bg-slate-100 dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-slate-500 dark:text-slate-400"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent
          value="overview"
          className="space-y-6 focus-visible:outline-none focus-visible:ring-0"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Progress card */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Project Progress</CardTitle>
                <CardDescription>Current completion status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300 font-medium">
                    Overall Completion
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-bold">
                    {project.progress}%
                  </span>
                </div>
                <Progress value={project.progress} className="h-3" />
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                {project.progress === 100
                  ? "Project complete"
                  : `${100 - project.progress}% remaining`}
              </CardFooter>
            </Card>

            {/* Quick stats card */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Total Tasks
                    </p>
                    <p className="text-xl font-bold text-slate-900 dark:text-white">
                      {project.tasks}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <div className="p-2 rounded-md bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Status
                    </p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">
                      {project.status}
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Badge
                  variant={statusVariant(project.status)}
                  className="uppercase tracking-wider text-xs"
                >
                  {project.status}
                </Badge>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Tasks Tab — coming soon */}
        <TabsContent
          value="tasks"
          className="focus-visible:outline-none focus-visible:ring-0"
        >
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
                Task Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Construction className="w-4 h-4" />
                <AlertTitle>Coming Soon</AlertTitle>
                <AlertDescription>
                  We are building a powerful task management system for you to
                  organize your work within this project. Check back soon!
                </AlertDescription>
              </Alert>
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <CheckCircle2 className="w-12 h-12 text-muted-foreground/40" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  Task Management Coming Soon
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm">
                  A powerful task management system is on its way to help you
                  organize your work within this project.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab — coming soon */}
        <TabsContent
          value="settings"
          className="focus-visible:outline-none focus-visible:ring-0"
        >
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-muted-foreground" />
                Project Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Construction className="w-4 h-4" />
                <AlertTitle>Coming Soon</AlertTitle>
                <AlertDescription>
                  You will soon be able to edit project details, manage members,
                  and configure integrations here.
                </AlertDescription>
              </Alert>
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3">
                <Settings className="w-12 h-12 text-muted-foreground/40" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white">
                  Project Settings Coming Soon
                </h3>
                <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm">
                  You will soon be able to edit project details, manage members,
                  and configure integrations here.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
