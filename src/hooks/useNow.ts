"use client";

import { useEffect, useState } from "react";

/**
 * Re-renders on an interval so waiting-time/urgency displays stay fresh.
 * This never touches Firestore - it only drives a local re-render so
 * getElapsedMinutes() can be recomputed from the already-loaded createdAt.
 */
export function useNow(intervalMs = 15000): number {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return now;
}
