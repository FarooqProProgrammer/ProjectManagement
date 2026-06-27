import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  serverTimestamp,
  deleteDoc,
  doc
} from "firebase/firestore";

export interface TimeLog {
  id: string;
  taskId: string;
  userId: string;
  hours: number;
  description: string;
  createdAt: any;
}

export const getTimeLogsByTask = async (taskId: string): Promise<TimeLog[]> => {
  try {
    const q = query(
      collection(db, "time_logs"),
      where("taskId", "==", taskId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
    })) as TimeLog[];
  } catch (error) {
    console.error("Error fetching time logs:", error);
    throw error;
  }
};

export const addTimeLog = async (
  taskId: string,
  userId: string,
  hours: number,
  description: string
): Promise<TimeLog> => {
  const logsRef = collection(db, "time_logs");
  
  const newLog = {
    taskId,
    userId,
    hours,
    description,
    createdAt: serverTimestamp()
  };
  
  const docRef = await addDoc(logsRef, newLog);
  
  return {
    id: docRef.id,
    taskId,
    userId,
    hours,
    description,
    createdAt: new Date().toISOString()
  };
};

export const deleteTimeLog = async (logId: string): Promise<void> => {
  const logRef = doc(db, "time_logs", logId);
  await deleteDoc(logRef);
};
