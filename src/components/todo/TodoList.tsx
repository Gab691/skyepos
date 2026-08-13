"use client";

import { OrderCard } from "@/components/todo/OrderCard";
import { Spinner } from "@/components/ui/Spinner";
import { useActiveOrders } from "@/features/orders/useActiveOrders";
import { completeOrder, startOrder, cancelOrder } from "@/services/orderService";
import type { UserRole } from "@/types/user";
import { CAN_COMPLETE_ORDERS, CAN_START_ORDERS } from "@/types/user";

interface TodoListProps {
  employeeId: string;
  role: UserRole;
}

export function TodoList({ employeeId, role }: TodoListProps) {
  const { orders, loading, error } = useActiveOrders();

  const canStart = CAN_START_ORDERS.includes(role);
  const canComplete = CAN_COMPLETE_ORDERS.includes(role);
  const canDelete = role === "MANAGER" || role === "ADMIN" || role === "CASHIER" || role === "EMPLOYEE";

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner label="Loading active orders..." />
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-red-600">{error}</p>;
  }

  if (orders.length === 0) {
    return <p className="text-sm text-slate-500">No active orders. All caught up.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {orders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          canStart={canStart}
          canComplete={canComplete}
          canDelete={canDelete}
          onStart={(orderId) => startOrder(orderId, employeeId)}
          onComplete={(orderId) => completeOrder(orderId, employeeId)}
          onDelete={(orderId) => cancelOrder(orderId, employeeId)}
        />
      ))}
    </div>
  );
}
