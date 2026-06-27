import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "My Tasks",
};

export default function TasksPage() {
  const tasks = [
    { id: 1, title: "Review landing page copy", project: "Website Redesign", status: "todo", priority: "High" },
    { id: 2, title: "Fix authentication flow bug", project: "Projectify V2", status: "in-progress", priority: "Critical" },
    { id: 3, title: "Update brand assets", project: "Marketing Campaign", status: "done", priority: "Medium" },
    { id: 4, title: "Conduct user interviews", project: "Mobile App V2", status: "todo", priority: "Medium" },
    { id: 5, title: "Create API documentation", project: "Projectify V2", status: "in-progress", priority: "Low" },
  ];

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">My Tasks</h1>
        <p className="text-slate-400">Track and manage your assigned tasks across all projects.</p>
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader className="border-b border-slate-800">
          <CardTitle className="text-lg text-white">Active Tasks</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-800">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-4 hover:bg-white/5 transition-colors group cursor-pointer">
                <div className="flex items-center gap-4">
                  {task.status === 'done' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : task.status === 'in-progress' ? (
                    <Clock className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-600 group-hover:text-blue-500 transition-colors" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${task.status === 'done' ? 'text-slate-500 line-through' : 'text-slate-200 group-hover:text-white transition-colors'}`}>
                      {task.title}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{task.project}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${
                    task.priority === 'Critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    task.priority === 'High' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                    task.priority === 'Medium' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
