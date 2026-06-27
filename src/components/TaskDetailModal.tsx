import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Task, Subtask, updateTaskSubtasks, updateTaskEstimatedHours } from "@/lib/task";
import { Comment, getCommentsByTask, addComment, deleteComment } from "@/lib/comment";
import { TimeLog, getTimeLogsByTask, addTimeLog, deleteTimeLog } from "@/lib/time";
import { ActivityLog, getActivityLogsByTask } from "@/lib/activity";
import { UserProfile } from "@/lib/user";
import { CheckSquare, MessageSquare, Send, Trash2, User, Flag, Clock, Activity } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { auth } from "@/lib/firebase";

interface TaskDetailModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  memberMap: Map<string, UserProfile>;
  onTaskUpdated: (task: Task) => void;
}

export function TaskDetailModal({ task, isOpen, onClose, memberMap, onTaskUpdated }: TaskDetailModalProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [priority, setPriority] = useState<"Low" | "Medium" | "High">(task?.priority || "Medium");
  const [estimatedHours, setEstimatedHours] = useState<string>(task?.estimatedHours?.toString() || "");

  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [newLogHours, setNewLogHours] = useState("");
  const [newLogDesc, setNewLogDesc] = useState("");
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);

  const currentUser = auth.currentUser;

  useEffect(() => {
    if (task) {
      setPriority(task.priority || "Medium");
      setEstimatedHours(task.estimatedHours?.toString() || "");
    }
  }, [task]);

  useEffect(() => {
    if (isOpen && task) {
      loadComments();
      loadTimeLogs();
      loadActivityLogs();
    }
  }, [isOpen, task]);

  const loadComments = async () => {
    if (!task) return;
    try {
      const fetched = await getCommentsByTask(task.id);
      setComments(fetched);
    } catch (error) {
      console.error(error);
    }
  };

  const loadTimeLogs = async () => {
    if (!task) return;
    try {
      const fetched = await getTimeLogsByTask(task.id);
      setTimeLogs(fetched);
    } catch (error) {
      console.error(error);
    }
  };

  const loadActivityLogs = async () => {
    if (!task) return;
    try {
      const fetched = await getActivityLogsByTask(task.id);
      setActivityLogs(fetched);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !currentUser || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const added = await addComment(task.id, currentUser.uid, newComment.trim());
      setComments([...comments, added]);
      setNewComment("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await deleteComment(commentId);
      setComments(comments.filter(c => c.id !== commentId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddTimeLog = async (e: React.FormEvent) => {
    e.preventDefault();
    const hours = parseFloat(newLogHours);
    if (!task || !currentUser || isNaN(hours) || hours <= 0 || !newLogDesc.trim()) return;

    setIsSubmittingLog(true);
    try {
      const added = await addTimeLog(task.id, currentUser.uid, hours, newLogDesc.trim());
      setTimeLogs([added, ...timeLogs]);
      setNewLogHours("");
      setNewLogDesc("");
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmittingLog(false);
    }
  };

  const handleDeleteTimeLog = async (logId: string) => {
    try {
      await deleteTimeLog(logId);
      setTimeLogs(timeLogs.filter(l => l.id !== logId));
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !newSubtaskTitle.trim()) return;

    const newSubtask: Subtask = {
      id: Date.now().toString(),
      title: newSubtaskTitle.trim(),
      isCompleted: false,
    };

    const updatedSubtasks = [...(task.subtasks || []), newSubtask];
    
    try {
      await updateTaskSubtasks(task.id, updatedSubtasks);
      onTaskUpdated({ ...task, subtasks: updatedSubtasks });
      setNewSubtaskTitle("");
    } catch (error) {
      console.error(error);
    }
  };

  const toggleSubtask = async (subtaskId: string) => {
    if (!task) return;
    
    const updatedSubtasks = (task.subtasks || []).map(st => 
      st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st
    );

    try {
      await updateTaskSubtasks(task.id, updatedSubtasks);
      onTaskUpdated({ ...task, subtasks: updatedSubtasks });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!task) return;
    
    const updatedSubtasks = (task.subtasks || []).filter(st => st.id !== subtaskId);

    try {
      await updateTaskSubtasks(task.id, updatedSubtasks);
      onTaskUpdated({ ...task, subtasks: updatedSubtasks });
    } catch (error) {
      console.error(error);
    }
  };

  const handlePriorityChange = async (val: "Low" | "Medium" | "High") => {
    if (!task) return;
    setPriority(val);
    try {
      const { updateTaskPriority } = await import("@/lib/task");
      await updateTaskPriority(task.id, val);
      onTaskUpdated({ ...task, priority: val });
    } catch (error) {
      console.error(error);
    }
  };

  const handleEstimatedHoursChange = async (val: string) => {
    setEstimatedHours(val);
    const parsed = parseFloat(val);
    if (!task) return;
    try {
      await updateTaskEstimatedHours(task.id, isNaN(parsed) ? 0 : parsed);
      onTaskUpdated({ ...task, estimatedHours: isNaN(parsed) ? 0 : parsed });
    } catch (error) {
      console.error(error);
    }
  };

  if (!task) return null;

  const completedSubtasks = task.subtasks?.filter(s => s.isCompleted).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  const progressPercent = totalSubtasks === 0 ? 0 : Math.round((completedSubtasks / totalSubtasks) * 100);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white sm:max-w-3xl h-[80vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <DialogTitle className="text-xl flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${task.status === 'Done' ? 'bg-green-500' : task.status === 'In Progress' ? 'bg-yellow-500' : 'bg-blue-500'}`}></span>
            {task.title}
          </DialogTitle>
          {task.description && (
            <DialogDescription className="text-slate-600 dark:text-slate-400 mt-2 whitespace-pre-wrap">
              {task.description}
            </DialogDescription>
          )}
          <div className="mt-4 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                <Flag className="w-4 h-4" />
                Priority:
              </span>
              <Select value={priority} onValueChange={handlePriorityChange}>
                <SelectTrigger className="text-xs w-[110px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-500 flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Est. Hours:
              </span>
              <Input 
                type="number"
                step="0.5"
                min="0"
                value={estimatedHours}
                onChange={(e) => handleEstimatedHoursChange(e.target.value)}
                placeholder="e.g. 5"
                className="text-xs h-8 w-[110px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col md:flex-row gap-6">
          
          {/* Left Column: Subtasks */}
          <div className="flex-1 space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-slate-500" />
                  Subtasks
                </h3>
                {totalSubtasks > 0 && (
                  <span className="text-sm font-medium text-slate-500">{progressPercent}%</span>
                )}
              </div>
              
              {totalSubtasks > 0 && (
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-blue-500 h-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              )}

              <div className="space-y-2">
                {task.subtasks?.map(st => (
                  <div key={st.id} className="flex items-center gap-3 p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg group">
                    <input 
                      type="checkbox" 
                      checked={st.isCompleted} 
                      onChange={() => toggleSubtask(st.id)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`flex-1 text-sm ${st.isCompleted ? 'line-through text-slate-400' : ''}`}>
                      {st.title}
                    </span>
                    <button 
                      onClick={() => handleDeleteSubtask(st.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddSubtask} className="flex gap-2">
                <Input
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  placeholder="Add a new subtask..."
                  className="bg-slate-50 dark:bg-slate-950 h-9"
                />
                <Button type="submit" disabled={!newSubtaskTitle.trim()} size="sm" variant="secondary">
                  Add
                </Button>
              </form>
            </div>
          </div>

          {/* Right Column: Comments & Time */}
          <div className="flex-1 flex flex-col border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 md:pl-6 pt-4 md:pt-0">
            <Tabs defaultValue="comments" className="flex flex-col h-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="comments">Comments</TabsTrigger>
                <TabsTrigger value="time">Time Log</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
              
              <TabsContent value="comments" className="flex-1 flex flex-col mt-0 h-full">
                <div className="flex-1 flex flex-col gap-4 overflow-y-auto mb-4 min-h-[200px] pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                  {comments.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                      No comments yet. Start the conversation!
                    </div>
                  ) : (
                    comments.map(comment => {
                      const author = memberMap.get(comment.authorId);
                      const isOwner = currentUser?.uid === comment.authorId;
                      
                      return (
                        <div key={comment.id} className="flex gap-3 text-sm">
                          <div className="flex-shrink-0 mt-1">
                            {author?.photoURL ? (
                              <img src={author.photoURL} alt={author.displayName} className="w-8 h-8 rounded-full" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center">
                                <User className="w-4 h-4 text-slate-500" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-baseline justify-between mb-1">
                              <span className="font-medium">{author?.displayName || 'Unknown User'}</span>
                              <span className="text-xs text-slate-400 ml-2">
                                {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                              {comment.content}
                            </p>
                            {isOwner && (
                              <button 
                                onClick={() => handleDeleteComment(comment.id)}
                                className="text-xs text-slate-400 hover:text-red-500 mt-1 font-medium"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <form onSubmit={handleAddComment} className="flex gap-2 flex-shrink-0 bg-white dark:bg-slate-900 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a comment..."
                    className="min-h-[40px] h-[40px] resize-none py-2"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleAddComment(e);
                      }
                    }}
                  />
                  <Button type="submit" disabled={isSubmitting || !newComment.trim()} className="px-3" size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="time" className="flex-1 flex flex-col mt-0 h-full">
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto mb-4 min-h-[200px] pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                  {timeLogs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                      No time logged yet.
                    </div>
                  ) : (
                    timeLogs.map(log => {
                      const author = memberMap.get(log.userId);
                      const isOwner = currentUser?.uid === log.userId;
                      return (
                        <div key={log.id} className="flex flex-col gap-1 text-sm bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {log.hours} {log.hours === 1 ? 'hr' : 'hrs'}
                            </span>
                            <span className="text-xs text-slate-400">
                              {new Date(log.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300">{log.description}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {author?.displayName || 'Unknown User'}
                            </span>
                            {isOwner && (
                              <button 
                                onClick={() => handleDeleteTimeLog(log.id)}
                                className="text-xs text-red-400 hover:text-red-500 font-medium"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>

                <form onSubmit={handleAddTimeLog} className="flex flex-col gap-2 flex-shrink-0 bg-white dark:bg-slate-900 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      step="0.25"
                      min="0.25"
                      value={newLogHours}
                      onChange={(e) => setNewLogHours(e.target.value)}
                      placeholder="Hrs"
                      className="w-20 bg-slate-50 dark:bg-slate-950 h-9"
                    />
                    <Input
                      value={newLogDesc}
                      onChange={(e) => setNewLogDesc(e.target.value)}
                      placeholder="What did you work on?"
                      className="flex-1 bg-slate-50 dark:bg-slate-950 h-9"
                    />
                    <Button type="submit" disabled={isSubmittingLog || !newLogHours || !newLogDesc.trim()} size="sm">
                      Log
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="activity" className="flex-1 flex flex-col mt-0 h-full">
                <div className="flex-1 flex flex-col gap-3 overflow-y-auto mb-4 min-h-[200px] pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
                  {activityLogs.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                      No activity recorded yet.
                    </div>
                  ) : (
                    activityLogs.map(log => {
                      const author = memberMap.get(log.userId);
                      return (
                        <div key={log.id} className="flex gap-3 text-sm border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 last:pb-0">
                          <div className="flex-shrink-0 mt-0.5">
                            <Activity className="w-4 h-4 text-slate-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-700 dark:text-slate-300">
                              <span className="font-semibold text-slate-900 dark:text-white mr-1">{author?.displayName || 'Unknown User'}</span>
                              {log.action}
                              {log.details && <span className="text-slate-500 ml-1">({log.details})</span>}
                            </p>
                            <span className="text-xs text-slate-400">
                              {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  );
}
