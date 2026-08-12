"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { SalesList } from "@/components/sales/SalesList";
import { SalesDetail } from "@/components/sales/SalesDetail";
import { Spinner } from "@/components/ui/Spinner";
import { Input } from "@/components/ui/Input";
import { useSalesHistory } from "@/features/orders/useSalesHistory";
import { CAN_VIEW_SALES_HISTORY } from "@/types/user";
import type { Order } from "@/types/order";

function endOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function SalesScreen() {
  const today = new Date();
  const [dateInput, setDateInput] = useState(() => today.toISOString().slice(0, 10));
  const [selected, setSelected] = useState<Order | null>(null);
  const [search, setSearch] = useState("");

  const selectedDate = new Date(`${dateInput}T00:00:00`);
  const range = { start: startOfDay(selectedDate), end: endOfDay(selectedDate) };

  const { orders, loading, error } = useSalesHistory(range);

  const filteredOrders = search.trim()
    ? orders.filter((order) => order.orderNumber.includes(search.trim()))
    : orders;

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Sales History</h1>
      <p className="mt-1 text-sm text-slate-500">Completed orders and transaction details.</p>

      <div className="mt-6 flex flex-wrap items-end gap-3">
        <Input
          id="sales-date"
          label="Date"
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
        />
        <Input
          id="sales-search"
          label="Search order #"
          placeholder="e.g. 001"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          {loading && (
            <div className="flex justify-center py-16">
              <Spinner label="Loading sales history..." />
            </div>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
          {!loading && !error && (
            <SalesList orders={filteredOrders} selectedOrderId={selected?.id ?? null} onSelect={setSelected} />
          )}
        </div>

        <SalesDetail order={selected} />
      </div>
    </>
  );
}

export default function SalesPage() {
  return (
    <ProtectedRoute allowedRoles={CAN_VIEW_SALES_HISTORY}>
      <AppShell>
        <SalesScreen />
      </AppShell>
    </ProtectedRoute>
  );
}
