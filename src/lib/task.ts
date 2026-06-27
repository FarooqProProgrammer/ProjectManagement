import {
  collection,
  doc,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

export type TaskStatus = "To Do" | "In Progress" | "Done";
export type TaskPriority = "Low" | "Medium" | "High";

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface Task {
  id: string;
  workspaceId: string;
  projectId: string; // If empty string, it's a workspace-level task without a project
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  labels?: string[];
  assigneeId?: string;
  dueDate?: string;
  subtasks?: Subtask[];
  createdAt?: any;
}

export const createTask = async (
  workspaceId: string,
  projectId: string,
  title: string,
  description?: string,
  dueDate?: string,
  assigneeId?: string
): Promise<Task> => {
  const tasksRef = collection(db, "tasks");
  const newTask = {
    workspaceId,
    projectId,
    title,
    description: description || "",
    status: "To Do" as TaskStatus,
    priority: "Medium" as TaskPriority,
    labels: [],
    dueDate: dueDate || "",
    assigneeId: assigneeId || null,
    subtasks: [],
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(tasksRef, newTask);

  return {
    id: docRef.id,
    ...newTask,
  } as Task;
};

export const getTasksByWorkspace = async (workspaceId: string): Promise<Task[]> => {
  const tasksRef = collection(db, "tasks");
  const q = query(tasksRef, where("workspaceId", "==", workspaceId));
  const querySnapshot = await getDocs(q);
  
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Task[];
};

export const updateTaskStatus = async (taskId: string, status: TaskStatus): Promise<void> => {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, { status });

  if (auth.currentUser) {
    try {
      const { createActivityLog } = await import('./activity');
      await createActivityLog(taskId, auth.currentUser.uid, 'Status changed', `Moved to ${status}`);
    } catch (e) {
      console.error(e);
    }
  }
};

export const updateTaskPriority = async (taskId: string, priority: TaskPriority): Promise<void> => {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, { priority });

  if (auth.currentUser) {
    try {
      const { createActivityLog } = await import('./activity');
      await createActivityLog(taskId, auth.currentUser.uid, 'Priority updated', `Set to ${priority}`);
    } catch (e) {
      console.error(e);
    }
  }
};

export const updateTaskLabels = async (taskId: string, labels: string[]): Promise<void> => {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, { labels });
};

export const updateTaskAssignee = async (taskId: string, assigneeId: string | null): Promise<void> => {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, { assigneeId });

  // Trigger Notification if assignee is set
  if (assigneeId) {
    try {
      const { createNotification } = await import('./notification');
      await createNotification(
        assigneeId,
        "New Task Assignment",
        `You have been assigned to a new task.`,
        `/dashboard/tasks`
      );
    } catch (e) {
      console.error("Failed to send notification:", e);
    }
  }

  if (auth.currentUser) {
    try {
      const { createActivityLog } = await import('./activity');
      await createActivityLog(taskId, auth.currentUser.uid, 'Assignee updated', assigneeId ? 'Assigned to a member' : 'Unassigned');
    } catch (e) {
      console.error(e);
    }
  }
};

export const updateTaskSubtasks = async (taskId: string, subtasks: Subtask[]): Promise<void> => {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, { subtasks });

  if (auth.currentUser) {
    try {
      const { createActivityLog } = await import('./activity');
      await createActivityLog(taskId, auth.currentUser.uid, 'Subtasks updated');
    } catch (e) {
      console.error(e);
    }
  }
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const taskRef = doc(db, "tasks", taskId);
  await deleteDoc(taskRef);
};
