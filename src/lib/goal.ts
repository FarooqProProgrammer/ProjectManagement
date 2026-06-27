import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  serverTimestamp,
  doc,
  arrayUnion,
} from "firebase/firestore";

export interface Goal {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  type: "company" | "team" | "personal";
  ownerId: string;
  linkedProjectIds: string[];
  progress: number;
  targetDate: string;
  status: "On Track" | "At Risk" | "Completed" | "Off Track";
  createdAt?: any;
}

const GOALS_COLLECTION = "goals";

export async function createGoal(
  workspaceId: string,
  title: string,
  type: "company" | "team" | "personal",
  ownerId: string,
  targetDate: string,
  description?: string
): Promise<Goal> {
  const goalData = {
    workspaceId,
    title,
    description: description ?? "",
    type,
    ownerId,
    linkedProjectIds: [],
    progress: 0,
    targetDate,
    status: "Off Track" as Goal["status"],
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, GOALS_COLLECTION), goalData);

  return {
    id: docRef.id,
    ...goalData,
  };
}

export async function getWorkspaceGoals(workspaceId: string): Promise<Goal[]> {
  const q = query(
    collection(db, GOALS_COLLECTION),
    where("workspaceId", "==", workspaceId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<Goal, "id">),
  }));
}

export async function updateGoal(
  goalId: string,
  data: Partial<Goal>
): Promise<void> {
  const goalRef = doc(db, GOALS_COLLECTION, goalId);
  await updateDoc(goalRef, data as Record<string, unknown>);
}

function deriveStatus(progress: number): Goal["status"] {
  if (progress >= 100) return "Completed";
  if (progress >= 70) return "On Track";
  if (progress >= 40) return "At Risk";
  return "Off Track";
}

export async function updateGoalProgress(
  goalId: string,
  progress: number
): Promise<void> {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const status = deriveStatus(clampedProgress);

  const goalRef = doc(db, GOALS_COLLECTION, goalId);
  await updateDoc(goalRef, { progress: clampedProgress, status });
}

export async function linkProjectToGoal(
  goalId: string,
  projectId: string
): Promise<void> {
  const goalRef = doc(db, GOALS_COLLECTION, goalId);
  await updateDoc(goalRef, { linkedProjectIds: arrayUnion(projectId) });
}

export async function deleteGoal(goalId: string): Promise<void> {
  const goalRef = doc(db, GOALS_COLLECTION, goalId);
  await deleteDoc(goalRef);
}
