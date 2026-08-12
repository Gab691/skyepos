"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { TodoList } from "@/components/todo/TodoList";
import { useAuth } from "@/context/AuthContext";
import { CAN_START_ORDERS } from "@/types/user";

function TodoScreen() {
  const { profile } = useAuth();
  if (!profile) return null;

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">To-Do List</h1>
      <p className="mt-1 text-sm text-slate-500">Orders waiting to be prepared and served.</p>

      <div className="mt-6">
        <TodoList employeeId={profile.id} role={profile.role} />
      </div>
    </>
  );
}

export default function TodoPage() {
  return (
    <ProtectedRoute allowedRoles={CAN_START_ORDERS}>
      <AppShell>
        <TodoScreen />
      </AppShell>
    </ProtectedRoute>
  );
}
