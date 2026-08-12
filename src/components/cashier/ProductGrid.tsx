"use client";

import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/utils/currency";
import type { Product } from "@/types/product";

interface ProductGridProps {
  products: Product[];
  onSelect: (product: Product) => void;
}

export function ProductGrid({ products, onSelect }: ProductGridProps) {
  if (products.length === 0) {
    return <p className="text-sm text-slate-500">No products available right now.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <Card
          key={product.id}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(product)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") onSelect(product);
          }}
          className="cursor-pointer p-4 text-left transition-colors duration-200 hover:border-brand-400 hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-500"
        >
          <p className="font-semibold text-slate-900">{product.name}</p>
          <p className="mt-1 text-sm text-slate-500">{product.category}</p>
          <p className="mt-2 font-semibold text-brand-700">{formatCurrency(product.price)}</p>
        </Card>
      ))}
    </div>
  );
}
