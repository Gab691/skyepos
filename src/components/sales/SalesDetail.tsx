"use client";

import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/currency";
import { formatClockTime, formatDate } from "@/lib/utils/time";
import type { Order } from "@/types/order";

export function SalesDetail({ order }: { order: Order | null }) {
  if (!order) {
    return (
      <Card className="flex h-full min-h-[16rem] items-center justify-center p-6">
        <p className="text-sm text-slate-400">Select an order to view details.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <p className="text-xl font-bold text-slate-900">ORDER #{order.orderNumber}</p>
        <p className="text-sm text-slate-500">
          {order.completedAt ? `${formatDate(order.completedAt)} \u00b7 ${formatClockTime(order.completedAt)}` : ""}
        </p>
      </div>

      <ul className="divide-y divide-slate-100 border-y border-slate-100">
        {order.items.map((item) => (
          <li key={item.productId} className="flex items-center justify-between py-2.5">
            <span className="text-slate-700">
              {item.quantity} &times; {item.name}
            </span>
            <span className="font-medium text-slate-900">{formatCurrency(item.subtotal)}</span>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-1.5 text-sm">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span>{formatCurrency(order.subtotal)}</span>
        </div>
        <div className="flex justify-between text-base font-bold text-slate-900">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Cash received</span>
          <span>{formatCurrency(order.payment.amountReceived)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Change</span>
          <span>{formatCurrency(order.payment.change)}</span>
        </div>
      </div>

      <div className="mt-5 space-y-1 border-t border-slate-100 pt-4 text-sm text-slate-500">
        <p>Cashier: {order.cashierName}</p>
        {order.completedBy && <p>Completed by: {order.completedBy}</p>}
      </div>
    </Card>
  );
}
