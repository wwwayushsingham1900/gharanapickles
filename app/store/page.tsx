import { StorePage } from "@/components/store/store-page"
import { getAdminProducts } from "@/app/admin/actions"
import { Product } from "@/components/admin/products-page"

async function getProducts(): Promise<Product[]> {
  try {
    const products = await getAdminProducts();
    // Default to the original if empty
    return products.length > 0 ? products : [];
  } catch (e) {
    console.error("Failed to fetch products server-side", e);
  }
  return [];
}

export default async function Store() {
  const products = await getProducts();
  return <StorePage products={products} />
}
