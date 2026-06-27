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

export type ProjectStatus = "Planning" | "In Progress" | "Active" | "Completed";

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  deadline?: string;
  imageUrl?: string;
  status: ProjectStatus;
  tasks: number;
  progress: number;
  color: string;
  createdAt?: any;
}

const TAILWIND_COLORS = [
  "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-green-500", 
  "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-blue-500", 
  "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", 
  "bg-pink-500", "bg-rose-500"
];

const getRandomColor = () => TAILWIND_COLORS[Math.floor(Math.random() * TAILWIND_COLORS.length)];

export const createProject = async (
  workspaceId: string, 
  name: string, 
  status: ProjectStatus = "Planning",
  description?: string,
  deadline?: string,
  imageUrl?: string
): Promise<Project> => {
  const projectsRef = collection(db, "projects");
  const newProject = {
    workspaceId,
    name,
    description: description || "",
    deadline: deadline || "",
    imageUrl: imageUrl || "",
    status,
    tasks: 0,
    progress: 0,
    color: getRandomColor(),
    createdAt: serverTimestamp(),
  };
  
  const docRef = await addDoc(projectsRef, newProject);
  
  return {
    id: docRef.id,
    ...newProject,
  } as Project;
};

export const getWorkspaceProjects = async (workspaceId: string): Promise<Project[]> => {
  const projectsRef = collection(db, "projects");
  const q = query(
    projectsRef, 
    where("workspaceId", "==", workspaceId)
  );
  
  const querySnapshot = await getDocs(q);
  const projects: Project[] = [];
  querySnapshot.forEach((doc) => {
    projects.push({ id: doc.id, ...doc.data() } as Project);
  });
  
  return projects.sort((a, b) => a.name.localeCompare(b.name));
};

export const updateProject = async (projectId: string, data: Partial<Project>): Promise<void> => {
  const projectRef = doc(db, "projects", projectId);
  await updateDoc(projectRef, data);
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const projectRef = doc(db, "projects", projectId);
  await deleteDoc(projectRef);
};

export const getProject = async (projectId: string): Promise<Project | null> => {
  const projectRef = doc(db, "projects", projectId);
  const projectSnap = await getDocs(query(collection(db, "projects"), where("__name__", "==", projectId)));
  
  if (projectSnap.empty) {
    return null;
  }
  
  const docSnap = projectSnap.docs[0];
  return {
    id: docSnap.id,
    ...docSnap.data(),
  } as Project;
};
