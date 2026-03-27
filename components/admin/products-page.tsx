"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Package, Plus, Edit2, X, Save, Trash2, Trash, XCircle } from "lucide-react";
import { toast } from "sonner"; 
import { getAdminProducts, updateAdminProduct, seedDefaultProduct, deleteAdminProduct, deleteImage } from "@/app/admin/actions";
import { storage } from "@/lib/firebase";
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";

export interface ProductVariant {
  size: string;
  price: number;
  stock: number;
}

export interface Product {
  id: string;
  title: string;
  category: string;
  image: string; // Legacy / Fallback
  images: string[];
  description?: string;
  themeColor?: 'terracotta' | 'mustard' | 'emerald' | 'charcoal';
  variants: ProductVariant[];
  rating?: number;
  reviewCount?: number;
}

const DEFAULT_PRODUCT: Product = {
  id: "bharua-lal-mirch",
  title: "Bharua Lal Mirchi Achaar",
  category: "Pickles",
  image: "/bharua_lal_mirch_ingredients_3.png",
  images: ["/bharua_lal_mirch_ingredients_3.png"],
  description: "Experience the richness of traditional recipes, handcrafted in small batches.",
  variants: [
    { size: "250g", price: 274, stock: 100 },
    { size: "500g", price: 476, stock: 100 },
    { size: "1kg", price: 650, stock: 100 },
  ]
};

