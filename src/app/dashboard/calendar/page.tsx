"use client";

import { useState, useEffect, useMemo } from "react";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getTasksByWorkspace, Task } from "@/lib/task";
import { getWorkspaceProjects, Project } from "@/lib/project";
import { getUsersByIds, UserProfile } from "@/lib/user";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

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
          getUsersByIds(activeWorkspace.members)
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
    projects.forEach(p => map.set(p.id, p));
    return map;
  }, [projects]);

  const memberMap = useMemo(() => {
    const map = new Map<string, UserProfile>();
    members.forEach(m => map.set(m.uid, m));
    return map;
  }, [members]);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    
    const days = [];
    
    // Add empty slots for days before the 1st
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      days.push({
        day: i,
        dateStr,
        tasks: tasks.filter(t => t.dueDate === dateStr)
      });
    }
    
    return days;
  };

  if (!activeWorkspace) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Please select a workspace to view the calendar.</p>
      </div>
    );
  }

  const calendarDays = generateCalendarDays();
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="flex flex-col h-full w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <title>Calendar | Projectify</title>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">Calendar</h1>
          <p className="text-slate-500 dark:text-slate-400">Track deadlines and upcoming tasks across the workspace.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <span className="font-semibold text-slate-900 dark:text-white min-w-[120px] text-center">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="ghost" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <div className="flex-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col">
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            {weekDays.map(day => (
              <div key={day} className="py-3 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">
                {day}
              </div>
            ))}
          </div>
          
          <div className="flex-1 grid grid-cols-7 grid-rows-5 lg:grid-rows-6 auto-rows-fr">
            {calendarDays.map((dayData, index) => (
              <div 
                key={index} 
                className={`border-r border-b border-slate-200 dark:border-slate-800 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 ${!dayData ? 'bg-slate-50 dark:bg-slate-950/50' : 'bg-white dark:bg-slate-900'} ${dayData && dayData.dateStr === new Date().toISOString().split('T')[0] ? 'ring-2 ring-inset ring-blue-500/50 bg-blue-50/10 dark:bg-blue-500/5' : ''}`}
              >
                {dayData && (
                  <>
                    <div className={`text-right text-sm font-medium mb-1 ${dayData.dateStr === new Date().toISOString().split('T')[0] ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}>
                      {dayData.day}
                    </div>
                    <div className="flex flex-col gap-1.5 mt-2">
                      {dayData.tasks.map(task => {
                        const project = projectMap.get(task.projectId);
                        return (
                          <div 
                            key={task.id} 
                            className={`text-xs p-1.5 rounded border ${
                              task.status === 'Done' ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-900/50 dark:text-green-400' : 
                              task.status === 'In Progress' ? 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950/30 dark:border-yellow-900/50 dark:text-yellow-400' : 
                              'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-900/50 dark:text-blue-400'
                            }`}
                          >
                            <div className="font-semibold truncate mb-0.5">{task.title}</div>
                            {project && (
                              <div className="flex items-center gap-1 opacity-80 text-[10px]">
                                <div className={`w-1.5 h-1.5 rounded-full ${project.color}`} />
                                <span className="truncate">{project.name}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
