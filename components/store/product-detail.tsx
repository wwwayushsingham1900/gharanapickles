"use client"

import { useState, useEffect } from "react"
import { Product } from "@/components/admin/products-page"
import { useCart } from "@/lib/cart-context"
import { Navbar } from "@/components/navbar"
import { Star, Upload, X } from "lucide-react"
import { toast } from "sonner"
import { storage } from "@/lib/firebase"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"

interface Review {
  id?: string;
  productId: string;
  userName: string;
  rating: number;
  text: string;
  photos: string[];
  createdAt: string;
}

export function ProductDetail({ product }: { product: Product }) {
  const { addToCart, setIsCartOpen } = useCart();
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null);
  
  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  
  // New Review Form
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ userName: "", text: "", rating: 5, photos: [] as string[] });
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/reviews?productId=${product.id}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
      }
    } catch (e) {
      console.error("Failed to fetch reviews", e);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    addToCart({
      id: `${product.id}-${selectedVariant.size}`,
      title: product.title,
      size: selectedVariant.size,
      price: selectedVariant.price,
      image: product.images?.[0] || product.image || "",
      quantity: 1,
      isPreorder: true
    });
    setIsCartOpen(true);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    setUploadingPhoto(true);
    try {
      const filename = `reviews/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "")}`;
      const storageRef = ref(storage, filename);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setNewReview(prev => ({ ...prev, photos: [...prev.photos, url] }));
    } catch (error) {
      toast.error("Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.userName || !newReview.text) {
      toast.error("Please fill in your name and review text");
      return;
    }
    
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newReview, productId: product.id })
      });
      if (res.ok) {
        toast.success("Review submitted!");
        setShowReviewForm(false);
        setNewReview({ userName: "", text: "", rating: 5, photos: [] });
        fetchReviews();
      } else {
        toast.error("Failed to submit review");
      }
    } catch (error) {
      toast.error("Error submitting review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const displayImage = product.images?.[0] || product.image;
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : "5.0";

  return (
    <div className="bg-background-stitch text-on-surface font-body min-h-screen">
      <Navbar />

      <main className="container mx-auto px-6 pt-32 pb-24">
        {/* Product Overview */}
        <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
          <div className="space-y-6">
            <div className="aspect-[4/5] bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm relative">
              <img 
                src={displayImage || "https://images.unsplash.com/photo-1628189674066-e82df4c753bd"} 
                alt={product.title} 
                className="w-full h-full object-cover"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img, i) => (
                  <img key={i} src={img} alt="" className="w-24 h-24 rounded-lg object-cover bg-surface-container-lowest border border-outline-variant/30 shrink-0" />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col pt-8">
            <span className="font-label text-xs uppercase tracking-[0.3em] text-tertiary-container block mb-4">{product.category || 'Our Collection'}</span>
            <h1 className="font-headline text-5xl md:text-6xl text-on-surface mb-4">{product.title}</h1>
            
            <div className="flex items-center gap-2 mb-8">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.round(Number(averageRating)) ? "fill-current" : "opacity-30"}`} />
                ))}
              </div>
              <span className="text-on-surface-variant font-medium text-sm">
                {averageRating} ({reviews.length} reviews)
              </span>
            </div>

            <p className="text-on-surface-variant text-lg leading-relaxed font-light mb-10">
              {product.description || "Every jar tells a story of our home, and the ancient techniques passed down through generations."}
            </p>

            <div className="space-y-6 mt-auto">
              <div>
                <label className="block text-sm font-semibold uppercase tracking-wider text-on-surface-variant mb-3">Select Size</label>
                <div className="flex flex-wrap gap-3">
                  {product.variants?.map((variant) => (
                    <button
                      key={variant.size}
                      onClick={() => setSelectedVariant(variant)}
                      className={`px-6 py-3 rounded-lg border font-medium transition-all ${
                        selectedVariant?.size === variant.size 
                          ? "border-primary-container bg-primary-container/10 text-primary-container"
                          : "border-outline-variant text-on-surface-variant hover:border-outline"
                      }`}
                    >
                      {variant.size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-6 pt-6 border-t border-outline-variant/30">
                <span className="text-4xl font-serif text-tertiary">
                  ₹{selectedVariant?.price || "..."}
                </span>
                <button 
                  onClick={handleAddToCart}
                  disabled={!selectedVariant || selectedVariant.stock <= 0}
                  className="flex-1 bg-primary-container text-on-primary-stitch py-4 rounded-xl font-medium hover:bg-primary-stitch transition-all shadow-lg shadow-primary-container/20 disabled:opacity-50"
                >
                  {selectedVariant?.stock! > 0 ? "Add to Bag" : "Currently Out of Stock"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-32 pt-16 border-t border-outline-variant/30">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h2 className="font-headline text-4xl text-on-surface">Customer Reviews</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex text-amber-500">
                  <Star className="w-6 h-6 fill-current" />
                </div>
                <span className="text-2xl font-serif text-charcoal-deep">{averageRating}</span>
                <span className="text-on-surface-variant">Based on {reviews.length} reviews</span>
              </div>
            </div>
            
            {!showReviewForm && (
              <button 
                onClick={() => setShowReviewForm(true)}
                className="bg-surface-container-high text-on-surface px-6 py-3 rounded-lg font-medium hover:bg-surface-container-highest transition-colors shadow-sm"
              >
                Write a Review
              </button>
            )}
          </div>

          {/* New Review Form */}
          {showReviewForm && (
            <div className="bg-surface-container-lowest p-8 rounded-2xl mb-12 border border-outline-variant/30 animate-in fade-in slide-in-from-top-4">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-serif font-medium text-on-surface">Write your review</h3>
                <button onClick={() => setShowReviewForm(false)} className="text-on-surface-variant hover:text-on-surface">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={submitReview} className="space-y-6">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold uppercase tracking-wider text-on-surface-variant">Rating</span>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(star => (
                      <button 
                        key={star} 
                        type="button" 
                        onClick={() => setNewReview({...newReview, rating: star})}
                        className="p-1 focus:outline-none"
                      >
                        <Star className={`w-6 h-6 ${star <= newReview.rating ? "fill-amber-500 text-amber-500" : "text-outline-variant"}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Name</label>
                  <input 
                    required 
                    type="text" 
                    value={newReview.userName}
                    onChange={(e) => setNewReview({...newReview, userName: e.target.value})}
                    className="w-full md:w-1/2 p-3 rounded-lg border border-outline-variant bg-white focus:outline-none focus:ring-2 focus:ring-primary-container/50" 
                    placeholder="Joe Doe" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Review</label>
                  <textarea 
                    required 
                    rows={4}
                    value={newReview.text}
                    onChange={(e) => setNewReview({...newReview, text: e.target.value})}
                    className="w-full p-4 rounded-lg border border-outline-variant bg-white focus:outline-none focus:ring-2 focus:ring-primary-container/50 resize-y" 
                    placeholder="How was the taste? Tell us your experience..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-on-surface mb-2">Add Photos (Optional)</label>
                  <div className="flex gap-4 items-center">
                    <label className={`w-24 h-24 border-2 border-dashed border-outline-variant rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container/50 transition-colors text-on-surface-variant ${uploadingPhoto ? 'opacity-50' : ''}`}>
                      <Upload className="w-6 h-6 mb-1" />
                      <span className="text-xs">{uploadingPhoto ? 'Uploading' : 'Upload'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
                    </label>
                    {newReview.photos.map((photo, i) => (
                      <div key={i} className="w-24 h-24 rounded-xl overflow-hidden shadow-sm">
                        <img src={photo} className="w-full h-full object-cover" alt="" />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    type="submit" 
                    disabled={submittingReview}
                    className="bg-primary-container text-on-primary-stitch px-8 py-3 rounded-xl font-medium hover:bg-primary-stitch transition-all disabled:opacity-50"
                  >
                    {submittingReview ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Review List */}
          <div className="space-y-8">
            {loadingReviews ? (
              <div className="text-on-surface-variant py-8 animate-pulse">Loading reviews...</div>
            ) : reviews.length === 0 ? (
              <div className="py-12 text-center text-on-surface-variant bg-surface-container-lowest rounded-2xl border border-outline-variant/30">
                <p className="font-medium text-lg mb-2">No reviews yet</p>
                <p className="text-sm font-light">Be the first to share your experience with this Gharana masterpiece.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reviews.map((review, idx) => (
                  <div key={idx} className="bg-surface-container-lowest p-8 rounded-2xl shadow-sm border border-outline-variant/20 flex flex-col h-full">
                    <div className="flex text-amber-500 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? "fill-current" : "opacity-30"}`} />
                      ))}
                    </div>
                    <p className="text-on-surface-variant text-sm italic font-light mb-6 flex-grow leading-relaxed">
                      "{review.text}"
                    </p>
                    
                    {review.photos && review.photos.length > 0 && (
                      <div className="flex gap-2 mb-6 overflow-hidden">
                        {review.photos.map((img, i) => (
                          <div key={i} className="w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-outline-variant/20">
                            <img src={img} className="w-full h-full object-cover" alt="Customer review photo" />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4 mt-auto">
                      <span className="font-semibold text-on-surface text-sm uppercase tracking-wide">{review.userName}</span>
                      <span className="text-xs text-on-surface-variant">
                        {new Date(review.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
