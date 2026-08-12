import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/collections";
import { isValidPrice } from "@/lib/utils/currency";
import type { Product, ProductInput } from "@/types/product";

export class ProductValidationError extends Error {}

function toProduct(id: string, data: Record<string, unknown>): Product {
  return { id, ...(data as Omit<Product, "id">) };
}

function validateProductInput(input: ProductInput) {
  if (!input.name.trim()) {
    throw new ProductValidationError("Product name is required.");
  }
  if (!isValidPrice(input.price)) {
    throw new ProductValidationError("Product price must be zero or greater.");
  }
  if (!input.category.trim()) {
    throw new ProductValidationError("Product category is required.");
  }
}

/** Real-time listener for products available to sell at the cashier screen. */
export function subscribeToAvailableProducts(
  onChange: (products: Product[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  // Some Firestore queries that filter and sort can require composite indexes.
  // To avoid the "query requires an index" runtime error in some projects
  // (where indexes may not yet be deployed), fetch the product list ordered
  // by name and filter availability client-side. This slightly increases
  // read volume but guarantees the cashier screen remains functional.
  const q = query(collection(db, COLLECTIONS.products), orderBy("name", "asc"));

  return onSnapshot(
    q,
    (snapshot) => {
      try {
        const products = snapshot.docs.map((d) => toProduct(d.id, d.data())).filter((p) => p.isAvailable);
        onChange(products);
      } catch (err) {
        onError(err instanceof Error ? err : new Error(String(err)));
      }
    },
    (error) => onError(error)
  );
}

/** Real-time listener for the full product catalog (Products management screen). */
export function subscribeToAllProducts(
  onChange: (products: Product[]) => void,
  onError: (error: Error) => void
): Unsubscribe {
  const q = query(collection(db, COLLECTIONS.products), orderBy("name", "asc"));

  return onSnapshot(
    q,
    (snapshot) => onChange(snapshot.docs.map((d) => toProduct(d.id, d.data()))),
    (error) => onError(error)
  );
}

export async function createProduct(input: ProductInput): Promise<string> {
  validateProductInput(input);
  const ref = await addDoc(collection(db, COLLECTIONS.products), input);
  return ref.id;
}

export async function updateProduct(productId: string, input: Partial<ProductInput>): Promise<void> {
  if (input.price !== undefined && !isValidPrice(input.price)) {
    throw new ProductValidationError("Product price must be zero or greater.");
  }
  if (input.name !== undefined && !input.name.trim()) {
    throw new ProductValidationError("Product name is required.");
  }
  await updateDoc(doc(db, COLLECTIONS.products, productId), input);
}

/**
 * Products are archived (isAvailable = false), never deleted - existing
 * orders reference productId, and historical order items already store
 * their own name/price snapshot, but keeping the product record avoids
 * dangling references.
 */
export async function setProductAvailability(productId: string, isAvailable: boolean): Promise<void> {
  await updateDoc(doc(db, COLLECTIONS.products, productId), { isAvailable });
}
