"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Folder, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Project, deleteProject, getWorkspaceProjects } from "@/lib/project";
import Link from "next/link";

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
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <title>Projects | Projectify</title>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Projects</h1>
          <p className="text-slate-400">Manage your team's projects and track progress.</p>
        </div>
        
        <Link 
          href={activeWorkspace ? "/dashboard/projects/new" : "#"}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)] ${
            activeWorkspace 
              ? "bg-blue-600 hover:bg-blue-500 text-white" 
              : "bg-blue-600/50 text-white/50 cursor-not-allowed shadow-none"
          }`}
          onClick={(e) => !activeWorkspace && e.preventDefault()}
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {loading ? (
        <div className="text-slate-400">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-slate-900/50 rounded-xl border border-dashed border-slate-800">
          <Folder className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No projects found</h3>
          <p className="text-slate-400 mb-4">Get started by creating your first project in this workspace.</p>
          <Link 
            href={activeWorkspace ? "/dashboard/projects/new" : "#"}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeWorkspace
                ? "bg-slate-800 hover:bg-slate-700 text-white"
                : "bg-slate-800/50 text-white/50 cursor-not-allowed"
            }`}
            onClick={(e) => !activeWorkspace && e.preventDefault()}
          >
            Create Project
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link href={`/dashboard/projects/${project.id}`} key={project.id} className="block group">
              <Card className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all cursor-pointer h-full overflow-hidden flex flex-col relative z-0">
                {project.imageUrl && (
                  <div 
                    className="h-32 w-full bg-cover bg-center border-b border-slate-800"
                    style={{ backgroundImage: `url(${project.imageUrl})` }}
                  />
                )}
                <CardHeader className={`flex flex-row items-start justify-between pb-2 ${project.imageUrl ? 'pt-4' : ''}`}>
                  <div className="flex items-center gap-3">
                    {!project.imageUrl && (
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-slate-800 ${project.color} bg-opacity-10`}>
                        <Folder className={`w-5 h-5 ${project.color.replace('bg-', 'text-')}`} />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                        {project.name}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                          {project.status}
                        </span>
                        {project.deadline && (
                          <span className="text-xs text-slate-500">
                            Due: {new Date(project.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative z-10" onClick={(e) => e.preventDefault()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-slate-500 hover:text-white transition-colors p-1 rounded-md hover:bg-slate-800 -mr-2 -mt-2">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-slate-900 border-slate-800 text-slate-200">
                        <DropdownMenuItem 
                          className="text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
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
                <CardContent className="pt-4 flex-1 flex flex-col justify-end">
                  {project.description && (
                    <p className="text-sm text-slate-400 line-clamp-2 mb-4">
                      {project.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-sm text-slate-400 mb-2">
                    <span>{project.tasks} tasks</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${project.color}`} 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
