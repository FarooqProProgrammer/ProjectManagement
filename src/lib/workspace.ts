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

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: string[];
  createdAt?: any;
}

export const createWorkspace = async (name: string, userId: string): Promise<Workspace> => {
  const workspacesRef = collection(db, "workspaces");
  const newWorkspace = {
    name,
    ownerId: userId,
    members: [userId],
    createdAt: serverTimestamp(),
  };
  const docRef = await addDoc(workspacesRef, newWorkspace);
  
  return {
    id: docRef.id,
    ...newWorkspace,
  } as Workspace;
};

export const getUserWorkspaces = async (userId: string): Promise<Workspace[]> => {
  const workspacesRef = collection(db, "workspaces");
  const q = query(workspacesRef, where("members", "array-contains", userId));
  const querySnapshot = await getDocs(q);
  
  const workspaces: Workspace[] = [];
  querySnapshot.forEach((doc) => {
    workspaces.push({ id: doc.id, ...doc.data() } as Workspace);
  });
  
  return workspaces;
};

export const updateWorkspaceName = async (workspaceId: string, newName: string): Promise<void> => {
  const workspaceRef = doc(db, "workspaces", workspaceId);
  await updateDoc(workspaceRef, {
    name: newName,
  });
};

export const deleteWorkspace = async (workspaceId: string): Promise<void> => {
  const workspaceRef = doc(db, "workspaces", workspaceId);
  await deleteDoc(workspaceRef);
};
