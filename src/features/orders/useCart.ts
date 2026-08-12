"use client";

import { useCallback, useMemo, useState } from "react";
import { calculateSubtotal, calculateTotal } from "@/lib/utils/currency";
import type { Product } from "@/types/product";

export interface CartLine {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([]);

  const addProduct = useCallback((product: Product) => {
    setLines((prev) => {
      const existing = prev.find((line) => line.productId === product.id);
      if (existing) {
        return prev.map((line) =>
          line.productId === product.id
            ? {
                ...line,
                quantity: line.quantity + 1,
                subtotal: calculateSubtotal(line.unitPrice, line.quantity + 1),
              }
            : line
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unitPrice: product.price,
          quantity: 1,
          subtotal: product.price,
        },
      ];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((prev) => {
      if (quantity <= 0) {
        return prev.filter((line) => line.productId !== productId);
      }
      return prev.map((line) =>
        line.productId === productId
          ? { ...line, quantity, subtotal: calculateSubtotal(line.unitPrice, quantity) }
          : line
      );
    });
  }, []);

  const removeLine = useCallback((productId: string) => {
    setLines((prev) => prev.filter((line) => line.productId !== productId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const total = useMemo(() => calculateTotal(lines), [lines]);

  return { lines, addProduct, setQuantity, removeLine, clear, total };
}
