import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import type { AppUser, UserRole } from "@/types/user";

function toAppUser(id: string, data: Record<string, unknown>): AppUser {
  return { id, ...(data as Omit<AppUser, "id">) };
}

/** Fetches a single user profile (role, active status) by their auth uid. */
export async function getUserProfile(uid: string): Promise<AppUser | null> {
  const snap = await getDoc(doc(db, COLLECTIONS.users, uid));
  if (!snap.exists()) return null;
  return toAppUser(snap.id, snap.data());
}

/**
 * Creates the Firestore profile document for a user that already exists in
 * Firebase Authentication. New accounts default to the CASHIER role and
 * must be promoted by an admin - this app never lets a signup request
 * elevate its own privileges.
 */
export async function createUserProfile(uid: string, displayName: string, email: string): Promise<void> {
  await setDoc(doc(db, COLLECTIONS.users, uid), {
    displayName,
    email,
    role: "CASHIER" satisfies UserRole,
    isActive: true,
  });
}

export function subscribeToUsers(
  onChange: (users: AppUser[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, COLLECTIONS.users), orderBy("displayName", "asc"));

  return onSnapshot(
    q,
    (snapshot) => onChange(snapshot.docs.map((d) => toAppUser(d.id, d.data()))),
    (error) => onError(error)
  );
}

export async function updateUserRole(userId: string, role: UserRole): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.users, userId), { role });
}

export async function setUserActive(userId: string, isActive: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.users, userId), { isActive });
}
