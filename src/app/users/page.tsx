"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { UserTable } from "@/components/users/UserTable";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useUsers } from "@/features/users/useUsers";
import { CAN_MANAGE_USERS } from "@/types/user";

function UsersScreen() {
  const { profile } = useAuth();
  const { users, loading, error } = useUsers();

  if (!profile) return null;

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Users</h1>
      <p className="mt-1 text-sm text-slate-500">Manage roles and account access.</p>

      <div className="mt-6">
        {loading && (
          <div className="flex justify-center py-16">
            <Spinner label="Loading users..." />
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && <UserTable users={users} currentUserId={profile.id} />}
      </div>
    </>
  );
}

export default function UsersPage() {
  return (
    <ProtectedRoute allowedRoles={CAN_MANAGE_USERS}>
      <AppShell>
        <UsersScreen />
      </AppShell>
    </ProtectedRoute>
  );
}
