"use client";

import { useState, useEffect, useMemo } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getTasksByWorkspace, Task } from "@/lib/task";
import { getWorkspaceProjects, Project } from "@/lib/project";
import { getUsersByIds, UserProfile } from "@/lib/user";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

type CalendarDay =
  | null
  | { day: number; dateStr: string; tasks: Task[] };

function getStatusBadgeClass(status: string): string {
  switch (status) {
    case "Done":
      return "bg-green-100 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900/50";
    case "In Progress":
      return "bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-900/50";
    default:
      return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50";
  }
}

export default function CalendarPage() {
  const { activeWorkspace } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    if (!activeWorkspace) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [fetchedTasks, fetchedProjects, fetchedMembers] = await Promise.all([
          getTasksByWorkspace(activeWorkspace.id),
          getWorkspaceProjects(activeWorkspace.id),
          getUsersByIds(activeWorkspace.members),
        ]);
        setTasks(fetchedTasks);
        setProjects(fetchedProjects);
        setMembers(fetchedMembers);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeWorkspace]);

  const projectMap = useMemo(() => {
    const map = new Map<string, Project>();
    projects.forEach((p) => map.set(p.id, p));
    return map;
  }, [projects]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const memberMap = useMemo(() => {
    const map = new Map<string, UserProfile>();
    members.forEach((m) => map.set(m.uid, m));
    return map;
  }, [members]);

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days: CalendarDay[] = [];

    // Add empty slots for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(i).padStart(2, "0")}`;
      days.push({
        day: i,
        dateStr,
        tasks: tasks.filter((t) => t.dueDate === dateStr),
      });
    }

    return days;
  };

  if (!activeWorkspace) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">
          Please select a workspace to view the calendar.
        </p>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayStr = new Date().toISOString().split("T")[0];

  const monthLabel = currentDate.toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <title>Calendar | Projectify</title>

      {/* Page header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">Calendar</h1>
          <p className="text-muted-foreground">
            Track deadlines and upcoming tasks across the workspace.
          </p>
        </div>

        {/* Month navigation */}
        <div className="flex items-center gap-1 border rounded-lg p-1 bg-background">
          <Button variant="outline" size="icon" onClick={handlePrevMonth} aria-label="Previous month">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button variant="ghost" className="min-w-[140px] font-semibold" onClick={() => setCurrentDate(new Date())}>
            {monthLabel}
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth} aria-label="Next month">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Calendar card */}
      <Card className="flex-1 overflow-hidden flex flex-col">
        <CardHeader className="p-0">
          {/* Weekday labels */}
          <div className="grid grid-cols-7 bg-muted/40">
            {weekDays.map((day) => (
              <div
                key={day}
                className="py-3 text-center text-xs font-semibold text-muted-foreground tracking-wide uppercase"
              >
                {day}
              </div>
            ))}
          </div>
          <Separator />
        </CardHeader>

        <CardContent className="p-0 flex-1 overflow-hidden">
          {loading ? (
            /* Skeleton loading state */
            <div className="grid grid-cols-7 h-full">
              {Array.from({ length: 35 }).map((_, i) => (
                <div
                  key={i}
                  className="border-r border-b p-2 flex flex-col gap-2"
                >
                  <Skeleton className="h-5 w-5 rounded-full ml-auto" />
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-4 w-3/4 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-7 auto-rows-fr h-full">
              {calendarDays.map((dayData, index) => {
                const isToday = dayData !== null && dayData.dateStr === todayStr;
                const isEmpty = dayData === null;

                return (
                  <div
                    key={index}
                    className={[
                      "border-r border-b overflow-y-auto p-1.5 transition-colors",
                      isEmpty
                        ? "bg-muted/20"
                        : "hover:bg-accent cursor-default",
                    ].join(" ")}
                  >
                    {dayData !== null && (
                      <>
                        {/* Day number */}
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={[
                              "inline-flex items-center justify-center text-xs font-semibold w-6 h-6 rounded-full",
                              isToday
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground",
                            ].join(" ")}
                          >
                            {dayData.day}
                          </span>
                          {dayData.tasks.length > 0 && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                              {dayData.tasks.length}
                            </Badge>
                          )}
                        </div>

                        {/* Task badges */}
                        <div className="flex flex-col gap-1">
                          {dayData.tasks.map((task) => {
                            const project = projectMap.get(task.projectId);
                            return (
                              <Badge
                                key={task.id}
                                variant="outline"
                                className={[
                                  "text-[10px] px-1.5 py-0.5 h-auto font-normal flex flex-col items-start gap-0.5 w-full rounded",
                                  getStatusBadgeClass(task.status),
                                ].join(" ")}
                              >
                                <span className="font-semibold truncate w-full block leading-tight">
                                  {task.title}
                                </span>
                                {project && (
                                  <span className="flex items-center gap-1 opacity-80 text-[9px] w-full">
                                    <span
                                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${project.color}`}
                                    />
                                    <span className="truncate">{project.name}</span>
                                  </span>
                                )}
                              </Badge>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
