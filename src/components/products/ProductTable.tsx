"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils/currency";
import { setProductAvailability } from "@/services/productService";
import type { Product } from "@/types/product";

export function ProductTable({ products }: { products: Product[] }) {
  const [pendingId, setPendingId] = useState<string | null>(null);

  async function toggleAvailability(product: Product) {
    setPendingId(product.id);
    try {
      await setProductAvailability(product.id, !product.isAvailable);
    } finally {
      setPendingId(null);
    }
  }

  if (products.length === 0) {
    return <p className="text-sm text-slate-500">No products yet.</p>;
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.map((product) => (
            <tr key={product.id}>
              <td className="px-4 py-3 font-medium text-slate-900">{product.name}</td>
              <td className="px-4 py-3 text-slate-600">{product.category}</td>
              <td className="px-4 py-3 text-slate-600">{formatCurrency(product.price)}</td>
              <td className="px-4 py-3">
                <Badge tone={product.isAvailable ? "green" : "slate"}>
                  {product.isAvailable ? "Available" : "Unavailable"}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  disabled={pendingId === product.id}
                  onClick={() => toggleAvailability(product)}
                  className="cursor-pointer font-medium text-brand-700 hover:text-brand-900 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {product.isAvailable ? "Mark unavailable" : "Mark available"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
