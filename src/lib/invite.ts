import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  getDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { WorkspaceRole, inviteMemberToWorkspace } from "./workspace";

export interface WorkspaceInvite {
  id: string;
  workspaceId: string;
  role: WorkspaceRole;
  expiresAt: string;
  createdBy: string;
  createdAt: any;
}

export const createInviteLink = async (
  workspaceId: string,
  role: WorkspaceRole,
  expiresInDays: number,
  createdBy: string
): Promise<string> => {
  const invitesRef = collection(db, "workspace_invites");
  
  const expirationDate = new Date();
  expirationDate.setDate(expirationDate.getDate() + expiresInDays);
  
  const newInvite = {
    workspaceId,
    role,
    expiresAt: expirationDate.toISOString(),
    createdBy,
    createdAt: serverTimestamp()
  };
  
  const docRef = await addDoc(invitesRef, newInvite);
  
  return docRef.id;
};

export const getInviteDetails = async (inviteId: string): Promise<WorkspaceInvite | null> => {
  const docRef = doc(db, "workspace_invites", inviteId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    return { id: docSnap.id, ...data } as WorkspaceInvite;
  }
  return null;
};

export const acceptInvite = async (inviteId: string, userId: string): Promise<string> => {
  const invite = await getInviteDetails(inviteId);
  if (!invite) {
    throw new Error("Invalid invite link.");
  }
  
  if (new Date(invite.expiresAt) < new Date()) {
    throw new Error("This invite link has expired.");
  }
  
  await inviteMemberToWorkspace(invite.workspaceId, userId, invite.role);
  
  return invite.workspaceId;
};
