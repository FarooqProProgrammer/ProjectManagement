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

export interface Task {
  id: string;
  workspaceId: string;
  projectId: string; // If empty string, it's a workspace-level task without a project
  title: string;
  description?: string;
  status: TaskStatus;
  assigneeId?: string;
  dueDate?: string;
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
    dueDate: dueDate || "",
    assigneeId: assigneeId || null,
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
};

export const updateTaskAssignee = async (taskId: string, assigneeId: string | null): Promise<void> => {
  const taskRef = doc(db, "tasks", taskId);
  await updateDoc(taskRef, { assigneeId });
};

export const deleteTask = async (taskId: string): Promise<void> => {
  const taskRef = doc(db, "tasks", taskId);
  await deleteDoc(taskRef);
};
