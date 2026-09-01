import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import type { HomeTabScreenProps } from "@/core/navigation/types";
import { colors } from "@/theme/colors";
import { resolveAssetUrl } from "@/services/api/client";
import type { Category } from "@/services/api/types";

type Navigation = HomeTabScreenProps<"Home">["navigation"];

/** Fallback tint when a category has no photo, cycled by position. */
const FALLBACK_COLORS = ["#DCEAFB", "#FCE1EA", "#DBEAFE", "#DCFCE7"] as const;

type Props = {
  categories: Category[];
  navigation: Navigation;
};

export function CategoryShortcuts({ categories, navigation }: Props) {
  if (categories.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {categories.map((category, index) => {
          const imageUrl = resolveAssetUrl(category.image);

          return (
            <Pressable
              key={category.id}
              onPress={() =>
                navigation.navigate("ProductList", {
                  categorySlug: category.slug,
                  categoryName: category.name,
                })
              }
              style={({ pressed }) => [styles.box, pressed && styles.pressed]}
            >
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} resizeMode="cover" style={styles.image} />
              ) : (
                <View
                  style={[
                    styles.image,
                    { backgroundColor: FALLBACK_COLORS[index % FALLBACK_COLORS.length] },
                  ]}
                />
              )}

              <View style={styles.overlay}>
                <Text style={styles.name} numberOfLines={2}>
                  {category.name}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EDE4F6",
  },
  pressed: {
    opacity: 0.85,
  },
  row: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 12,
  },
  box: {
    width: 130,
    height: 76,
    borderRadius: 18,
    overflow: "hidden",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  name: {
    textAlign: "center",
    color: colors.white,
    fontSize: 14,
    fontWeight: "800",
  },
});
