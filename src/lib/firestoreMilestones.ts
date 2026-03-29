import { db } from "./firebase";
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import { Milestone, MilestoneFormData } from "@/types/milestone";

const MILESTONES_COLLECTION = "milestones";

export async function loadMilestonesFromFirebase(): Promise<Milestone[]> {
  try {
    const milestonesRef = collection(db, MILESTONES_COLLECTION);
    const snapshot = await getDocs(milestonesRef);

    const milestones: Milestone[] = [];
    snapshot.forEach((doc) => {
      milestones.push({ id: doc.id, ...doc.data() } as Milestone);
    });

    return milestones.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    );
  } catch (error) {
    console.error("[Firebase] Error loading milestones from Firebase:", error);
    throw error;
  }
}

export async function addMilestoneToFirebase(
  id: string,
  data: MilestoneFormData,
): Promise<Milestone> {
  const docRef = doc(db, MILESTONES_COLLECTION, id);
  const docData = {
    title: data.title,
    date: data.date,
    description: data.description,
    images: data.images || [],
    tags: data.tags || [],
  };

  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(
      () => reject(new Error("Firebase write timeout after 10s")),
      10000,
    );
  });

  try {
    await Promise.race([setDoc(docRef, docData), timeoutPromise]);
    return { id, ...data };
  } catch (error) {
    console.error("[Firebase] Error adding milestone to Firebase:", error);
    throw error;
  }
}

export async function updateMilestoneInFirebase(
  id: string,
  data: Partial<MilestoneFormData>,
): Promise<void> {
  try {
    const docRef = doc(db, MILESTONES_COLLECTION, id);
    await setDoc(docRef, data, { merge: true });
  } catch (error) {
    console.error("Error updating milestone in Firebase:", error);
    throw error;
  }
}

export async function deleteMilestoneFromFirebase(id: string): Promise<void> {
  try {
    const docRef = doc(db, MILESTONES_COLLECTION, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting milestone from Firebase:", error);
    throw error;
  }
}

export async function clearMilestonesFromFirebase(): Promise<void> {
  try {
    const milestonesRef = collection(db, MILESTONES_COLLECTION);
    const snapshot = await getDocs(milestonesRef);

    const batch = writeBatch(db);
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
  } catch (error) {
    console.error("Error clearing milestones from Firebase:", error);
    throw error;
  }
}
