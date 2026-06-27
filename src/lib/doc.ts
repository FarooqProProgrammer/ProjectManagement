import { db } from "./firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc as firestoreGetDoc,
  updateDoc as firestoreUpdateDoc,
  deleteDoc as firestoreDeleteDoc,
  query,
  where,
  serverTimestamp,
  orderBy,
} from "firebase/firestore";

export interface Doc {
  id: string;
  workspaceId: string;
  projectId?: string;
  title: string;
  content: string;
  authorId: string;
  lastEditedBy?: string;
  isPublic: boolean;
  createdAt?: any;
  updatedAt?: any;
}

export async function createDoc(
  workspaceId: string,
  title: string,
  authorId: string,
  projectId?: string,
  content?: string
): Promise<Doc> {
  const data: any = {
    workspaceId,
    title,
    authorId,
    content: content ?? "",
    isPublic: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (projectId) {
    data.projectId = projectId;
  }

  const ref = await addDoc(collection(db, "docs"), data);

  return {
    id: ref.id,
    workspaceId,
    title,
    authorId,
    content: data.content,
    isPublic: false,
    projectId,
  };
}

export async function getWorkspaceDocs(workspaceId: string): Promise<Doc[]> {
  const q = query(
    collection(db, "docs"),
    where("workspaceId", "==", workspaceId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Doc, "id">),
  }));
}

export async function getProjectDocs(projectId: string): Promise<Doc[]> {
  const q = query(
    collection(db, "docs"),
    where("projectId", "==", projectId),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...(d.data() as Omit<Doc, "id">),
  }));
}

export async function getDoc(docId: string): Promise<Doc | null> {
  const ref = doc(db, "docs", docId);
  const snapshot = await firestoreGetDoc(ref);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    id: snapshot.id,
    ...(snapshot.data() as Omit<Doc, "id">),
  };
}

export async function updateDocContent(
  docId: string,
  data: Partial<Doc>
): Promise<void> {
  const ref = doc(db, "docs", docId);
  await firestoreUpdateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteDoc(docId: string): Promise<void> {
  const ref = doc(db, "docs", docId);
  await firestoreDeleteDoc(ref);
}
