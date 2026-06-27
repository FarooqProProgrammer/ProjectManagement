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

export interface Comment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: any;
}

export const getCommentsByTask = async (taskId: string): Promise<Comment[]> => {
  try {
    const q = query(
      collection(db, "comments"),
      where("taskId", "==", taskId),
      orderBy("createdAt", "asc")
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      // Handle timestamp safely if it hasn't synced yet
      createdAt: doc.data().createdAt?.toDate()?.toISOString() || new Date().toISOString()
    })) as Comment[];
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

export const addComment = async (
  taskId: string,
  authorId: string,
  content: string
): Promise<Comment> => {
  const commentsRef = collection(db, "comments");
  
  const newComment = {
    taskId,
    authorId,
    content,
    createdAt: serverTimestamp()
  };
  
  const docRef = await addDoc(commentsRef, newComment);
  
  return {
    id: docRef.id,
    taskId,
    authorId,
    content,
    createdAt: new Date().toISOString()
  };
};

export const deleteComment = async (commentId: string): Promise<void> => {
  const commentRef = doc(db, "comments", commentId);
  await deleteDoc(commentRef);
};
