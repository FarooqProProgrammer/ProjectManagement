import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { User } from "firebase/auth";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  defaultWorkspaceId?: string;
}

export const syncUserToFirestore = async (user: User): Promise<void> => {
  if (!user.email) return;

  const userRef = doc(db, "users", user.uid);
  
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email.toLowerCase(),
    displayName: user.displayName || user.email.split('@')[0],
    photoURL: user.photoURL || null,
  }, { merge: true });
};

export const getUserByEmail = async (email: string): Promise<UserProfile | null> => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("email", "==", email.toLowerCase()));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data() as UserProfile;
};

export const getUsersByIds = async (uids: string[]): Promise<UserProfile[]> => {
  if (uids.length === 0) return [];
  
  const chunks = [];
  for (let i = 0; i < uids.length; i += 10) {
    chunks.push(uids.slice(i, i + 10));
  }

  const users: UserProfile[] = [];
  const usersRef = collection(db, "users");

  for (const chunk of chunks) {
    const q = query(usersRef, where("uid", "in", chunk));
    const snapshot = await getDocs(q);
    snapshot.forEach((doc) => {
      users.push(doc.data() as UserProfile);
    });
  }

  return users;
};

export const updateUserProfile = async (uid: string, updates: Partial<UserProfile>): Promise<void> => {
  const userRef = doc(db, "users", uid);
  await setDoc(userRef, updates, { merge: true });
};
