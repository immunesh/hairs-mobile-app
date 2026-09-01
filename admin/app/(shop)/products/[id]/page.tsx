"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBag,
  Heart,
  Share2,
  Star,
  Check,
  Truck,
  RotateCcw,
  Shield,
  ChevronRight,
  Minus,
  Plus,
  Zap,
  Award,
  Info,
} from "lucide-react";
import Product360View from "@/components/features/Product360View";
import ProductCard from "@/components/ui/ProductCard";
import StarRating from "@/components/ui/StarRating";
import { formatPrice, getDiscountPercent, formatDate } from "@/lib/utils";
import { Product } from "@/types";
import {
  useCartStore,
  useWishlistStore,
  useAuthStore,
  useUIStore,
} from "@/lib/store";
import { cartApi, wishlistApi, productsApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { reviewsApi } from "@/lib/api";
const PRODUCT_TABS = ["Description", "Care Guide", "Reviews", "FAQ"];

export default function ProductDetailPage() {
  const params = useParams();
  const productId = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedTab, setSelectedTab] = useState("Description");
  const [selectedVariant, setSelectedVariant] = useState<
    Record<string, string>
  >({});
  const [addingToCart, setAddingToCart] = useState(false);
  const [viewMode, setViewMode] = useState<"gallery" | "360">("gallery");
  const [activeImage, setActiveImage] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const { isAuthenticated } = useAuthStore();
  const { addItem: addToCart } = useCartStore();
  const {
    items: wishlistItems,
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
  } = useWishlistStore();
  const { showToast } = useUIStore();

  const loadProduct = async () => {
    setLoadError(null);
    try {
      const response = await productsApi.getById(productId);
      const productData = response.data.data;

      setProduct(productData);
      setActiveImage(0);
      try {
        const reviewResponse = await reviewsApi.getByProduct(productData.id);

        console.log("Reviews API:", reviewResponse.data);
        console.log("Reviews Data", reviewResponse.data.data);
        setReviews(reviewResponse.data.data || []);
      } catch (error) {
        console.error("Review Error:", error);
      }

      const relatedResponse = await productsApi.getRelated(productData.id);
      setRelatedProducts(relatedResponse.data.data.slice(0, 4));
    } catch (err: any) {
      // Log full error for developer debugging and show a friendly message
      console.error("Failed to load product (axios)", err);
      const axiosMsg =
        err?.response?.data?.message || err?.message || "Network Error";
      // Try a plain fetch fallback to see if axios-specific behavior or CORS is the problem
      try {
        const API_BASE =
          (process.env.NEXT_PUBLIC_API_URL as string) ||
          "http://localhost:4000/api";
        const fallbackRes = await fetch(`${API_BASE}/products/${productId}`);
        const text = await fallbackRes.text();
        if (fallbackRes.ok) {
          // parse JSON and set product if possible
          try {
            const parsed = JSON.parse(text);
            const productData = parsed.data;
            setProduct(productData);
            setActiveImage(0);
            // try related via fetch too
            try {
              const relRes = await fetch(
                `${API_BASE}/products/${productData.id}/related`,
              );
              if (relRes.ok) {
                const relParsed = await relRes.json();
                setRelatedProducts(relParsed.data.slice(0, 4));
              }
            } catch (e) {
              console.warn("Related fetch fallback failed", e);
            }
            return;
          } catch (parseErr) {
            console.warn("Fallback response not JSON", parseErr, text);
          }
        } else {
          console.warn("Fallback fetch failed", fallbackRes.status, text);
        }
        setLoadError(
          `Network Error: ${axiosMsg} (fallback status: ${fallbackRes.status})`,
        );
      } catch (fetchErr) {
        console.error("Fallback fetch also failed", fetchErr);
        setLoadError(axiosMsg || "Unable to load product details.");
      }
    }
  };

  useEffect(() => {
    if (productId) loadProduct();
  }, [productId]);

  if (!product) {
    return (
      <div className="container-custom py-20 text-center">
        {loadError ? (
          <div className="space-y-4">
            <div className="text-red-600 text-lg font-medium">{loadError}</div>
            <div>
              <button
                onClick={() => loadProduct()}
                className="mt-2 inline-flex items-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <div className="animate-pulse">
            <div className="skeleton h-96 w-full rounded-2xl mb-6" />
            <div className="skeleton h-8 w-64 mx-auto mb-3 rounded" />
            <div className="skeleton h-4 w-96 mx-auto rounded" />
          </div>
        )}
      </div>
    );
  }

  const isWishlisted = wishlistItems.some((i) => i.productId === product.id);
  const sortedImages = (product.images || [])
    .slice()
    .sort((a, b) => a.angle - b.angle);
  const primaryImage = sortedImages.find((i) => i.isPrimary) || sortedImages[0];
  const discountPct = product.salePrice
    ? getDiscountPercent(product.basePrice, product.salePrice)
    : 0;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      showToast("Please sign in to add to cart", "error");
      return;
    }
    setAddingToCart(true);
    try {
      const { data } = await cartApi.add(product.id, quantity, selectedVariant);
      addToCart(data.data);
      useCartStore.getState().toggleCart();
      showToast(`${product.name} added to bag!`);
    } catch {
      showToast("Failed to add to cart", "error");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      showToast("Please sign in", "error");
      return;
    }
    try {
      if (isWishlisted) {
        await wishlistApi.remove(product.id);
        removeFromWishlist(product.id);
        showToast("Removed from wishlist");
      } else {
        const { data } = await wishlistApi.add(product.id);
        addToWishlist(data.data);
        showToast("Saved to wishlist!");
      }
    } catch {
      showToast("Something went wrong", "error");
    }
  };

  const totalReviews = reviews.length;

  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((review) => review.rating === star).length;

    return {
      star,
      pct: totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0,
    };
  });

  const handleSubmitReview = async () => {
    try {
      if (!userRating) {
        alert("Please select rating");
        return;
      }

      if (!reviewText.trim()) {
        alert("Please write review");
        return;
      }

      await reviewsApi.create({
        productId: product.id,
        rating: userRating,
        body: reviewText,
      });

      alert("Review submitted!");

      setReviewText("");
      setUserRating(0);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div>
      {/* Breadcrumb */}
      <div className="container-custom py-3">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-brand-600">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link
            href={`/${product.gender.toLowerCase()}`}
            className="hover:text-brand-600"
          >
            {product.gender === "WOMEN" ? "Women's Wigs" : "Men's Hair Systems"}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium line-clamp-1">
            {product.name}
          </span>
        </nav>
      </div>

      <div className="container-custom pb-16">
        <div className="grid lg:grid-cols-2 gap-10 xl:gap-16">
          {/* ── LEFT: Images ── */}
          <div className="space-y-4">
            {/* View mode toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("gallery")}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all",
                  viewMode === "gallery"
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-gray-200 text-gray-600",
                )}
              >
                Gallery
              </button>
              <button
                onClick={() => setViewMode("360")}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium border-2 transition-all flex items-center gap-1.5",
                  viewMode === "360"
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-gray-200 text-gray-600",
                )}
              >
                <RotateCcw className="w-4 h-4" /> 360° View
              </button>
            </div>

            {viewMode === "360" ? (
              <Product360View
                images={
                  sortedImages.length > 0
                    ? sortedImages
                    : [
                        {
                          id: "fallback",
                          url: primaryImage?.url || "",
                          angle: 0,
                          isPrimary: true,
                        },
                      ]
                }
                productName={product.name}
              />
            ) : (
              <div className="space-y-3">
                {/* Main image */}
                <div className="relative rounded-2xl overflow-hidden bg-gray-50 group w-full h-[560px]">
                  {sortedImages[activeImage] && (
                    <Image
                      src={sortedImages[activeImage].url}
                      alt={product.name}
                      fill
                      className="object-fill pointer-events-none"
                      priority
                      sizes="(max-width: 1024px) 100vw, 50vw"
                    />
                  )}
                  {discountPct > 0 && (
                    <div className="absolute top-4 left-4 badge-sale text-sm font-bold px-3 py-1">
                      -{discountPct}%
                    </div>
                  )}
                  {product.isNewArrival && (
                    <div className="absolute top-4 right-4 badge-new text-sm px-3 py-1">
                      New Arrival
                    </div>
                  )}
                </div>
                {/* Thumbnails */}
                {sortedImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                    {sortedImages.map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() => setActiveImage(idx)}
                        className={cn(
                          "relative flex-shrink-0 w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden border-2 transition-all",
                          activeImage === idx
                            ? "border-brand-500"
                            : "border-gray-200 hover:border-brand-300",
                        )}
                      >
                        <Image
                          src={img.url}
                          alt={`View ${idx + 1}`}
                          fill
                          className="object-fill"
                          sizes="80px"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Try-on CTA */}
            <Link
              href={`/try-on?wig=${product.id}`}
              className="flex items-center justify-center gap-2 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 font-semibold rounded-2xl py-3 px-5 transition-colors"
            >
              <Zap className="w-4 h-4" /> Try this wig virtually — Free
            </Link>
          </div>

          {/* ── RIGHT: Product Info ── */}
          <div className="space-y-5">
            {/* Category + badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={cn(
                  "badge text-xs",
                  product.gender === "WOMEN"
                    ? "bg-pink-100 text-pink-700"
                    : "bg-blue-100 text-blue-700",
                )}
              >
                {product.gender === "WOMEN" ? "Women" : "Men"}
              </span>
              {product.isBestSeller && (
                <span className="badge-best text-xs">Best Seller</span>
              )}
              {product.isNewArrival && (
                <span className="badge-new text-xs">New Arrival</span>
              )}
              <span className="text-sm text-gray-400">
                {product.category?.name}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-display font-bold text-gray-900 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <StarRating
                rating={product.rating}
                count={product.reviewCount}
                size="md"
              />
              <span className="text-sm text-gray-500">|</span>
              <Link
                href="#reviews"
                className="text-sm text-brand-600 hover:underline"
              >
                Read reviews
              </Link>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-3xl font-bold text-gray-900">
                {formatPrice(product.salePrice || product.basePrice)}
              </span>
              {product.salePrice && (
                <>
                  <span className="text-xl text-gray-400 line-through">
                    {formatPrice(product.basePrice)}
                  </span>
                  <span className="badge-sale text-sm font-bold px-2 py-1">
                    {discountPct}% OFF
                  </span>
                </>
              )}
            </div>

            {/* Key specs */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Material", value: product.material },
                { label: "Length", value: product.length || product.capSize },
                { label: "Density", value: product.density },
                { label: "Texture", value: product.texture },
                { label: "Colour", value: product.color },
                { label: "SKU", value: product.sku },
              ]
                .filter((s) => s.value)
                .map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {value}
                    </p>
                  </div>
                ))}
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <Check className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600 font-medium">
                    In Stock
                  </span>
                </>
              ) : (
                <span className="text-sm text-red-600 font-medium">
                  Out of Stock
                </span>
              )}
              {product.stock > 0 && product.stock <= 10 && (
                <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                  Only {product.stock} left!
                </span>
              )}
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                Quantity:
              </span>
              <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-semibold text-lg min-w-[3rem] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stock, quantity + 1))
                  }
                  className="px-3 py-2 hover:bg-gray-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={addingToCart || product.stock === 0}
                className="flex-1 btn-primary py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <ShoppingBag className="w-5 h-5" />
                {product.stock === 0
                  ? "Out of Stock"
                  : addingToCart
                    ? "Adding…"
                    : "Add to Bag"}
              </button>
              <button
                onClick={handleWishlist}
                className={cn(
                  "p-3.5 rounded-full border-2 transition-all",
                  isWishlisted
                    ? "border-red-400 bg-red-50 text-red-500"
                    : "border-gray-200 hover:border-red-300 hover:text-red-500",
                )}
              >
                <Heart
                  className={cn("w-5 h-5", isWishlisted && "fill-current")}
                />
              </button>
              <button
                onClick={() =>
                  navigator.share?.({
                    title: product.name,
                    url: window.location.href,
                  })
                }
                className="p-3.5 rounded-full border-2 border-gray-200 hover:border-brand-300 hover:text-brand-600 transition-all"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            {/* Delivery / Returns strip */}
            <div className="grid grid-cols-3 gap-3">
              {product.features?.map((feature, index) => {
                const icons = [Truck, RotateCcw, Shield];
                const colors = [
                  "text-green-600",
                  "text-blue-600",
                  "text-brand-600",
                ];

                const Icon = icons[index] || Shield;
                const color = colors[index] || "text-brand-600";

                return (
                  <div
                    key={feature.id}
                    className="flex flex-col items-center text-center p-3 bg-gray-50 rounded-xl"
                  >
                    <Icon className={cn("w-5 h-5 mb-1", color)} />

                    <p className="text-xs font-semibold text-gray-900">
                      {feature.title}
                    </p>

                    <p className="text-xs text-gray-500">{feature.subtitle}</p>
                  </div>
                );
              })}
            </div>

            {/* Certifications */}
            <div className="flex items-center gap-2 text-xs text-gray-500 pt-2">
              <Award className="w-4 h-4 text-brand-600" />

              <span>{product.highlights?.map((h) => h.text).join(" · ")}</span>
            </div>
          </div>
        </div>

        {/* ── PRODUCT TABS ── */}
        <div className="mt-16" id="details">
          <div className="flex gap-1 border-b border-gray-200 overflow-x-auto scrollbar-hide">
            {PRODUCT_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={cn(
                  "px-5 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all",
                  selectedTab === tab
                    ? "border-brand-600 text-brand-600"
                    : "border-transparent text-gray-500 hover:text-gray-900",
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="py-8">
            {selectedTab === "Description" && (
              <div className="prose max-w-none">
                <p className="text-gray-700 text-base leading-relaxed mb-6">
                  {product.description}
                </p>
                <h3 className="text-lg font-semibold mb-3">
                  What&apos;s Included
                </h3>
                <ul className="space-y-2">
                  {product.includedItems?.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {item.text}
                    </li>
                  ))}
                </ul>
                {product.tags && product.tags.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-3">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedTab === "Care Guide" && (
              <div className="grid md:grid-cols-2 gap-6">
                {product.careGuides?.map((guide) => (
                  <div key={guide.id} className="bg-gray-50 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-2xl">{guide.icon}</span>

                      <h3 className="font-semibold text-lg">{guide.title}</h3>
                    </div>

                    <ul className="space-y-2">
                      {guide.steps
                        .split("|")
                        .map((step: string, index: number) => (
                          <li key={index} className="text-gray-700 flex gap-2">
                            <span>•</span>
                            <span>{step}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {selectedTab === "Reviews" && (
              <div id="reviews">
                {/* Rating summary */}
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                  <div className="flex flex-col items-center justify-center bg-gray-50 rounded-2xl p-6">
                    <div className="text-5xl font-bold text-gray-900 mb-2">
                      {reviews.length
                        ? (
                            reviews.reduce((sum, r) => sum + r.rating, 0) /
                            reviews.length
                          ).toFixed(1)
                        : "0.0"}
                    </div>
                    <StarRating rating={product.rating} size="lg" />
                    <p className="text-sm text-gray-500 mt-2">
                      {reviews.length} verified reviews
                    </p>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    {ratingBreakdown.map(({ star, pct }) => {
                      return (
                        <div key={star} className="flex items-center gap-3">
                          <span className="text-sm text-gray-600 w-4">
                            {star}
                          </span>
                          <Star className="w-3.5 h-3.5 star-filled flex-shrink-0" />
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-500 w-8">
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews list */}
                <div className="space-y-5">
                  {reviews.map((review) => (
                    <div
                      key={review.id}
                      className="border border-gray-100 rounded-2xl p-5"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-sm">
                            {review.user.firstName[0]}
                            {review.user.lastName[0]}
                          </div>
                          <div>
                            <p className="font-semibold text-sm">
                              {review.user.firstName} {review.user.lastName}
                            </p>
                            <div className="flex items-center gap-2">
                              <StarRating rating={review.rating} size="sm" />
                              {review.isVerified && (
                                <span className="text-xs text-green-600 flex items-center gap-0.5">
                                  <Check className="w-3 h-3" /> Verified
                                  Purchase
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400">
                          {formatDate(review.createdAt)}
                        </p>
                      </div>
                      {review.title && (
                        <p className="font-semibold text-gray-900 mb-1">
                          {review.title}
                        </p>
                      )}
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {review.body}
                      </p>
                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs text-gray-500">
                          Helpful? ({review.helpfulCount})
                        </span>
                        <button className="text-xs text-brand-600 hover:underline">
                          👍 Yes
                        </button>
                        <button className="text-xs text-gray-400 hover:underline">
                          👎 No
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Write a review */}
                {isAuthenticated && (
                  <div className="mt-8 bg-brand-50 rounded-2xl p-6 border border-brand-100">
                    <h3 className="font-bold text-gray-900 mb-4">
                      Write a Review
                    </h3>
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">Your Rating</p>
                      <StarRating
                        rating={userRating}
                        size="lg"
                        interactive
                        onRate={setUserRating}
                      />
                    </div>
                    <textarea
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      placeholder="Share your experience with this product..."
                      className="input-field resize-none h-28 mb-3"
                    />
                    <button
                      onClick={handleSubmitReview}
                      className="btn-primary text-sm py-2.5 px-6"
                    >
                      Submit Review
                    </button>
                  </div>
                )}
              </div>
            )}

            {selectedTab === "FAQ" && (
              <div className="space-y-4 max-w-2xl">
                {product.faqs?.map((faq) => (
                  <div key={faq.id} className="bg-gray-50 rounded-2xl p-5">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-start gap-2">
                      <Info className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                      {faq.question}
                    </h4>

                    <p className="text-gray-700 text-sm leading-relaxed pl-6">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-display font-bold text-gray-900 mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
