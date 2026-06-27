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
  orderBy,
  doc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

export interface Sprint {
  id: string;
  workspaceId: string;
  projectId: string;
  name: string;
  goal?: string;
  startDate: string;
  endDate: string;
  status: "Planning" | "Active" | "Completed";
  taskIds: string[];
  createdAt?: any;
}

export async function createSprint(
  workspaceId: string,
  projectId: string,
  name: string,
  startDate: string,
  endDate: string,
  goal?: string
): Promise<Sprint> {
  const sprintData = {
    workspaceId,
    projectId,
    name,
    startDate,
    endDate,
    status: "Planning" as const,
    taskIds: [],
    createdAt: serverTimestamp(),
    ...(goal !== undefined ? { goal } : {}),
  };

  const docRef = await addDoc(collection(db, "sprints"), sprintData);

  return {
    id: docRef.id,
    ...sprintData,
  };
}

export async function getWorkspaceSprints(workspaceId: string): Promise<Sprint[]> {
  const q = query(
    collection(db, "sprints"),
    where("workspaceId", "==", workspaceId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Sprint, "id">),
  }));
}

export async function getProjectSprints(projectId: string): Promise<Sprint[]> {
  const q = query(
    collection(db, "sprints"),
    where("projectId", "==", projectId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Sprint, "id">),
  }));
}

export async function updateSprint(
  sprintId: string,
  data: Partial<Sprint>
): Promise<void> {
  const sprintRef = doc(db, "sprints", sprintId);
  const { id, ...rest } = data;
  await updateDoc(sprintRef, rest as Record<string, any>);
}

export async function addTaskToSprint(
  sprintId: string,
  taskId: string
): Promise<void> {
  const sprintRef = doc(db, "sprints", sprintId);
  await updateDoc(sprintRef, {
    taskIds: arrayUnion(taskId),
  });
}

export async function removeTaskFromSprint(
  sprintId: string,
  taskId: string
): Promise<void> {
  const sprintRef = doc(db, "sprints", sprintId);
  await updateDoc(sprintRef, {
    taskIds: arrayRemove(taskId),
  });
}

export async function deleteSprint(sprintId: string): Promise<void> {
  const sprintRef = doc(db, "sprints", sprintId);
  await deleteDoc(sprintRef);
}

export async function completeSprint(sprintId: string): Promise<void> {
  const sprintRef = doc(db, "sprints", sprintId);
  await updateDoc(sprintRef, {
    status: "Completed",
  });
}
