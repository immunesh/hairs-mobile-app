import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";

import { colors } from "@/theme/colors";
import type { RootStackParamList } from "@/core/navigation/types";
import { getApiErrorMessage } from "@/services/api/client";
import type { ProductDetail } from "@/services/api/types";
import { useAuth } from "@/features/auth/hooks";
import { useAddToCart, useProduct, useToggleWishlist } from "@/features/products/hooks";
import { RatingStars } from "@/screens/Home/ProductCard";
import { ProductImageGallery } from "./ProductImageGallery";
import { ReviewsSection } from "./ReviewsSection";

const GENDER_LABELS: Record<string, string> = {
  MEN: "Men",
  WOMEN: "Women",
  UNISEX: "Unisex",
};

const TRUST_BADGES = [
  { icon: "car-outline" as const, title: "Free Shipping", subtitle: "On orders above ₹999" },
  { icon: "refresh-outline" as const, title: "Easy Returns", subtitle: "7-day hassle-free returns" },
  { icon: "lock-closed-outline" as const, title: "Secure Payment", subtitle: "100% encrypted & safe" },
  { icon: "headset-outline" as const, title: "24/7 Support", subtitle: "Expert help anytime" },
];

const TABS = [
  { key: "description", label: "Description" },
  { key: "care", label: "Care Guide" },
  { key: "reviews", label: "Reviews" },
  { key: "faq", label: "FAQ" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function formatPrice(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

function discountPercent(product: ProductDetail) {
  if (!product.salePrice) return null;
  return Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100);
}

function careSteps(steps: string): string[] {
  try {
    const parsed = JSON.parse(steps);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // not JSON — fall through to plain text
  }
  return steps.split("\n").filter(Boolean);
}

type Props = NativeStackScreenProps<RootStackParamList, "ProductDetail">;

export function ProductDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const productQuery = useProduct(id);
  const { isAuthenticated } = useAuth();
  const addToCart = useAddToCart();
  const wishlist = useToggleWishlist();

  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<TabKey>("description");
  const [showCartToast, setShowCartToast] = useState(false);
  const [addedProductName, setAddedProductName] = useState("");
  const toastTimeoutId = useRef<any>(null);
  const scrollRef = useRef<ScrollView>(null);
  const tabsY = useRef(0);

  const goToLogin = () => navigation.navigate("Login");

  const handleAddToBag = (product: ProductDetail) => {
    if (!isAuthenticated) return goToLogin();
    addToCart.mutate(
      { productId: product.id, quantity },
      {
        onSuccess: () => {
          setAddedProductName(`${product.name} (x${quantity})`);
          setShowCartToast(true);
          if (toastTimeoutId.current) {
            clearTimeout(toastTimeoutId.current);
          }
          toastTimeoutId.current = setTimeout(() => {
            setShowCartToast(false);
          }, 5000);
        },
        onError: (error) => Alert.alert("Could not add to bag", getApiErrorMessage(error)),
      }
    );
  };

  const handleWishlistToggle = (product: ProductDetail) => {
    if (!isAuthenticated) return goToLogin();
    wishlist.toggle(product.id);
  };

  const handleShare = (product: ProductDetail) => {
    Share.share({ message: `Check out ${product.name} on HairsUp!` }).catch(() => {});
  };

  const jumpToReviews = () => {
    setActiveTab("reviews");
    scrollRef.current?.scrollTo({ y: tabsY.current, animated: true });
  };

  if (productQuery.isPending) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator color={colors.purple.DEFAULT} />
      </View>
    );
  }

  if (productQuery.isError || !productQuery.data) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.statusText}>
          {getApiErrorMessage(productQuery.error, "Could not load this product.")}
        </Text>
        <Pressable onPress={() => productQuery.refetch()} style={styles.retryButton}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  const product = productQuery.data;
  const discount = discountPercent(product);
  const isOutOfStock = product.stock <= 0;
  const isWishlisted = wishlist.isWishlisted(product.id);

  const specs = [
    { label: "Material", value: product.material },
    { label: "Length", value: product.length },
    { label: "Density", value: product.density },
    { label: "Texture", value: product.texture },
    { label: "Colour", value: product.color },
    { label: "SKU", value: product.sku },
  ].filter((spec) => Boolean(spec.value));

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.galleryWrap}>
          <ProductImageGallery images={product.images} />
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton} hitSlop={8}>
            <Ionicons name="arrow-back" size={20} color="#1F1233" />
          </Pressable>
        </View>

        <View style={styles.body}>
          <View style={styles.badgeRow}>
            <View style={[styles.badge, styles.genderBadge]}>
              <Text style={styles.genderBadgeText}>
                {GENDER_LABELS[product.gender?.toUpperCase() ?? ""] ?? "Unisex"}
              </Text>
            </View>
            {product.isBestSeller ? (
              <View style={[styles.badge, styles.bestSellerBadge]}>
                <Text style={styles.bestSellerBadgeText}>Best Seller</Text>
              </View>
            ) : null}
            {product.isNewArrival ? (
              <View style={[styles.badge, styles.newArrivalBadge]}>
                <Text style={styles.newArrivalBadgeText}>New Arrival</Text>
              </View>
            ) : null}
            {product.category ? <Text style={styles.categoryLabel}>{product.category.name}</Text> : null}
          </View>

          <Text style={styles.title}>{product.name}</Text>

          <View style={styles.ratingRow}>
            <RatingStars rating={product.rating} />
            <Text style={styles.ratingValue}>{product.rating.toFixed(1)}</Text>
            <Text style={styles.reviewCount}>({product.reviewCount})</Text>
            <Pressable onPress={jumpToReviews} hitSlop={6}>
              <Text style={styles.readReviews}>Read reviews</Text>
            </Pressable>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.salePrice}>{formatPrice(product.salePrice ?? product.basePrice)}</Text>
            {product.salePrice ? (
              <>
                <Text style={styles.basePrice}>{formatPrice(product.basePrice)}</Text>
                <View style={styles.discountPill}>
                  <Text style={styles.discountPillText}>{discount}% OFF</Text>
                </View>
              </>
            ) : null}
          </View>

          {specs.length > 0 ? (
            <View style={styles.specGrid}>
              {specs.map((spec) => (
                <View key={spec.label} style={styles.specBox}>
                  <Text style={styles.specLabel}>{spec.label}</Text>
                  <Text style={styles.specValue}>{spec.value}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={styles.stockRow}>
            <Ionicons
              name={isOutOfStock ? "close-circle" : "checkmark-circle"}
              size={16}
              color={isOutOfStock ? "#DC2626" : "#16A34A"}
            />
            <Text style={[styles.stockText, { color: isOutOfStock ? "#DC2626" : "#16A34A" }]}>
              {isOutOfStock ? "Out of Stock" : "In Stock"}
            </Text>
          </View>

          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.stepper}>
              <Pressable
                onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                style={styles.stepperButton}
                hitSlop={6}
              >
                <Ionicons name="remove" size={16} color="#1F1233" />
              </Pressable>
              <Text style={styles.stepperValue}>{quantity}</Text>
              <Pressable
                onPress={() => setQuantity((q) => Math.min(Math.max(product.stock, 1), q + 1))}
                style={styles.stepperButton}
                hitSlop={6}
              >
                <Ionicons name="add" size={16} color="#1F1233" />
              </Pressable>
            </View>
          </View>

          <View style={styles.actionRow}>
            <Pressable
              onPress={() => handleAddToBag(product)}
              disabled={isOutOfStock || addToCart.isPending}
              style={({ pressed }) => [
                styles.addToBagButton,
                (pressed || isOutOfStock) && styles.addToBagButtonDisabled,
              ]}
            >
              {addToCart.isPending ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="bag-handle-outline" size={18} color={colors.white} />
                  <Text style={styles.addToBagText}>Add to Bag</Text>
                </>
              )}
            </Pressable>

            <Pressable onPress={() => handleWishlistToggle(product)} style={styles.iconButton} hitSlop={6}>
              <Ionicons
                name={isWishlisted ? "heart" : "heart-outline"}
                size={20}
                color={isWishlisted ? "#DB2777" : "#1F1233"}
              />
            </Pressable>

            <Pressable onPress={() => handleShare(product)} style={styles.iconButton} hitSlop={6}>
              <Ionicons name="share-social-outline" size={20} color="#1F1233" />
            </Pressable>
          </View>

          <Pressable
            onPress={() => navigation.navigate("Home", { screen: "TryOn", params: { productId: product.id } })}
            style={styles.tryOnBanner}
          >
            <Ionicons name="flash" size={16} color={colors.purple.DEFAULT} />
            <Text style={styles.tryOnBannerText}>Try this wig virtually — Free</Text>
          </Pressable>

          <View onLayout={(event) => (tabsY.current = event.nativeEvent.layout.y)} style={styles.tabRow}>
            {TABS.map((tab) => (
              <Pressable key={tab.key} onPress={() => setActiveTab(tab.key)} style={styles.tabButton}>
                <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
                {activeTab === tab.key ? <View style={styles.tabUnderline} /> : null}
              </Pressable>
            ))}
          </View>

          <View style={styles.tabContent}>
            {activeTab === "description" ? (
              <View>
                <Text style={styles.descriptionText}>{product.description}</Text>

                {product.includedItems.length > 0 ? (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>What's Included</Text>
                    {product.includedItems.map((item) => (
                      <View key={item.id} style={styles.checklistRow}>
                        <Ionicons name="checkmark" size={14} color="#16A34A" />
                        <Text style={styles.checklistText}>{item.text}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                {product.tags.length > 0 ? (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Tags</Text>
                    <View style={styles.tagChipRow}>
                      {product.tags.map((tag) => (
                        <View key={tag} style={styles.tagChip}>
                          <Text style={styles.tagChipText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : null}
              </View>
            ) : null}

            {activeTab === "care" ? (
              <View style={{ gap: 12 }}>
                {product.careGuides.length === 0 ? (
                  <Text style={styles.emptyTabText}>No care guide available for this product yet.</Text>
                ) : (
                  product.careGuides.map((guide) => (
                    <View key={guide.id} style={styles.careCard}>
                      <Text style={styles.careTitle}>{guide.title}</Text>
                      {careSteps(guide.steps).map((step, index) => (
                        <Text key={index} style={styles.careStep}>
                          • {step}
                        </Text>
                      ))}
                    </View>
                  ))
                )}
              </View>
            ) : null}

            {activeTab === "reviews" ? (
              <ReviewsSection productId={product.id} onRequireLogin={goToLogin} />
            ) : null}

            {activeTab === "faq" ? (
              <View style={{ gap: 12 }}>
                {product.faqs.length === 0 ? (
                  <Text style={styles.emptyTabText}>No FAQs for this product yet.</Text>
                ) : (
                  product.faqs.map((faq) => (
                    <View key={faq.id} style={styles.faqCard}>
                      <View style={styles.faqQuestionRow}>
                        <Ionicons name="information-circle-outline" size={16} color={colors.purple.DEFAULT} />
                        <Text style={styles.faqQuestion}>{faq.question}</Text>
                      </View>
                      <Text style={styles.faqAnswer}>{faq.answer}</Text>
                    </View>
                  ))
                )}
              </View>
            ) : null}
          </View>

          <View style={styles.trustRow}>
            {TRUST_BADGES.map((badge) => (
              <View key={badge.title} style={styles.trustItem}>
                <Ionicons name={badge.icon} size={20} color={colors.purple.DEFAULT} />
                <Text style={styles.trustTitle}>{badge.title}</Text>
                <Text style={styles.trustSubtitle}>{badge.subtitle}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      {showCartToast ? (
        <Pressable
          onPress={() => {
            setShowCartToast(false);
            navigation.navigate("Home", { screen: "Cart" });
          }}
          style={styles.toastContainer}
        >
          <View style={styles.toastLeft}>
            <View style={styles.toastCheckmark}>
              <Ionicons name="checkmark" size={16} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.toastTitle}>Added to Bag</Text>
              <Text style={styles.toastSubtitle} numberOfLines={1}>
                {addedProductName}
              </Text>
            </View>
          </View>
          <View style={styles.toastAction}>
            <Text style={styles.toastActionText}>Checkout</Text>
            <Ionicons name="chevron-forward" size={14} color="#FFF" />
          </View>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  centerContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    backgroundColor: colors.white,
    paddingHorizontal: 32,
  },
  statusText: {
    fontSize: 13,
    color: "#5A4C6B",
    textAlign: "center",
  },
  retryButton: {
    borderWidth: 1.5,
    borderColor: colors.purple.light,
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  retryText: {
    color: colors.purple.DEFAULT,
    fontSize: 13,
    fontWeight: "700",
  },
  galleryWrap: {
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 16,
    left: 16,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.9)",
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  genderBadge: {
    backgroundColor: "#DBEAFE",
  },
  genderBadgeText: {
    color: "#1D4ED8",
    fontSize: 11,
    fontWeight: "700",
  },
  bestSellerBadge: {
    backgroundColor: "#FDECC8",
  },
  bestSellerBadgeText: {
    color: "#92400E",
    fontSize: 11,
    fontWeight: "700",
  },
  newArrivalBadge: {
    backgroundColor: "#CCFBF1",
  },
  newArrivalBadgeText: {
    color: "#0F766E",
    fontSize: 11,
    fontWeight: "700",
  },
  categoryLabel: {
    fontSize: 11,
    color: "#8A7B99",
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F1233",
    marginTop: 10,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  ratingValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1F1233",
  },
  reviewCount: {
    fontSize: 12,
    color: "#8A7B99",
  },
  readReviews: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.purple.DEFAULT,
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 14,
  },
  salePrice: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F1233",
  },
  basePrice: {
    fontSize: 15,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  discountPill: {
    backgroundColor: "#FEE2E2",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  discountPillText: {
    color: "#DC2626",
    fontSize: 11,
    fontWeight: "800",
  },
  specGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 18,
  },
  specBox: {
    width: "47%",
    backgroundColor: "#F8F6FC",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  specLabel: {
    fontSize: 11,
    color: "#8A7B99",
  },
  specValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F1233",
    marginTop: 2,
  },
  stockRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 18,
  },
  stockText: {
    fontSize: 13,
    fontWeight: "700",
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginTop: 16,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F1233",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#E5DAF2",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  stepperButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F1E6FB",
    alignItems: "center",
    justifyContent: "center",
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F1233",
    minWidth: 18,
    textAlign: "center",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },
  addToBagButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.purple.DEFAULT,
    borderRadius: 999,
    paddingVertical: 14,
  },
  addToBagButtonDisabled: {
    opacity: 0.6,
  },
  addToBagText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#E5DAF2",
    alignItems: "center",
    justifyContent: "center",
  },
  tryOnBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#F8F0FF",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 18,
  },
  tryOnBannerText: {
    color: colors.purple.DEFAULT,
    fontSize: 14,
    fontWeight: "700",
  },
  tabRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#EDE4F6",
    marginTop: 28,
  },
  tabButton: {
    marginRight: 24,
    paddingBottom: 10,
  },
  tabLabel: {
    fontSize: 13,
    color: "#8A7B99",
    fontWeight: "600",
  },
  tabLabelActive: {
    color: colors.purple.DEFAULT,
    fontWeight: "800",
  },
  tabUnderline: {
    height: 2,
    backgroundColor: colors.purple.DEFAULT,
    marginTop: 8,
  },
  tabContent: {
    paddingTop: 18,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 21,
    color: "#3F3350",
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1F1233",
    marginBottom: 10,
  },
  checklistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  checklistText: {
    fontSize: 13,
    color: "#3F3350",
  },
  tagChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tagChip: {
    backgroundColor: "#F1E6FB",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  tagChipText: {
    fontSize: 12,
    color: colors.purple.DEFAULT,
    fontWeight: "600",
  },
  emptyTabText: {
    fontSize: 13,
    color: "#8A7B99",
  },
  careCard: {
    backgroundColor: "#F8F6FC",
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  careTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F1233",
    marginBottom: 4,
  },
  careStep: {
    fontSize: 13,
    lineHeight: 19,
    color: "#3F3350",
  },
  faqCard: {
    backgroundColor: "#F8F6FC",
    borderRadius: 14,
    padding: 14,
    gap: 6,
  },
  faqQuestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  faqQuestion: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1F1233",
    flexShrink: 1,
  },
  faqAnswer: {
    fontSize: 13,
    lineHeight: 19,
    color: "#3F3350",
  },
  trustRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 32,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#EDE4F6",
  },
  trustItem: {
    width: "50%",
    alignItems: "center",
    gap: 4,
    paddingVertical: 10,
  },
  trustTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#1F1233",
  },
  trustSubtitle: {
    fontSize: 10,
    color: "#8A7B99",
    textAlign: "center",
  },
  toastContainer: {
    position: "absolute",
    bottom: 30,
    left: 16,
    right: 16,
    backgroundColor: "#1F1233",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  toastLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  toastCheckmark: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#16A34A",
    alignItems: "center",
    justifyContent: "center",
  },
  toastTitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "800",
  },
  toastSubtitle: {
    color: "#A78BFA",
    fontSize: 12,
    marginTop: 2,
  },
  toastAction: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.purple.DEFAULT,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  toastActionText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
