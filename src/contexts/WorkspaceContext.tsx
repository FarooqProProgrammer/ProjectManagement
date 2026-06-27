"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Workspace, getUserWorkspaces, createWorkspace, updateWorkspaceName, deleteWorkspace } from "@/lib/workspace";

interface WorkspaceContextProps {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspace: (ws: Workspace) => void;
  loading: boolean;
  addWorkspace: (name: string) => Promise<Workspace>;
  renameActiveWorkspace: (newName: string) => Promise<void>;
  removeActiveWorkspace: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userWs = await getUserWorkspaces(currentUser.uid);
          setWorkspaces(userWs);
          if (userWs.length > 0) {
            const savedId = localStorage.getItem("activeWorkspaceId");
            const found = userWs.find(w => w.id === savedId);
            setActiveWorkspace(found || userWs[0]);
          } else {
            const defaultWsName = currentUser.displayName ? `${currentUser.displayName.split(' ')[0]}'s Workspace` : "My Workspace";
            const newWs = await createWorkspace(defaultWsName, currentUser.uid);
            
            // Auto-create a default project for the new workspace
            const { createProject } = await import("@/lib/project");
            await createProject(newWs.id, "My First Project", "Active");
            
            setWorkspaces([newWs]);
            setActiveWorkspace(newWs);
          }
        } catch (error) {
          console.error("Failed to load workspaces:", error);
        }
      } else {
        setWorkspaces([]);
        setActiveWorkspace(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (activeWorkspace) {
      localStorage.setItem("activeWorkspaceId", activeWorkspace.id);
    }
  }, [activeWorkspace]);

  const addWorkspace = async (name: string): Promise<Workspace> => {
    if (!user) throw new Error("Must be logged in");
    const newWs = await createWorkspace(name, user.uid);
    setWorkspaces((prev) => [...prev, newWs]);
    setActiveWorkspace(newWs);
    return newWs;
  };

  const renameActiveWorkspace = async (newName: string): Promise<void> => {
    if (!activeWorkspace) throw new Error("No active workspace");
    await updateWorkspaceName(activeWorkspace.id, newName);
    const updated = { ...activeWorkspace, name: newName };
    setActiveWorkspace(updated);
    setWorkspaces((prev) => prev.map(ws => ws.id === activeWorkspace.id ? updated : ws));
  };

  const removeActiveWorkspace = async (): Promise<void> => {
    if (!activeWorkspace) throw new Error("No active workspace");
    await deleteWorkspace(activeWorkspace.id);
    
    const remaining = workspaces.filter(ws => ws.id !== activeWorkspace.id);
    setWorkspaces(remaining);
    setActiveWorkspace(remaining.length > 0 ? remaining[0] : null);
    
    if (remaining.length === 0) {
      localStorage.removeItem("activeWorkspaceId");
    }
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        loading,
        addWorkspace,
        renameActiveWorkspace,
        removeActiveWorkspace
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error("useWorkspace must be used within a WorkspaceProvider");
  }
  return context;
}
