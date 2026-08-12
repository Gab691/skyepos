"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Input";
import { setUserActive, updateUserRole } from "@/services/userService";
import { USER_ROLE, type AppUser, type UserRole } from "@/types/user";

const ROLE_OPTIONS: UserRole[] = [USER_ROLE.CASHIER, USER_ROLE.EMPLOYEE, USER_ROLE.MANAGER, USER_ROLE.ADMIN];

export function UserTable({ users, currentUserId }: { users: AppUser[]; currentUserId: string }) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function handleRoleChange(user: AppUser, role: UserRole) {
    setPendingId(user.id);
    try {
      await updateUserRole(user.id, role);
    } finally {
      setPendingId(null);
    }
  }

  async function handleToggleActive(user: AppUser) {
    setPendingId(user.id);
    try {
      await setUserActive(user.id, !user.isActive);
    } finally {
      setPendingId(null);
    }
  }

  if (users.length === 0) {
    return <p className="text-sm text-slate-500">No users yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Email</th>
            <th className="px-4 py-3 font-medium">Role</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((user) => (
            <tr key={user.id}>
              <td className="px-4 py-3 font-medium text-slate-900">
                {user.displayName}
                {user.id === currentUserId && <span className="ml-1.5 text-xs text-slate-400">(you)</span>}
              </td>
              <td className="px-4 py-3 text-slate-600">{user.email}</td>
              <td className="px-4 py-3">
                <Select
                  id={`role-${user.id}`}
                  aria-label={`Role for ${user.displayName}`}
                  value={user.role}
                  disabled={pendingId === user.id || user.id === currentUserId}
                  onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                  className="py-1.5"
                >
                  {ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </Select>
              </td>
              <td className="px-4 py-3">
                <Badge tone={user.isActive ? "green" : "slate"}>
                  {user.isActive ? "Active" : "Deactivated"}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  disabled={pendingId === user.id || user.id === currentUserId}
                  onClick={() => handleToggleActive(user)}
                  className="cursor-pointer font-medium text-brand-700 hover:text-brand-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {user.isActive ? "Deactivate" : "Reactivate"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
