import { db } from "./firebase";
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy,
  serverTimestamp,
  updateDoc,
  doc,
  writeBatch
} from "firebase/firestore";

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: any;
}

export const getUserNotifications = async (userId: string): Promise<Notification[]> => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
    })) as Notification[];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  link?: string
): Promise<Notification> => {
  const notificationsRef = collection(db, "notifications");
  
  const newNotification = {
    userId,
    title,
    message,
    isRead: false,
    link: link || "",
    createdAt: serverTimestamp()
  };
  
  const docRef = await addDoc(notificationsRef, newNotification);
  
  return {
    id: docRef.id,
    userId,
    title,
    message,
    isRead: false,
    link,
    createdAt: new Date().toISOString()
  };
};

export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  const notifRef = doc(db, "notifications", notificationId);
  await updateDoc(notifRef, { isRead: true });
};

export const markAllNotificationsAsRead = async (userId: string): Promise<void> => {
  try {
    const q = query(
      collection(db, "notifications"),
      where("userId", "==", userId),
      where("isRead", "==", false)
    );
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) return;

    const batch = writeBatch(db);
    querySnapshot.docs.forEach((document) => {
      batch.update(document.ref, { isRead: true });
    });
    
    await batch.commit();
  } catch (error) {
    console.error("Error marking all as read:", error);
    throw error;
  }
};
