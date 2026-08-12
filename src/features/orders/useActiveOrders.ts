"use client";

import { useEffect, useState } from "react";
import { subscribeToActiveOrders } from "@/services/orderService";
import type { Order } from "@/types/order";

interface UseActiveOrdersResult {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

export function useActiveOrders(): UseActiveOrdersResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToActiveOrders(
      (nextOrders) => {
        setOrders(nextOrders);
        setLoading(false);
        setError(null);
      },
      () => {
        setError("Unable to load the To-Do List right now.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

  return { orders, loading, error };
}
