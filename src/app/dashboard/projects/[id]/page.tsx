"use client";

import { useEffect, useState, use } from "react";
import { getProject, Project } from "@/lib/project";
import { ArrowLeft, Calendar, CheckCircle2, Clock, Folder, Settings, LayoutList } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
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
      <div className="flex h-[50vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <p className="text-slate-400">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-white">Project not found</h2>
        <p className="text-slate-400">The project you're looking for doesn't exist or you don't have access.</p>
        <Link href="/dashboard/projects" className="text-blue-400 hover:text-blue-300">
          Return to Projects
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <title>{`${project.name} | Projectify`}</title>

      {/* Header Banner */}
      <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 mb-8 shadow-xl">
        {project.imageUrl ? (
          <div 
            className="h-48 w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${project.imageUrl})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
          </div>
        ) : (
          <div className={`h-48 w-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center`}>
            <Folder className={`w-24 h-24 ${project.color.replace('bg-', 'text-')} opacity-20`} />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent" />
          </div>
        )}

        <div className="absolute top-4 left-4 z-10">
          <Link href="/dashboard/projects" className="inline-flex items-center px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-sm font-medium text-white hover:bg-black/60 transition-colors border border-white/10">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Projects
          </Link>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-4 z-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider border border-blue-500/20">
                {project.status}
              </span>
              {project.deadline && (
                <span className="flex items-center text-xs font-medium text-slate-300 bg-black/40 px-3 py-1 rounded-full border border-white/10 backdrop-blur-md">
                  <Calendar className="w-3 h-3 mr-1.5" />
                  Due: {new Date(project.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-2 shadow-black/50 drop-shadow-md">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-slate-300 max-w-2xl text-sm md:text-base drop-shadow-md">
                {project.description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-slate-900 border border-slate-800 p-1 rounded-xl mb-6">
          <TabsTrigger value="overview" className="rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400">
            <LayoutList className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="tasks" className="rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Tasks
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-lg data-[state=active]:bg-slate-800 data-[state=active]:text-white text-slate-400">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 focus-visible:outline-none focus-visible:ring-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-slate-900 border-slate-800 md:col-span-2">
              <CardHeader>
                <CardTitle className="text-white">Project Progress</CardTitle>
                <CardDescription className="text-slate-400">Current completion status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300 font-medium">Overall Completion</span>
                    <span className="text-blue-400 font-bold">{project.progress}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full ${project.color} transition-all duration-1000 ease-out rounded-full`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="p-2 rounded-md bg-blue-500/10 text-blue-400">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400">Total Tasks</p>
                    <p className="text-xl font-bold text-white">{project.tasks}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="p-2 rounded-md bg-orange-500/10 text-orange-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400">Status</p>
                    <p className="text-lg font-bold text-white">{project.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="focus-visible:outline-none focus-visible:ring-0">
          <Card className="bg-slate-900 border-slate-800 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-64 text-center">
              <CheckCircle2 className="w-12 h-12 text-slate-700 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Task Management Coming Soon</h3>
              <p className="text-slate-400 max-w-sm">We are building a powerful task management system for you to organize your work within this project.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="focus-visible:outline-none focus-visible:ring-0">
          <Card className="bg-slate-900 border-slate-800 border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-64 text-center">
              <Settings className="w-12 h-12 text-slate-700 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Project Settings Coming Soon</h3>
              <p className="text-slate-400 max-w-sm">You will soon be able to edit project details, manage members, and configure integrations here.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
