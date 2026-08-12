import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createProduct, ProductValidationError } from "@/services/productService";

export function ProductForm({ onCreated }: { onCreated?: () => void }) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await createProduct({
        name: name.trim(),
        price: Number(price),
        category: category.trim(),
        isAvailable: true,
      });
      setName("");
      setPrice("");
      setCategory("");
      onCreated?.();
    } catch (err) {
      setError(err instanceof ProductValidationError ? err.message : "Unable to add product.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:items-end">
      <Input id="product-name" label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input
        id="product-price"
        label="Price"
        type="number"
        min={0}
        step="0.01"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        required
      />
      <Input
        id="product-category"
        label="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />
      <Button type="submit" isLoading={isSubmitting}>
        Add Product
      </Button>

      {error && <p className="sm:col-span-4 text-sm text-red-600">{error}</p>}
    </form>
  );
}
