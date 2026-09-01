import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";
import type { HomeTabScreenProps } from "@/core/navigation/types";
import { getApiErrorMessage } from "@/services/api/client";
import type { FeaturedProduct } from "@/services/api/types";
import { ProductCard } from "./ProductCard";

const VISIBLE_COUNT = 4;

type Props = {
  products: FeaturedProduct[];
  isPending: boolean;
  isError: boolean;
  error: unknown;
  onRetry: () => void;
  navigation: HomeTabScreenProps<"Home">["navigation"];
};

export function FeaturedCollection({
  products,
  isPending,
  isError,
  error,
  onRetry,
  navigation,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Featured Collection</Text>
      <Text style={styles.subtitle}>Handpicked by our style experts</Text>

      {isPending ? (
        <View style={styles.statusBox}>
          <ActivityIndicator color={colors.purple.DEFAULT} />
        </View>
      ) : isError ? (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>
            {getApiErrorMessage(error, "Could not load featured products.")}
          </Text>
          <Pressable onPress={onRetry} style={styles.retryButton}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.statusBox}>
          <Text style={styles.statusText}>No featured products yet.</Text>
        </View>
      ) : (
        <>
          <View style={styles.grid}>
            {products.slice(0, VISIBLE_COUNT).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onPress={() => navigation.navigate("ProductDetail", { id: product.slug })}
                onTryOnPress={() => navigation.navigate("TryOn", { productId: product.id })}
              />
            ))}
          </View>

          {products.length > VISIBLE_COUNT ? (
            <Pressable
              onPress={() => navigation.navigate("ProductList", { featured: true })}
              style={({ pressed }) => [styles.viewMoreButton, pressed && styles.pressed]}
            >
              <Text style={styles.viewMoreText}>View More</Text>
              <Ionicons name="arrow-forward" size={14} color={colors.purple.DEFAULT} />
            </Pressable>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  pressed: {
    opacity: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#1F1233",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: "#8A7B99",
    textAlign: "center",
    marginTop: 6,
    marginBottom: 20,
  },
  statusBox: {
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 28,
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    alignSelf: "center",
    marginTop: 20,
    borderWidth: 1.5,
    borderColor: colors.purple.light,
    borderRadius: 999,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  viewMoreText: {
    color: colors.purple.DEFAULT,
    fontSize: 14,
    fontWeight: "700",
  },
});
