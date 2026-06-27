"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getTasksByWorkspace, createTask, updateTaskStatus, deleteTask, Task, TaskStatus } from "@/lib/task";
import { getWorkspaceProjects, Project } from "@/lib/project";
import { getUsersByIds, UserProfile } from "@/lib/user";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { CheckCircle2, Clock, MoreVertical, Plus, Trash2, Calendar, GripVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
const DragDropContext = dynamic(() => import("@hello-pangea/dnd").then(mod => mod.DragDropContext), { ssr: false });
const Droppable = dynamic(() => import("@hello-pangea/dnd").then(mod => mod.Droppable), { ssr: false });
const Draggable = dynamic(() => import("@hello-pangea/dnd").then(mod => mod.Draggable), { ssr: false });

export default function TasksPage() {
  const { activeWorkspace } = useWorkspace();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  
  // New Task state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("none");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("none");

  // Selected Task state for Modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

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
        console.error("Error fetching tasks data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeWorkspace]);

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !title.trim()) return;

    setIsCreating(true);
    try {
      const newTask = await createTask(
        activeWorkspace.id,
        projectId === "none" ? "" : projectId,
        title,
        description,
        dueDate,
        assigneeId === "none" ? undefined : assigneeId
      );
      setTasks(prev => [...prev, newTask]);
      setIsDialogOpen(false);
      setTitle("");
      setDescription("");
      setProjectId("none");
      setDueDate("");
      setAssigneeId("none");
    } catch (error) {
      console.error(error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      // Optimistic update
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      await updateTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error(error);
      // Revert if error occurs
      if (activeWorkspace) {
        const fetchedTasks = await getTasksByWorkspace(activeWorkspace.id);
        setTasks(fetchedTasks);
      }
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setTasks(prev => prev.filter(t => t.id !== taskId));
      await deleteTask(taskId);
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

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

  const getProjectName = (id: string) => {
    if (!id) return "Workspace";
    return projectMap.get(id)?.name || "Unknown Project";
  };

  const getProjectColor = (id: string) => {
    if (!id) return "bg-slate-700";
    return projectMap.get(id)?.color || "bg-slate-700";
  };

  const columns: { title: string; status: TaskStatus; icon: any }[] = [
    { title: "To Do", status: "To Do", icon: Clock },
    { title: "In Progress", status: "In Progress", icon: Clock },
    { title: "Done", status: "Done", icon: CheckCircle2 }
  ];

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Dropped in the same position
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    handleStatusChange(draggableId, destination.droppableId as TaskStatus);
  };

  if (!activeWorkspace || !isMounted) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400">Please select a workspace to view tasks.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
      <title>My Tasks | Projectify</title>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-1">My Tasks</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and track your tasks across all projects.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400">
                Add a new task to your workspace.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTask} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-700 dark:text-slate-300">Task Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Design homepage layout"
                  className="bg-transparent dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project" className="text-slate-700 dark:text-slate-300">Project</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger className="bg-transparent dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-h-48">
                    <SelectItem value="none">No Project (Workspace Level)</SelectItem>
                    {projects.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-slate-700 dark:text-slate-300">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-transparent dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignee" className="text-slate-700 dark:text-slate-300">Assignee</Label>
                <Select value={assigneeId} onValueChange={setAssigneeId}>
                  <SelectTrigger className="bg-transparent dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white max-h-48">
                    <SelectItem value="none">Unassigned</SelectItem>
                    {members.map((m) => (
                      <SelectItem key={m.uid} value={m.uid}>{m.displayName}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-slate-700 dark:text-slate-300">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add any additional details here..."
                  className="bg-transparent dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white resize-none"
                  rows={3}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800">
                  Cancel
                </Button>
                <Button type="submit" disabled={isCreating || !title.trim()} className="bg-blue-600 hover:bg-blue-500 text-white">
                  {isCreating ? "Creating..." : "Create Task"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden pb-4">
            {columns.map((column) => (
              <div 
                key={column.title} 
                className="flex flex-col h-full bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden"
              >
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <column.icon className={`w-5 h-5 ${column.status === "Done" ? "text-green-500 dark:text-green-400" : "text-blue-500 dark:text-blue-400"}`} />
                    <h3 className="font-semibold text-slate-900 dark:text-white">{column.title}</h3>
                  </div>
                  <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {tasks.filter(t => t.status === column.status).length}
                  </span>
                </div>
                
                <Droppable droppableId={column.status}>
                  {(provided, snapshot) => (
                    <div 
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-3 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800 scrollbar-track-transparent ${snapshot.isDraggingOver ? 'bg-slate-200/50 dark:bg-slate-800/20' : ''}`}
                    >
                      {tasks
                        .filter((t) => t.status === column.status)
                        .map((task, index) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <Card 
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                onClick={() => setSelectedTask(task)}
                                className={`bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 transition-colors shadow-sm group cursor-pointer ${snapshot.isDragging ? 'shadow-xl shadow-blue-500/10 border-blue-500 dark:border-slate-700 z-50' : 'hover:border-blue-400 dark:hover:border-slate-700'}`}
                              >
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start gap-2 mb-2">
                                    <h4 className="font-medium text-slate-900 dark:text-white text-sm leading-snug">{task.title}</h4>
                                    <div onClick={e => e.stopPropagation()}>
                                      <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <button className="text-slate-400 dark:text-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 -mt-1 -mr-1">
                                          <MoreVertical className="w-4 h-4" />
                                        </button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                                        <DropdownMenuItem className="text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white">
                                          Move to...
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                                        {columns.filter(c => c.status !== task.status).map(c => (
                                          <DropdownMenuItem 
                                            key={c.status}
                                            onClick={() => handleStatusChange(task.id, c.status)}
                                            className="text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white focus:bg-slate-100 dark:focus:bg-slate-800 focus:text-slate-900 dark:focus:text-white cursor-pointer"
                                          >
                                            {c.title}
                                          </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-800" />
                                        <DropdownMenuItem 
                                          onClick={() => handleDeleteTask(task.id)}
                                          className="text-red-500 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-600 dark:focus:text-red-400 cursor-pointer"
                                        >
                                          <Trash2 className="w-4 h-4 mr-2" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                    </div>
                                  </div>
                                  
                                  {task.description && (
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mb-3">
                                      {task.description}
                                    </p>
                                  )}
                                  
                                  <div className="flex items-center justify-between mt-3">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <div className={`w-2 h-2 rounded-full ${getProjectColor(task.projectId)}`} />
                                      <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[100px]">
                                        {getProjectName(task.projectId)}
                                      </span>
                                      
                                      {task.priority && (
                                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium border ${
                                          task.priority === 'High' ? 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20' :
                                          task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20' :
                                          'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                        }`}>
                                          {task.priority}
                                        </span>
                                      )}
                                    </div>
                                    
                                    {task.dueDate && (
                                      <span className="flex items-center text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                                        <Calendar className="w-3 h-3 mr-1" />
                                        {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                      </span>
                                    )}

                                    {task.assigneeId && memberMap.has(task.assigneeId) && (
                                      <div className="flex items-center ml-2" title={memberMap.get(task.assigneeId)?.displayName}>
                                        {memberMap.get(task.assigneeId)?.photoURL ? (
                                          <img 
                                            src={memberMap.get(task.assigneeId)?.photoURL!} 
                                            alt="Assignee" 
                                            className="w-5 h-5 rounded-full object-cover border border-white dark:border-slate-800" 
                                          />
                                        ) : (
                                          <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-bold border border-white dark:border-slate-800">
                                            {memberMap.get(task.assigneeId)?.displayName?.charAt(0).toUpperCase()}
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                      
                      {tasks.filter((t) => t.status === column.status).length === 0 && (
                        <div className="h-24 border-2 border-dashed border-slate-200/50 dark:border-slate-800/50 rounded-lg flex items-center justify-center text-slate-400 dark:text-slate-500 text-sm">
                          Drop tasks here
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      <TaskDetailModal 
        task={selectedTask} 
        isOpen={!!selectedTask} 
        onClose={() => setSelectedTask(null)}
        memberMap={memberMap}
        onTaskUpdated={(updatedTask) => {
          setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
          setSelectedTask(updatedTask);
        }}
      />
    </div>
  );
}
