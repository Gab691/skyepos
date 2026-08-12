"use client";

import { useEffect, useState } from "react";
import { subscribeToSalesHistory, type SalesHistoryRange } from "@/services/orderService";
import type { Order } from "@/types/order";

interface UseSalesHistoryResult {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

export function useSalesHistory(range?: SalesHistoryRange): UseSalesHistoryResult {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const rangeKey = range ? `${range.start.getTime()}-${range.end.getTime()}` : "all";

  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToSalesHistory(
      (nextOrders) => {
        setOrders(nextOrders);
        setLoading(false);
        setError(null);
      },
      () => {
        setError("Unable to load Sales History right now.");
        setLoading(false);
      },
      range
    );

    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeKey]);

  return { orders, loading, error };
}
