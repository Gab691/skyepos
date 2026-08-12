"use client";

import { useEffect, useState } from "react";
import { subscribeToUsers } from "@/services/userService";
import type { AppUser } from "@/types/user";

export function useUsers() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToUsers(
      (next) => {
        setUsers(next);
        setLoading(false);
        setError(null);
      },
      () => {
        setError("Unable to load users right now.");
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return { users, loading, error };
}
