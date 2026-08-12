"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { DashboardSummary } from "@/components/dashboard/DashboardSummary";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">A quick look at today&apos;s activity.</p>

        <div className="mt-6">
          <DashboardSummary />
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