export function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const fetchedProducts = await getAdminProducts();
      if (fetchedProducts.length === 0) {
        await seedDefaultProduct(DEFAULT_PRODUCT);
        setProducts([DEFAULT_PRODUCT]);
      } else {
        setProducts(fetchedProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewProduct = () => {
    setEditingProduct({
      id: `product-${Date.now()}`,
      title: "New Product",
      category: "Pickles",
      image: "",
      images: [],
      description: "",
      themeColor: "terracotta",
      variants: [
        { size: "250g", price: 0, stock: 100 }
      ]
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    try {
      if (editingProduct.images.length > 0) {
          editingProduct.image = editingProduct.images[0];
      }
      await updateAdminProduct(editingProduct);
      toast.success("Product updated successfully!");
      setProducts((current) => {
        const exists = current.find(p => p.id === editingProduct.id);
        if (exists) {
          return current.map(p => p.id === editingProduct.id ? editingProduct : p);
        } else {
          return [...current, editingProduct];
        }
      });
      setEditingProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    }
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    if (!editingProduct) return;
    const newVariants = [...editingProduct.variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: field === 'price' || field === 'stock' ? Number(value) : value
    };
    setEditingProduct({ ...editingProduct, variants: newVariants });
  };

  const handleAddVariant = () => {
    if (!editingProduct) return;
    setEditingProduct({
      ...editingProduct,
      variants: [...editingProduct.variants, { size: "New Size", price: 0, stock: 100 }]
    });
  };

  const handleRemoveVariant = (index: number) => {
    if (!editingProduct || editingProduct.variants.length <= 1) return;
    const newVariants = editingProduct.variants.filter((_, i) => i !== index);
    setEditingProduct({ ...editingProduct, variants: newVariants });
  };

  const [productToDelete, setProductToDelete] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!productToDelete) return;
    
    try {
      const res = await deleteAdminProduct(productToDelete);
      if (res.success) {
        toast.success("Product deleted successfully");
        setProducts(products.filter(p => p.id !== productToDelete));
      } else {
        toast.error("Failed to delete product: " + res.error);
      }
    } catch (e: any) {
      toast.error("An error occurred while deleting.");
    } finally {
      setProductToDelete(null);
    }
  };

  const handleDeleteProduct = (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProductToDelete(productId);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingProduct) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      const url = data.secure_url;
      const updatedImages = [...(editingProduct.images || []), url];
      
      setEditingProduct({ 
        ...editingProduct, 
        images: updatedImages,
        image: updatedImages[0]
      });
      toast.success("Image uploaded to Cloudinary!");
    } catch (error) {
      console.error("Upload error", error);
      toast.error("Cloudinary upload failed.");
    } finally {
      setUploadingImage(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput || !editingProduct) return;
    const updatedImages = [...(editingProduct.images || []), imageUrlInput];
    setEditingProduct({ 
      ...editingProduct, 
      images: updatedImages,
      image: updatedImages[0]
    });
    setImageUrlInput("");
    toast.success("Image URL added!");
  };

  const handleRemoveImage = async (imageUrl: string, index: number) => {
    if (!editingProduct) return;

    if (imageUrl.includes("firebasestorage.googleapis.com") && storage) {
      try {
        const fileRef = ref(storage, imageUrl);
        await deleteObject(fileRef);
        toast.success("Image deleted from storage.");
      } catch (err) {
        console.error("Error deleting image from storage", err);
        toast.error("Could not delete image from storage.");
      }
    } else if (imageUrl.startsWith("/uploads/")) {
        const res = await deleteImage(imageUrl);
        if (!res.success) {
            toast.error("Could not delete image from server.");
        } else {
            toast.success("Image deleted permanently.");
        }
    }

    const newImages = [...editingProduct.images];
    newImages.splice(index, 1);
    setEditingProduct({
        ...editingProduct,
        images: newImages,
        image: newImages.length > 0 ? newImages[0] : ""
    });
  };

  if (loading) return <div className="p-12 text-center text-charcoal-light">Loading products...</div>;

  return (
    <main className="p-8 md:p-12 max-w-7xl mx-auto animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif text-charcoal-deep font-medium tracking-tight">Products Inventory</h1>
          <p className="text-sm text-charcoal-light mt-1">Manage your storefront offerings and categories.</p>
        </div>
        <button 
          onClick={handleAddNewProduct}
          className="bg-mustard hover:bg-mustard-dark text-charcoal-deep px-5 py-2.5 rounded-xl font-bold shadow-md shadow-mustard/20 transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add New Product
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => {
          const displayImage = product.images?.[0] || product.image;
          return (
            <div key={product.id} className="bg-white rounded-3xl border border-charcoal/10 overflow-hidden shadow-sm group relative flex flex-col h-full">
              <div className="absolute top-4 right-4 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingProduct(product); }}
                  className="bg-white/90 backdrop-blur text-charcoal-dark p-2 rounded-full shadow hover:scale-105 hover:text-mustard-dark transition-all"
                  title="Edit Product"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={(e) => handleDeleteProduct(product.id, e)}
                  className="bg-white/90 backdrop-blur text-charcoal-dark p-2 rounded-full shadow hover:scale-105 hover:text-chilli transition-all"
                  title="Delete Product"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>

              <div className="aspect-[4/3] relative bg-earth/5 shrink-0 border-b border-earth/10">
                {displayImage ? (
                  <Image src={displayImage} alt={product.title} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                ) : (
                  <div className="absolute inset-0 flex flex-col gap-2 items-center justify-center text-earth/40">
                    <Package className="w-10 h-10 drop-shadow-sm" />
                    <span className="text-xs font-semibold tracking-wider uppercase">No Image</span>
                  </div>
                )}
                {product.category && (
                    <span className="absolute top-4 left-4 bg-earth text-white px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full shadow">
                      {product.category}
                    </span>
                )}
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <h2 className="font-serif text-lg font-medium text-charcoal-deep mb-4">{product.title}</h2>
                <div className="space-y-3 mt-auto">
                  {product.variants.map(variant => (
                    <div key={variant.size} className="flex items-center justify-between py-2 border-b border-charcoal/5 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="bg-charcoal/5 text-charcoal-dark px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider">
                          {variant.size}
                        </div>
                      </div>
                      <div className="font-sans font-semibold text-earth">₹{variant.price}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-charcoal-deep/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-sm w-full rounded-3xl shadow-2xl p-8 text-center animate-in zoom-in-95">
            <div className="w-16 h-16 bg-chilli/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-chilli" />
            </div>
            <h3 className="text-xl font-serif font-bold text-charcoal-deep mb-2">Delete Product?</h3>
            <p className="text-sm text-charcoal-light mb-8">This action cannot be undone. This product will be permanently removed from your storefront.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setProductToDelete(null)}
                className="flex-1 bg-charcoal/5 hover:bg-charcoal/10 text-charcoal-dark font-semibold py-3 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 bg-chilli hover:bg-red-700 text-white font-semibold py-3 rounded-xl transition-colors shadow-lg shadow-chilli/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Upload Modal / Editing Layout */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-charcoal-deep/60 backdrop-blur-sm overflow-y-auto p-4 md:p-8">
          <div className="bg-base w-full max-w-2xl mx-auto rounded-3xl shadow-2xl p-6 sm:p-8 my-4 md:my-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-serif text-charcoal-deep font-medium tracking-tight">Edit Product</h2>
              <button 
                type="button"
                onClick={() => setEditingProduct(null)} 
                className="text-charcoal-light hover:text-earth transition-colors p-1"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-light uppercase tracking-wider mb-2">Product Title</label>
                    <input 
                      type="text" 
                      value={editingProduct.title}
                      onChange={(e) => setEditingProduct({...editingProduct, title: e.target.value})}
                      className="w-full border border-charcoal/10 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-earth/30 transition-shadow text-charcoal-deep font-medium text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-charcoal-light uppercase tracking-wider mb-2">Category</label>
                    <input 
                      type="text" 
                      list="categories"
                      value={editingProduct.category || ''}
                      onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                      className="w-full border border-charcoal/10 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-earth/30 transition-shadow text-charcoal-deep font-medium text-sm"
                      placeholder="e.g. Pickles"
                      required
                    />
                    <datalist id="categories">
                        <option value="Pickles" />
                        <option value="Namkeen" />
                        <option value="Spices" />
                        <option value="Essentials" />
                    </datalist>
                  </div>
              </div>
              
              <div className="border border-charcoal/10 rounded-xl p-4 bg-white">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                     <label className="text-xs font-semibold text-charcoal-light uppercase tracking-wider">Product Images</label>
                     <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                         <div className="flex text-sm">
                             <input 
                               type="url" 
                               placeholder="Paste Image URL..." 
                               className="border border-charcoal/10 rounded-l-lg px-3 py-2 outline-none focus:border-mustard w-full sm:w-48"
                               value={imageUrlInput}
                               onChange={(e) => setImageUrlInput(e.target.value)}
                             />
                             <button 
                               type="button" 
                               onClick={handleAddImageUrl}
                               className="bg-charcoal/5 hover:bg-charcoal/10 font-medium px-3 py-2 rounded-r-lg transition-colors border-y border-r border-charcoal/10"
                             >
                               Add
                             </button>
                         </div>
                         <label className={`bg-earth/10 text-earth hover:bg-earth/20 font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center text-sm ${uploadingImage ? 'opacity-50 cursor-not-allowed' : ''}`}>
                             {uploadingImage ? "Uploading..." : "Upload File"}
                             <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploadingImage} />
                         </label>
                     </div>
                 </div>
                 
                 {(!editingProduct.images || editingProduct.images.length === 0) ? (
                     <div className="text-center py-6 text-charcoal/40 text-sm italic border-2 border-dashed border-charcoal/10 rounded-lg">
                         No images added. Please upload an image.
                     </div>
                 ) : (
                     <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                         {editingProduct.images.map((img, i) => (
                             <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-charcoal/10 group">
                                 <img src={img} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                                 <button
                                    type="button"
                                    onClick={() => handleRemoveImage(img, i)}
                                    className="absolute top-1 right-1 bg-white text-chilli rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                 >
                                     <XCircle className="w-5 h-5" />
                                 </button>
                                 {i === 0 && (
                                     <div className="absolute bottom-0 left-0 right-0 bg-charcoal/80 text-white text-[10px] text-center py-1 uppercase tracking-wider font-semibold">Primary</div>
                                 )}
                             </div>
                         ))}
                     </div>
                 )}
              </div>

               <div>
                 <label className="block text-xs font-semibold text-charcoal-light uppercase tracking-wider mb-2">Theme Frame Color</label>
                 <select 
                   value={editingProduct.themeColor || 'terracotta'}
                   onChange={(e) => setEditingProduct({...editingProduct, themeColor: e.target.value as any})}
                   className="w-full border border-charcoal/10 rounded-xl px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-earth/30 transition-shadow text-charcoal-deep font-medium text-sm"
                 >
                   <option value="terracotta">Terracotta (Signature)</option>
                   <option value="mustard">Mustard (Vibrant)</option>
                   <option value="emerald">Emerald (Fresh)</option>
                   <option value="charcoal">Charcoal (Premium)</option>
                 </select>
               </div>
               
                {/* Sizing & Pricing */}
                <div className="space-y-4 pt-4 border-t border-charcoal/5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-serif font-medium text-charcoal-deep">Sizing & Pricing</h3>
                    <button 
                      type="button" 
                      onClick={handleAddVariant}
                      className="text-sm text-mustard-dark hover:text-mustard font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add Weight
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {editingProduct.variants.map((variant, index) => (
                      <div key={index} className="flex flex-col sm:flex-row gap-4 items-center bg-charcoal/5 p-4 rounded-2xl relative group">
                        <div className="flex-1 w-full space-y-2">
                          <label className="text-xs font-semibold text-charcoal tracking-wide uppercase">Weight/Size label</label>
                          <input 
                            type="text" 
                            value={variant.size} 
                            onChange={(e) => handleVariantChange(index, 'size', e.target.value)}
                            className="w-full bg-white border border-charcoal/10 rounded-xl px-4 py-2.5 text-charcoal-deep font-sans font-medium focus:ring-2 focus:ring-mustard/20 focus:border-mustard outline-none transition-all"
                            placeholder="e.g. 250g, 2 Liters"
                          />
                        </div>
                        <div className="flex-1 w-full space-y-2">
                          <label className="text-xs font-semibold text-charcoal tracking-wide uppercase">Price (₹)</label>
                          <input 
                            type="number" 
                            value={variant.price} 
                            onChange={(e) => handleVariantChange(index, 'price', e.target.value)}
                            className="w-full bg-white border border-charcoal/10 rounded-xl px-4 py-2.5 text-charcoal-deep font-sans font-bold focus:ring-2 focus:ring-mustard/20 focus:border-mustard outline-none transition-all"
                          />
                        </div>
                        <div className="flex-1 w-full space-y-2">
                          <label className="text-xs font-semibold text-charcoal tracking-wide uppercase">Stock</label>
                          <input 
                            type="number" 
                            value={variant.stock} 
                            onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                            className="w-full bg-white border border-charcoal/10 rounded-xl px-4 py-2.5 text-charcoal-deep font-sans font-medium focus:ring-2 focus:ring-mustard/20 focus:border-mustard outline-none transition-all"
                          />
                        </div>
                        {editingProduct.variants.length > 1 && (
                          <button 
                            type="button"
                            onClick={() => handleRemoveVariant(index)}
                            className="absolute -right-2 -top-2 bg-white text-chilli hover:text-white hover:bg-chilli p-1.5 rounded-full shadow-md transition-colors sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                            title="Remove Variant"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              <div className="pt-4">
                <button type="submit" className="w-full bg-mustard-dark hover:bg-mustard text-white font-medium py-3.5 rounded-xl transition-colors shadow-lg shadow-mustard-dark/20 flex items-center justify-center gap-2 cursor-pointer">
                  <Save className="w-5 h-5" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
