import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Folder, MoreVertical, Plus } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
};

export default function ProjectsPage() {
  const projects = [
    { name: "Website Redesign", status: "In Progress", tasks: 12, progress: 65, color: "bg-blue-500" },
    { name: "Mobile App V2", status: "Planning", tasks: 0, progress: 0, color: "bg-purple-500" },
    { name: "Marketing Campaign", status: "Active", tasks: 8, progress: 40, color: "bg-green-500" },
    { name: "Design System", status: "Completed", tasks: 24, progress: 100, color: "bg-slate-500" },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Projects</h1>
          <p className="text-slate-400">Manage your team's projects and track progress.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-[0_0_15px_rgba(37,99,235,0.3)]">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <Card key={i} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-all cursor-pointer group">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-slate-800 ${project.color} bg-opacity-10`}>
                  <Folder className={`w-5 h-5 ${project.color.replace('bg-', 'text-')}`} />
                </div>
                <div>
                  <CardTitle className="text-base text-white group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    {project.status}
                  </CardDescription>
                </div>
              </div>
              <button className="text-slate-500 hover:text-white transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="pt-4">
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
        ))}
      </div>
    </div>
  );
}
