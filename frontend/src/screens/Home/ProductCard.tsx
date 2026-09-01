import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";
import { resolveAssetUrl } from "@/services/api/client";
import type { FeaturedProduct } from "@/services/api/types";

const LOW_STOCK_THRESHOLD = 5;

const GENDER_PILLS: Record<string, { label: string; background: string; color: string }> = {
  MEN: { label: "Men", background: "#DBEAFE", color: "#1D4ED8" },
  WOMEN: { label: "Women", background: "#FCE7F3", color: "#BE185D" },
  UNISEX: { label: "Unisex", background: "#EDE9FE", color: colors.purple.DEFAULT },
};

function genderPill(product: FeaturedProduct) {
  const key = (product.category?.gender ?? product.gender ?? "").toUpperCase();
  return GENDER_PILLS[key] ?? GENDER_PILLS.UNISEX;
}

function discountPercent(product: FeaturedProduct) {
  if (!product.salePrice) return null;
  return Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100);
}

function specLine(product: FeaturedProduct) {
  return [product.texture, product.length].filter(Boolean).join(" · ") || "Classic style";
}

function formatPrice(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function RatingStars({ rating }: { rating: number }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((position) => {
        const icon =
          rating >= position ? "star" : rating >= position - 0.5 ? "star-half" : "star-outline";
        return <Ionicons key={position} name={icon} size={12} color="#F5B301" />;
      })}
    </View>
  );
}

type Props = {
  product: FeaturedProduct;
  onPress: () => void;
  onTryOnPress: () => void;
};

export function ProductCard({ product, onPress, onTryOnPress }: Props) {
  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];
  const imageUrl = resolveAssetUrl(primaryImage?.url);
  const discount = discountPercent(product);
  const gender = genderPill(product);
  const isLowStock = product.stock > 0 && product.stock <= LOW_STOCK_THRESHOLD;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.imageWrap}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} resizeMode="cover" style={styles.image} />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]} />
        )}

        {discount !== null ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountBadgeText}>-{discount}%</Text>
          </View>
        ) : null}

        <View style={[styles.genderBadge, { backgroundColor: gender.background }]}>
          <Text style={[styles.genderBadgeText, { color: gender.color }]}>{gender.label}</Text>
        </View>

        {isLowStock ? (
          <View style={styles.lowStockBanner}>
            <Text style={styles.lowStockText}>Only {product.stock} left!</Text>
          </View>
        ) : (
          <View style={styles.tagStack}>
            {product.isNewArrival ? (
              <View style={[styles.tag, styles.tagNew]}>
                <Text style={[styles.tagText, styles.tagNewText]}>New</Text>
              </View>
            ) : null}
            {product.isBestSeller ? (
              <View style={[styles.tag, styles.tagBestSeller]}>
                <Text style={[styles.tagText, styles.tagBestSellerText]}>Best Seller</Text>
              </View>
            ) : null}
          </View>
        )}
      </View>

      <View style={styles.content}>
        {product.category ? (
          <Text style={styles.categoryLabel}>{product.category.name.toUpperCase()}</Text>
        ) : null}
        <Text style={styles.name} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.spec}>{specLine(product)}</Text>

        <View style={styles.ratingRow}>
          <RatingStars rating={product.rating} />
          <Text style={styles.reviewCount}>({product.reviewCount})</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.salePrice}>
            {formatPrice(product.salePrice ?? product.basePrice)}
          </Text>
          {product.salePrice ? (
            <>
              <Text style={styles.basePrice}>{formatPrice(product.basePrice)}</Text>
              <Text style={styles.discountLabel}>{discount}% off</Text>
            </>
          ) : null}
        </View>

        <Pressable
          onPress={onTryOnPress}
          style={({ pressed }) => [styles.tryOnLink, pressed && styles.pressed]}
        >
          <Ionicons name="flash" size={13} color={colors.purple.DEFAULT} />
          <Text style={styles.tryOnLinkText}>Try it virtually</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.8,
  },
  card: {
    width: "47%",
    borderRadius: 16,
    backgroundColor: colors.white,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  imageWrap: {
    height: 140,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    backgroundColor: "#F1E6FB",
  },
  discountBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#DB2777",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  discountBadgeText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: "800",
  },
  genderBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  genderBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  tagStack: {
    position: "absolute",
    left: 8,
    bottom: 8,
    gap: 4,
  },
  tag: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 10,
    fontWeight: "800",
  },
  tagNew: {
    backgroundColor: "#CCFBF1",
  },
  tagNewText: {
    color: "#0F766E",
  },
  tagBestSeller: {
    backgroundColor: "#FDECC8",
  },
  tagBestSellerText: {
    color: "#92400E",
  },
  lowStockBanner: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 8,
    backgroundColor: "#F97316",
    borderRadius: 999,
    paddingVertical: 5,
    alignItems: "center",
  },
  lowStockText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: "800",
  },
  content: {
    padding: 12,
  },
  categoryLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
    color: "#9B93A6",
  },
  name: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F1233",
    marginTop: 3,
  },
  spec: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 6,
  },
  starsRow: {
    flexDirection: "row",
    gap: 1,
  },
  reviewCount: {
    fontSize: 11,
    color: "#8A7B99",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 8,
  },
  salePrice: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1F1233",
  },
  basePrice: {
    fontSize: 12,
    color: "#9CA3AF",
    textDecorationLine: "line-through",
  },
  discountLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16A34A",
  },
  tryOnLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
    alignSelf: "flex-start",
  },
  tryOnLinkText: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.purple.DEFAULT,
  },
});
