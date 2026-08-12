/**
 * Centralized Firestore collection names.
 *
 * NOTE: per the data architecture rule, there is a single `orders`
 * collection. The To-Do List and Sales History are both filtered VIEWS
 * over this one collection (by status) - they are not separate
 * collections and must never store duplicate copies of an order.
 */
export const COLLECTIONS = {
  users: "users",
  products: "products",
  orders: "orders",
} as const;
