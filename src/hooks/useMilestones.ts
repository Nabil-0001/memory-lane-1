"use client";

import { useState, useCallback, useSyncExternalStore, useEffect } from "react";
import { Milestone, MilestoneFormData } from "@/types/milestone";
import {
  saveMilestones,
  generateMilestoneId,
  sortMilestonesByDate,
} from "@/utils/milestoneUtils";
import {
  loadMilestonesFromFirebase,
  addMilestoneToFirebase,
  updateMilestoneInFirebase,
  deleteMilestoneFromFirebase,
  clearMilestonesFromFirebase,
} from "@/lib/firestoreMilestones";

export function useMilestones() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isLoaded = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    async function loadFromFirebase() {
      try {
        setIsLoading(true);
        setError(null);
        const firebaseMilestones = await loadMilestonesFromFirebase();

        const sorted = sortMilestonesByDate(firebaseMilestones);
        setMilestones(sorted);
        saveMilestones(sorted);
      } catch (err) {
        console.error("Failed to load from Firebase:", err);
        setError("Failed to load milestones. Please check your connection.");
      } finally {
        setIsLoading(false);
      }
    }

    loadFromFirebase();
  }, []);

  const addMilestone = useCallback(async (data: MilestoneFormData) => {
    const id = generateMilestoneId();
    const newMilestone: Milestone = {
      ...data,
      id,
    };

    setMilestones((prev) => {
      const updated = sortMilestonesByDate([...prev, newMilestone]);
      saveMilestones(updated);
      return updated;
    });

    try {
      await addMilestoneToFirebase(id, data);
    } catch (err) {
      console.error("Failed to save to Firebase:", err);
      setError("Failed to save to cloud. Changes saved locally.");
    }

    return newMilestone;
  }, []);

  const updateMilestone = useCallback(
    async (id: string, data: Partial<MilestoneFormData>) => {
      setMilestones((prev) => {
        const updated = prev.map((m) => (m.id === id ? { ...m, ...data } : m));
        const sorted = sortMilestonesByDate(updated);
        saveMilestones(sorted);
        return sorted;
      });

      try {
        await updateMilestoneInFirebase(id, data);
      } catch (err) {
        console.error("Failed to update in Firebase:", err);
        setError("Failed to save to cloud. Changes saved locally.");
      }
    },
    [],
  );

  const deleteMilestone = useCallback(async (id: string) => {
    setMilestones((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      saveMilestones(updated);
      return updated;
    });

    try {
      await deleteMilestoneFromFirebase(id);
    } catch (err) {
      console.error("Failed to delete from Firebase:", err);
      setError("Failed to delete from cloud. Changes saved locally.");
    }
  }, []);

  const clearAllMilestones = useCallback(async () => {
    setMilestones([]);
    saveMilestones([]);

    try {
      await clearMilestonesFromFirebase();
    } catch (err) {
      console.error("Failed to clear Firebase:", err);
      setError("Failed to clear cloud data.");
    }
  }, []);

  return {
    milestones,
    isLoaded,
    isLoading,
    error,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    clearAllMilestones,
  };
}
