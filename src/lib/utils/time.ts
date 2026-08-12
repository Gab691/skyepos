import type { Timestamp } from "firebase/firestore";
import { URGENCY_THRESHOLDS_MINUTES, type UrgencyLevel } from "@/types/order";

/**
 * Elapsed waiting time is always derived at read/render time from the
 * stored createdAt timestamp - it is never persisted as a string like
 * "3 minutes ago", and the database is never rewritten just to keep a
 * displayed duration fresh.
 */
export function getElapsedMinutes(createdAt: Timestamp | Date): number {
  const createdMs = createdAt instanceof Date ? createdAt.getTime() : createdAt.toMillis();
  const elapsedMs = Date.now() - createdMs;
  return Math.max(0, Math.floor(elapsedMs / 60000));
}

export function getUrgencyLevel(elapsedMinutes: number): UrgencyLevel {
  if (elapsedMinutes >= URGENCY_THRESHOLDS_MINUTES.critical) return "critical";
  if (elapsedMinutes >= URGENCY_THRESHOLDS_MINUTES.urgent) return "urgent";
  if (elapsedMinutes >= URGENCY_THRESHOLDS_MINUTES.attention) return "attention";
  return "normal";
}

export function formatWaitingTime(elapsedMinutes: number): string {
  if (elapsedMinutes < 1) return "Just now";
  if (elapsedMinutes === 1) return "1 minute";
  return `${elapsedMinutes} minutes`;
}

export function formatClockTime(value: Timestamp | Date): string {
  const date = value instanceof Date ? value : value.toDate();
  return date.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" });
}

export function formatDate(value: Timestamp | Date): string {
  const date = value instanceof Date ? value : value.toDate();
  return date.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}
