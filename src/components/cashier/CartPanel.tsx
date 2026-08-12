"use client";

import { formatCurrency } from "@/lib/utils/currency";
import type { CartLine } from "@/features/orders/useCart";

interface CartPanelProps {
  lines: CartLine[];
  onIncrease: (productId: string) => void;
  onDecrease: (productId: string) => void;
  onRemove: (productId: string) => void;
}

export function CartPanel({ lines, onIncrease, onDecrease, onRemove }: CartPanelProps) {
  if (lines.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        Tap a product to add it to the order.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {lines.map((line) => (
        <li key={line.productId} className="flex items-center justify-between gap-3 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium text-slate-900">{line.name}</p>
            <p className="text-sm text-slate-500">
              {formatCurrency(line.unitPrice)} &times; {line.quantity} = {formatCurrency(line.subtotal)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={`Decrease quantity of ${line.name}`}
              onClick={() => onDecrease(line.productId)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-300 text-lg font-semibold text-slate-700 hover:bg-slate-100"
            >
              &minus;
            </button>
            <span className="w-6 text-center font-medium">{line.quantity}</span>
            <button
              type="button"
              aria-label={`Increase quantity of ${line.name}`}
              onClick={() => onIncrease(line.productId)}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-slate-300 text-lg font-semibold text-slate-700 hover:bg-slate-100"
            >
              +
            </button>
            <button
              type="button"
              aria-label={`Remove ${line.name} from order`}
              onClick={() => onRemove(line.productId)}
              className="ml-1 cursor-pointer text-sm font-medium text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
