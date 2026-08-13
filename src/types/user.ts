/**
 * Centralized user roles. Do not use arbitrary strings for role checks -
 * always reference this type / the USER_ROLE constants below.
 */
export type UserRole = "CASHIER" | "EMPLOYEE" | "MANAGER" | "ADMIN";

export const USER_ROLE = {
  CASHIER: "CASHIER",
  EMPLOYEE: "EMPLOYEE",
  MANAGER: "MANAGER",
  ADMIN: "ADMIN",
} as const satisfies Record<UserRole, UserRole>;

export interface AppUser {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

/** Roles allowed to mark an order as COMPLETED. */
export const CAN_COMPLETE_ORDERS: UserRole[] = ["CASHIER", "EMPLOYEE", "MANAGER", "ADMIN"];

/** Roles allowed to start (begin preparing) an order. */
export const CAN_START_ORDERS: UserRole[] = ["CASHIER", "EMPLOYEE", "MANAGER", "ADMIN"];

/** Roles allowed to create orders at the cashier/POS screen. */
export const CAN_CREATE_ORDERS: UserRole[] = ["CASHIER", "MANAGER", "ADMIN"];

/** Roles allowed to manage products. */
export const CAN_MANAGE_PRODUCTS: UserRole[] = ["MANAGER", "ADMIN"];

/** Roles allowed to manage users. */
export const CAN_MANAGE_USERS: UserRole[] = ["ADMIN"];

/** Roles allowed to view Sales History. */
export const CAN_VIEW_SALES_HISTORY: UserRole[] = ["MANAGER", "ADMIN"];
