import { getAdminProducts } from "@/app/admin/actions"
import { Product } from "@/components/admin/products-page"
import { CategoryClientPage } from "@/components/store/category-client-page"

export const dynamic = "force-dynamic";

async function getProductsByCategory(categorySlug: string): Promise<Product[]> {
  try {
    const products = await getAdminProducts();
    // Filter matching category
    // Default to empty array if none
    return products.filter(p => (p.category || 'Our Collection').toLowerCase() === decodeURIComponent(categorySlug).toLowerCase());
  } catch (e) {
    console.error("Failed to fetch products server-side", e);
  }
  return [];
}

export default async function CategoryPageRoute({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const products = await getProductsByCategory(category);
  const categoryName = decodeURIComponent(category);
  return <CategoryClientPage products={products} categoryName={categoryName} />
}
