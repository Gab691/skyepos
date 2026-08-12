export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  isAvailable: boolean;
}

/** Shape used when creating/editing a product from the Products screen. */
export type ProductInput = Omit<Product, "id">;
