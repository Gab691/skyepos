"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { ProductGrid } from "@/components/cashier/ProductGrid";
import { CartPanel } from "@/components/cashier/CartPanel";
import { PaymentPanel } from "@/components/cashier/PaymentPanel";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { useAuth } from "@/context/AuthContext";
import { useAvailableProducts } from "@/features/products/useProducts";
import { useCart } from "@/features/orders/useCart";
import { createOrder, OrderValidationError } from "@/services/orderService";
import { CAN_CREATE_ORDERS } from "@/types/user";

function CashierScreen() {
  const { profile } = useAuth();
  const { products, loading, error } = useAvailableProducts();
  const { lines, addProduct, setQuantity, removeLine, clear, total } = useCart();
  const showDebug = process.env.NODE_ENV === "development";

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<{ change: number } | null>(null);

  async function handleConfirmPayment(amountReceived: number) {
    if (!profile || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitError(null);
    setConfirmation(null);

    try {
      await createOrder({
        items: lines.map(({ productId, name, unitPrice, quantity }) => ({
          productId,
          name,
          unitPrice,
          quantity,
        })),
        amountReceived,
        cashierId: profile.id,
        cashierName: profile.displayName,
      });

      setConfirmation({ change: amountReceived - total });
      clear();
    } catch (err) {
      setSubmitError(
        err instanceof OrderValidationError ? err.message : "Unable to create the order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-bold text-slate-900">Cashier</h1>
        <p className="mt-1 text-sm text-slate-500">Select products to build the order.</p>

        <div className="mt-6">
          {loading && (
            <div className="flex justify-center py-16">
              <Spinner label="Loading products..." />
            </div>
          )}
          {error && (
            <div className="mb-4">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {!loading && !error && <ProductGrid products={products} onSelect={addProduct} />}

          {showDebug && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-medium text-slate-800">Products debug</p>
              <p>Products count: {products.length}</p>
              <p>Loading: {String(loading)}</p>
              <p>Error: {error ?? "none"}</p>
              <details className="mt-2">
                <summary className="cursor-pointer">Raw products (first 20)</summary>
                <pre className="mt-2 max-h-48 overflow-auto text-xs">{JSON.stringify(products.slice(0, 20), null, 2)}</pre>
              </details>
            </div>
          )}
        </div>
      </div>

      <div>
        <Card className="sticky top-6 p-5">
          <h2 className="font-bold text-slate-900">Current Order</h2>

          {confirmation && (
            <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">
              Payment confirmed. Order sent to the To-Do List.
            </div>
          )}
          {submitError && (
            <div className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{submitError}</div>
          )}

          <div className="mt-3">
            <CartPanel
              lines={lines}
              onIncrease={(id) => {
                const line = lines.find((l) => l.productId === id);
                if (line) setQuantity(id, line.quantity + 1);
              }}
              onDecrease={(id) => {
                const line = lines.find((l) => l.productId === id);
                if (line) setQuantity(id, line.quantity - 1);
              }}
              onRemove={removeLine}
            />
          </div>

          <PaymentPanel
            total={total}
            disabled={lines.length === 0}
            isSubmitting={isSubmitting}
            onConfirm={handleConfirmPayment}
          />
        </Card>
      </div>
    </div>
  );
}

export default function CashierPage() {
  return (
    <ProtectedRoute allowedRoles={CAN_CREATE_ORDERS}>
      <AppShell>
        <CashierScreen />
      </AppShell>
    </ProtectedRoute>
  );
}
