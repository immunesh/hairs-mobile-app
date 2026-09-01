import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "@/theme/colors";
import type { HomeTabScreenProps } from "@/core/navigation/types";
import { useCategories } from "@/features/categories/hooks";
import { getApiErrorMessage, resolveAssetUrl } from "@/services/api/client";
import type { Category } from "@/services/api/types";

const GENDER_LABELS: Record<string, string> = {
  MEN: "Men's",
  WOMEN: "Women's",
  UNISEX: "Unisex",
};

/** Tint applied over each card's photo, cycled by position. */
const CATEGORY_OVERLAYS = [
  ["rgba(194,24,91,0.55)", "rgba(123,31,162,0.82)"],
  ["rgba(30,41,59,0.6)", "rgba(49,46,129,0.85)"],
  ["rgba(120,53,15,0.45)", "rgba(146,64,14,0.8)"],
  ["rgba(139,92,246,0.55)", "rgba(91,33,182,0.85)"],
] as const;

function categoryTag(category: Category) {
  return GENDER_LABELS[category.gender ?? ""] ?? "Collection";
}

function categoryProductLabel(category: Category) {
  const count = category._count?.products ?? 0;
  return count === 1 ? "1 style" : `${count} styles`;
}

type Props = HomeTabScreenProps<"Categories">;

export function CategoriesScreen({ navigation }: Props) {
  const categoriesQuery = useCategories();
  const categories = categoriesQuery.data ?? [];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Shop by Category</Text>
        <Text style={styles.subtitle}>Find the perfect wig for your lifestyle and personality</Text>

        {categoriesQuery.isPending ? (
          <View style={styles.statusBox}>
            <ActivityIndicator color={colors.purple.DEFAULT} />
          </View>
        ) : categoriesQuery.isError ? (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>
              {getApiErrorMessage(categoriesQuery.error, "Could not load categories.")}
            </Text>
            <Pressable onPress={() => categoriesQuery.refetch()} style={styles.retryButton}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.statusBox}>
            <Text style={styles.statusText}>No categories yet.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {categories.map((category, index) => {
              const imageUrl = resolveAssetUrl(category.image);
              const overlay = CATEGORY_OVERLAYS[index % CATEGORY_OVERLAYS.length];

              return (
                <Pressable
                  key={category.id}
                  onPress={() =>
                    navigation.navigate("ProductList", {
                      categorySlug: category.slug,
                      categoryName: category.name,
                    })
                  }
                  style={({ pressed }) => [styles.card, pressed && styles.pressed]}
                >
                  {imageUrl ? (
                    <Image source={{ uri: imageUrl }} resizeMode="cover" style={styles.cardImage} />
                  ) : null}
                  <LinearGradient
                    colors={overlay}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.cardOverlay}
                  />

                  <View style={styles.cardContent}>
                    <View style={styles.cardTag}>
                      <Text style={styles.cardTagText}>{categoryTag(category)}</Text>
                    </View>

                    <View style={styles.cardFooter}>
                      <Text style={styles.cardCount}>{categoryProductLabel(category)}</Text>
                      <Text style={styles.cardTitle}>{category.name}</Text>
                      <View style={styles.cardCta}>
                        <Text style={styles.cardCtaText}>Shop Now</Text>
                        <Ionicons name="arrow-forward" size={13} color={colors.white} />
                      </View>
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
  },
  pressed: {
    opacity: 0.85,
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
  card: {
    width: "47%",
    height: 210,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#2B0A45",
  },
  cardImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
  cardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  cardContent: {
    flex: 1,
    justifyContent: "space-between",
    padding: 14,
  },
  cardTag: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(255,255,255,0.85)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  cardTagText: {
    color: "#1F1233",
    fontSize: 10,
    fontWeight: "700",
  },
  cardFooter: {
    gap: 2,
  },
  cardCount: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 12,
    fontWeight: "600",
  },
  cardTitle: {
    color: colors.white,
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 24,
    marginBottom: 2,
  },
  cardCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  cardCtaText: {
    color: colors.white,
    fontSize: 13,
    fontWeight: "700",
  },
});
