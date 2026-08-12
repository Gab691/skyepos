"use client";

import { AppShell } from "@/components/layout/AppShell";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { ProductForm } from "@/components/products/ProductForm";
import { ProductTable } from "@/components/products/ProductTable";
import { Spinner } from "@/components/ui/Spinner";
import { useAllProducts } from "@/features/products/useProducts";
import { CAN_MANAGE_PRODUCTS } from "@/types/user";

function ProductsScreen() {
  const { products, loading, error } = useAllProducts();

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900">Products</h1>
      <p className="mt-1 text-sm text-slate-500">Manage what&apos;s available for sale.</p>

      <div className="mt-6">
        <ProductForm />
      </div>

      <div className="mt-6">
        {loading && (
          <div className="flex justify-center py-16">
            <Spinner label="Loading products..." />
          </div>
        )}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && <ProductTable products={products} />}
      </div>
    </>
  );
}

export default function ProductsPage() {
  return (
    <ProtectedRoute allowedRoles={CAN_MANAGE_PRODUCTS}>
      <AppShell>
        <ProductsScreen />
      </AppShell>
    </ProtectedRoute>
  );
}
