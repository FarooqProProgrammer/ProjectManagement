import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  serverTimestamp
} from "firebase/firestore";

export interface ActivityLog {
  id: string;
  taskId: string;
  userId: string;
  action: string;
  details?: string;
  createdAt: any;
}

export const getActivityLogsByTask = async (taskId: string): Promise<ActivityLog[]> => {
  try {
    const q = query(
      collection(db, "activity_logs"),
      where("taskId", "==", taskId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
    })) as ActivityLog[];
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    throw error;
  }
};

export const createActivityLog = async (
  taskId: string,
  userId: string,
  action: string,
  details?: string
): Promise<ActivityLog> => {
  const logsRef = collection(db, "activity_logs");
  
  const newLog = {
    taskId,
    userId,
    action,
    details: details || "",
    createdAt: serverTimestamp()
  };
  
  const docRef = await addDoc(logsRef, newLog);
  
  return {
    id: docRef.id,
    taskId,
    userId,
    action,
    details,
    createdAt: new Date().toISOString()
  };
};
