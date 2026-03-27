import { getProductById } from "@/app/admin/actions";
import { ProductDetail } from "@/components/store/product-detail";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);
  
  if (!product) {
    notFound();
  }

  return <ProductDetail product={product} />;
}
