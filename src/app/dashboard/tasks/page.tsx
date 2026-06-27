"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { getTasksByWorkspace, createTask, updateTaskStatus, deleteTask, Task, TaskStatus } from "@/lib/task";
import { getWorkspaceProjects, Project } from "@/lib/project";
import { getUsersByIds, UserProfile } from "@/lib/user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TaskDetailModal } from "@/components/TaskDetailModal";
import { CheckCircle2, Clock, MoreVertical, Plus, Trash2, Calendar, Search, Filter } from "lucide-react";
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

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

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

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (task.description?.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesAssignee = assigneeFilter === "all" ||
                              (assigneeFilter === "unassigned" && !task.assigneeId) ||
                              task.assigneeId === assigneeFilter;
      const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

      return matchesSearch && matchesAssignee && matchesPriority;
    });
  }, [tasks, searchQuery, assigneeFilter, priorityFilter]);

  const columns: { title: string; status: TaskStatus; icon: React.ElementType }[] = [
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

    if (!destination) {
      return;
    }

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
        <p className="text-muted-foreground">Please select a workspace to view tasks.</p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col gap-6 h-full w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
        <title>My Tasks | Projectify</title>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-1">My Tasks</h1>
            <p className="text-muted-foreground">Manage and track your tasks across all projects.</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20">
                <Plus className="w-4 h-4 mr-2" />
                New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to your workspace.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateTask} className="space-y-4 pt-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Design homepage layout"
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project">Project</Label>
                  <Select value={projectId} onValueChange={setProjectId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a project" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      <SelectItem value="none">No Project (Workspace Level)</SelectItem>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignee">Assignee</Label>
                  <Select value={assigneeId} onValueChange={setAssigneeId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent className="max-h-48">
                      <SelectItem value="none">Unassigned</SelectItem>
                      {members.map((m) => (
                        <SelectItem key={m.uid} value={m.uid}>{m.displayName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Add any additional details here..."
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <DialogFooter className="pt-2 border-t border-border">
                  <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isCreating || !title.trim()} className="bg-blue-600 hover:bg-blue-500 text-white">
                    {isCreating ? "Creating..." : "Create Task"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tasks..."
                  className="pl-9"
                />
              </div>

              <div className="flex gap-3">
                <div className="w-44">
                  <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Filter className="w-3 h-3 text-muted-foreground" />
                        <SelectValue placeholder="Assignee" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Members</SelectItem>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {members.map(m => (
                        <SelectItem key={m.uid} value={m.uid}>{m.displayName}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-44">
                  <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                    <SelectTrigger>
                      <div className="flex items-center gap-2">
                        <Filter className="w-3 h-3 text-muted-foreground" />
                        <SelectValue placeholder="Priority" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[0, 1, 2].map((col) => (
              <div key={col} className="flex flex-col gap-3 rounded-2xl bg-muted/40 border border-border p-4">
                <Skeleton className="h-6 w-24 mb-2" />
                {[0, 1, 2].map((row) => (
                  <Skeleton key={row} className="h-24 w-full rounded-lg" />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 h-full overflow-hidden pb-4">
              {columns.map((column) => {
                const columnTasks = filteredTasks.filter(t => t.status === column.status);
                return (
                  <div
                    key={column.title}
                    className="flex flex-col h-full bg-muted/40 rounded-2xl border border-border overflow-hidden"
                  >
                    {/* Column Header */}
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <column.icon
                          className={`w-4 h-4 ${column.status === "Done" ? "text-green-500" : "text-blue-500"}`}
                        />
                        <h3 className="font-semibold text-sm text-foreground">{column.title}</h3>
                      </div>
                      <Badge variant="secondary" className="font-bold tabular-nums">
                        {columnTasks.length}
                      </Badge>
                    </div>

                    <Droppable droppableId={column.status}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`flex-1 p-3 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent transition-colors ${snapshot.isDraggingOver ? "bg-muted/60" : ""}`}
                        >
                          {columnTasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                              {(provided, snapshot) => (
                                <Card
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => setSelectedTask(task)}
                                  className={`bg-background border-border transition-all shadow-sm cursor-pointer group ${snapshot.isDragging ? "shadow-xl shadow-blue-500/10 border-blue-500 z-50 rotate-1" : "hover:border-blue-400 hover:shadow-md"}`}
                                >
                                  <CardContent className="p-3.5">
                                    {/* Card Top: Title + Menu */}
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                      <h4 className="font-medium text-foreground text-sm leading-snug flex-1">{task.title}</h4>
                                      <div onClick={e => e.stopPropagation()} className="shrink-0">
                                        <DropdownMenu>
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <DropdownMenuTrigger asChild>
                                                <button className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted -mt-0.5 -mr-0.5 opacity-0 group-hover:opacity-100 focus:opacity-100">
                                                  <MoreVertical className="w-4 h-4" />
                                                </button>
                                              </DropdownMenuTrigger>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">Task options</TooltipContent>
                                          </Tooltip>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem className="text-muted-foreground cursor-default" disabled>
                                              Move to...
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            {columns.filter(c => c.status !== task.status).map(c => (
                                              <DropdownMenuItem
                                                key={c.status}
                                                onClick={() => handleStatusChange(task.id, c.status)}
                                                className="cursor-pointer"
                                              >
                                                {c.title}
                                              </DropdownMenuItem>
                                            ))}
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem
                                              onClick={() => handleDeleteTask(task.id)}
                                              className="text-destructive focus:text-destructive cursor-pointer"
                                            >
                                              <Trash2 className="w-4 h-4 mr-2" />
                                              Delete
                                            </DropdownMenuItem>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      </div>
                                    </div>

                                    {task.description && (
                                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                                        {task.description}
                                      </p>
                                    )}

                                    {/* Card Footer: project dot, priority badge, due date, assignee */}
                                    <div className="flex items-center justify-between gap-2 mt-2 flex-wrap">
                                      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                                        <div className={`w-2 h-2 rounded-full shrink-0 ${getProjectColor(task.projectId)}`} />
                                        <span className="text-xs text-muted-foreground truncate max-w-[90px]">
                                          {getProjectName(task.projectId)}
                                        </span>

                                        {task.priority && (
                                          task.priority === "High" ? (
                                            <Badge variant="destructive" className="text-[10px] h-4 px-1.5">
                                              High
                                            </Badge>
                                          ) : task.priority === "Medium" ? (
                                            <Badge className="text-[10px] h-4 px-1.5 bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/20">
                                              Medium
                                            </Badge>
                                          ) : (
                                            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                                              Low
                                            </Badge>
                                          )
                                        )}
                                      </div>

                                      <div className="flex items-center gap-1.5 shrink-0">
                                        {task.dueDate && (
                                          <span className="flex items-center text-[10px] text-muted-foreground font-medium">
                                            <Calendar className="w-3 h-3 mr-0.5" />
                                            {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                          </span>
                                        )}

                                        {task.assigneeId && memberMap.has(task.assigneeId) && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <span className="inline-flex">
                                                <Avatar size="sm" className="w-5 h-5 ring-2 ring-background">
                                                  {memberMap.get(task.assigneeId)?.photoURL && (
                                                    <AvatarImage
                                                      src={memberMap.get(task.assigneeId)!.photoURL!}
                                                      alt={memberMap.get(task.assigneeId)?.displayName ?? "Assignee"}
                                                    />
                                                  )}
                                                  <AvatarFallback className="text-[10px] bg-blue-500 text-white font-bold">
                                                    {memberMap.get(task.assigneeId)?.displayName?.charAt(0).toUpperCase()}
                                                  </AvatarFallback>
                                                </Avatar>
                                              </span>
                                            </TooltipTrigger>
                                            <TooltipContent side="top">
                                              {memberMap.get(task.assigneeId)?.displayName}
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}

                          {columnTasks.length === 0 && (
                            <div className="h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                              Drop tasks here
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                );
              })}
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
    </TooltipProvider>
  );
}
