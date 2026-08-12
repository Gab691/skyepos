"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { signOutUser } from "@/services/authService";
import {
  CAN_CREATE_ORDERS,
  CAN_MANAGE_PRODUCTS,
  CAN_MANAGE_USERS,
  CAN_START_ORDERS,
  CAN_VIEW_SALES_HISTORY,
} from "@/types/user";

interface NavItem {
  href: string;
  label: string;
  allowed?: string[];
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/cashier", label: "Cashier / POS", allowed: CAN_CREATE_ORDERS },
  { href: "/todo", label: "To-Do List", allowed: CAN_START_ORDERS },
  { href: "/sales", label: "Sales History", allowed: CAN_VIEW_SALES_HISTORY },
  { href: "/products", label: "Products", allowed: CAN_MANAGE_PRODUCTS },
  { href: "/users", label: "Users", allowed: CAN_MANAGE_USERS },
];

export function Sidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.allowed || (profile && item.allowed.includes(profile.role))
  );

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="px-6 py-5">
        <span className="text-xl font-bold tracking-tight text-slate-900">Skye</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {visibleItems.map((item) => {
          const active = pathname?.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                active
                  ? "bg-brand-50 text-brand-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {profile && (
        <div className="border-t border-slate-200 p-4">
          <p className="truncate text-sm font-medium text-slate-900">{profile.displayName}</p>
          <p className="text-xs text-slate-500">{profile.role}</p>
          <button
            onClick={() => signOutUser()}
            className="mt-3 cursor-pointer text-sm font-medium text-slate-500 hover:text-slate-800"
          >
            Sign out
          </button>
        </div>
      )}
    </aside>
  );
}
