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
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "./firebase";

export type WorkspaceRole = "admin" | "member" | "viewer";

export interface Workspace {
  id: string;
  name: string;
  ownerId: string;
  members: string[];
  roles: Record<string, WorkspaceRole>;
  createdAt?: any;
}

export const createWorkspace = async (name: string, userId: string): Promise<Workspace> => {
  const workspacesRef = collection(db, "workspaces");
  const newWorkspace = {
    name,
    ownerId: userId,
    members: [userId],
    roles: {
      [userId]: "admin" as WorkspaceRole
    },
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

export const inviteMemberToWorkspace = async (workspaceId: string, userId: string, role: WorkspaceRole = "member"): Promise<void> => {
  const workspaceRef = doc(db, "workspaces", workspaceId);
  await updateDoc(workspaceRef, {
    members: arrayUnion(userId),
    [`roles.${userId}`]: role,
  });
};

export const updateMemberRole = async (workspaceId: string, userId: string, newRole: WorkspaceRole): Promise<void> => {
  const workspaceRef = doc(db, "workspaces", workspaceId);
  await updateDoc(workspaceRef, {
    [`roles.${userId}`]: newRole,
  });
};

export const removeMemberFromWorkspace = async (workspaceId: string, userId: string): Promise<void> => {
  const workspaceRef = doc(db, "workspaces", workspaceId);
  // Firestore doesn't easily let you delete a map key with arrayRemove, 
  // you actually have to use deleteField(), but setting it to null or ignoring it is fine since they are removed from members array.
  // We will leave the role there or overwrite it, but the source of truth is the members array.
  await updateDoc(workspaceRef, {
    members: arrayRemove(userId),
  });
};
