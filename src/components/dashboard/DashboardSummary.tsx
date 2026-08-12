"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/Card";
import { useActiveOrders } from "@/features/orders/useActiveOrders";
import { useSalesHistory } from "@/features/orders/useSalesHistory";
import { formatCurrency } from "@/lib/utils/currency";
import { ORDER_STATUS } from "@/types/order";

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function endOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
}

export function DashboardSummary() {
  const { orders: activeOrders, loading: loadingActive } = useActiveOrders();
  const range = useMemo(() => ({ start: startOfToday(), end: endOfToday() }), []);
  const { orders: todaysSales, loading: loadingSales } = useSalesHistory(range);

  const pendingCount = activeOrders.filter((o) => o.status === ORDER_STATUS.PENDING).length;
  const preparingCount = activeOrders.filter((o) => o.status === ORDER_STATUS.PREPARING).length;
  const todaysTotal = todaysSales.reduce((sum, order) => sum + order.total, 0);

  const stats = [
    { label: "Pending Orders", value: loadingActive ? "\u2014" : pendingCount },
    { label: "Preparing", value: loadingActive ? "\u2014" : preparingCount },
    { label: "Orders Completed Today", value: loadingSales ? "\u2014" : todaysSales.length },
    { label: "Sales Today", value: loadingSales ? "\u2014" : formatCurrency(todaysTotal) },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-5">
          <p className="text-sm font-medium text-slate-500">{stat.label}</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">{stat.value}</p>
        </Card>
      ))}
    </div>
  );
}
