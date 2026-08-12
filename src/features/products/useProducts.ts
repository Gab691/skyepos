"use client";

import { useEffect, useState } from "react";
import { subscribeToAllProducts, subscribeToAvailableProducts } from "@/services/productService";
import type { Product } from "@/types/product";

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export function useAvailableProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAvailableProducts(
      (next) => {
        setProducts(next);
        setLoading(false);
        setError(null);
      },
      (error) => {
        // Show the actual Firestore error in development so the root cause is
        // easier to diagnose, while keeping a friendly message in production.
        const message = error instanceof Error ? error.message : "Unable to load products right now.";
        setError(message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return { products, loading, error };
}

export function useAllProducts(): UseProductsResult {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeToAllProducts(
      (next) => {
        setProducts(next);
        setLoading(false);
        setError(null);
      },
      (error) => {
        const message = error instanceof Error ? error.message : "Unable to load products right now.";
        setError(message);
        setLoading(false);
      }
    );
    return unsubscribe;
  }, []);

  return { products, loading, error };
}
