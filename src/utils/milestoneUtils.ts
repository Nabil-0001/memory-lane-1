import { Milestone } from "@/types/milestone";
import { defaultMilestones, STORAGE_KEY } from "@/data/milestones";

export function loadMilestones(): Milestone[] {
  if (typeof window === "undefined") {
    return defaultMilestones;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.warn("Failed to load milestones from localStorage:", error);
  }

  return defaultMilestones;
}

export function saveMilestones(milestones: Milestone[]): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(milestones));
    return true;
  } catch (error) {
    console.error("Failed to save milestones to localStorage:", error);
    return false;
  }
}

export function clearMilestones(): Milestone[] {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
  }
  return defaultMilestones;
}

export function generateMilestoneId(): string {
  return `m_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function sortMilestonesByDate(milestones: Milestone[]): Milestone[] {
  return [...milestones].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function getYear(dateString: string): number {
  return new Date(dateString).getFullYear();
}

export function validateMilestone(milestone: Partial<Milestone>): string[] {
  const errors: string[] = [];

  if (!milestone.title?.trim()) {
    errors.push("Title is required");
  }

  if (!milestone.date) {
    errors.push("Date is required");
  } else {
    const date = new Date(milestone.date);
    if (isNaN(date.getTime())) {
      errors.push("Invalid date format");
    }
  }

  if (!milestone.description?.trim()) {
    errors.push("Description is required");
  }

  return errors;
}

export function parseImagePaths(input: string): string[] {
  return input
    .split(",")
    .map((path) => path.trim())
    .filter((path) => path.length > 0);
}

export function imagesToString(images: string[]): string {
  return images.join(", ");
}
