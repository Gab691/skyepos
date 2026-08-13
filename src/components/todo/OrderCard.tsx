"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useNow } from "@/hooks/useNow";
import { formatCurrency } from "@/lib/utils/currency";
import { formatClockTime, formatWaitingTime, getElapsedMinutes, getUrgencyLevel } from "@/lib/utils/time";
import type { Order } from "@/types/order";
import type { UrgencyLevel } from "@/types/order";

const URGENCY_LABEL: Record<UrgencyLevel, string> = {
  normal: "Normal",
  attention: "Attention",
  urgent: "Urgent",
  critical: "Critical",
};

const URGENCY_TONE: Record<UrgencyLevel, "green" | "amber" | "orange" | "red"> = {
  normal: "green",
  attention: "amber",
  urgent: "orange",
  critical: "red",
};

const URGENCY_BORDER: Record<UrgencyLevel, string> = {
  normal: "border-urgency-normal",
  attention: "border-urgency-attention",
  urgent: "border-urgency-urgent",
  critical: "border-urgency-critical",
};

interface OrderCardProps {
  order: Order;
  canStart: boolean;
  canComplete: boolean;
  onStart: (orderId: string) => Promise<void>;
  onComplete: (orderId: string) => Promise<void>;
  canDelete?: boolean;
  onDelete?: (orderId: string) => Promise<void>;
}

export function OrderCard({ order, canStart, canComplete, onStart, onComplete, canDelete = false, onDelete }: OrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Re-render on an interval so waiting time / urgency stay current without
  // any additional Firestore reads or writes.
  useNow();

  const elapsedMinutes = getElapsedMinutes(order.createdAt);
  const urgency = getUrgencyLevel(elapsedMinutes);

  async function handleStart() {
    setIsUpdating(true);
    setActionError(null);
    try {
      await onStart(order.id);
    } catch {
      setActionError("Unable to start this order. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleComplete() {
    setIsUpdating(true);
    setActionError(null);
    try {
      await onComplete(order.id);
    } catch {
      setActionError("Unable to complete this order. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDelete() {
    if (!onDelete) return;
    const ok = window.confirm("Are you sure you want to delete this order? This action is irreversible.");
    if (!ok) return;

    setIsDeleting(true);
    setActionError(null);
    try {
      await onDelete(order.id);
    } catch (err) {
      setActionError("Unable to delete this order. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Card className={`border border-l-4 p-5 ${URGENCY_BORDER[urgency]}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-lg font-bold text-slate-900">ORDER #{order.orderNumber}</p>
          <p className="text-sm text-slate-500">Placed {formatClockTime(order.createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge tone={URGENCY_TONE[urgency]}>{URGENCY_LABEL[urgency]}</Badge>
          <Badge tone={order.status === "PREPARING" ? "blue" : "slate"}>{order.status}</Badge>
        </div>
      </div>

      <ul className="mt-4 space-y-1">
        {order.items.map((item) => (
          <li key={item.productId} className="text-slate-700">
            {item.quantity} &times; {item.name}
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
        <span>Cash: {formatCurrency(order.payment.amountReceived)}</span>
        <span>Change: {formatCurrency(order.payment.change)}</span>
        <span>Total: {formatCurrency(order.total)}</span>
        <span>Waiting: {formatWaitingTime(elapsedMinutes)}</span>
      </div>

      {actionError && <p className="mt-3 text-sm text-red-600">{actionError}</p>}

      <div className="mt-4 flex gap-2">
        {order.status === "PENDING" && canStart && (
          <Button size="sm" variant="secondary" isLoading={isUpdating} onClick={handleStart}>
            Start Order
          </Button>
        )}
        {canComplete && (
          <Button size="sm" isLoading={isUpdating} onClick={handleComplete}>
            Complete Order
          </Button>
        )}
        {canDelete && (
          <Button size="sm" variant="danger" isLoading={isDeleting} onClick={handleDelete}>
            Delete
          </Button>
        )}
      </div>
    </Card>
  );
}
