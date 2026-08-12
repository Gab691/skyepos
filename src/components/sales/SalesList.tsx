"use client";

import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/currency";
import { formatClockTime, formatDate } from "@/lib/utils/time";
import type { Order } from "@/types/order";

interface SalesListProps {
  orders: Order[];
  selectedOrderId: string | null;
  onSelect: (order: Order) => void;
}

export function SalesList({ orders, selectedOrderId, onSelect }: SalesListProps) {
  if (orders.length === 0) {
    return <p className="text-sm text-slate-500">No completed orders in this range.</p>;
  }

  return (
    <ul className="space-y-2">
      {orders.map((order) => (
        <li key={order.id}>
          <Card
            role="button"
            tabIndex={0}
            onClick={() => onSelect(order)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") onSelect(order);
            }}
            className={`flex cursor-pointer items-center justify-between p-4 transition-colors duration-200 hover:bg-slate-50 ${
              selectedOrderId === order.id ? "border-brand-400 ring-1 ring-brand-400" : ""
            }`}
          >
            <div>
              <p className="font-semibold text-slate-900">ORDER #{order.orderNumber}</p>
              <p className="text-sm text-slate-500">
                {order.completedAt ? formatDate(order.completedAt) : ""}
                {" \u00b7 "}
                {order.completedAt ? formatClockTime(order.completedAt) : ""}
              </p>
            </div>
            <p className="font-semibold text-slate-900">{formatCurrency(order.total)}</p>
          </Card>
        </li>
      ))}
    </ul>
  );
}
