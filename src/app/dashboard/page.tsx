"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex flex-col gap-8 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <title>Overview | Projectify</title>
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
          Good morning{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ""}
        </h1>
        <p className="text-slate-400">Here's an overview of your projects and tasks.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Projects", value: "12", icon: Activity, color: "text-blue-400" },
          { title: "Tasks Pending", value: "24", icon: Clock, color: "text-yellow-400" },
          { title: "Completed", value: "128", icon: CheckCircle2, color: "text-green-400" },
          { title: "To Review", value: "4", icon: ListTodo, color: "text-purple-400" },
        ].map((stat, i) => (
          <Card key={i} className="bg-slate-900 border-slate-800 backdrop-blur-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Recent Activity</CardTitle>
            <CardDescription className="text-slate-400">
              Your team's activity over the past 7 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center border-t border-slate-800/50 mt-2">
             {/* Placeholder for a chart */}
             <div className="flex flex-col items-center gap-2">
               <Activity className="w-8 h-8 text-slate-700" />
               <p className="text-slate-500 text-sm">Activity chart will appear here</p>
             </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-slate-900 border-slate-800">
          <CardHeader>
            <CardTitle className="text-white">Upcoming Deadlines</CardTitle>
            <CardDescription className="text-slate-400">
              Tasks due in the next 48 hours.
            </CardDescription>
          </CardHeader>
          <CardContent className="border-t border-slate-800/50 pt-6">
            <div className="space-y-6">
              {[
                { title: "Design System Updates", project: "Projectify V2", time: "Tomorrow, 2:00 PM" },
                { title: "User Research Synthesis", project: "Mobile App", time: "Tomorrow, 5:00 PM" },
                { title: "Fix Authentication Bug", project: "Projectify V2", time: "Friday, 10:00 AM" },
              ].map((task, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-2 h-2 mt-1 rounded-full bg-blue-500 shrink-0"></div>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium leading-none text-white">{task.title}</p>
                    <p className="text-xs text-slate-400">{task.project} • {task.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
