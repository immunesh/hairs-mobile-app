import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { colors } from "@/theme/colors";

export type PriceRange = "under2000" | "2000to4000" | "4000to7000" | "above7000" | null;

export type ProductFilters = {
  priceRange: PriceRange;
  newArrival: boolean;
  bestSeller: boolean;
  featured: boolean;
  sale: boolean;
  texture: string[];
};

export const DEFAULT_FILTERS: ProductFilters = {
  priceRange: null,
  newArrival: false,
  bestSeller: false,
  featured: false,
  sale: false,
  texture: [],
};

export function activeFilterCount(filters: ProductFilters) {
  return (
    (filters.priceRange ? 1 : 0) +
    (filters.newArrival ? 1 : 0) +
    (filters.bestSeller ? 1 : 0) +
    (filters.featured ? 1 : 0) +
    (filters.sale ? 1 : 0) +
    filters.texture.length
  );
}

export function priceRangeToBounds(range: PriceRange) {
  switch (range) {
    case "under2000":
      return { maxPrice: 2000 };
    case "2000to4000":
      return { minPrice: 2000, maxPrice: 4000 };
    case "4000to7000":
      return { minPrice: 4000, maxPrice: 7000 };
    case "above7000":
      return { minPrice: 7000 };
    default:
      return {};
  }
}

const PRICE_OPTIONS: { key: PriceRange; label: string }[] = [
  { key: "under2000", label: "Under ₹2,000" },
  { key: "2000to4000", label: "₹2,000 - ₹4,000" },
  { key: "4000to7000", label: "₹4,000 - ₹7,000" },
  { key: "above7000", label: "Above ₹7,000" },
];

const COLLECTION_OPTIONS: { key: keyof Pick<ProductFilters, "newArrival" | "bestSeller" | "featured" | "sale">; label: string }[] = [
  { key: "newArrival", label: "New Arrivals" },
  { key: "bestSeller", label: "Best Sellers" },
  { key: "featured", label: "Featured" },
  { key: "sale", label: "Sale Items" },
];

const HAIR_TYPE_OPTIONS = ["Straight", "Curly", "Body Wave", "Deep Wave", "Kinky Afro"];

type Props = {
  visible: boolean;
  initialFilters: ProductFilters;
  onApply: (filters: ProductFilters) => void;
  onClose: () => void;
};

export function FilterModal({ visible, initialFilters, onApply, onClose }: Props) {
  const [pending, setPending] = useState(initialFilters);

  useEffect(() => {
    if (visible) setPending(initialFilters);
  }, [visible, initialFilters]);

  const toggleTexture = (value: string) => {
    setPending((prev) => ({
      ...prev,
      texture: prev.texture.includes(value)
        ? prev.texture.filter((t) => t !== value)
        : [...prev.texture, value],
    }));
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />

      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Filters</Text>
          <View style={styles.headerActions}>
            <Pressable onPress={() => setPending(DEFAULT_FILTERS)} hitSlop={6}>
              <Text style={styles.clearAllText}>Clear All</Text>
            </Pressable>
            <Pressable onPress={onClose} hitSlop={6}>
              <Ionicons name="close" size={22} color="#1F1233" />
            </Pressable>
          </View>
        </View>

        <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>Price Range</Text>
          {PRICE_OPTIONS.map((option) => (
            <Pressable
              key={option.key}
              onPress={() =>
                setPending((prev) => ({
                  ...prev,
                  priceRange: prev.priceRange === option.key ? null : option.key,
                }))
              }
              style={styles.optionRow}
            >
              <View style={[styles.radio, pending.priceRange === option.key && styles.radioSelected]}>
                {pending.priceRange === option.key ? <View style={styles.radioDot} /> : null}
              </View>
              <Text style={styles.optionLabel}>{option.label}</Text>
            </Pressable>
          ))}

          <Text style={styles.sectionTitle}>Collection</Text>
          {COLLECTION_OPTIONS.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => setPending((prev) => ({ ...prev, [option.key]: !prev[option.key] }))}
              style={styles.optionRow}
            >
              <View style={[styles.checkbox, pending[option.key] && styles.checkboxSelected]}>
                {pending[option.key] ? <Ionicons name="checkmark" size={13} color={colors.white} /> : null}
              </View>
              <Text style={styles.optionLabel}>{option.label}</Text>
            </Pressable>
          ))}

          <Text style={styles.sectionTitle}>Hair Type</Text>
          {HAIR_TYPE_OPTIONS.map((option) => (
            <Pressable key={option} onPress={() => toggleTexture(option)} style={styles.optionRow}>
              <View style={[styles.checkbox, pending.texture.includes(option) && styles.checkboxSelected]}>
                {pending.texture.includes(option) ? (
                  <Ionicons name="checkmark" size={13} color={colors.white} />
                ) : null}
              </View>
              <Text style={styles.optionLabel}>{option}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Pressable
          onPress={() => {
            onApply(pending);
            onClose();
          }}
          style={styles.applyButton}
        >
          <Text style={styles.applyButtonText}>Apply Filters</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EDE4F6",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#1F1233",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  clearAllText: {
    color: colors.purple.DEFAULT,
    fontSize: 13,
    fontWeight: "700",
  },
  body: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1F1233",
    marginTop: 18,
    marginBottom: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  optionLabel: {
    fontSize: 14,
    color: "#3F3350",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#D6C7E8",
    alignItems: "center",
    justifyContent: "center",
  },
  radioSelected: {
    borderColor: colors.purple.DEFAULT,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.purple.DEFAULT,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: "#D6C7E8",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: colors.purple.DEFAULT,
    borderColor: colors.purple.DEFAULT,
  },
  applyButton: {
    backgroundColor: colors.purple.DEFAULT,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  applyButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
  },
});
