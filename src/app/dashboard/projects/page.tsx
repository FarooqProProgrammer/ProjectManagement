"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Folder, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Project, ProjectStatus, deleteProject, getWorkspaceProjects } from "@/lib/project";
import Link from "next/link";

function getStatusBadgeVariant(
  status: ProjectStatus
): "default" | "secondary" | "outline" {
  switch (status) {
    case "Active":
      return "default";
    case "Completed":
      return "outline";
    case "Planning":
    case "In Progress":
    default:
      return "secondary";
  }
}

function SkeletonCard() {
  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="flex items-center gap-3 flex-1">
          <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </div>
        <Skeleton className="w-7 h-7 rounded-md shrink-0" />
      </CardHeader>
      <CardContent className="flex-1 space-y-3 pt-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <div className="space-y-1 pt-1">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-3 border-t border-border">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
      </CardFooter>
    </Card>
  );
}

export default function ProjectsPage() {
  const { activeWorkspace } = useWorkspace();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProjects() {
      if (activeWorkspace) {
        setLoading(true);
        try {
          const data = await getWorkspaceProjects(activeWorkspace.id);
          setProjects(data);
        } catch (error) {
          console.error("Error loading projects:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setProjects([]);
        setLoading(false);
      }
    }

    loadProjects();
  }, [activeWorkspace]);

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await deleteProject(projectId);
      setProjects(projects.filter((p) => p.id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <title>Projects | Projectify</title>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            Projects
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your team&apos;s projects and track progress.
          </p>
        </div>

        <Button asChild disabled={!activeWorkspace} size="default">
          <Link
            href={activeWorkspace ? "/dashboard/projects/new" : "#"}
            onClick={(e) => !activeWorkspace && e.preventDefault()}
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Loading state — 6 skeleton cards */}
      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Folder className="w-8 h-8 text-slate-400 dark:text-slate-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              No projects yet
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              Get started by creating your first project in this workspace.
            </p>
          </div>
          <Button asChild disabled={!activeWorkspace} variant="outline">
            <Link
              href={activeWorkspace ? "/dashboard/projects/new" : "#"}
              onClick={(e) => !activeWorkspace && e.preventDefault()}
            >
              <Plus className="w-4 h-4" />
              Create Project
            </Link>
          </Button>
        </div>
      ) : (
        /* Project grid */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              href={`/dashboard/projects/${project.id}`}
              key={project.id}
              className="block group"
            >
              <Card className="flex flex-col h-full overflow-hidden transition-all hover:shadow-md cursor-pointer border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-slate-700 bg-white dark:bg-slate-900">
                {/* Optional cover image */}
                {project.imageUrl && (
                  <div
                    className="h-32 w-full bg-cover bg-center border-b border-slate-200 dark:border-slate-800 shrink-0"
                    style={{ backgroundImage: `url(${project.imageUrl})` }}
                  />
                )}

                {/* CardHeader — icon + name + status badge + dropdown */}
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="flex items-center gap-3 min-w-0">
                    {!project.imageUrl && (
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-opacity-20 dark:bg-opacity-10 ${project.color}`}
                      >
                        <Folder
                          className={`w-5 h-5 ${project.color.replace(
                            "bg-",
                            "text-"
                          )}`}
                        />
                      </div>
                    )}
                    <div className="min-w-0">
                      <CardTitle className="text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                        {project.name}
                      </CardTitle>
                      <div className="mt-1">
                        <Badge variant={getStatusBadgeVariant(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown — stop propagation so Link doesn't fire */}
                  <div
                    className="relative z-10 shrink-0"
                    onClick={(e) => e.preventDefault()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="p-1 rounded-md text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors -mr-1 -mt-1">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                      >
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteProject(project.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                {/* CardContent — description + progress */}
                <CardContent className="flex-1 flex flex-col justify-end gap-3 pt-0">
                  {project.description && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                      {project.description}
                    </p>
                  )}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>
                </CardContent>

                {/* CardFooter — task count + deadline */}
                <CardFooter className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
                  <Badge variant="secondary">
                    {project.tasks} {project.tasks === 1 ? "task" : "tasks"}
                  </Badge>

                  {project.deadline ? (
                    <Badge variant="outline" className="gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.deadline).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </Badge>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      No deadline
                    </span>
                  )}
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
